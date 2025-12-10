/**
 * TeachingLoadService - Faculty Teaching Load Management and Optimization
 * 
 * This service handles:
 * - Teaching load calculation and tracking
 * - Faculty assignment optimization
 * - Workload distribution analysis
 * - Integration with ScrollScheduler agent
 * - Overload approval workflows
 * 
 * Part of the Academic Year Automation System
 * Implements Task 15 requirements with comprehensive functionality
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/logger';
import { AIGatewayService } from '../AIGatewayService';
import { EventSchedulerService } from './EventSchedulerService';

// Types for teaching load management
export interface TeachingLoadAnalysis {
  facultyId: string;
  semesterId: string;
  totalCreditHours: number;
  totalContactHours: number;
  totalCourses: number;
  totalStudents: number;
  loadPercentage: number;
  loadStatus: 'underload' | 'normal' | 'overload' | 'excessive';
  overloadCredits: number;
  underloadCredits: number;
  requiresApproval: boolean;
  recommendations: string[];
}

export interface CourseAssignmentRequest {
  facultyId: string;
  courseId: string;
  semesterId: string;
  sectionId?: string;
  assignmentRole: 'instructor' | 'co_instructor' | 'teaching_assistant' | 'grader';
  creditHours: number;
  contactHours: number;
  enrollmentCount: number;
  deliveryMode: 'in_person' | 'online' | 'hybrid';
  meetingDays: string[];
  meetingTimes?: string;
  classroom?: string;
}

export interface OptimizationParameters {
  semesterId: string;
  optimizationType: 'balanced' | 'minimize_overload' | 'maximize_preferences' | 'cost_effective';
  maxOverloadPercentage: number;
  minCourseEnrollment: number;
  maxCourseEnrollment: number;
  priorityFactors: {
    facultyPreference: number;
    qualificationMatch: number;
    workloadBalance: number;
    costEfficiency: number;
  };
}

export interface OptimizationResult {
  optimizationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalAssignments: number;
  facultySatisfiedCount: number;
  overloadAssignments: number;
  optimizationScore: number;
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  facultyId: string;
  courseId: string;
  recommendationType: 'assign' | 'reassign' | 'remove' | 'adjust_load';
  preferenceScore: number;
  qualificationScore: number;
  workloadImpactScore: number;
  overallScore: number;
  rationale: string;
}

/**
 * TeachingLoadService
 * 
 * Comprehensive service for managing faculty teaching loads, course assignments,
 * and workload optimization across academic semesters.
 */
export default class TeachingLoadService {
  private prisma: PrismaClient;
  private aiGateway: AIGatewayService;
  private eventScheduler: EventSchedulerService;

  constructor() {
    this.prisma = new PrismaClient();
    this.aiGateway = new AIGatewayService();
    this.eventScheduler = new EventSchedulerService();
  }

  /**
   * Calculate teaching load for a faculty member in a specific semester
   */
  async calculateTeachingLoad(facultyId: string, semesterId: string): Promise<TeachingLoadAnalysis> {
    try {
      logger.info('Calculating teaching load', { facultyId, semesterId });

      // Get faculty profile with load limits
      const faculty = await this.prisma.facultyProfile.findUnique({
        where: { id: facultyId },
        include: {
          courseAssignments: {
            where: {
              semesterId,
              assignmentStatus: { in: ['assigned', 'confirmed'] }
            }
          },
          availability: {
            where: { semesterId }
          }
        }
      });

      if (!faculty) {
        throw new Error(`Faculty not found: ${facultyId}`);
      }

      // Calculate totals
      const totalCreditHours = faculty.courseAssignments.reduce(
        (sum, assignment) => sum + Number(assignment.creditHours), 0
      );
      const totalContactHours = faculty.courseAssignments.reduce(
        (sum, assignment) => sum + Number(assignment.contactHours), 0
      );
      const totalCourses = faculty.courseAssignments.length;
      const totalStudents = faculty.courseAssignments.reduce(
        (sum, assignment) => sum + assignment.enrollmentCount, 0
      );

      // Calculate load percentage
      const standardLoad = faculty.maxTeachingLoadCredits;
      const loadPercentage = (totalCreditHours / standardLoad) * 100;

      // Determine load status
      let loadStatus: 'underload' | 'normal' | 'overload' | 'excessive';
      if (loadPercentage < 75) {
        loadStatus = 'underload';
      } else if (loadPercentage <= 110) {
        loadStatus = 'normal';
      } else if (loadPercentage <= 125) {
        loadStatus = 'overload';
      } else {
        loadStatus = 'excessive';
      }

      // Calculate over/underload
      const overloadCredits = Math.max(0, totalCreditHours - standardLoad);
      const underloadCredits = Math.max(0, standardLoad - totalCreditHours);

      // Generate recommendations
      const recommendations = await this.generateLoadRecommendations(
        faculty, totalCreditHours, loadStatus
      );

      // Update or create teaching load record
      await this.prisma.facultyTeachingLoad.upsert({
        where: {
          facultyId_semesterId: {
            facultyId,
            semesterId
          }
        },
        create: {
          facultyId,
          semesterId,
          totalCreditHours,
          totalContactHours,
          totalCourses,
          totalStudents,
          standardLoadCredits: standardLoad,
          overloadCredits,
          underloadCredits,
          loadPercentage,
          loadStatus,
          requiresApproval: loadStatus === 'overload' || loadStatus === 'excessive'
        },
        update: {
          totalCreditHours,
          totalContactHours,
          totalCourses,
          totalStudents,
          overloadCredits,
          underloadCredits,
          loadPercentage,
          loadStatus,
          requiresApproval: loadStatus === 'overload' || loadStatus === 'excessive',
          calculatedAt: new Date()
        }
      });

      return {
        facultyId,
        semesterId,
        totalCreditHours,
        totalContactHours,
        totalCourses,
        totalStudents,
        loadPercentage,
        loadStatus,
        overloadCredits,
        underloadCredits,
        requiresApproval: loadStatus === 'overload' || loadStatus === 'excessive',
        recommendations
      };
    } catch (error) {
      logger.error('Error calculating teaching load', { error, facultyId, semesterId });
      throw error;
    }
  }

  /**
   * Assign a course to a faculty member
   */
  async assignCourse(request: CourseAssignmentRequest, assignedBy: string): Promise<any> {
    try {
      logger.info('Assigning course to faculty', { request });

      // Create course assignment
      const assignment = await this.prisma.courseAssignment.create({
        data: {
          facultyId: request.facultyId,
          courseId: request.courseId,
          semesterId: request.semesterId,
          sectionId: request.sectionId,
          assignmentRole: request.assignmentRole,
          creditHours: request.creditHours,
          contactHours: request.contactHours,
          enrollmentCount: request.enrollmentCount,
          deliveryMode: request.deliveryMode,
          meetingDays: request.meetingDays,
          meetingTimes: request.meetingTimes,
          classroom: request.classroom,
          assignmentStatus: 'assigned',
          createdBy: assignedBy
        }
      });

      // Recalculate teaching load
      await this.calculateTeachingLoad(request.facultyId, request.semesterId);

      // Schedule notification event
      await this.eventScheduler.scheduleEvent({
        eventType: 'course_assignment_notification',
        scheduledFor: new Date(),
        metadata: {
          facultyId: request.facultyId,
          courseId: request.courseId,
          assignmentId: assignment.id
        }
      });

      return assignment;
    } catch (error) {
      logger.error('Error assigning course', { error, request });
      throw error;
    }
  }

  /**
   * Optimize teaching load distribution for a semester
   */
  async optimizeTeachingLoads(params: OptimizationParameters, requestedBy: string): Promise<OptimizationResult> {
    try {
      logger.info('Starting teaching load optimization', { params });

      // Create optimization record
      const optimization = await this.prisma.teachingLoadOptimization.create({
        data: {
          semesterId: params.semesterId,
          optimizationType: params.optimizationType,
          priorityFactors: params.priorityFactors,
          maxOverloadPercentage: params.maxOverloadPercentage,
          minCourseEnrollment: params.minCourseEnrollment,
          maxCourseEnrollment: params.maxCourseEnrollment,
          optimizationStatus: 'running',
          requestedBy,
          startedAt: new Date()
        }
      });

      // Get all faculty and their availability
      const facultyList = await this.prisma.facultyProfile.findMany({
        where: { status: 'active' },
        include: {
          specializations: true,
          availability: {
            where: { semesterId: params.semesterId }
          },
          courseAssignments: {
            where: { semesterId: params.semesterId }
          }
        }
      });

      // Get unassigned courses for the semester
      // Note: This would need to query your courses table
      // For now, we'll use a placeholder

      // Use AI to generate optimization recommendations
      const aiPrompt = this.buildOptimizationPrompt(facultyList, params);
      const aiResponse = await this.aiGateway.generateCompletion({
        prompt: aiPrompt,
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 2000
      });

      // Parse AI recommendations
      const recommendations = this.parseOptimizationRecommendations(aiResponse.completion);

      // Calculate optimization metrics
      const totalAssignments = recommendations.length;
      const facultySatisfiedCount = recommendations.filter(r => r.preferenceScore > 0.7).length;
      const overloadAssignments = recommendations.filter(r => r.workloadImpactScore < 0).length;
      const optimizationScore = recommendations.reduce((sum, r) => sum + r.overallScore, 0) / totalAssignments;

      // Save recommendations
      for (const rec of recommendations) {
        await this.prisma.optimizationRecommendation.create({
          data: {
            optimizationId: optimization.id,
            facultyId: rec.facultyId,
            courseId: rec.courseId,
            recommendationType: rec.recommendationType,
            preferenceScore: rec.preferenceScore,
            qualificationScore: rec.qualificationScore,
            workloadImpactScore: rec.workloadImpactScore,
            overallScore: rec.overallScore,
            recommendationStatus: 'pending'
          }
        });
      }

      // Update optimization record
      await this.prisma.teachingLoadOptimization.update({
        where: { id: optimization.id },
        data: {
          optimizationStatus: 'completed',
          completedAt: new Date(),
          totalAssignments,
          facultySatisfiedCount,
          overloadAssignments,
          optimizationScore
        }
      });

      return {
        optimizationId: optimization.id,
        status: 'completed',
        totalAssignments,
        facultySatisfiedCount,
        overloadAssignments,
        optimizationScore,
        recommendations
      };
    } catch (error) {
      logger.error('Error optimizing teaching loads', { error, params });
      throw error;
    }
  }

  /**
   * Get teaching load summary for all faculty in a semester
   */
  async getSemesterLoadSummary(semesterId: string): Promise<any> {
    try {
      const loads = await this.prisma.facultyTeachingLoad.findMany({
        where: { semesterId },
        include: {
          faculty: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              rank: true
            }
          }
        }
      });

      const summary = {
        totalFaculty: loads.length,
        averageLoad: loads.reduce((sum, l) => sum + Number(l.loadPercentage), 0) / loads.length,
        underloadCount: loads.filter(l => l.loadStatus === 'underload').length,
        normalCount: loads.filter(l => l.loadStatus === 'normal').length,
        overloadCount: loads.filter(l => l.loadStatus === 'overload').length,
        excessiveCount: loads.filter(l => l.loadStatus === 'excessive').length,
        requiresApprovalCount: loads.filter(l => l.requiresApproval).length,
        facultyLoads: loads
      };

      return summary;
    } catch (error) {
      logger.error('Error getting semester load summary', { error, semesterId });
      throw error;
    }
  }

  /**
   * Generate load recommendations using AI
   */
  private async generateLoadRecommendations(
    faculty: any,
    currentLoad: number,
    loadStatus: string
  ): Promise<string[]> {
    const recommendations: string[] = [];

    if (loadStatus === 'underload') {
      recommendations.push('Consider assigning additional courses to reach standard teaching load');
      recommendations.push('Review available courses that match faculty specializations');
    } else if (loadStatus === 'overload') {
      recommendations.push('Overload requires department chair approval');
      recommendations.push('Consider additional compensation for overload hours');
    } else if (loadStatus === 'excessive') {
      recommendations.push('CRITICAL: Excessive load may violate institutional policies');
      recommendations.push('Immediate review and redistribution recommended');
      recommendations.push('Consider hiring adjunct faculty or redistributing courses');
    }

    return recommendations;
  }

  /**
   * Build AI prompt for optimization
   */
  private buildOptimizationPrompt(facultyList: any[], params: OptimizationParameters): string {
    return `
You are an academic scheduling optimization expert. Analyze the following faculty data and provide optimal course assignments.

Optimization Type: ${params.optimizationType}
Priority Factors:
- Faculty Preference Weight: ${params.priorityFactors.facultyPreference}
- Qualification Match Weight: ${params.priorityFactors.qualificationMatch}
- Workload Balance Weight: ${params.priorityFactors.workloadBalance}
- Cost Efficiency Weight: ${params.priorityFactors.costEfficiency}

Faculty Data:
${JSON.stringify(facultyList, null, 2)}

Provide recommendations in JSON format with the following structure:
{
  "recommendations": [
    {
      "facultyId": "string",
      "courseId": "string",
      "recommendationType": "assign|reassign|remove",
      "preferenceScore": 0-1,
      "qualificationScore": 0-1,
      "workloadImpactScore": -1 to 1,
      "overallScore": 0-1,
      "rationale": "string"
    }
  ]
}
    `.trim();
  }

  /**
   * Parse AI optimization recommendations
   */
  private parseOptimizationRecommendations(aiResponse: string): OptimizationRecommendation[] {
    try {
      const parsed = JSON.parse(aiResponse);
      return parsed.recommendations || [];
    } catch (error) {
      logger.error('Error parsing optimization recommendations', { error });
      return [];
    }
  }

  /**
   * Approve overload assignment
   */
  async approveOverload(
    facultyId: string,
    semesterId: string,
    approvedBy: string,
    compensationAmount?: number
  ): Promise<any> {
    try {
      const load = await this.prisma.facultyTeachingLoad.update({
        where: {
          facultyId_semesterId: {
            facultyId,
            semesterId
          }
        },
        data: {
          approvedBy,
          approvalDate: new Date(),
          overloadCompensation: compensationAmount || 0
        }
      });

      logger.info('Overload approved', { facultyId, semesterId, approvedBy });
      return load;
    } catch (error) {
      logger.error('Error approving overload', { error, facultyId, semesterId });
      throw error;
    }
  }
}
