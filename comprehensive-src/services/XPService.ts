import { Repository } from 'typeorm';
import { Enrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { Lecture } from '../models/Lecture';
import { Assessment } from '../models/Assessment';
import { AppDataSource } from '../config/database';

export interface XPTransaction {
  student_id: string;
  course_id: string;
  xp_amount: number;
  source: 'lecture_completion' | 'assessment_pass' | 'milestone_reached' | 'bonus_award';
  metadata: {
    lecture_id?: string;
    assessment_id?: string;
    milestone?: string;
    bonus_reason?: string;
  };
  timestamp: Date;
}

export interface XPUpdate {
  student_id: string;
  course_id: string;
  xp_amount: number;
  source: string;
  metadata: any;
}

export class XPService {
  private enrollmentRepository: Repository<Enrollment>;
  private courseRepository: Repository<Course>;
  private lectureRepository: Repository<Lecture>;
  private assessmentRepository: Repository<Assessment>;

  constructor() {
    this.enrollmentRepository = AppDataSource.getRepository(Enrollment);
    this.courseRepository = AppDataSource.getRepository(Course);
    this.lectureRepository = AppDataSource.getRepository(Lecture);
    this.assessmentRepository = AppDataSource.getRepository(Assessment);
  }

  async awardLectureXP(studentId: string, courseId: string, lectureId: string): Promise<XPTransaction> {
    const enrollment = await this.getEnrollment(studentId, courseId);
    const course = await this.courseRepository.findOne({ where: { course_id: courseId } });
    const lecture = await this.lectureRepository.findOne({ where: { lecture_id: lectureId } });

    if (!enrollment || !course || !lecture) {
      throw new Error('Invalid enrollment, course, or lecture');
    }

    // Check if lecture XP already awarded
    if (enrollment.completed_lectures.includes(lectureId)) {
      throw new Error('XP already awarded for this lecture');
    }

    // Calculate XP with difficulty multiplier
    const baseXP = lecture.xp_reward;
    const multiplier = course.xp_multiplier;
    const awardedXP = Math.round(baseXP * multiplier);

    // Create XP transaction
    const transaction: XPTransaction = {
      student_id: studentId,
      course_id: courseId,
      xp_amount: awardedXP,
      source: 'lecture_completion',
      metadata: {
        lecture_id: lectureId
      },
      timestamp: new Date()
    };

    // Update enrollment
    enrollment.completed_lectures.push(lectureId);
    enrollment.total_xp_earned += awardedXP;
    enrollment.last_activity = new Date();

    await this.enrollmentRepository.save(enrollment);

    // Log transaction (would integrate with audit system)
    await this.logXPTransaction(transaction);

    // Integrate with ScrollXPTracker (would be external service call)
    await this.syncWithScrollXPTracker(transaction);

    return transaction;
  }

  async awardAssessmentXP(
    studentId: string, 
    courseId: string, 
    assessmentId: string, 
    score: number, 
    attempts: number
  ): Promise<XPTransaction> {
    const enrollment = await this.getEnrollment(studentId, courseId);
    const course = await this.courseRepository.findOne({ where: { course_id: courseId } });
    const assessment = await this.assessmentRepository.findOne({ where: { assessment_id: assessmentId } });

    if (!enrollment || !course || !assessment) {
      throw new Error('Invalid enrollment, course, or assessment');
    }

    // Check if assessment already passed
    const existingAssessment = enrollment.completed_assessments.find(
      (a: any) => a.assessment_id === assessmentId
    );

    if (existingAssessment) {
      throw new Error('XP already awarded for this assessment');
    }

    // Check if passing score achieved
    if (score < assessment.passing_score) {
      throw new Error('Assessment must be passed to earn XP');
    }

    // Calculate XP with difficulty multiplier and performance bonus
    const baseXP = assessment.xp_reward;
    const multiplier = course.xp_multiplier;
    const performanceBonus = this.calculatePerformanceBonus(score, assessment.passing_score, attempts);
    const awardedXP = Math.round((baseXP * multiplier) + performanceBonus);

    // Create XP transaction
    const transaction: XPTransaction = {
      student_id: studentId,
      course_id: courseId,
      xp_amount: awardedXP,
      source: 'assessment_pass',
      metadata: {
        assessment_id: assessmentId,
        score: score,
        attempts: attempts,
        performance_bonus: performanceBonus
      },
      timestamp: new Date()
    };

    // Update enrollment
    enrollment.completed_assessments.push({
      assessment_id: assessmentId,
      score: score,
      completed_at: new Date(),
      attempts: attempts
    });
    enrollment.total_xp_earned += awardedXP;
    enrollment.last_activity = new Date();

    await this.enrollmentRepository.save(enrollment);

    // Log transaction
    await this.logXPTransaction(transaction);

    // Integrate with ScrollXPTracker
    await this.syncWithScrollXPTracker(transaction);

    return transaction;
  }

  async awardMilestoneXP(studentId: string, courseId: string, milestone: string): Promise<XPTransaction> {
    const enrollment = await this.getEnrollment(studentId, courseId);
    const course = await this.courseRepository.findOne({ where: { course_id: courseId } });

    if (!enrollment || !course) {
      throw new Error('Invalid enrollment or course');
    }

    // Check if milestone already awarded
    const milestoneKey = `milestone_${milestone}`;
    if (enrollment.mentor_alerts.includes(milestoneKey)) {
      throw new Error('Milestone XP already awarded');
    }

    // Calculate milestone XP
    const milestoneXP = this.calculateMilestoneXP(milestone, course.xp_multiplier);

    // Create XP transaction
    const transaction: XPTransaction = {
      student_id: studentId,
      course_id: courseId,
      xp_amount: milestoneXP,
      source: 'milestone_reached',
      metadata: {
        milestone: milestone
      },
      timestamp: new Date()
    };

    // Update enrollment
    enrollment.mentor_alerts.push(milestoneKey);
    enrollment.total_xp_earned += milestoneXP;
    enrollment.last_activity = new Date();

    await this.enrollmentRepository.save(enrollment);

    // Log transaction
    await this.logXPTransaction(transaction);

    // Integrate with ScrollXPTracker
    await this.syncWithScrollXPTracker(transaction);

    return transaction;
  }

  async awardBonusXP(
    studentId: string, 
    courseId: string, 
    amount: number, 
    reason: string
  ): Promise<XPTransaction> {
    const enrollment = await this.getEnrollment(studentId, courseId);

    if (!enrollment) {
      throw new Error('Invalid enrollment');
    }

    // Create XP transaction
    const transaction: XPTransaction = {
      student_id: studentId,
      course_id: courseId,
      xp_amount: amount,
      source: 'bonus_award',
      metadata: {
        bonus_reason: reason
      },
      timestamp: new Date()
    };

    // Update enrollment
    enrollment.total_xp_earned += amount;
    enrollment.last_activity = new Date();

    await this.enrollmentRepository.save(enrollment);

    // Log transaction
    await this.logXPTransaction(transaction);

    // Integrate with ScrollXPTracker
    await this.syncWithScrollXPTracker(transaction);

    return transaction;
  }

  async getStudentXPSummary(studentId: string, courseId?: string): Promise<any> {
    let enrollments: Enrollment[];

    if (courseId) {
      const enrollment = await this.getEnrollment(studentId, courseId);
      enrollments = enrollment ? [enrollment] : [];
    } else {
      enrollments = await this.enrollmentRepository.find({
        where: { student_id: studentId },
        relations: ['course']
      });
    }

    const summary = {
      total_xp: 0,
      course_xp: {} as any,
      xp_by_source: {
        lecture_completion: 0,
        assessment_pass: 0,
        milestone_reached: 0,
        bonus_award: 0
      },
      recent_transactions: [] as XPTransaction[]
    };

    for (const enrollment of enrollments) {
      summary.total_xp += enrollment.total_xp_earned;
      summary.course_xp[enrollment.course_id] = {
        course_title: enrollment.course?.title || 'Unknown',
        xp_earned: enrollment.total_xp_earned,
        progress_percentage: enrollment.progress_percentage
      };
    }

    // Get recent transactions (would be from audit log)
    summary.recent_transactions = await this.getRecentXPTransactions(studentId, 10);

    return summary;
  }

  async getXPLeaderboard(courseId?: string, limit: number = 10): Promise<any[]> {
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.course', 'course')
      .orderBy('enrollment.total_xp_earned', 'DESC')
      .limit(limit);

    if (courseId) {
      queryBuilder.where('enrollment.course_id = :courseId', { courseId });
    }

    const enrollments = await queryBuilder.getMany();

    return enrollments.map((enrollment, index) => ({
      rank: index + 1,
      student_id: enrollment.student_id,
      course_title: enrollment.course?.title,
      total_xp: enrollment.total_xp_earned,
      progress_percentage: enrollment.progress_percentage,
      status: enrollment.status
    }));
  }

  private async getEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    return await this.enrollmentRepository.findOne({
      where: { student_id: studentId, course_id: courseId },
      relations: ['course']
    });
  }

  private calculatePerformanceBonus(score: number, passingScore: number, attempts: number): number {
    // Base bonus for exceeding passing score
    const scoreBonus = Math.max(0, (score - passingScore) * 0.5);
    
    // Penalty for multiple attempts
    const attemptPenalty = Math.max(0, (attempts - 1) * 2);
    
    // Excellence bonus for perfect scores on first attempt
    const excellenceBonus = (score >= 95 && attempts === 1) ? 10 : 0;

    return Math.round(scoreBonus - attemptPenalty + excellenceBonus);
  }

  private calculateMilestoneXP(milestone: string, multiplier: number): number {
    const baseMilestoneXP = {
      '25': 25,
      '50': 50,
      '75': 75,
      '100': 100
    };

    const baseXP = baseMilestoneXP[milestone as keyof typeof baseMilestoneXP] || 0;
    return Math.round(baseXP * multiplier);
  }

  private async logXPTransaction(transaction: XPTransaction): Promise<void> {
    // This would integrate with audit trail system
    console.log('XP Transaction:', {
      student: transaction.student_id,
      course: transaction.course_id,
      xp: transaction.xp_amount,
      source: transaction.source,
      timestamp: transaction.timestamp
    });
  }

  private async syncWithScrollXPTracker(transaction: XPTransaction): Promise<void> {
    // This would integrate with ScrollXPTracker interface
    const xpUpdate: XPUpdate = {
      student_id: transaction.student_id,
      course_id: transaction.course_id,
      xp_amount: transaction.xp_amount,
      source: transaction.source,
      metadata: transaction.metadata
    };

    // Simulate API call to ScrollXPTracker
    console.log('Syncing with ScrollXPTracker:', xpUpdate);
  }

  private async getRecentXPTransactions(studentId: string, limit: number): Promise<XPTransaction[]> {
    // This would query the audit trail system
    // For now, return empty array
    return [];
  }

  async calculateCourseXPPotential(courseId: string): Promise<any> {
    const course = await this.courseRepository.findOne({
      where: { course_id: courseId },
      relations: ['lectures', 'assessments']
    });

    if (!course) {
      throw new Error('Course not found');
    }

    const lectureXP = course.lectures.reduce((total, lecture) => {
      return total + (lecture.xp_reward * course.xp_multiplier);
    }, 0);

    const assessmentXP = course.assessments.reduce((total, assessment) => {
      return total + (assessment.xp_reward * course.xp_multiplier);
    }, 0);

    const milestoneXP = [25, 50, 75, 100].reduce((total, milestone) => {
      return total + this.calculateMilestoneXP(milestone.toString(), course.xp_multiplier);
    }, 0);

    return {
      course_id: courseId,
      course_title: course.title,
      total_potential_xp: lectureXP + assessmentXP + milestoneXP,
      breakdown: {
        lectures: {
          count: course.lectures.length,
          total_xp: lectureXP
        },
        assessments: {
          count: course.assessments.length,
          total_xp: assessmentXP
        },
        milestones: {
          count: 4,
          total_xp: milestoneXP
        }
      },
      difficulty_multiplier: course.xp_multiplier
    };
  }
}