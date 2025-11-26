/**
 * Course Improvement Service
 * 
 * Manages continuous improvement of live courses through feedback collection,
 * improvement task creation, content flagging, and student notifications.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.5
 */

import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export interface LiveFeedbackData {
  courseId: string;
  studentId: string;
  moduleId?: string;
  lectureId?: string;
  rating: number;
  comments?: string;
  issueType?: 'content' | 'technical' | 'clarity' | 'relevance' | 'other';
  timestamp: Date;
}

export interface AnalyticsData {
  courseId: string;
  completionRate: number;
  averageRating: number;
  engagementMetrics: {
    videoWatchTime: number;
    assignmentSubmissionRate: number;
    discussionParticipation: number;
  };
  strugglingTopics: string[];
}

export interface ImprovementTask {
  id: string;
  courseId: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impactScore: number;
  affectedStudents: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedTo?: string;
  dueDate?: Date;
  createdAt: Date;
}

export interface OutdatedContentFlag {
  id: string;
  courseId: string;
  contentId: string;
  contentType: 'lecture' | 'notes' | 'assessment' | 'resource';
  reason: 'age' | 'external_change' | 'feedback' | 'technology_update';
  flaggedAt: Date;
  scheduledUpdateDate?: Date;
  severity: 'urgent' | 'important' | 'routine';
}

export interface StudentNotification {
  id: string;
  studentId: string;
  courseId: string;
  notificationType: 'content_update' | 'improvement' | 'new_feature';
  title: string;
  message: string;
  updateDetails: {
    moduleId?: string;
    lectureId?: string;
    changeDescription: string;
    improvementType: string;
  };
  sentAt: Date;
  readAt?: Date;
}

export class CourseImprovementService {
  /**
   * Collect live feedback from students and analytics data for ongoing courses
   * Requirements: 12.1
   * 
   * Property 51: Live Course Feedback Collection
   * For any live course, the system should continuously collect student feedback and analytics data.
   */
  async collectLiveFeedback(courseId: string): Promise<{
    feedback: LiveFeedbackData[];
    analytics: AnalyticsData;
  }> {
    try {
      logger.info(`Collecting live feedback for course: ${courseId}`);

      // Verify course exists and is live
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          enrollments: {
            include: {
              student: true
            }
          },
          modules: {
            include: {
              lectures: true
            }
          }
        }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      if (course.status !== 'published') {
        throw new Error(`Course is not live: ${courseId}`);
      }

      // Collect student feedback
      const feedback: LiveFeedbackData[] = [];
      
      // Get feedback from course reviews
      const reviews = await prisma.courseReview.findMany({
        where: { courseId },
        orderBy: { createdAt: 'desc' }
      });

      for (const review of reviews) {
        feedback.push({
          courseId,
          studentId: review.studentId,
          rating: review.rating,
          comments: review.comment || undefined,
          issueType: this.categorizeIssue(review.comment || ''),
          timestamp: review.createdAt
        });
      }

      // Get feedback from module/lecture specific feedback
      for (const module of course.modules) {
        for (const lecture of module.lectures) {
          const lectureProgress = await prisma.lectureProgress.findMany({
            where: { lectureId: lecture.id },
            include: { student: true }
          });

          for (const progress of lectureProgress) {
            if (progress.feedback) {
              feedback.push({
                courseId,
                studentId: progress.studentId,
                moduleId: module.id,
                lectureId: lecture.id,
                rating: progress.rating || 0,
                comments: progress.feedback,
                issueType: this.categorizeIssue(progress.feedback),
                timestamp: progress.updatedAt
              });
            }
          }
        }
      }

      // Calculate analytics data
      const totalEnrollments = course.enrollments.length;
      const completedEnrollments = course.enrollments.filter(
        e => e.status === 'completed'
      ).length;

      const completionRate = totalEnrollments > 0 
        ? (completedEnrollments / totalEnrollments) * 100 
        : 0;

      const averageRating = feedback.length > 0
        ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
        : 0;

      // Calculate engagement metrics
      const videoWatchTime = await this.calculateAverageWatchTime(courseId);
      const assignmentSubmissionRate = await this.calculateSubmissionRate(courseId);
      const discussionParticipation = await this.calculateDiscussionParticipation(courseId);

      // Identify struggling topics
      const strugglingTopics = await this.identifyStrugglingTopics(courseId, feedback);

      const analytics: AnalyticsData = {
        courseId,
        completionRate,
        averageRating,
        engagementMetrics: {
          videoWatchTime,
          assignmentSubmissionRate,
          discussionParticipation
        },
        strugglingTopics
      };

      logger.info(`Collected ${feedback.length} feedback items for course: ${courseId}`);

      return { feedback, analytics };
    } catch (error) {
      logger.error(`Error collecting live feedback for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Create improvement tasks with prioritization based on impact
   * Requirements: 12.2
   * 
   * Property 52: Improvement Task Creation
   * For any identified improvement, the system should create an update task with assigned priority level.
   */
  async createImprovementTask(
    courseId: string,
    improvement: {
      title: string;
      description: string;
      affectedStudents: number;
      impactType: 'critical' | 'high' | 'medium' | 'low';
      moduleId?: string;
      lectureId?: string;
    }
  ): Promise<ImprovementTask> {
    try {
      logger.info(`Creating improvement task for course: ${courseId}`);

      // Verify course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      // Calculate impact score based on affected students and impact type
      const impactScore = this.calculateImpactScore(
        improvement.affectedStudents,
        improvement.impactType
      );

      // Determine priority based on impact score
      const priority = this.determinePriority(impactScore, improvement.impactType);

      // Create improvement task
      const task: ImprovementTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId,
        title: improvement.title,
        description: improvement.description,
        priority,
        impactScore,
        affectedStudents: improvement.affectedStudents,
        status: 'pending',
        createdAt: new Date()
      };

      // Set due date based on priority
      if (priority === 'critical') {
        task.dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      } else if (priority === 'high') {
        task.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
      } else if (priority === 'medium') {
        task.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      }

      // Store task in database
      await prisma.courseImprovementTask.create({
        data: {
          id: task.id,
          courseId: task.courseId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          impactScore: task.impactScore,
          affectedStudents: task.affectedStudents,
          status: task.status,
          dueDate: task.dueDate,
          createdAt: task.createdAt
        }
      });

      logger.info(`Created improvement task ${task.id} with priority ${priority}`);

      return task;
    } catch (error) {
      logger.error(`Error creating improvement task for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Flag outdated content for revision and schedule updates
   * Requirements: 12.3
   * 
   * Property 53: Outdated Content Flagging
   * For any content that becomes outdated (based on age or external triggers), 
   * the system should flag it for revision and schedule updates.
   */
  async flagOutdatedContent(
    courseId: string,
    contentId: string,
    contentType: 'lecture' | 'notes' | 'assessment' | 'resource',
    reason: 'age' | 'external_change' | 'feedback' | 'technology_update'
  ): Promise<OutdatedContentFlag> {
    try {
      logger.info(`Flagging outdated content: ${contentId} in course: ${courseId}`);

      // Verify course and content exist
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        throw new Error(`Course not found: ${courseId}`);
      }

      // Determine severity based on reason and content age
      const severity = this.determineSeverity(reason, contentType);

      // Create content flag
      const flag: OutdatedContentFlag = {
        id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        courseId,
        contentId,
        contentType,
        reason,
        flaggedAt: new Date(),
        severity
      };

      // Schedule update date based on severity
      if (severity === 'urgent') {
        flag.scheduledUpdateDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      } else if (severity === 'important') {
        flag.scheduledUpdateDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      } else {
        flag.scheduledUpdateDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
      }

      // Store flag in database
      await prisma.contentFlag.create({
        data: {
          id: flag.id,
          courseId: flag.courseId,
          contentId: flag.contentId,
          contentType: flag.contentType,
          reason: flag.reason,
          severity: flag.severity,
          flaggedAt: flag.flaggedAt,
          scheduledUpdateDate: flag.scheduledUpdateDate
        }
      });

      logger.info(`Flagged content ${contentId} with severity ${severity}`);

      return flag;
    } catch (error) {
      logger.error(`Error flagging outdated content ${contentId}:`, error);
      throw error;
    }
  }

  /**
   * Notify enrolled students of content updates and improvements
   * Requirements: 12.5
   * 
   * Property 54: Update Notification to Students
   * For any content update in a live course, the system should notify all enrolled students of the improvement.
   */
  async notifyStudents(
    courseId: string,
    updateDetails: {
      moduleId?: string;
      lectureId?: string;
      changeDescription: string;
      improvementType: string;
    }
  ): Promise<StudentNotification[]> {
    try {
      logger.info(`Notifying students of updates for course: ${courseId}`);

      // Get all enrolled students
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: { in: ['active', 'in_progress'] }
        },
        include: {
          student: true
        }
      });

      if (enrollments.length === 0) {
        logger.info(`No enrolled students to notify for course: ${courseId}`);
        return [];
      }

      // Create notification title and message
      const title = this.generateNotificationTitle(updateDetails.improvementType);
      const message = this.generateNotificationMessage(updateDetails);

      // Create notifications for all enrolled students
      const notifications: StudentNotification[] = [];

      for (const enrollment of enrollments) {
        const notification: StudentNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          studentId: enrollment.studentId,
          courseId,
          notificationType: 'content_update',
          title,
          message,
          updateDetails,
          sentAt: new Date()
        };

        // Store notification in database
        await prisma.notification.create({
          data: {
            id: notification.id,
            userId: notification.studentId,
            type: notification.notificationType,
            title: notification.title,
            message: notification.message,
            metadata: JSON.stringify({
              courseId: notification.courseId,
              updateDetails: notification.updateDetails
            }),
            createdAt: notification.sentAt
          }
        });

        notifications.push(notification);
      }

      logger.info(`Sent ${notifications.length} notifications for course: ${courseId}`);

      return notifications;
    } catch (error) {
      logger.error(`Error notifying students for course ${courseId}:`, error);
      throw error;
    }
  }

  // Helper methods

  private categorizeIssue(comment: string): 'content' | 'technical' | 'clarity' | 'relevance' | 'other' {
    const lowerComment = comment.toLowerCase();
    
    if (lowerComment.includes('unclear') || lowerComment.includes('confusing') || lowerComment.includes('understand')) {
      return 'clarity';
    }
    if (lowerComment.includes('bug') || lowerComment.includes('error') || lowerComment.includes('broken')) {
      return 'technical';
    }
    if (lowerComment.includes('outdated') || lowerComment.includes('irrelevant') || lowerComment.includes('not applicable')) {
      return 'relevance';
    }
    if (lowerComment.includes('content') || lowerComment.includes('material') || lowerComment.includes('lecture')) {
      return 'content';
    }
    
    return 'other';
  }

  private async calculateAverageWatchTime(courseId: string): Promise<number> {
    const lectureProgress = await prisma.lectureProgress.findMany({
      where: {
        lecture: {
          module: {
            courseId
          }
        }
      }
    });

    if (lectureProgress.length === 0) return 0;

    const totalWatchTime = lectureProgress.reduce((sum, p) => sum + (p.watchTime || 0), 0);
    return totalWatchTime / lectureProgress.length;
  }

  private async calculateSubmissionRate(courseId: string): Promise<number> {
    const assignments = await prisma.assignment.findMany({
      where: {
        module: {
          courseId
        }
      },
      include: {
        submissions: true
      }
    });

    if (assignments.length === 0) return 0;

    const totalAssignments = assignments.length;
    const totalSubmissions = assignments.reduce((sum, a) => sum + a.submissions.length, 0);
    
    return totalSubmissions / totalAssignments;
  }

  private async calculateDiscussionParticipation(courseId: string): Promise<number> {
    const discussions = await prisma.discussion.findMany({
      where: { courseId },
      include: {
        posts: true
      }
    });

    if (discussions.length === 0) return 0;

    const totalPosts = discussions.reduce((sum, d) => sum + d.posts.length, 0);
    return totalPosts / discussions.length;
  }

  private async identifyStrugglingTopics(
    courseId: string,
    feedback: LiveFeedbackData[]
  ): Promise<string[]> {
    // Identify topics with low ratings or negative feedback
    const topicRatings = new Map<string, { total: number; count: number }>();

    for (const item of feedback) {
      if (item.moduleId) {
        const module = await prisma.module.findUnique({
          where: { id: item.moduleId }
        });

        if (module) {
          const current = topicRatings.get(module.title) || { total: 0, count: 0 };
          topicRatings.set(module.title, {
            total: current.total + item.rating,
            count: current.count + 1
          });
        }
      }
    }

    // Find topics with average rating below 3.0
    const strugglingTopics: string[] = [];
    for (const [topic, data] of topicRatings.entries()) {
      const average = data.total / data.count;
      if (average < 3.0) {
        strugglingTopics.push(topic);
      }
    }

    return strugglingTopics;
  }

  private calculateImpactScore(affectedStudents: number, impactType: string): number {
    const baseScore = affectedStudents;
    const multiplier = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    }[impactType] || 1;

    return baseScore * multiplier;
  }

  private determinePriority(
    impactScore: number,
    impactType: string
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (impactType === 'critical' || impactScore > 100) {
      return 'critical';
    }
    if (impactType === 'high' || impactScore > 50) {
      return 'high';
    }
    if (impactType === 'medium' || impactScore > 20) {
      return 'medium';
    }
    return 'low';
  }

  private determineSeverity(
    reason: string,
    contentType: string
  ): 'urgent' | 'important' | 'routine' {
    if (reason === 'external_change' || reason === 'technology_update') {
      return 'urgent';
    }
    if (reason === 'feedback' && contentType === 'lecture') {
      return 'important';
    }
    if (reason === 'age') {
      return 'routine';
    }
    return 'routine';
  }

  private generateNotificationTitle(improvementType: string): string {
    const titles: Record<string, string> = {
      content_update: 'Course Content Updated',
      bug_fix: 'Technical Issue Resolved',
      enhancement: 'Course Enhancement Available',
      new_material: 'New Learning Materials Added'
    };

    return titles[improvementType] || 'Course Update Available';
  }

  private generateNotificationMessage(updateDetails: {
    moduleId?: string;
    lectureId?: string;
    changeDescription: string;
    improvementType: string;
  }): string {
    let message = `We've made improvements to your course based on student feedback. `;
    message += updateDetails.changeDescription;
    message += ` Check out the updated content to enhance your learning experience.`;

    return message;
  }
}

export default new CourseImprovementService();
