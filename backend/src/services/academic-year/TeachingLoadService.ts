/**
 * Teaching Load Service
 * "And he gave some, apostles; and some, prophets; and some, evangelists; and some, pastors and teachers" - Ephesians 4:11
 * 
 * Task 4: Faculty Teaching Load Management
 * Manages faculty teaching assignments, load balancing, and scheduling optimization.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/productionLogger';

const prisma = new PrismaClient();

export interface TeachingLoadAnalysis {
  facultyId: string;
  currentLoad: {
    courses: number;
    students: number;
    credits: number;
    workloadHours: number;
  };
  capacity: {
    maxCourses: number;
    maxStudents: number;
    maxCredits: number;
    maxWorkloadHours: number;
  };
  utilization: {
    courseUtilization: number;
    studentUtilization: number;
    creditUtilization: number;
    workloadUtilization: number;
  };
  availability: {
    totalHours: number;
    scheduledHours: number;
    availableHours: number;
  };
}

export interface CourseAssignment {
  assignmentId: string;
  facultyId: string;
  courseId: string;
  role: 'primary' | 'assistant' | 'guest';
  credits: number;
  estimatedStudents: number;
  workloadHours: number;
}

export interface LoadBalancingRecommendation {
  type: 'redistribute' | 'hire_additional' | 'reduce_offerings' | 'optimize_schedule';
  priority: 'high' | 'medium' | 'low';
  description: string;
  affectedFaculty: string[];
  affectedCourses: string[];
  estimatedImpact: {
    workloadReduction: number;
    costImplication: number;
    studentImpact: number;
  };
}

export class TeachingLoadService {
  async calculateTeachingLoad(facultyId: string, semesterId?: string): Promise<TeachingLoadAnalysis> {
    try {
      const faculty = await prisma.user.findUnique({
        where: { id: facultyId },
        include: { facultyProfile: true }
      });

      if (!faculty || !faculty.facultyProfile) {
        throw new Error('Faculty member not found');
      }

      const assignments = await prisma.courseAssignment.findMany({
        where: { 
          facultyId, 
          isActive: true, // Only count active assignments
          ...(semesterId && { semesterId }) 
        },
        include: { course: { include: { enrollments: { where: { status: 'ACTIVE' } } } } }
      });

      const currentLoad = {
        courses: assignments.length,
        students: assignments.reduce((sum, a) => sum + (a.course?.enrollments?.length || 0), 0),
        credits: assignments.reduce((sum, a) => sum + (a.credits || 3), 0),
        workloadHours: assignments.reduce((sum, a) => sum + this.calculateWorkloadHours(a), 0)
      };

      const capacity = {
        maxCourses: faculty.facultyProfile.maxCourses || 4,
        maxStudents: faculty.facultyProfile.maxStudents || 120,
        maxCredits: faculty.facultyProfile.maxCredits || 12,
        maxWorkloadHours: faculty.facultyProfile.maxWorkloadHours || 40
      };

      const utilization = {
        courseUtilization: (currentLoad.courses / capacity.maxCourses) * 100,
        studentUtilization: (currentLoad.students / capacity.maxStudents) * 100,
        creditUtilization: (currentLoad.credits / capacity.maxCredits) * 100,
        workloadUtilization: (currentLoad.workloadHours / capacity.maxWorkloadHours) * 100
      };

      const availability = await this.calculateAvailability(facultyId, assignments);

      return { facultyId, currentLoad, capacity, utilization, availability };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating teaching load', { error: errorMessage, facultyId });
      throw error;
    }
  }

  private calculateWorkloadHours(assignment: any): number {
    const credits = assignment.credits || 3;
    const students = assignment.course?.enrollments?.length || 20;
    return credits * 3 + students * 0.5 + credits * 2;
  }

  private async calculateAvailability(facultyId: string, assignments: any[]): Promise<{
    totalHours: number;
    scheduledHours: number;
    availableHours: number;
  }> {
    const availability = await prisma.facultyAvailability.findMany({ where: { facultyId } });
    const totalHours = availability.reduce((sum, slot) => {
      const start = this.timeToMinutes(slot.startTime);
      const end = this.timeToMinutes(slot.endTime);
      return sum + ((end - start) / 60);
    }, 0);
    const scheduledHours = assignments.reduce((sum, a) => sum + (a.scheduledHours || 0), 0);
    return { totalHours, scheduledHours, availableHours: Math.max(0, totalHours - scheduledHours) };
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async assignCourse(
    facultyId: string,
    courseId: string,
    role: 'primary' | 'assistant' | 'guest' = 'primary',
    semesterId?: string
  ): Promise<CourseAssignment> {
    try {
      const loadAnalysis = await this.calculateTeachingLoad(facultyId, semesterId);
      if (loadAnalysis.utilization.courseUtilization >= 100) {
        throw new Error('Faculty member at maximum course capacity');
      }

      const course = await prisma.courseProject.findUnique({
        where: { id: courseId },
        include: { enrollments: { where: { status: 'ACTIVE' } } }
      });

      if (!course) throw new Error('Course not found');

      const assignment = await prisma.courseAssignment.create({
        data: {
          facultyId,
          courseId,
          role,
          credits: course.credits || 3,
          estimatedStudents: course.enrollments?.length || 0,
          semesterId: semesterId || 'current',
          assignedDate: new Date()
        }
      });

      const workloadHours = this.calculateWorkloadHours({
        credits: assignment.credits,
        course: { enrollments: course.enrollments }
      });

      logger.info('Course assigned to faculty', { facultyId, courseId, assignmentId: assignment.id, workloadHours });

      return {
        assignmentId: assignment.id,
        facultyId,
        courseId,
        role,
        credits: assignment.credits,
        estimatedStudents: assignment.estimatedStudents,
        workloadHours
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error assigning course', { error: errorMessage, facultyId, courseId });
      throw error;
    }
  }

  async optimizeLoadDistribution(semesterId?: string): Promise<LoadBalancingRecommendation[]> {
    try {
      const faculty = await prisma.user.findMany({
        where: { role: 'FACULTY' },
        include: { facultyProfile: true }
      });

      const recommendations: LoadBalancingRecommendation[] = [];
      const loadAnalyses: TeachingLoadAnalysis[] = [];

      for (const member of faculty) {
        try {
          const analysis = await this.calculateTeachingLoad(member.id, semesterId);
          loadAnalyses.push(analysis);
        } catch (error) {
          logger.warn('Could not calculate load for faculty', { facultyId: member.id });
        }
      }

      const overloaded = loadAnalyses.filter(a => a.utilization.workloadUtilization > 90 || a.utilization.courseUtilization > 90);
      const underutilized = loadAnalyses.filter(a => a.utilization.workloadUtilization < 60 && a.utilization.courseUtilization < 60);

      if (overloaded.length > 0 && underutilized.length > 0) {
        recommendations.push({
          type: 'redistribute',
          priority: 'high',
          description: `Redistribute courses from ${overloaded.length} overloaded faculty to ${underutilized.length} underutilized faculty`,
          affectedFaculty: [...overloaded.map(f => f.facultyId), ...underutilized.map(f => f.facultyId)],
          affectedCourses: [],
          estimatedImpact: { workloadReduction: 15, costImplication: 0, studentImpact: 5 }
        });
      }

      const avgUtilization = loadAnalyses.reduce((sum, a) => sum + a.utilization.workloadUtilization, 0) / loadAnalyses.length;
      if (avgUtilization > 85) {
        recommendations.push({
          type: 'hire_additional',
          priority: 'medium',
          description: 'Consider hiring additional faculty due to high average utilization',
          affectedFaculty: [],
          affectedCourses: [],
          estimatedImpact: { workloadReduction: 20, costImplication: 100000, studentImpact: -5 }
        });
      }

      logger.info('Load distribution optimization completed', {
        totalFaculty: faculty.length,
        overloaded: overloaded.length,
        underutilized: underutilized.length,
        recommendations: recommendations.length
      });

      return recommendations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error optimizing load distribution', { error: errorMessage });
      throw error;
    }
  }

  async getLoadStatistics(semesterId?: string): Promise<{
    totalFaculty: number;
    averageLoad: { courses: number; students: number; credits: number; workloadHours: number };
    utilization: { high: number; optimal: number; low: number };
    recommendations: number;
  }> {
    try {
      const faculty = await prisma.user.findMany({ where: { role: 'FACULTY' } });
      const loadAnalyses: TeachingLoadAnalysis[] = [];
      
      for (const member of faculty) {
        try {
          const analysis = await this.calculateTeachingLoad(member.id, semesterId);
          loadAnalyses.push(analysis);
        } catch (error) {
          // Skip faculty with errors
        }
      }

      const totalFaculty = loadAnalyses.length;
      const averageLoad = {
        courses: loadAnalyses.reduce((sum, a) => sum + a.currentLoad.courses, 0) / totalFaculty,
        students: loadAnalyses.reduce((sum, a) => sum + a.currentLoad.students, 0) / totalFaculty,
        credits: loadAnalyses.reduce((sum, a) => sum + a.currentLoad.credits, 0) / totalFaculty,
        workloadHours: loadAnalyses.reduce((sum, a) => sum + a.currentLoad.workloadHours, 0) / totalFaculty
      };

      const utilization = {
        high: loadAnalyses.filter(a => a.utilization.workloadUtilization > 90).length,
        optimal: loadAnalyses.filter(a => a.utilization.workloadUtilization >= 70 && a.utilization.workloadUtilization <= 90).length,
        low: loadAnalyses.filter(a => a.utilization.workloadUtilization < 70).length
      };

      const recommendations = await this.optimizeLoadDistribution(semesterId);

      return { totalFaculty, averageLoad, utilization, recommendations: recommendations.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting load statistics', { error: errorMessage });
      throw error;
    }
  }
}

export default new TeachingLoadService();
