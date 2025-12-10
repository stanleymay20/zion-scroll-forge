/**
 * Course Sequencing Service
 * "Let wisdom guide the path of learning, step by step"
 * 
 * Manages optimal course sequencing, path calculation, and scheduling
 * optimization to help students progress efficiently through their programs.
 */

import { PrismaClient } from '@prisma/client';
import PrerequisiteManagementService from './PrerequisiteManagementService';
import {
  DependencyGraph,
  DependencyNode,
  CourseSequence,
  CoursePathStep
} from '../types/prerequisite.types';

const prisma = new PrismaClient();

export interface OptimalPathRequest {
  userId: string;
  degreeProgramId: string;
  startSemester?: string;
  maxCoursesPerSemester?: number;
  preferredCourses?: string[];
}

export interface OptimalPathResult {
  userId: string;
  degreeProgramId: string;
  recommendedPath: CoursePathStep[];
  alternativePaths: CoursePathStep[][];
  estimatedCompletionSemesters: number;
  totalCredits: number;
  warnings: string[];
}

export interface SchedulingConflict {
  type: 'TIME_CONFLICT' | 'PREREQUISITE_CONFLICT' | 'CAPACITY_CONFLICT' | 'WORKLOAD_CONFLICT';
  courseIds: string[];
  semester: number;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolution?: string;
}

export interface ProgressionTracking {
  userId: string;
  degreeProgramId: string;
  completedCourses: string[];
  inProgressCourses: string[];
  remainingCourses: string[];
  completedCredits: number;
  remainingCredits: number;
  percentComplete: number;
  onTrack: boolean;
  projectedGraduationSemester: string;
}

export default class CourseSequencingService {
  private prerequisiteService: PrerequisiteManagementService;

  constructor() {
    this.prerequisiteService = new PrerequisiteManagementService();
  }

  /**
   * Calculate optimal course path for a student
   * Uses topological sort and constraint satisfaction
   */
  async calculateOptimalPath(request: OptimalPathRequest): Promise<OptimalPathResult> {
    const {
      userId,
      degreeProgramId,
      maxCoursesPerSemester = 5,
      preferredCourses = []
    } = request;

    // Get degree program requirements
    const degreeProgram = await prisma.degreeProgram.findUnique({
      where: { id: degreeProgramId },
      include: {
        requiredCourses: true,
        electiveCourses: true
      }
    });

    if (!degreeProgram) {
      throw new Error(`Degree program not found: ${degreeProgramId}`);
    }

    // Get student's completed and in-progress courses
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });

    const completedCourses = enrollments
      .filter(e => e.status === 'COMPLETED')
      .map(e => e.courseId);

    const inProgressCourses = enrollments
      .filter(e => e.status === 'ENROLLED')
      .map(e => e.courseId);

    // Get all required courses
    const allRequiredCourseIds = [
      ...degreeProgram.requiredCourses.map(c => c.id),
      ...degreeProgram.electiveCourses.slice(0, degreeProgram.electiveCreditsRequired / 3).map(c => c.id)
    ];

    // Filter out completed courses
    const remainingCourses = allRequiredCourseIds.filter(
      id => !completedCourses.includes(id) && !inProgressCourses.includes(id)
    );

    // Build dependency graph for remaining courses
    const graph = await this.buildCourseGraph(remainingCourses);

    // Perform topological sort to get course levels
    const sortedLevels = this.topologicalSort(graph);

    // Generate semester-by-semester path
    const recommendedPath = await this.generateSemesterPath(
      sortedLevels,
      maxCoursesPerSemester,
      preferredCourses,
      userId
    );

    // Generate alternative paths
    const alternativePaths = await this.generateAlternativePaths(
      sortedLevels,
      maxCoursesPerSemester,
      userId,
      2 // Generate 2 alternative paths
    );

    // Calculate total credits
    const totalCredits = await this.calculateTotalCredits(
      recommendedPath.flatMap(step => step.courses)
    );

    // Generate warnings
    const warnings = await this.generatePathWarnings(recommendedPath, userId);

    return {
      userId,
      degreeProgramId,
      recommendedPath,
      alternativePaths,
      estimatedCompletionSemesters: recommendedPath.length,
      totalCredits,
      warnings
    };
  }

  /**
   * Build a dependency graph for a set of courses
   */
  private async buildCourseGraph(courseIds: string[]): Promise<DependencyGraph> {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: {
        id: true,
        code: true,
        title: true,
        prerequisites: true
      }
    });

    const nodes = new Map<string, DependencyNode>();
    const edges = new Map<string, string[]>();

    // Initialize nodes
    for (const course of courses) {
      nodes.set(course.id, {
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        prerequisites: course.prerequisites.filter(p => courseIds.includes(p)),
        dependents: [],
        level: 0
      });
      edges.set(course.id, course.prerequisites.filter(p => courseIds.includes(p)));
    }

    // Build dependent relationships
    for (const course of courses) {
      for (const prereqId of course.prerequisites) {
        if (courseIds.includes(prereqId)) {
          const prereqNode = nodes.get(prereqId);
          if (prereqNode) {
            prereqNode.dependents.push(course.id);
          }
        }
      }
    }

    return {
      nodes,
      edges,
      hasCycle: false
    };
  }

  /**
   * Perform topological sort to organize courses by level
   */
  private topologicalSort(graph: DependencyGraph): Map<number, string[]> {
    const levels = new Map<number, string[]>();
    const inDegree = new Map<string, number>();
    const queue: string[] = [];

    // Calculate in-degrees
    for (const [nodeId, node] of graph.nodes.entries()) {
      inDegree.set(nodeId, node.prerequisites.length);
      if (node.prerequisites.length === 0) {
        queue.push(nodeId);
      }
    }

    let currentLevel = 0;

    while (queue.length > 0) {
      const levelSize = queue.length;
      const currentLevelCourses: string[] = [];

      for (let i = 0; i < levelSize; i++) {
        const courseId = queue.shift()!;
        currentLevelCourses.push(courseId);

        const node = graph.nodes.get(courseId);
        if (node) {
          node.level = currentLevel;

          // Reduce in-degree for dependents
          for (const dependent of node.dependents) {
            const degree = inDegree.get(dependent) || 0;
            inDegree.set(dependent, degree - 1);

            if (degree - 1 === 0) {
              queue.push(dependent);
            }
          }
        }
      }

      levels.set(currentLevel, currentLevelCourses);
      currentLevel++;
    }

    return levels;
  }

  /**
   * Generate semester-by-semester course path
   */
  private async generateSemesterPath(
    sortedLevels: Map<number, string[]>,
    maxCoursesPerSemester: number,
    preferredCourses: string[],
    userId: string
  ): Promise<CoursePathStep[]> {
    const path: CoursePathStep[] = [];
    let semester = 1;

    for (const [level, courseIds] of sortedLevels.entries()) {
      // Prioritize preferred courses
      const preferred = courseIds.filter(id => preferredCourses.includes(id));
      const others = courseIds.filter(id => !preferredCourses.includes(id));
      const orderedCourses = [...preferred, ...others];

      // Split courses across semesters if needed
      for (let i = 0; i < orderedCourses.length; i += maxCoursesPerSemester) {
        const semesterCourses = orderedCourses.slice(i, i + maxCoursesPerSemester);
        const credits = await this.calculateTotalCredits(semesterCourses);

        // Get prerequisites for this semester
        const prerequisites = await this.getPrerequisitesForCourses(semesterCourses);

        path.push({
          semester,
          courses: semesterCourses,
          credits,
          prerequisites
        });

        semester++;
      }
    }

    return path;
  }

  /**
   * Generate alternative course paths
   */
  private async generateAlternativePaths(
    sortedLevels: Map<number, string[]>,
    maxCoursesPerSemester: number,
    userId: string,
    numAlternatives: number
  ): Promise<CoursePathStep[][]> {
    const alternatives: CoursePathStep[][] = [];

    for (let alt = 0; alt < numAlternatives; alt++) {
      const path: CoursePathStep[] = [];
      let semester = 1;

      for (const [level, courseIds] of sortedLevels.entries()) {
        // Shuffle courses for variety
        const shuffled = this.shuffleArray([...courseIds]);

        for (let i = 0; i < shuffled.length; i += maxCoursesPerSemester) {
          const semesterCourses = shuffled.slice(i, i + maxCoursesPerSemester);
          const credits = await this.calculateTotalCredits(semesterCourses);
          const prerequisites = await this.getPrerequisitesForCourses(semesterCourses);

          path.push({
            semester,
            courses: semesterCourses,
            credits,
            prerequisites
          });

          semester++;
        }
      }

      alternatives.push(path);
    }

    return alternatives;
  }

  /**
   * Calculate total credits for a list of courses
   */
  private async calculateTotalCredits(courseIds: string[]): Promise<number> {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { credits: true }
    });

    return courses.reduce((sum, course) => sum + course.credits, 0);
  }

  /**
   * Get all prerequisites for a set of courses
   */
  private async getPrerequisitesForCourses(courseIds: string[]): Promise<string[]> {
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { prerequisites: true }
    });

    const allPrereqs = new Set<string>();
    courses.forEach(course => {
      course.prerequisites.forEach(prereq => allPrereqs.add(prereq));
    });

    return Array.from(allPrereqs);
  }

  /**
   * Generate warnings for the recommended path
   */
  private async generatePathWarnings(
    path: CoursePathStep[],
    userId: string
  ): Promise<string[]> {
    const warnings: string[] = [];

    // Check for heavy semesters
    for (const step of path) {
      if (step.credits > 18) {
        warnings.push(
          `Semester ${step.semester}: Heavy course load (${step.credits} credits). Consider reducing workload.`
        );
      }
    }

    // Check for prerequisite gaps
    const completedCourses = new Set<string>();
    for (const step of path) {
      for (const courseId of step.courses) {
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { prerequisites: true }
        });

        if (course) {
          const missingPrereqs = course.prerequisites.filter(
            prereq => !completedCourses.has(prereq)
          );

          if (missingPrereqs.length > 0) {
            warnings.push(
              `Semester ${step.semester}: Course may have unmet prerequisites. Verify completion.`
            );
          }
        }
      }

      // Mark courses as completed for next iteration
      step.courses.forEach(id => completedCourses.add(id));
    }

    return warnings;
  }

  /**
   * Detect scheduling conflicts
   */
  async detectSchedulingConflicts(
    userId: string,
    semester: number,
    proposedCourses: string[]
  ): Promise<SchedulingConflict[]> {
    const conflicts: SchedulingConflict[] = [];

    // Check prerequisite conflicts
    for (const courseId of proposedCourses) {
      const validation = await this.prerequisiteService.validatePrerequisites({
        userId,
        courseId
      });

      if (!validation.satisfied) {
        conflicts.push({
          type: 'PREREQUISITE_CONFLICT',
          courseIds: [courseId],
          semester,
          description: `Prerequisites not satisfied: ${validation.missingPrerequisites.join(', ')}`,
          severity: 'CRITICAL',
          resolution: 'Complete prerequisite courses first'
        });
      }
    }

    // Check workload conflicts
    const totalCredits = await this.calculateTotalCredits(proposedCourses);
    if (totalCredits > 18) {
      conflicts.push({
        type: 'WORKLOAD_CONFLICT',
        courseIds: proposedCourses,
        semester,
        description: `Excessive course load: ${totalCredits} credits`,
        severity: totalCredits > 21 ? 'CRITICAL' : 'HIGH',
        resolution: 'Reduce number of courses or select lower-credit courses'
      });
    }

    return conflicts;
  }

  /**
   * Track student progression through their program
   */
  async trackProgression(
    userId: string,
    degreeProgramId: string
  ): Promise<ProgressionTracking> {
    // Get degree program
    const degreeProgram = await prisma.degreeProgram.findUnique({
      where: { id: degreeProgramId },
      include: {
        requiredCourses: true,
        electiveCourses: true
      }
    });

    if (!degreeProgram) {
      throw new Error(`Degree program not found: ${degreeProgramId}`);
    }

    // Get student enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true }
    });

    const completedCourses = enrollments
      .filter(e => e.status === 'COMPLETED')
      .map(e => e.courseId);

    const inProgressCourses = enrollments
      .filter(e => e.status === 'ENROLLED')
      .map(e => e.courseId);

    // Calculate required courses
    const allRequiredCourseIds = degreeProgram.requiredCourses.map(c => c.id);
    const remainingCourses = allRequiredCourseIds.filter(
      id => !completedCourses.includes(id) && !inProgressCourses.includes(id)
    );

    // Calculate credits
    const completedCredits = await this.calculateTotalCredits(completedCourses);
    const remainingCredits = await this.calculateTotalCredits(remainingCourses);
    const totalRequiredCredits = degreeProgram.totalCreditsRequired;

    const percentComplete = (completedCredits / totalRequiredCredits) * 100;

    // Estimate graduation semester
    const remainingSemesters = Math.ceil(remainingCourses.length / 5);
    const currentDate = new Date();
    const projectedGraduationSemester = this.calculateProjectedGraduation(
      currentDate,
      remainingSemesters
    );

    // Check if on track (simplified logic)
    const onTrack = percentComplete >= 25; // At least 25% complete

    return {
      userId,
      degreeProgramId,
      completedCourses,
      inProgressCourses,
      remainingCourses,
      completedCredits,
      remainingCredits,
      percentComplete,
      onTrack,
      projectedGraduationSemester
    };
  }

  /**
   * Calculate projected graduation semester
   */
  private calculateProjectedGraduation(
    currentDate: Date,
    remainingSemesters: number
  ): string {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    // Determine current semester
    let currentSemester: 'Spring' | 'Fall';
    if (month >= 0 && month <= 5) {
      currentSemester = 'Spring';
    } else {
      currentSemester = 'Fall';
    }

    // Calculate future semester
    let projectedYear = year;
    let projectedSemester = currentSemester;

    for (let i = 0; i < remainingSemesters; i++) {
      if (projectedSemester === 'Spring') {
        projectedSemester = 'Fall';
      } else {
        projectedSemester = 'Spring';
        projectedYear++;
      }
    }

    return `${projectedSemester} ${projectedYear}`;
  }

  /**
   * Shuffle array for generating alternative paths
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Optimize course scheduling for a semester
   */
  async optimizeScheduling(
    userId: string,
    semester: number,
    availableCourses: string[],
    constraints: {
      maxCredits?: number;
      maxCourses?: number;
      preferredDays?: string[];
      avoidTimeConflicts?: boolean;
    }
  ): Promise<string[]> {
    const {
      maxCredits = 18,
      maxCourses = 5,
      avoidTimeConflicts = true
    } = constraints;

    // Filter courses by prerequisites
    const eligibleCourses: string[] = [];
    for (const courseId of availableCourses) {
      const validation = await this.prerequisiteService.validatePrerequisites({
        userId,
        courseId
      });

      if (validation.satisfied) {
        eligibleCourses.push(courseId);
      }
    }

    // Sort by priority (courses with more dependents first)
    const graph = await this.buildCourseGraph(eligibleCourses);
    const sortedCourses = Array.from(graph.nodes.values())
      .sort((a, b) => b.dependents.length - a.dependents.length)
      .map(node => node.courseId);

    // Select courses within constraints
    const selectedCourses: string[] = [];
    let totalCredits = 0;

    for (const courseId of sortedCourses) {
      if (selectedCourses.length >= maxCourses) break;

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { credits: true }
      });

      if (course && totalCredits + course.credits <= maxCredits) {
        selectedCourses.push(courseId);
        totalCredits += course.credits;
      }
    }

    return selectedCourses;
  }
}
