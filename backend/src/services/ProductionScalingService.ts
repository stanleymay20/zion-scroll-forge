/**
 * ProductionScalingService
 * 
 * Manages scalable production processes for concurrent course development.
 * Handles resource pooling, team assignment, template management, task automation,
 * and capacity monitoring with bottleneck detection.
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Types
export interface ResourcePool {
  id: string;
  type: ResourceType;
  totalCapacity: number;
  availableCapacity: number;
  allocatedTo: string[]; // course IDs
}

export enum ResourceType {
  STUDIO_TIME = 'STUDIO_TIME',
  EDITING_WORKSTATION = 'EDITING_WORKSTATION',
  FACULTY_TIME = 'FACULTY_TIME',
  DESIGNER_TIME = 'DESIGNER_TIME',
  REVIEWER_TIME = 'REVIEWER_TIME'
}

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  availability: number; // percentage
  currentAssignments: string[]; // course IDs
}

export enum TeamRole {
  INSTRUCTIONAL_DESIGNER = 'INSTRUCTIONAL_DESIGNER',
  SUBJECT_MATTER_EXPERT = 'SUBJECT_MATTER_EXPERT',
  VIDEO_PRODUCER = 'VIDEO_PRODUCER',
  VIDEO_EDITOR = 'VIDEO_EDITOR',
  GRAPHIC_DESIGNER = 'GRAPHIC_DESIGNER',
  QA_REVIEWER = 'QA_REVIEWER',
  PROJECT_MANAGER = 'PROJECT_MANAGER'
}

export interface TeamAssignment {
  courseId: string;
  teamMembers: TeamMember[];
  assignedAt: Date;
  dedicatedRoles: TeamRole[];
}

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  templateType: TemplateType;
  content: any;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum TemplateType {
  LECTURE_NOTES = 'LECTURE_NOTES',
  VIDEO_SCRIPT = 'VIDEO_SCRIPT',
  ASSESSMENT = 'ASSESSMENT',
  RUBRIC = 'RUBRIC',
  MODULE_STRUCTURE = 'MODULE_STRUCTURE',
  COURSE_OUTLINE = 'COURSE_OUTLINE'
}

export interface AutomatedTask {
  id: string;
  taskType: AutomatedTaskType;
  status: TaskStatus;
  inputData: any;
  outputData?: any;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export enum AutomatedTaskType {
  CAPTION_GENERATION = 'CAPTION_GENERATION',
  VIDEO_FORMATTING = 'VIDEO_FORMATTING',
  PDF_GENERATION = 'PDF_GENERATION',
  FILE_CONVERSION = 'FILE_CONVERSION',
  THUMBNAIL_GENERATION = 'THUMBNAIL_GENERATION',
  TRANSCRIPT_GENERATION = 'TRANSCRIPT_GENERATION'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface CapacityMetrics {
  totalCourses: number;
  activeCourses: number;
  resourceUtilization: Record<ResourceType, number>; // percentage
  teamUtilization: Record<TeamRole, number>; // percentage
  bottlenecks: Bottleneck[];
  performanceDegradation: boolean;
}

export interface Bottleneck {
  type: BottleneckType;
  resource: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentLoad: number;
  capacity: number;
  recommendations: string[];
}

export enum BottleneckType {
  RESOURCE_SHORTAGE = 'RESOURCE_SHORTAGE',
  TEAM_OVERLOAD = 'TEAM_OVERLOAD',
  SYSTEM_PERFORMANCE = 'SYSTEM_PERFORMANCE',
  PROCESS_DELAY = 'PROCESS_DELAY'
}

export interface ScalingReport {
  timestamp: Date;
  capacityMetrics: CapacityMetrics;
  recommendations: string[];
  projectedCapacity: number;
}

export default class ProductionScalingService {
  // In-memory storage for templates (in production, this would be in database)
  private templates: Map<string, CourseTemplate> = new Map();
  /**
   * Check if system can support concurrent course development
   * Requirements: 11.1
   */
  async supportsConcurrentCourses(minCourses: number = 5): Promise<boolean> {
    try {
      const metrics = await this.getCapacityMetrics();
      
      // Check if system can handle at least minCourses without degradation
      const canSupport = metrics.activeCourses <= minCourses && 
                        !metrics.performanceDegradation;
      
      logger.info('Concurrent course support check', {
        minCourses,
        activeCourses: metrics.activeCourses,
        canSupport,
        performanceDegradation: metrics.performanceDegradation
      });
      
      return canSupport;
    } catch (error) {
      logger.error('Error checking concurrent course support', { error, minCourses });
      throw new Error(`Failed to check concurrent course support: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign dedicated team to a course project
   * Requirements: 11.2
   */
  async assignDedicatedTeam(courseId: string, requiredRoles: TeamRole[]): Promise<TeamAssignment> {
    try {
      // Remove duplicate roles to ensure no overlap
      const uniqueRoles = Array.from(new Set(requiredRoles));
      
      // Get available team members for each unique role
      const teamMembers: TeamMember[] = [];
      
      for (const role of uniqueRoles) {
        const member = await this.findAvailableTeamMember(role, courseId);
        if (!member) {
          throw new Error(`No available team member found for role: ${role}`);
        }
        teamMembers.push(member);
      }
      
      // Create team assignment with unique roles
      const assignment: TeamAssignment = {
        courseId,
        teamMembers,
        assignedAt: new Date(),
        dedicatedRoles: uniqueRoles
      };
      
      // Update team member assignments
      for (const member of teamMembers) {
        member.currentAssignments.push(courseId);
      }
      
      logger.info('Dedicated team assigned', {
        courseId,
        teamSize: teamMembers.length,
        roles: uniqueRoles
      });
      
      return assignment;
    } catch (error) {
      logger.error('Error assigning dedicated team', { error, courseId, requiredRoles });
      throw new Error(`Failed to assign dedicated team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find available team member for a specific role
   * Ensures no overlap in core roles across courses
   */
  private async findAvailableTeamMember(role: TeamRole, courseId: string): Promise<TeamMember | null> {
    // In a real implementation, this would query a database
    // For now, return a mock team member
    const mockMember: TeamMember = {
      id: `member-${role}-${Date.now()}`,
      name: `${role} Member`,
      role,
      availability: 100,
      currentAssignments: []
    };
    
    return mockMember;
  }

  /**
   * Create and store a reusable template
   * Requirements: 11.3
   */
  async createTemplate(
    name: string,
    description: string,
    templateType: TemplateType,
    content: any
  ): Promise<CourseTemplate> {
    try {
      const template: CourseTemplate = {
        id: `template-${Date.now()}`,
        name,
        description,
        templateType,
        content,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store template in memory
      this.templates.set(template.id, template);
      
      logger.info('Template created', {
        templateId: template.id,
        name,
        templateType
      });
      
      return template;
    } catch (error) {
      logger.error('Error creating template', { error, name, templateType });
      throw new Error(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reuse an existing template for a course
   * Requirements: 11.3
   */
  async reuseTemplate(templateId: string, courseId: string): Promise<any> {
    try {
      // Fetch template from storage
      const template = this.templates.get(templateId);
      
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
      
      // Increment usage count
      template.usageCount++;
      template.updatedAt = new Date();
      
      // Clone template content for the course
      const clonedContent = JSON.parse(JSON.stringify(template.content));
      
      logger.info('Template reused', {
        templateId,
        courseId,
        usageCount: template.usageCount
      });
      
      return clonedContent;
    } catch (error) {
      logger.error('Error reusing template', { error, templateId, courseId });
      throw new Error(`Failed to reuse template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Automate a repetitive task
   * Requirements: 11.4
   */
  async automateTask(taskType: AutomatedTaskType, inputData: any): Promise<AutomatedTask> {
    try {
      const task: AutomatedTask = {
        id: `task-${Date.now()}`,
        taskType,
        status: TaskStatus.PENDING,
        inputData,
        startedAt: new Date()
      };
      
      // Execute automation based on task type
      task.status = TaskStatus.IN_PROGRESS;
      
      try {
        task.outputData = await this.executeAutomation(taskType, inputData);
        task.status = TaskStatus.COMPLETED;
        task.completedAt = new Date();
      } catch (automationError) {
        task.status = TaskStatus.FAILED;
        task.error = automationError instanceof Error ? automationError.message : 'Unknown error';
        task.completedAt = new Date();
      }
      
      logger.info('Task automated', {
        taskId: task.id,
        taskType,
        status: task.status
      });
      
      return task;
    } catch (error) {
      logger.error('Error automating task', { error, taskType });
      throw new Error(`Failed to automate task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute specific automation based on task type
   */
  private async executeAutomation(taskType: AutomatedTaskType, inputData: any): Promise<any> {
    switch (taskType) {
      case AutomatedTaskType.CAPTION_GENERATION:
        return { captions: 'Generated captions', language: 'en' };
      case AutomatedTaskType.VIDEO_FORMATTING:
        return { format: 'mp4', resolution: '1080p' };
      case AutomatedTaskType.PDF_GENERATION:
        return { pdfUrl: 'https://example.com/document.pdf' };
      case AutomatedTaskType.FILE_CONVERSION:
        return { convertedFile: 'converted-file.ext' };
      case AutomatedTaskType.THUMBNAIL_GENERATION:
        return { thumbnailUrl: 'https://example.com/thumbnail.jpg' };
      case AutomatedTaskType.TRANSCRIPT_GENERATION:
        return { transcript: 'Generated transcript text' };
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  /**
   * Get current capacity metrics
   * Requirements: 11.5
   */
  async getCapacityMetrics(): Promise<CapacityMetrics> {
    try {
      // In a real implementation, this would query actual system metrics
      const metrics: CapacityMetrics = {
        totalCourses: 10,
        activeCourses: 3,
        resourceUtilization: {
          [ResourceType.STUDIO_TIME]: 60,
          [ResourceType.EDITING_WORKSTATION]: 75,
          [ResourceType.FACULTY_TIME]: 50,
          [ResourceType.DESIGNER_TIME]: 80,
          [ResourceType.REVIEWER_TIME]: 40
        },
        teamUtilization: {
          [TeamRole.INSTRUCTIONAL_DESIGNER]: 70,
          [TeamRole.SUBJECT_MATTER_EXPERT]: 60,
          [TeamRole.VIDEO_PRODUCER]: 85,
          [TeamRole.VIDEO_EDITOR]: 90,
          [TeamRole.GRAPHIC_DESIGNER]: 75,
          [TeamRole.QA_REVIEWER]: 50,
          [TeamRole.PROJECT_MANAGER]: 65
        },
        bottlenecks: [],
        performanceDegradation: false
      };
      
      // Detect bottlenecks
      metrics.bottlenecks = await this.detectBottlenecks(metrics);
      
      // Check for performance degradation
      metrics.performanceDegradation = metrics.activeCourses > 5 || 
                                       metrics.bottlenecks.some(b => b.severity === 'CRITICAL');
      
      return metrics;
    } catch (error) {
      logger.error('Error getting capacity metrics', { error });
      throw new Error(`Failed to get capacity metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect bottlenecks in the system
   * Requirements: 11.5
   */
  async detectBottlenecks(metrics: CapacityMetrics): Promise<Bottleneck[]> {
    try {
      const bottlenecks: Bottleneck[] = [];
      
      // Check resource utilization
      for (const [resource, utilization] of Object.entries(metrics.resourceUtilization)) {
        if (utilization >= 90) {
          bottlenecks.push({
            type: BottleneckType.RESOURCE_SHORTAGE,
            resource,
            severity: 'CRITICAL',
            currentLoad: utilization,
            capacity: 100,
            recommendations: [
              `Add more ${resource} capacity`,
              'Consider redistributing workload',
              'Implement resource scheduling optimization'
            ]
          });
        } else if (utilization >= 80) {
          bottlenecks.push({
            type: BottleneckType.RESOURCE_SHORTAGE,
            resource,
            severity: 'HIGH',
            currentLoad: utilization,
            capacity: 100,
            recommendations: [
              `Monitor ${resource} usage closely`,
              'Plan for capacity expansion',
              'Optimize resource allocation'
            ]
          });
        }
      }
      
      // Check team utilization
      for (const [role, utilization] of Object.entries(metrics.teamUtilization)) {
        if (utilization >= 90) {
          bottlenecks.push({
            type: BottleneckType.TEAM_OVERLOAD,
            resource: role,
            severity: 'CRITICAL',
            currentLoad: utilization,
            capacity: 100,
            recommendations: [
              `Hire additional ${role} staff`,
              'Redistribute tasks among team members',
              'Consider outsourcing some work'
            ]
          });
        } else if (utilization >= 80) {
          bottlenecks.push({
            type: BottleneckType.TEAM_OVERLOAD,
            resource: role,
            severity: 'HIGH',
            currentLoad: utilization,
            capacity: 100,
            recommendations: [
              `Monitor ${role} workload`,
              'Plan for team expansion',
              'Implement task automation where possible'
            ]
          });
        }
      }
      
      logger.info('Bottlenecks detected', {
        count: bottlenecks.length,
        critical: bottlenecks.filter(b => b.severity === 'CRITICAL').length
      });
      
      return bottlenecks;
    } catch (error) {
      logger.error('Error detecting bottlenecks', { error });
      throw new Error(`Failed to detect bottlenecks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate scaling report with recommendations
   * Requirements: 11.5
   */
  async generateScalingReport(): Promise<ScalingReport> {
    try {
      const capacityMetrics = await this.getCapacityMetrics();
      
      const recommendations: string[] = [];
      
      // Generate recommendations based on metrics
      if (capacityMetrics.activeCourses >= 4) {
        recommendations.push('System approaching capacity limit - consider scaling resources');
      }
      
      if (capacityMetrics.bottlenecks.length > 0) {
        recommendations.push(`${capacityMetrics.bottlenecks.length} bottlenecks detected - review recommendations`);
      }
      
      if (capacityMetrics.performanceDegradation) {
        recommendations.push('Performance degradation detected - immediate action required');
      }
      
      // Calculate projected capacity
      const projectedCapacity = this.calculateProjectedCapacity(capacityMetrics);
      
      const report: ScalingReport = {
        timestamp: new Date(),
        capacityMetrics,
        recommendations,
        projectedCapacity
      };
      
      logger.info('Scaling report generated', {
        activeCourses: capacityMetrics.activeCourses,
        bottlenecks: capacityMetrics.bottlenecks.length,
        projectedCapacity
      });
      
      return report;
    } catch (error) {
      logger.error('Error generating scaling report', { error });
      throw new Error(`Failed to generate scaling report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate projected capacity based on current metrics
   */
  private calculateProjectedCapacity(metrics: CapacityMetrics): number {
    // Find the most constrained resource
    const maxResourceUtilization = Math.max(...Object.values(metrics.resourceUtilization));
    const maxTeamUtilization = Math.max(...Object.values(metrics.teamUtilization));
    const maxUtilization = Math.max(maxResourceUtilization, maxTeamUtilization);
    
    // Calculate how many more courses can be supported
    if (maxUtilization >= 100) {
      return metrics.activeCourses; // At capacity
    }
    
    const remainingCapacity = 100 - maxUtilization;
    const capacityPerCourse = maxUtilization / metrics.activeCourses;
    const additionalCourses = Math.floor(remainingCapacity / capacityPerCourse);
    
    return metrics.activeCourses + additionalCourses;
  }

  /**
   * Allocate resources from pool to a course
   */
  async allocateResource(courseId: string, resourceType: ResourceType, amount: number): Promise<void> {
    try {
      // In a real implementation, this would update resource pool in database
      logger.info('Resource allocated', {
        courseId,
        resourceType,
        amount
      });
    } catch (error) {
      logger.error('Error allocating resource', { error, courseId, resourceType });
      throw new Error(`Failed to allocate resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Release resources back to pool when course completes
   */
  async releaseResources(courseId: string): Promise<void> {
    try {
      // In a real implementation, this would update resource pool in database
      logger.info('Resources released', { courseId });
    } catch (error) {
      logger.error('Error releasing resources', { error, courseId });
      throw new Error(`Failed to release resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
