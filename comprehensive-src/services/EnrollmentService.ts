import { Repository } from 'typeorm';
import { Enrollment } from '../models/Enrollment';
import { Course } from '../models/Course';
import { AppDataSource } from '../config/database';

export class EnrollmentService {
  private enrollmentRepository: Repository<Enrollment>;
  private courseRepository: Repository<Course>;

  constructor() {
    this.enrollmentRepository = AppDataSource.getRepository(Enrollment);
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  async enrollStudent(courseId: string, studentId: string): Promise<Enrollment> {
    // Check if course exists and is published
    const course = await this.courseRepository.findOne({
      where: { course_id: courseId },
      relations: ['lectures', 'assessments']
    });

    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'published') {
      throw new Error('Cannot enroll in unpublished course');
    }

    // Check if student is already enrolled
    const existingEnrollment = await this.enrollmentRepository.findOne({
      where: { course_id: courseId, student_id: studentId }
    });

    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this course');
    }

    // Validate prerequisites if any
    if (course.prerequisites && course.prerequisites.length > 0) {
      await this.validatePrerequisites(studentId, course.prerequisites);
    }

    const enrollment = this.enrollmentRepository.create({
      course_id: courseId,
      student_id: studentId,
      enrollment_date: new Date(),
      status: 'enrolled',
      progress_percentage: 0,
      completed_lectures: [],
      completed_assessments: [],
      total_xp_earned: 0,
      mentor_alerts: [],
      tutoring_sessions: 0,
      last_activity: new Date()
    });

    return await this.enrollmentRepository.save(enrollment);
  }

  async getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { student_id: studentId },
      relations: ['course'],
      order: { enrollment_date: 'DESC' }
    });
  }

  async getCourseEnrollments(courseId: string): Promise<Enrollment[]> {
    return await this.enrollmentRepository.find({
      where: { course_id: courseId },
      relations: ['course'],
      order: { enrollment_date: 'DESC' }
    });
  }

  async updateProgress(enrollmentId: string, lectureId?: string, assessmentData?: any): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { enrollment_id: enrollmentId },
      relations: ['course', 'course.lectures', 'course.assessments']
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    let progressUpdated = false;
    let xpEarned = 0;

    // Handle lecture completion
    if (lectureId) {
      const lecture = enrollment.course.lectures.find(l => l.lecture_id === lectureId);
      if (!lecture) {
        throw new Error('Lecture not found in course');
      }

      if (!enrollment.completed_lectures.includes(lectureId)) {
        enrollment.completed_lectures.push(lectureId);
        xpEarned += lecture.xp_reward * enrollment.course.xp_multiplier;
        progressUpdated = true;
      }
    }

    // Handle assessment completion
    if (assessmentData) {
      const { assessment_id, score, attempts } = assessmentData;
      const assessment = enrollment.course.assessments.find(a => a.assessment_id === assessment_id);
      
      if (!assessment) {
        throw new Error('Assessment not found in course');
      }

      // Check if assessment was already completed
      const existingAssessment = enrollment.completed_assessments.find(
        (a: any) => a.assessment_id === assessment_id
      );

      if (!existingAssessment && score >= assessment.passing_score) {
        enrollment.completed_assessments.push({
          assessment_id,
          score,
          completed_at: new Date(),
          attempts
        });
        xpEarned += assessment.xp_reward * enrollment.course.xp_multiplier;
        progressUpdated = true;
      }
    }

    if (progressUpdated) {
      // Update XP
      enrollment.total_xp_earned += xpEarned;
      
      // Calculate progress percentage
      const totalLectures = enrollment.course.lectures.length;
      const totalAssessments = enrollment.course.assessments.filter(a => a.required).length;
      const completedLectures = enrollment.completed_lectures.length;
      const completedAssessments = enrollment.completed_assessments.length;
      
      const lectureProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 0.7 : 0;
      const assessmentProgress = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 0.3 : 0;
      
      enrollment.progress_percentage = Math.round((lectureProgress + assessmentProgress) * 100);
      
      // Update status based on progress
      if (enrollment.progress_percentage === 100) {
        enrollment.status = 'completed';
        enrollment.completion_date = new Date();
      } else if (enrollment.progress_percentage > 0) {
        enrollment.status = 'in_progress';
      }

      // Check for milestones and trigger celebrations
      await this.checkMilestones(enrollment);
      
      enrollment.last_activity = new Date();
    }

    return await this.enrollmentRepository.save(enrollment);
  }

  async checkInactiveStudents(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .where('enrollment.last_activity < :sevenDaysAgo', { sevenDaysAgo })
      .andWhere('enrollment.status IN (:...statuses)', { statuses: ['enrolled', 'in_progress'] })
      .getMany();

    for (const enrollment of inactiveEnrollments) {
      await this.sendReEngagementNotification(enrollment);
    }
  }

  async getStudentProgress(studentId: string, courseId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { student_id: studentId, course_id: courseId },
      relations: ['course', 'course.lectures', 'course.assessments']
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const totalLectures = enrollment.course.lectures.length;
    const totalAssessments = enrollment.course.assessments.length;
    const completedLectures = enrollment.completed_lectures.length;
    const completedAssessments = enrollment.completed_assessments.length;

    return {
      enrollment_id: enrollment.enrollment_id,
      course_title: enrollment.course.title,
      progress_percentage: enrollment.progress_percentage,
      status: enrollment.status,
      total_xp_earned: enrollment.total_xp_earned,
      lectures: {
        total: totalLectures,
        completed: completedLectures,
        remaining: totalLectures - completedLectures
      },
      assessments: {
        total: totalAssessments,
        completed: completedAssessments,
        remaining: totalAssessments - completedAssessments
      },
      last_activity: enrollment.last_activity,
      enrollment_date: enrollment.enrollment_date,
      completion_date: enrollment.completion_date
    };
  }

  async dropCourse(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { enrollment_id: enrollmentId }
    });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (enrollment.status === 'completed') {
      throw new Error('Cannot drop a completed course');
    }

    enrollment.status = 'dropped';
    await this.enrollmentRepository.save(enrollment);
  }

  private async validatePrerequisites(studentId: string, prerequisites: string[]): Promise<void> {
    for (const prerequisiteId of prerequisites) {
      const prerequisiteEnrollment = await this.enrollmentRepository.findOne({
        where: { 
          student_id: studentId, 
          course_id: prerequisiteId, 
          status: 'completed' 
        }
      });

      if (!prerequisiteEnrollment) {
        throw new Error(`Prerequisite course ${prerequisiteId} must be completed before enrollment`);
      }
    }
  }

  private async checkMilestones(enrollment: Enrollment): Promise<void> {
    const milestones = [25, 50, 75, 100];
    const currentProgress = enrollment.progress_percentage;
    
    for (const milestone of milestones) {
      if (currentProgress >= milestone) {
        // Check if milestone was already celebrated
        const milestoneKey = `milestone_${milestone}`;
        if (!enrollment.mentor_alerts.includes(milestoneKey)) {
          enrollment.mentor_alerts.push(milestoneKey);
          
          // Trigger milestone celebration (would integrate with notification system)
          await this.triggerMilestoneCelebration(enrollment, milestone);
        }
      }
    }
  }

  private async triggerMilestoneCelebration(enrollment: Enrollment, milestone: number): Promise<void> {
    // This would integrate with notification/reward systems
    console.log(`🎉 Student ${enrollment.student_id} reached ${milestone}% in course ${enrollment.course_id}`);
    
    // Award milestone bonus XP
    const bonusXP = milestone === 100 ? 100 : 25;
    enrollment.total_xp_earned += bonusXP;
  }

  private async sendReEngagementNotification(enrollment: Enrollment): Promise<void> {
    // This would integrate with notification system
    console.log(`📧 Sending re-engagement notification to student ${enrollment.student_id} for course ${enrollment.course_id}`);
    
    // Add alert to mentor alerts
    enrollment.mentor_alerts.push(`inactive_${new Date().toISOString()}`);
    await this.enrollmentRepository.save(enrollment);
  }

  async getEnrollmentAnalytics(courseId?: string): Promise<any> {
    const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment');
    
    if (courseId) {
      queryBuilder.where('enrollment.course_id = :courseId', { courseId });
    }

    const enrollments = await queryBuilder.getMany();
    
    const analytics = {
      total_enrollments: enrollments.length,
      active_enrollments: enrollments.filter(e => ['enrolled', 'in_progress'].includes(e.status)).length,
      completed_enrollments: enrollments.filter(e => e.status === 'completed').length,
      dropped_enrollments: enrollments.filter(e => e.status === 'dropped').length,
      average_progress: enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length || 0,
      average_xp: enrollments.reduce((sum, e) => sum + e.total_xp_earned, 0) / enrollments.length || 0,
      completion_rate: enrollments.length > 0 ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100 : 0
    };

    return analytics;
  }
}