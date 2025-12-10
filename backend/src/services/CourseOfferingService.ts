/**
 * Course Offering Service
 * "Let every course be offered in its season, meeting the needs of all learners"
 * 
 * Manages course offerings, demand analysis, capacity management, and
 * waitlist functionality to ensure students can complete their programs efficiently.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CourseOffering {
  id: string;
  courseId: string;
  semester: string;
  year: number;
  section: string;
  instructorId?: string;
  capacity: number;
  enrolled: number;
  waitlisted: number;
  status: OfferingStatus;
  schedule?: CourseSchedule;
  createdAt: Date;
  updatedAt: Date;
}

export enum OfferingStatus {
  PLANNED = 'PLANNED',
  OPEN = 'OPEN',
  FULL = 'FULL',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED'
}

export interface CourseSchedule {
  days: string[];
  startTime: string;
  endTime: string;
  location?: string;
  format: 'IN_PERSON' | 'ONLINE' | 'HYBRID';
}

export interface DemandAnalysis {
  courseId: string;
  semester: string;
  year: number;
  projectedDemand: number;
  historicalEnrollment: number[];
  trendDirection: 'INCREASING' | 'STABLE' | 'DECREASING';
  recommendedSections: number;
  recommendedCapacity: number;
  factors: DemandFactor[];
}

export interface DemandFactor {
  factor: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  offeringId: string;
  position: number;
  priority: number;
  addedAt: Date;
  notified: boolean;
  expiresAt?: Date;
}

export interface AlternativeCourse {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  similarity: number;
  reason: string;
  available: boolean;
  offeringId?: string;
}

export interface CapacityManagement {
  offeringId: string;
  currentCapacity: number;
  enrolled: number;
  waitlisted: number;
  utilizationRate: number;
  recommendedCapacity: number;
  canExpand: boolean;
  expansionOptions: CapacityExpansionOption[];
}

export interface CapacityExpansionOption {
  type: 'INCREASE_CAPACITY' | 'ADD_SECTION' | 'CHANGE_ROOM';
  description: string;
  newCapacity: number;
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
  cost?: number;
}

export default class CourseOfferingService {
  /**
   * Create a new course offering
   * Note: This is a placeholder implementation until CourseOffering model is added to Prisma schema
   */
  async createOffering(input: {
    courseId: string;
    semester: string;
    year: number;
    section: string;
    instructorId?: string;
    capacity: number;
    schedule?: CourseSchedule;
  }): Promise<CourseOffering> {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${input.courseId}`);
    }

    // Create offering object (in-memory for now)
    const offering: CourseOffering = {
      id: `offering_${input.courseId}_${input.semester}_${input.year}_${input.section}`,
      courseId: input.courseId,
      semester: input.semester,
      year: input.year,
      section: input.section,
      instructorId: input.instructorId,
      capacity: input.capacity,
      enrolled: 0,
      waitlisted: 0,
      status: OfferingStatus.PLANNED,
      schedule: input.schedule,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return offering;
  }

  /**
   * Get course offering by ID
   * Note: Placeholder implementation
   */
  async getOffering(offeringId: string): Promise<CourseOffering | null> {
    // Placeholder: Would query CourseOffering table when available
    return null;
  }

  /**
   * Get all offerings for a course
   * Note: Placeholder implementation
   */
  async getCourseOfferings(
    courseId: string,
    filters?: {
      semester?: string;
      year?: number;
      status?: OfferingStatus;
    }
  ): Promise<CourseOffering[]> {
    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return [];
    }

    // Placeholder: Would query CourseOffering table when available
    // For now, return empty array
    return [];
  }

  /**
   * Analyze demand for a course
   */
  async analyzeDemand(
    courseId: string,
    semester: string,
    year: number
  ): Promise<DemandAnalysis> {
    // Get historical enrollment data from actual enrollments
    const historicalEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        createdAt: {
          gte: new Date(year - 3, 0, 1) // Last 3 years
        }
      }
    });

    // Group by year and count
    const enrollmentsByYear = new Map<number, number>();
    historicalEnrollments.forEach(enrollment => {
      const enrollmentYear = enrollment.createdAt.getFullYear();
      enrollmentsByYear.set(
        enrollmentYear,
        (enrollmentsByYear.get(enrollmentYear) || 0) + 1
      );
    });

    const historicalEnrollment = Array.from(enrollmentsByYear.values());

    // Calculate average and trend
    const avgEnrollment = historicalEnrollment.length > 0
      ? historicalEnrollment.reduce((sum: number, val: number) => sum + val, 0) / historicalEnrollment.length
      : 0;

    const trendDirection = this.calculateTrend(historicalEnrollment);

    // Get students who need this course
    const studentsNeedingCourse = await this.getStudentsNeedingCourse(courseId);

    // Calculate projected demand
    const projectedDemand = Math.max(
      Math.ceil(avgEnrollment * this.getTrendMultiplier(trendDirection)),
      studentsNeedingCourse
    );

    // Determine recommended sections and capacity
    const recommendedSections = Math.ceil(projectedDemand / 30); // 30 students per section
    const recommendedCapacity = Math.ceil(projectedDemand / recommendedSections);

    // Identify demand factors
    const factors = await this.identifyDemandFactors(courseId, projectedDemand, avgEnrollment);

    return {
      courseId,
      semester,
      year,
      projectedDemand,
      historicalEnrollment,
      trendDirection,
      recommendedSections,
      recommendedCapacity,
      factors
    };
  }

  /**
   * Calculate enrollment trend
   */
  private calculateTrend(enrollments: number[]): 'INCREASING' | 'STABLE' | 'DECREASING' {
    if (enrollments.length < 2) return 'STABLE';

    const recentAvg = enrollments.slice(-2).reduce((sum, val) => sum + val, 0) / 2;
    const olderAvg = enrollments.slice(0, -2).reduce((sum, val) => sum + val, 0) / (enrollments.length - 2);

    const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (changePercent > 10) return 'INCREASING';
    if (changePercent < -10) return 'DECREASING';
    return 'STABLE';
  }

  /**
   * Get trend multiplier for projections
   */
  private getTrendMultiplier(trend: 'INCREASING' | 'STABLE' | 'DECREASING'): number {
    switch (trend) {
      case 'INCREASING': return 1.15;
      case 'DECREASING': return 0.85;
      default: return 1.0;
    }
  }

  /**
   * Get number of students who need this course
   */
  private async getStudentsNeedingCourse(courseId: string): Promise<number> {
    // Get all enrollments for this course
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: { in: ['COMPLETED', 'ENROLLED'] }
      },
      select: { userId: true }
    });

    const completedStudents = new Set(enrollments.map(e => e.userId));

    // Get total active users (simplified estimate)
    const totalUsers = await prisma.user.count({
      where: {
        role: 'STUDENT'
      }
    });

    // Estimate students who might need this course
    // This is a simplified calculation - in production would check degree requirements
    const studentsNeedingCourse = Math.max(0, Math.floor(totalUsers * 0.1) - completedStudents.size);

    return studentsNeedingCourse;
  }

  /**
   * Identify factors affecting demand
   */
  private async identifyDemandFactors(
    courseId: string,
    projectedDemand: number,
    avgEnrollment: number
  ): Promise<DemandFactor[]> {
    const factors: DemandFactor[] = [];

    // Check if course is a prerequisite for many courses
    const dependentCourses = await prisma.course.findMany({
      where: {
        prerequisites: { has: courseId }
      }
    });

    if (dependentCourses.length > 5) {
      factors.push({
        factor: 'High Prerequisite Demand',
        impact: 'HIGH',
        description: `Required prerequisite for ${dependentCourses.length} courses`
      });
    }

    // Check if demand is increasing
    if (projectedDemand > avgEnrollment * 1.2) {
      factors.push({
        factor: 'Growing Enrollment',
        impact: 'HIGH',
        description: 'Projected demand significantly exceeds historical average'
      });
    }

    // Check recent enrollment trends
    const recentEnrollments = await prisma.enrollment.count({
      where: {
        courseId,
        createdAt: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
        }
      }
    });

    if (recentEnrollments > 50) {
      factors.push({
        factor: 'High Recent Enrollment',
        impact: 'MEDIUM',
        description: `${recentEnrollments} enrollments in the past year`
      });
    }

    return factors;
  }

  /**
   * Manage course capacity
   * Note: Placeholder implementation until CourseOffering model is available
   */
  async manageCapacity(offeringId: string): Promise<CapacityManagement> {
    // Placeholder implementation
    const currentCapacity = 30;
    const enrolled = 25;
    const waitlisted = 5;
    const utilizationRate = (enrolled / currentCapacity) * 100;

    // Determine if capacity can be expanded
    const canExpand = utilizationRate >= 90 && waitlisted > 0;

    // Generate expansion options
    const expansionOptions: CapacityExpansionOption[] = [];

    if (canExpand) {
      // Option 1: Increase capacity by 20%
      expansionOptions.push({
        type: 'INCREASE_CAPACITY',
        description: 'Increase section capacity by 20%',
        newCapacity: Math.ceil(currentCapacity * 1.2),
        feasibility: 'HIGH'
      });

      // Option 2: Add new section
      if (waitlisted >= 15) {
        expansionOptions.push({
          type: 'ADD_SECTION',
          description: 'Add additional section',
          newCapacity: currentCapacity + 30,
          feasibility: 'MEDIUM'
        });
      }

      // Option 3: Move to larger room
      expansionOptions.push({
        type: 'CHANGE_ROOM',
        description: 'Move to larger classroom',
        newCapacity: Math.ceil(currentCapacity * 1.5),
        feasibility: 'MEDIUM'
      });
    }

    // Calculate recommended capacity
    const totalDemand = enrolled + waitlisted;
    const recommendedCapacity = Math.ceil(totalDemand * 1.1); // 10% buffer

    return {
      offeringId,
      currentCapacity,
      enrolled,
      waitlisted,
      utilizationRate,
      recommendedCapacity,
      canExpand,
      expansionOptions
    };
  }

  /**
   * Add student to waitlist
   * Note: Placeholder implementation until Waitlist model is available
   */
  async addToWaitlist(
    userId: string,
    offeringId: string,
    priority: number = 0
  ): Promise<WaitlistEntry> {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Placeholder: Create waitlist entry
    const entry: WaitlistEntry = {
      id: `waitlist_${userId}_${offeringId}`,
      userId,
      offeringId,
      position: 1, // Would calculate actual position
      priority,
      addedAt: new Date(),
      notified: false
    };

    return entry;
  }

  /**
   * Process waitlist when spot becomes available
   * Note: Placeholder implementation until Waitlist model is available
   */
  async processWaitlist(offeringId: string): Promise<WaitlistEntry | null> {
    // Placeholder: Would query waitlist table when available
    return null;
  }

  /**
   * Suggest alternative courses
   */
  async suggestAlternatives(
    courseId: string,
    semester: string,
    year: number
  ): Promise<AlternativeCourse[]> {
    const alternatives: AlternativeCourse[] = [];

    // Get the original course
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Find courses in the same faculty with similar level
    const similarCourses = await prisma.course.findMany({
      where: {
        facultyId: course.facultyId,
        level: course.level,
        id: { not: courseId }
      },
      take: 10
    });

    for (const similar of similarCourses) {
      // Calculate similarity score (simplified)
      const similarity = this.calculateSimilarity(course, similar);

      // Check current enrollments to estimate availability
      const enrollmentCount = await prisma.enrollment.count({
        where: {
          courseId: similar.id,
          status: 'ENROLLED'
        }
      });

      const available = enrollmentCount < 30; // Assume 30 capacity

      alternatives.push({
        courseId: similar.id,
        courseCode: similar.code,
        courseTitle: similar.title,
        similarity,
        reason: `Similar ${course.level} level course in same faculty`,
        available
      });
    }

    // Sort by similarity and availability
    alternatives.sort((a, b) => {
      if (a.available !== b.available) {
        return a.available ? -1 : 1;
      }
      return b.similarity - a.similarity;
    });

    return alternatives.slice(0, 5);
  }

  /**
   * Calculate similarity between courses
   */
  private calculateSimilarity(course1: any, course2: any): number {
    let score = 0;

    // Same faculty
    if (course1.facultyId === course2.facultyId) score += 40;

    // Same level
    if (course1.level === course2.level) score += 30;

    // Similar credits
    const creditDiff = Math.abs(course1.credits - course2.credits);
    if (creditDiff === 0) score += 20;
    else if (creditDiff === 1) score += 10;

    // Similar prerequisites
    const prereq1 = new Set(course1.prerequisites);
    const prereq2 = new Set(course2.prerequisites);
    const commonPrereqs = [...prereq1].filter(p => prereq2.has(p)).length;
    score += Math.min(commonPrereqs * 5, 10);

    return score;
  }

  /**
   * Predict future course demand
   */
  async predictDemand(
    courseId: string,
    futureSemesters: number = 4
  ): Promise<Map<string, number>> {
    const predictions = new Map<string, number>();

    // Get historical enrollment data
    const historicalEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        createdAt: {
          gte: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000) // Last 2 years
        }
      }
    });

    if (historicalEnrollments.length === 0) {
      return predictions;
    }

    // Group by year and count
    const enrollmentsByYear = new Map<number, number>();
    historicalEnrollments.forEach(enrollment => {
      const enrollmentYear = enrollment.createdAt.getFullYear();
      enrollmentsByYear.set(
        enrollmentYear,
        (enrollmentsByYear.get(enrollmentYear) || 0) + 1
      );
    });

    const historicalData = Array.from(enrollmentsByYear.values());

    // Calculate average enrollment
    const avgEnrollment = historicalData.reduce((sum: number, val: number) => sum + val, 0) / historicalData.length;

    // Simple linear trend
    const trend = this.calculateTrend(historicalData);
    const trendMultiplier = this.getTrendMultiplier(trend);

    // Generate predictions
    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentSemester = currentDate.getMonth() < 6 ? 'Spring' : 'Fall';

    for (let i = 0; i < futureSemesters; i++) {
      const semesterKey = `${currentSemester} ${currentYear}`;
      const predictedDemand = Math.round(avgEnrollment * Math.pow(trendMultiplier, i + 1));
      predictions.set(semesterKey, predictedDemand);

      // Move to next semester
      if (currentSemester === 'Spring') {
        currentSemester = 'Fall';
      } else {
        currentSemester = 'Spring';
        currentYear++;
      }
    }

    return predictions;
  }
}
