/**
 * ProductionTimelineService
 * 
 * Manages production timelines, task assignments, progress tracking,
 * deadline monitoring, and bottleneck identification for course development.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { PrismaClient } from '@prisma/client';
import NotificationService from './NotificationService';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export enum Phase {
  PLANNING = 'PLANNING',
  CONTENT_DEVELOPMENT = 'CONTENT_DEVELOPMENT',
  PRODUCTION = 'PRODUCTION',
  QUALITY_REVIEW = 'QUALITY_REVIEW',
  PILOT_TESTING = 'PILOT_TESTING',
  LAUNCH = 'LAUNCH'
}

export enum TaskStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  OVERDUE = 'OVERDUE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Milestone {
  id: string;
  phase: Phase;
  name: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  completedDate?: Date;
}

export interface Timeline {
  id: string;
  courseId: string;
  startDate: Date;
  targetLaunchDate: Date;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  timelineId: string;
  courseId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName?: string;
  phase: Phase;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskAssignment {
  taskId: string;
  assigneeId: string;
  assigneeName: string;
  assignedAt: Date;
  notificationSent: boolean;
}

export interface ProgressReport {
  courseId: string;
  courseName: string;
  currentPhase: Phase;
  overallProgress: number;
  phaseProgress: {
    phase: Phase;
    progress: number;
    tasksTotal: number;
    tasksCompleted: number;
    tasksInProgress: number;
    tasksBlocked: number;
  }[];
  upcomingDeadlines: {
    taskId: string;
    taskTitle: string;
    dueDate: Date;
    daysUntilDue: number;
    assigneeName: string;
  }[];
  overdueItems: {
    taskId: string;
    taskTitle: string;
    dueDate: Date;
    daysOverdue: number;
    assigneeName: string;
  }[];
  atRiskMilestones: {
    milestoneId: string;
    milestoneName: string;
    dueDate: Date;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reason: string;
  }[];
}

export interface DashboardData {
  courses: {
    courseId: string;
    courseName: string;
    currentPhase: Phase;
    overallProgress: number;
    status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED';
    nextMilestone: string;
    nextDeadline: Date;
  }[];
  summary: {
    totalCourses: number;
    onTrack: number;
    atRisk: number;
    delayed: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
}

export interface Bottleneck {
  id: string;
  courseId: string;
  type: 'RESOURCE' | 'DEPENDENCY' | 'CAPACITY' | 'APPROVAL' | 'TECHNICAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedTasks: string[];
  identifiedAt: Date;
  solutions: string[];
}

export interface BottleneckAnalysis {
  courseId: string;
  bottlenecks: Bottleneck[];
  recommendations: string[];
  estimatedDelay: number; // in days
}

export default class ProductionTimelineService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create a timeline with phase milestones for a course
   * Requirements: 8.1
   */
  async createTimeline(
    courseId: string,
    startDate: Date,
    targetLaunchDate: Date
  ): Promise<Timeline> {
    try {
      logger.info(`Creating timeline for course ${courseId}`);

      // Calculate phase durations based on total timeline
      const totalDays = Math.floor(
        (targetLaunchDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Standard phase distribution (percentages of total time)
      const phaseDistribution = {
        [Phase.PLANNING]: 0.15,
        [Phase.CONTENT_DEVELOPMENT]: 0.25,
        [Phase.PRODUCTION]: 0.25,
        [Phase.QUALITY_REVIEW]: 0.15,
        [Phase.PILOT_TESTING]: 0.15,
        [Phase.LAUNCH]: 0.05
      };

      // Generate milestones for each phase
      const milestones: Milestone[] = [];
      let currentDate = new Date(startDate);

      for (const [phase, percentage] of Object.entries(phaseDistribution)) {
        const phaseDays = Math.floor(totalDays * percentage);
        const phaseEndDate = new Date(currentDate);
        phaseEndDate.setDate(phaseEndDate.getDate() + phaseDays);

        milestones.push({
          id: `milestone-${phase}-${Date.now()}`,
          phase: phase as Phase,
          name: `Complete ${phase.replace(/_/g, ' ')}`,
          description: `Finish all deliverables for ${phase.replace(/_/g, ' ')} phase`,
          dueDate: phaseEndDate,
          completed: false
        });

        currentDate = phaseEndDate;
      }

      const timeline: Timeline = {
        id: `timeline-${courseId}-${Date.now()}`,
        courseId,
        startDate,
        targetLaunchDate,
        milestones,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      logger.info(`Timeline created successfully for course ${courseId}`);
      return timeline;
    } catch (error) {
      logger.error(`Error creating timeline for course ${courseId}:`, error);
      throw new Error(`Failed to create timeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign a task to a team member with notifications
   * Requirements: 8.2
   */
  async assignTask(
    taskId: string,
    assigneeId: string,
    assigneeName: string
  ): Promise<TaskAssignment> {
    try {
      logger.info(`Assigning task ${taskId} to ${assigneeName} (${assigneeId})`);

      // Create task assignment
      const assignment: TaskAssignment = {
        taskId,
        assigneeId,
        assigneeName,
        assignedAt: new Date(),
        notificationSent: false
      };

      // Send notification to assignee
      try {
        await this.notificationService.createNotification({
          userId: assigneeId,
          category: 'TASK_ASSIGNED',
          title: 'New Task Assigned',
          message: `You have been assigned a new task: ${taskId}`,
          priority: 'medium',
          channels: ['email', 'in_app'],
          data: { taskId }
        });
        assignment.notificationSent = true;
        logger.info(`Notification sent to ${assigneeName} for task ${taskId}`);
      } catch (notifError) {
        logger.warn(`Failed to send notification for task ${taskId}:`, notifError);
        // Continue even if notification fails
      }

      logger.info(`Task ${taskId} assigned successfully to ${assigneeName}`);
      return assignment;
    } catch (error) {
      logger.error(`Error assigning task ${taskId}:`, error);
      throw new Error(`Failed to assign task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track progress and generate dashboard data
   * Requirements: 8.3, 8.4
   */
  async trackProgress(courseId: string): Promise<ProgressReport> {
    try {
      logger.info(`Tracking progress for course ${courseId}`);

      // Mock data - in production, this would query the database
      const mockTasks: Task[] = this.generateMockTasks(courseId);
      const mockMilestones: Milestone[] = this.generateMockMilestones(courseId);

      // Calculate phase progress
      const phaseProgress = Object.values(Phase).map(phase => {
        const phaseTasks = mockTasks.filter(t => t.phase === phase);
        const completed = phaseTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
        const inProgress = phaseTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
        const blocked = phaseTasks.filter(t => t.status === TaskStatus.BLOCKED).length;

        return {
          phase,
          progress: phaseTasks.length > 0 ? (completed / phaseTasks.length) * 100 : 0,
          tasksTotal: phaseTasks.length,
          tasksCompleted: completed,
          tasksInProgress: inProgress,
          tasksBlocked: blocked
        };
      });

      // Calculate overall progress
      const totalTasks = mockTasks.length;
      const completedTasks = mockTasks.filter(t => t.status === TaskStatus.COMPLETED).length;
      const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // Identify upcoming deadlines (within 7 days)
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = mockTasks
        .filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate <= sevenDaysFromNow && t.dueDate >= now)
        .map(t => ({
          taskId: t.id,
          taskTitle: t.title,
          dueDate: t.dueDate,
          daysUntilDue: Math.floor((t.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          assigneeName: t.assigneeName || 'Unassigned'
        }))
        .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

      // Identify overdue items
      const overdueItems = mockTasks
        .filter(t => t.status !== TaskStatus.COMPLETED && t.dueDate < now)
        .map(t => ({
          taskId: t.id,
          taskTitle: t.title,
          dueDate: t.dueDate,
          daysOverdue: Math.floor((now.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
          assigneeName: t.assigneeName || 'Unassigned'
        }))
        .sort((a, b) => b.daysOverdue - a.daysOverdue);

      // Identify at-risk milestones
      const atRiskMilestones = mockMilestones
        .filter(m => !m.completed)
        .map(m => {
          const daysUntilDue = Math.floor((m.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const phaseTasks = mockTasks.filter(t => t.phase === m.phase);
          const phaseProgress = phaseTasks.length > 0
            ? (phaseTasks.filter(t => t.status === TaskStatus.COMPLETED).length / phaseTasks.length) * 100
            : 0;

          let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
          let reason = '';

          if (daysUntilDue < 0) {
            riskLevel = 'HIGH';
            reason = `Milestone is ${Math.abs(daysUntilDue)} days overdue`;
          } else if (daysUntilDue < 7 && phaseProgress < 80) {
            riskLevel = 'HIGH';
            reason = `Only ${daysUntilDue} days remaining with ${phaseProgress.toFixed(0)}% complete`;
          } else if (daysUntilDue < 14 && phaseProgress < 60) {
            riskLevel = 'MEDIUM';
            reason = `${daysUntilDue} days remaining with ${phaseProgress.toFixed(0)}% complete`;
          }

          return {
            milestoneId: m.id,
            milestoneName: m.name,
            dueDate: m.dueDate,
            riskLevel,
            reason
          };
        })
        .filter(m => m.riskLevel !== 'LOW');

      // Determine current phase
      const currentPhase = this.determineCurrentPhase(mockMilestones);

      const report: ProgressReport = {
        courseId,
        courseName: `Course ${courseId}`,
        currentPhase,
        overallProgress,
        phaseProgress,
        upcomingDeadlines,
        overdueItems,
        atRiskMilestones
      };

      logger.info(`Progress tracked successfully for course ${courseId}`);
      return report;
    } catch (error) {
      logger.error(`Error tracking progress for course ${courseId}:`, error);
      throw new Error(`Failed to track progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send reminders for approaching deadlines and escalate delays
   * Requirements: 8.3
   */
  async sendReminders(courseId: string): Promise<{ sent: number; escalated: number }> {
    try {
      logger.info(`Sending reminders for course ${courseId}`);

      const progress = await this.trackProgress(courseId);
      let sent = 0;
      let escalated = 0;

      // Send reminders for upcoming deadlines
      for (const deadline of progress.upcomingDeadlines) {
        if (deadline.daysUntilDue <= 3) {
          try {
            // In production, get actual assignee ID
            await this.notificationService.createNotification({
              userId: 'assignee-id', // Would be actual assignee ID
              category: 'DEADLINE_REMINDER',
              title: 'Upcoming Deadline',
              message: `Task "${deadline.taskTitle}" is due in ${deadline.daysUntilDue} day(s)`,
              priority: deadline.daysUntilDue <= 1 ? 'high' : 'medium',
              channels: ['email', 'in_app'],
              data: { taskId: deadline.taskId, dueDate: deadline.dueDate }
            });
            sent++;
          } catch (notifError) {
            logger.warn(`Failed to send reminder for task ${deadline.taskId}:`, notifError);
          }
        }
      }

      // Escalate overdue items
      for (const overdue of progress.overdueItems) {
        try {
          // Notify both assignee and manager
          await this.notificationService.createNotification({
            userId: 'manager-id', // Would be actual manager ID
            category: 'TASK_OVERDUE',
            title: 'Overdue Task - Escalation',
            message: `Task "${overdue.taskTitle}" is ${overdue.daysOverdue} day(s) overdue`,
            priority: 'high',
            channels: ['email', 'in_app'],
            data: { taskId: overdue.taskId, daysOverdue: overdue.daysOverdue }
          });
          escalated++;
        } catch (notifError) {
          logger.warn(`Failed to escalate overdue task ${overdue.taskId}:`, notifError);
        }
      }

      logger.info(`Reminders sent: ${sent}, Escalations: ${escalated} for course ${courseId}`);
      return { sent, escalated };
    } catch (error) {
      logger.error(`Error sending reminders for course ${courseId}:`, error);
      throw new Error(`Failed to send reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dashboard data for all courses
   * Requirements: 8.4
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      logger.info('Generating dashboard data for all courses');

      // Mock data - in production, this would query all courses
      const mockCourseIds = ['course-1', 'course-2', 'course-3'];
      const courses = [];

      for (const courseId of mockCourseIds) {
        const progress = await this.trackProgress(courseId);
        
        let status: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' = 'ON_TRACK';
        if (progress.overdueItems.length > 0) {
          status = 'DELAYED';
        } else if (progress.atRiskMilestones.some(m => m.riskLevel === 'HIGH')) {
          status = 'AT_RISK';
        }

        const nextMilestone = progress.phaseProgress
          .find(p => p.progress < 100)?.phase || Phase.LAUNCH;
        
        const nextDeadline = progress.upcomingDeadlines[0]?.dueDate || new Date();

        courses.push({
          courseId,
          courseName: progress.courseName,
          currentPhase: progress.currentPhase,
          overallProgress: progress.overallProgress,
          status,
          nextMilestone: nextMilestone.replace(/_/g, ' '),
          nextDeadline
        });
      }

      const summary = {
        totalCourses: courses.length,
        onTrack: courses.filter(c => c.status === 'ON_TRACK').length,
        atRisk: courses.filter(c => c.status === 'AT_RISK').length,
        delayed: courses.filter(c => c.status === 'DELAYED').length,
        totalTasks: courses.length * 20, // Mock calculation
        completedTasks: Math.floor(courses.reduce((sum, c) => sum + c.overallProgress, 0) / 100 * 20),
        overdueTasks: courses.filter(c => c.status === 'DELAYED').length * 2 // Mock calculation
      };

      logger.info('Dashboard data generated successfully');
      return { courses, summary };
    } catch (error) {
      logger.error('Error generating dashboard data:', error);
      throw new Error(`Failed to generate dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Identify bottlenecks and suggest solutions
   * Requirements: 8.5
   */
  async identifyBottlenecks(courseId: string): Promise<BottleneckAnalysis> {
    try {
      logger.info(`Identifying bottlenecks for course ${courseId}`);

      const progress = await this.trackProgress(courseId);
      const bottlenecks: Bottleneck[] = [];

      // Check for blocked tasks
      const blockedTasks = progress.phaseProgress
        .flatMap(p => Array(p.tasksBlocked).fill(p.phase));
      
      if (blockedTasks.length > 0) {
        bottlenecks.push({
          id: `bottleneck-dependency-${Date.now()}`,
          courseId,
          type: 'DEPENDENCY',
          severity: blockedTasks.length > 3 ? 'HIGH' : 'MEDIUM',
          description: `${blockedTasks.length} task(s) are blocked by dependencies`,
          affectedTasks: blockedTasks.map((_, i) => `task-${i}`),
          identifiedAt: new Date(),
          solutions: [
            'Review and resolve blocking dependencies',
            'Consider parallel work streams where possible',
            'Escalate critical blockers to management'
          ]
        });
      }

      // Check for overdue items
      if (progress.overdueItems.length > 0) {
        bottlenecks.push({
          id: `bottleneck-capacity-${Date.now()}`,
          courseId,
          type: 'CAPACITY',
          severity: progress.overdueItems.length > 5 ? 'CRITICAL' : 'HIGH',
          description: `${progress.overdueItems.length} task(s) are overdue`,
          affectedTasks: progress.overdueItems.map(o => o.taskId),
          identifiedAt: new Date(),
          solutions: [
            'Allocate additional resources to overdue tasks',
            'Re-prioritize task assignments',
            'Consider extending timeline or reducing scope',
            'Implement overtime or additional shifts'
          ]
        });
      }

      // Check for at-risk milestones
      const highRiskMilestones = progress.atRiskMilestones.filter(m => m.riskLevel === 'HIGH');
      if (highRiskMilestones.length > 0) {
        bottlenecks.push({
          id: `bottleneck-approval-${Date.now()}`,
          courseId,
          type: 'APPROVAL',
          severity: 'HIGH',
          description: `${highRiskMilestones.length} milestone(s) at high risk of missing deadline`,
          affectedTasks: highRiskMilestones.map(m => m.milestoneId),
          identifiedAt: new Date(),
          solutions: [
            'Expedite approval processes',
            'Increase review frequency',
            'Assign dedicated resources to at-risk phases',
            'Implement daily standups for at-risk milestones'
          ]
        });
      }

      // Generate recommendations
      const recommendations: string[] = [];
      
      if (bottlenecks.some(b => b.type === 'CAPACITY')) {
        recommendations.push('Consider hiring additional team members or contractors');
        recommendations.push('Implement automation for repetitive tasks');
      }
      
      if (bottlenecks.some(b => b.type === 'DEPENDENCY')) {
        recommendations.push('Create a dependency map and critical path analysis');
        recommendations.push('Establish clear communication channels between dependent teams');
      }
      
      if (bottlenecks.some(b => b.severity === 'CRITICAL')) {
        recommendations.push('Schedule emergency planning session with stakeholders');
        recommendations.push('Consider timeline adjustment or scope reduction');
      }

      // Estimate delay
      const estimatedDelay = Math.max(
        ...progress.overdueItems.map(o => o.daysOverdue),
        0
      );

      const analysis: BottleneckAnalysis = {
        courseId,
        bottlenecks,
        recommendations,
        estimatedDelay
      };

      logger.info(`Identified ${bottlenecks.length} bottleneck(s) for course ${courseId}`);
      return analysis;
    } catch (error) {
      logger.error(`Error identifying bottlenecks for course ${courseId}:`, error);
      throw new Error(`Failed to identify bottlenecks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods

  private determineCurrentPhase(milestones: Milestone[]): Phase {
    // Find the first incomplete milestone
    const incompleteMilestone = milestones.find(m => !m.completed);
    return incompleteMilestone?.phase || Phase.LAUNCH;
  }

  private generateMockTasks(courseId: string): Task[] {
    const tasks: Task[] = [];
    const phases = Object.values(Phase);
    const now = new Date();

    phases.forEach((phase, phaseIndex) => {
      for (let i = 0; i < 5; i++) {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + (phaseIndex * 30) + (i * 5));

        const statuses = [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS, TaskStatus.NOT_STARTED];
        const status = phaseIndex < 2 ? TaskStatus.COMPLETED : statuses[i % 3];

        tasks.push({
          id: `task-${phase}-${i}`,
          timelineId: `timeline-${courseId}`,
          courseId,
          title: `${phase} Task ${i + 1}`,
          description: `Task for ${phase} phase`,
          assigneeId: `user-${i % 3}`,
          assigneeName: `Team Member ${i % 3 + 1}`,
          phase,
          status,
          priority: i === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
          dueDate,
          estimatedHours: 8 + (i * 2),
          dependencies: i > 0 ? [`task-${phase}-${i - 1}`] : [],
          createdAt: new Date(),
          updatedAt: new Date(),
          completedAt: status === TaskStatus.COMPLETED ? new Date() : undefined
        });
      }
    });

    return tasks;
  }

  private generateMockMilestones(courseId: string): Milestone[] {
    const milestones: Milestone[] = [];
    const phases = Object.values(Phase);
    const now = new Date();

    phases.forEach((phase, index) => {
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + (index * 30));

      milestones.push({
        id: `milestone-${phase}`,
        phase,
        name: `Complete ${phase.replace(/_/g, ' ')}`,
        description: `Finish all deliverables for ${phase.replace(/_/g, ' ')} phase`,
        dueDate,
        completed: index < 2,
        completedDate: index < 2 ? new Date() : undefined
      });
    });

    return milestones;
  }
}
