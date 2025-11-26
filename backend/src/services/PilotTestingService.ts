/**
 * PilotTestingService
 * 
 * Manages pilot programs and collects feedback for course iteration.
 * Coordinates pilot student recruitment, feedback collection, issue prioritization,
 * iteration tracking, and launch approval based on feedback thresholds.
 * 
 * Requirements: 10.2, 10.3, 10.4, 10.5
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface PilotCohort {
  id: string;
  courseId: string;
  students: PilotStudent[];
  startDate: Date;
  endDate: Date;
  status: 'recruiting' | 'active' | 'completed';
}

interface PilotStudent {
  id: string;
  userId: string;
  cohortId: string;
  enrolledAt: Date;
  completedModules: string[];
}

interface FeedbackCollection {
  id: string;
  courseId: string;
  moduleId: string;
  studentId: string;
  ratings: Rating[];
  comments: string;
  issues: Issue[];
  submittedAt: Date;
}

interface Rating {
  criterion: string;
  score: number;
  maxScore: number;
}

interface Issue {
  id: string;
  description: string;
  category: 'content' | 'technical' | 'usability' | 'spiritual' | 'assessment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedBy: string;
  reportedAt: Date;
}

interface PriorityList {
  issues: PrioritizedIssue[];
  totalImpact: number;
}

interface PrioritizedIssue extends Issue {
  priority: number;
  impactScore: number;
  affectedStudents: number;
  estimatedEffort: 'low' | 'medium' | 'high';
}

interface Iteration {
  id: string;
  courseId: string;
  description: string;
  changes: Change[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  completedAt?: Date;
  reTestRequired: boolean;
}

interface Change {
  type: 'content' | 'assessment' | 'video' | 'materials' | 'spiritual';
  description: string;
  moduleId?: string;
  lectureId?: string;
  implementedBy: string;
  implementedAt: Date;
}

interface IterationHistory {
  courseId: string;
  iterations: Iteration[];
  totalIterations: number;
  completedIterations: number;
  pendingIterations: number;
}

interface PilotResults {
  cohortId: string;
  courseId: string;
  totalStudents: number;
  completionRate: number;
  averageRating: number;
  feedbackCount: number;
  issuesIdentified: number;
  issuesResolved: number;
  recommendationScore: number;
}

interface LaunchDecision {
  approved: boolean;
  courseId: string;
  pilotResults: PilotResults;
  feedbackThreshold: number;
  meetsThreshold: boolean;
  reason: string;
  conditions?: string[];
  decidedAt: Date;
}

interface RecruitmentCriteria {
  minGPA?: number;
  requiredPrerequisites?: string[];
  spiritualMaturity?: 'beginner' | 'intermediate' | 'advanced';
  technicalSkills?: string[];
  diversityTargets?: {
    geographic?: boolean;
    demographic?: boolean;
    academic?: boolean;
  };
}

export default class PilotTestingService {
  /**
   * Recruit pilot students for cohort formation
   * Requirements: 10.1 (implied for pilot program setup)
   * 
   * @param courseId - Course identifier
   * @param criteria - Recruitment criteria for student selection
   * @returns PilotCohort with recruited students
   */
  async recruitPilotStudents(
    courseId: string,
    criteria: RecruitmentCriteria
  ): Promise<PilotCohort> {
    try {
      logger.info('Recruiting pilot students', { courseId, criteria });

      // Validate course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      // Find eligible students based on criteria
      const eligibleStudents = await this.findEligibleStudents(criteria);

      if (eligibleStudents.length < 10) {
        logger.warn('Insufficient eligible students for pilot cohort', {
          courseId,
          found: eligibleStudents.length,
          required: 10
        });
      }

      // Select 10-20 students for pilot cohort
      const selectedStudents = eligibleStudents.slice(0, Math.min(20, eligibleStudents.length));

      // Create pilot cohort
      const cohort: PilotCohort = {
        id: `cohort_${courseId}_${Date.now()}`,
        courseId,
        students: selectedStudents.map(student => ({
          id: `pilot_${student.id}_${Date.now()}`,
          userId: student.id,
          cohortId: `cohort_${courseId}_${Date.now()}`,
          enrolledAt: new Date(),
          completedModules: []
        })),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        status: 'recruiting'
      };

      logger.info('Pilot cohort created', {
        cohortId: cohort.id,
        studentCount: cohort.students.length
      });

      return cohort;
    } catch (error) {
      logger.error('Error recruiting pilot students', { error, courseId });
      throw error;
    }
  }

  /**
   * Collect feedback after each module
   * Requirements: 10.2
   * Property 42: Module Feedback Collection
   * 
   * @param courseId - Course identifier
   * @param moduleId - Module identifier
   * @returns FeedbackCollection with student feedback
   */
  async collectFeedback(
    courseId: string,
    moduleId: string
  ): Promise<FeedbackCollection[]> {
    try {
      logger.info('Collecting module feedback', { courseId, moduleId });

      // Get all pilot students for this course
      const pilotStudents = await this.getPilotStudents(courseId);

      if (pilotStudents.length === 0) {
        logger.warn('No pilot students found for course', { courseId });
        return [];
      }

      // Collect feedback from each student who completed the module
      const feedbackCollections: FeedbackCollection[] = [];

      for (const student of pilotStudents) {
        if (student.completedModules.includes(moduleId)) {
          const feedback = await this.collectStudentFeedback(
            courseId,
            moduleId,
            student.userId
          );
          feedbackCollections.push(feedback);
        }
      }

      logger.info('Module feedback collected', {
        courseId,
        moduleId,
        feedbackCount: feedbackCollections.length
      });

      return feedbackCollections;
    } catch (error) {
      logger.error('Error collecting feedback', { error, courseId, moduleId });
      throw error;
    }
  }

  /**
   * Prioritize fixes based on impact
   * Requirements: 10.3
   * Property 43: Issue Prioritization by Impact
   * 
   * @param feedbackId - Feedback collection identifier
   * @returns PriorityList with impact-based prioritization
   */
  async prioritizeFixes(feedbackId: string): Promise<PriorityList> {
    try {
      logger.info('Prioritizing fixes', { feedbackId });

      // Get all issues from feedback
      const issues = await this.getIssuesFromFeedback(feedbackId);

      if (issues.length === 0) {
        logger.info('No issues found in feedback', { feedbackId });
        return {
          issues: [],
          totalImpact: 0
        };
      }

      // Calculate impact score for each issue
      const prioritizedIssues: PrioritizedIssue[] = await Promise.all(
        issues.map(async (issue) => {
          const impactScore = await this.calculateImpactScore(issue);
          const affectedStudents = await this.countAffectedStudents(issue);
          const estimatedEffort = this.estimateEffort(issue);

          // Priority = (Impact Score * Affected Students) / Effort
          const effortMultiplier = estimatedEffort === 'low' ? 1 : estimatedEffort === 'medium' ? 2 : 3;
          const priority = (impactScore * affectedStudents) / effortMultiplier;

          return {
            ...issue,
            priority,
            impactScore,
            affectedStudents,
            estimatedEffort
          };
        })
      );

      // Sort by priority (highest first)
      prioritizedIssues.sort((a, b) => b.priority - a.priority);

      const totalImpact = prioritizedIssues.reduce((sum, issue) => sum + issue.impactScore, 0);

      logger.info('Fixes prioritized', {
        feedbackId,
        issueCount: prioritizedIssues.length,
        totalImpact
      });

      return {
        issues: prioritizedIssues,
        totalImpact
      };
    } catch (error) {
      logger.error('Error prioritizing fixes', { error, feedbackId });
      throw error;
    }
  }

  /**
   * Track iterations for improvement tracking
   * Requirements: 10.4
   * Property 44: Content Update and Re-Test
   * 
   * @param courseId - Course identifier
   * @returns IterationHistory with all iterations
   */
  async trackIterations(courseId: string): Promise<IterationHistory> {
    try {
      logger.info('Tracking iterations', { courseId });

      // Get all iterations for the course
      const iterations = await this.getCourseIterations(courseId);

      const completedIterations = iterations.filter(i => i.completedAt !== undefined);
      const pendingIterations = iterations.filter(i => i.completedAt === undefined);

      const history: IterationHistory = {
        courseId,
        iterations,
        totalIterations: iterations.length,
        completedIterations: completedIterations.length,
        pendingIterations: pendingIterations.length
      };

      logger.info('Iteration history retrieved', {
        courseId,
        total: history.totalIterations,
        completed: history.completedIterations,
        pending: history.pendingIterations
      });

      return history;
    } catch (error) {
      logger.error('Error tracking iterations', { error, courseId });
      throw error;
    }
  }

  /**
   * Approve launch based on feedback threshold validation
   * Requirements: 10.5
   * Property 45: Launch Approval Based on Feedback
   * 
   * @param courseId - Course identifier
   * @param pilotResults - Results from pilot program
   * @returns LaunchDecision with approval status
   */
  async approveLaunch(
    courseId: string,
    pilotResults: PilotResults
  ): Promise<LaunchDecision> {
    try {
      logger.info('Evaluating launch approval', { courseId, pilotResults });

      // Define feedback threshold criteria
      const FEEDBACK_THRESHOLD = 0.75; // 75% positive feedback required
      const MIN_COMPLETION_RATE = 0.70; // 70% completion rate required
      const MIN_AVERAGE_RATING = 4.0; // 4.0/5.0 average rating required
      const MAX_CRITICAL_ISSUES = 0; // No critical issues allowed

      // Calculate recommendation score (0-1)
      const recommendationScore = pilotResults.recommendationScore;

      // Check if meets threshold
      const meetsThreshold = 
        recommendationScore >= FEEDBACK_THRESHOLD &&
        pilotResults.completionRate >= MIN_COMPLETION_RATE &&
        pilotResults.averageRating >= MIN_AVERAGE_RATING;

      // Check for critical issues
      const criticalIssues = await this.getCriticalIssues(courseId);
      const hasCriticalIssues = criticalIssues.length > MAX_CRITICAL_ISSUES;

      // Determine approval
      const approved = meetsThreshold && !hasCriticalIssues;

      // Build decision reason
      let reason = '';
      const conditions: string[] = [];

      if (!meetsThreshold) {
        reason = 'Feedback threshold not met. ';
        if (recommendationScore < FEEDBACK_THRESHOLD) {
          conditions.push(`Recommendation score ${recommendationScore.toFixed(2)} below threshold ${FEEDBACK_THRESHOLD}`);
        }
        if (pilotResults.completionRate < MIN_COMPLETION_RATE) {
          conditions.push(`Completion rate ${(pilotResults.completionRate * 100).toFixed(1)}% below required ${MIN_COMPLETION_RATE * 100}%`);
        }
        if (pilotResults.averageRating < MIN_AVERAGE_RATING) {
          conditions.push(`Average rating ${pilotResults.averageRating.toFixed(1)} below required ${MIN_AVERAGE_RATING}`);
        }
      }

      if (hasCriticalIssues) {
        reason += `${criticalIssues.length} critical issue(s) must be resolved. `;
        conditions.push(...criticalIssues.map(issue => `Critical: ${issue.description}`));
      }

      if (approved) {
        reason = 'All feedback thresholds met and no critical issues. Course approved for launch.';
      }

      const decision: LaunchDecision = {
        approved,
        courseId,
        pilotResults,
        feedbackThreshold: FEEDBACK_THRESHOLD,
        meetsThreshold,
        reason,
        conditions: conditions.length > 0 ? conditions : undefined,
        decidedAt: new Date()
      };

      logger.info('Launch decision made', {
        courseId,
        approved,
        reason
      });

      return decision;
    } catch (error) {
      logger.error('Error approving launch', { error, courseId });
      throw error;
    }
  }

  // Private helper methods

  private async findEligibleStudents(criteria: RecruitmentCriteria): Promise<any[]> {
    // Mock implementation - in production, query actual student database
    const mockStudents = Array.from({ length: 15 }, (_, i) => ({
      id: `student_${i + 1}`,
      gpa: 3.0 + Math.random() * 1.0,
      prerequisites: ['COURSE_101', 'COURSE_102'],
      spiritualMaturity: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)]
    }));

    return mockStudents.filter(student => {
      if (criteria.minGPA && student.gpa < criteria.minGPA) return false;
      if (criteria.spiritualMaturity && student.spiritualMaturity !== criteria.spiritualMaturity) return false;
      return true;
    });
  }

  private async getPilotStudents(courseId: string): Promise<PilotStudent[]> {
    // Mock implementation - in production, query pilot cohort database
    return [
      {
        id: `pilot_1`,
        userId: `user_1`,
        cohortId: `cohort_${courseId}`,
        enrolledAt: new Date(),
        completedModules: ['module_1', 'module_2']
      }
    ];
  }

  private async collectStudentFeedback(
    courseId: string,
    moduleId: string,
    studentId: string
  ): Promise<FeedbackCollection> {
    // Mock implementation - in production, retrieve actual feedback
    return {
      id: `feedback_${courseId}_${moduleId}_${studentId}`,
      courseId,
      moduleId,
      studentId,
      ratings: [
        { criterion: 'Content Quality', score: 4, maxScore: 5 },
        { criterion: 'Clarity', score: 5, maxScore: 5 },
        { criterion: 'Engagement', score: 4, maxScore: 5 }
      ],
      comments: 'Great module, very informative',
      issues: [],
      submittedAt: new Date()
    };
  }

  private async getIssuesFromFeedback(feedbackId: string): Promise<Issue[]> {
    // Mock implementation - in production, query feedback database
    return [
      {
        id: `issue_1`,
        description: 'Video quality poor in lecture 3',
        category: 'technical',
        severity: 'medium',
        reportedBy: 'student_1',
        reportedAt: new Date()
      },
      {
        id: `issue_2`,
        description: 'Assessment too difficult',
        category: 'assessment',
        severity: 'high',
        reportedBy: 'student_2',
        reportedAt: new Date()
      }
    ];
  }

  private async calculateImpactScore(issue: Issue): Promise<number> {
    // Calculate impact based on severity and category
    const severityScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const categoryMultipliers = {
      content: 1.5,
      technical: 1.0,
      usability: 1.2,
      spiritual: 1.8,
      assessment: 1.6
    };

    return severityScores[issue.severity] * categoryMultipliers[issue.category];
  }

  private async countAffectedStudents(issue: Issue): Promise<number> {
    // Mock implementation - in production, count actual affected students
    return Math.floor(Math.random() * 10) + 1;
  }

  private estimateEffort(issue: Issue): 'low' | 'medium' | 'high' {
    // Estimate effort based on category and severity
    if (issue.severity === 'low') return 'low';
    if (issue.severity === 'critical') return 'high';
    if (issue.category === 'technical') return 'medium';
    return 'medium';
  }

  private async getCourseIterations(courseId: string): Promise<Iteration[]> {
    // Mock implementation - in production, query iteration database
    return [
      {
        id: `iteration_1`,
        courseId,
        description: 'Fixed video quality issues',
        changes: [
          {
            type: 'video',
            description: 'Re-encoded lecture 3 video',
            lectureId: 'lecture_3',
            implementedBy: 'admin_1',
            implementedAt: new Date()
          }
        ],
        priority: 'high',
        completedAt: new Date(),
        reTestRequired: true
      }
    ];
  }

  private async getCriticalIssues(courseId: string): Promise<Issue[]> {
    // Mock implementation - in production, query issue database
    return [];
  }
}
