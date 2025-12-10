/**
 * Prerequisite Management Service
 * "Let knowledge build upon knowledge, wisdom upon wisdom"
 * 
 * Manages course prerequisites, validates enrollment eligibility,
 * and ensures proper course sequencing across the academic system.
 */

import { PrismaClient } from '@prisma/client';
import {
  PrerequisiteDefinition,
  PrerequisiteCreateInput,
  PrerequisiteUpdateInput,
  PrerequisiteValidationRequest,
  PrerequisiteValidationResult,
  PrerequisiteType,
  PrerequisiteStatus,
  DependencyGraph,
  DependencyNode,
  CircularDependencyError,
  PrerequisiteImpactAnalysis
} from '../types/prerequisite.types';

const prisma = new PrismaClient();

export default class PrerequisiteManagementService {
  /**
   * Create a new prerequisite definition for a course
   */
  async createPrerequisite(input: PrerequisiteCreateInput): Promise<PrerequisiteDefinition> {
    // Validate that the course exists
    const course = await prisma.course.findUnique({
      where: { id: input.courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${input.courseId}`);
    }

    // Validate that all required courses exist
    const requiredCourses = await prisma.course.findMany({
      where: { id: { in: input.requiredCourses } }
    });

    if (requiredCourses.length !== input.requiredCourses.length) {
      throw new Error('One or more required courses not found');
    }

    // Check for circular dependencies before creating
    const wouldCreateCycle = await this.wouldCreateCircularDependency(
      input.courseId,
      input.requiredCourses
    );

    if (wouldCreateCycle.detected) {
      throw new Error(
        `Cannot create prerequisite: would create circular dependency. ${wouldCreateCycle.message}`
      );
    }

    // Update the course with new prerequisites
    const updatedCourse = await prisma.course.update({
      where: { id: input.courseId },
      data: {
        prerequisites: {
          push: input.requiredCourses
        }
      }
    });

    return {
      id: `prereq_${input.courseId}_${Date.now()}`,
      courseId: input.courseId,
      type: input.type,
      requiredCourses: input.requiredCourses,
      minimumGrade: input.minimumGrade,
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Update an existing prerequisite definition
   */
  async updatePrerequisite(
    courseId: string,
    input: PrerequisiteUpdateInput
  ): Promise<PrerequisiteDefinition> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // If updating required courses, check for circular dependencies
    if (input.requiredCourses) {
      const wouldCreateCycle = await this.wouldCreateCircularDependency(
        courseId,
        input.requiredCourses
      );

      if (wouldCreateCycle.detected) {
        throw new Error(
          `Cannot update prerequisite: would create circular dependency. ${wouldCreateCycle.message}`
        );
      }
    }

    // Update the course
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        prerequisites: input.requiredCourses || course.prerequisites
      }
    });

    return {
      id: `prereq_${courseId}_${Date.now()}`,
      courseId: courseId,
      type: input.type || PrerequisiteType.AND,
      requiredCourses: input.requiredCourses || course.prerequisites,
      minimumGrade: input.minimumGrade,
      description: input.description,
      createdAt: course.createdAt,
      updatedAt: new Date()
    };
  }

  /**
   * Get prerequisite definition for a course
   */
  async getPrerequisite(courseId: string): Promise<PrerequisiteDefinition | null> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course || course.prerequisites.length === 0) {
      return null;
    }

    return {
      id: `prereq_${courseId}`,
      courseId: courseId,
      type: PrerequisiteType.AND, // Default type
      requiredCourses: course.prerequisites,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    };
  }

  /**
   * Validate if a student satisfies prerequisites for a course
   */
  async validatePrerequisites(
    request: PrerequisiteValidationRequest
  ): Promise<PrerequisiteValidationResult> {
    const { userId, courseId } = request;

    // Get the course and its prerequisites
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    if (course.prerequisites.length === 0) {
      return {
        courseId,
        satisfied: true,
        status: PrerequisiteStatus.SATISFIED,
        missingPrerequisites: [],
        satisfiedPrerequisites: [],
        inProgressPrerequisites: [],
        waivedPrerequisites: [],
        message: 'No prerequisites required'
      };
    }

    // Get student's completed and in-progress enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        courseId: { in: course.prerequisites }
      }
    });

    const completedCourses = enrollments
      .filter(e => e.status === 'COMPLETED')
      .map(e => e.courseId);

    const inProgressCourses = enrollments
      .filter(e => e.status === 'ENROLLED')
      .map(e => e.courseId);

    const missingPrerequisites = course.prerequisites.filter(
      prereq => !completedCourses.includes(prereq) && !inProgressCourses.includes(prereq)
    );

    // Check for waivers (would need a separate waiver table in production)
    const waivedPrerequisites: string[] = [];

    const satisfied = missingPrerequisites.length === 0;
    const status = satisfied
      ? PrerequisiteStatus.SATISFIED
      : inProgressCourses.length > 0
      ? PrerequisiteStatus.IN_PROGRESS
      : PrerequisiteStatus.NOT_SATISFIED;

    return {
      courseId,
      satisfied,
      status,
      missingPrerequisites,
      satisfiedPrerequisites: completedCourses,
      inProgressPrerequisites: inProgressCourses,
      waivedPrerequisites,
      message: satisfied
        ? 'All prerequisites satisfied'
        : `Missing ${missingPrerequisites.length} prerequisite(s)`
    };
  }

  /**
   * Build dependency graph for all courses
   */
  async buildDependencyGraph(): Promise<DependencyGraph> {
    const courses = await prisma.course.findMany({
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
        prerequisites: course.prerequisites,
        dependents: [],
        level: 0
      });
      edges.set(course.id, course.prerequisites);
    }

    // Build dependent relationships
    for (const course of courses) {
      for (const prereqId of course.prerequisites) {
        const prereqNode = nodes.get(prereqId);
        if (prereqNode) {
          prereqNode.dependents.push(course.id);
        }
      }
    }

    // Calculate levels (topological ordering)
    this.calculateCourseLevels(nodes, edges);

    // Detect cycles
    const cycles = this.detectCycles(nodes, edges);

    return {
      nodes,
      edges,
      hasCycle: cycles.length > 0,
      cycles: cycles.length > 0 ? cycles : undefined
    };
  }

  /**
   * Detect circular dependencies in the prerequisite graph
   */
  async detectCircularDependencies(): Promise<CircularDependencyError> {
    const graph = await this.buildDependencyGraph();

    if (!graph.hasCycle) {
      return {
        detected: false,
        cycles: [],
        affectedCourses: [],
        message: 'No circular dependencies detected'
      };
    }

    const affectedCourses = new Set<string>();
    graph.cycles?.forEach(cycle => {
      cycle.forEach(courseId => affectedCourses.add(courseId));
    });

    return {
      detected: true,
      cycles: graph.cycles || [],
      affectedCourses: Array.from(affectedCourses),
      message: `Detected ${graph.cycles?.length} circular dependency cycle(s)`
    };
  }

  /**
   * Check if adding a prerequisite would create a circular dependency
   */
  private async wouldCreateCircularDependency(
    courseId: string,
    newPrerequisites: string[]
  ): Promise<CircularDependencyError> {
    // Build a temporary graph with the new prerequisite
    const graph = await this.buildDependencyGraph();

    // Add the new prerequisites temporarily
    const node = graph.nodes.get(courseId);
    if (node) {
      const tempPrereqs = [...node.prerequisites, ...newPrerequisites];
      node.prerequisites = tempPrereqs;
      graph.edges.set(courseId, tempPrereqs);
    }

    // Check for cycles
    const cycles = this.detectCycles(graph.nodes, graph.edges);

    if (cycles.length === 0) {
      return {
        detected: false,
        cycles: [],
        affectedCourses: [],
        message: 'No circular dependency would be created'
      };
    }

    const affectedCourses = new Set<string>();
    cycles.forEach(cycle => {
      cycle.forEach(id => affectedCourses.add(id));
    });

    return {
      detected: true,
      cycles,
      affectedCourses: Array.from(affectedCourses),
      message: `Would create ${cycles.length} circular dependency cycle(s)`
    };
  }

  /**
   * Detect cycles using DFS
   */
  private detectCycles(
    nodes: Map<string, DependencyNode>,
    edges: Map<string, string[]>
  ): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    const dfs = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      currentPath.push(nodeId);

      const neighbors = edges.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = currentPath.indexOf(neighbor);
          const cycle = currentPath.slice(cycleStart);
          cycles.push([...cycle, neighbor]);
          return true;
        }
      }

      recursionStack.delete(nodeId);
      currentPath.pop();
      return false;
    };

    for (const nodeId of nodes.keys()) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return cycles;
  }

  /**
   * Calculate course levels using topological sort
   */
  private calculateCourseLevels(
    nodes: Map<string, DependencyNode>,
    edges: Map<string, string[]>
  ): void {
    const inDegree = new Map<string, number>();
    const queue: string[] = [];

    // Calculate in-degrees
    for (const nodeId of nodes.keys()) {
      inDegree.set(nodeId, 0);
    }

    for (const [nodeId, prereqs] of edges.entries()) {
      for (const prereq of prereqs) {
        inDegree.set(prereq, (inDegree.get(prereq) || 0) + 1);
      }
    }

    // Find nodes with no prerequisites
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
        const node = nodes.get(nodeId);
        if (node) node.level = 0;
      }
    }

    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentNode = nodes.get(current);
      if (!currentNode) continue;

      // Update dependents
      for (const dependent of currentNode.dependents) {
        const dependentNode = nodes.get(dependent);
        if (!dependentNode) continue;

        dependentNode.level = Math.max(dependentNode.level, currentNode.level + 1);

        const degree = inDegree.get(dependent) || 0;
        inDegree.set(dependent, degree - 1);

        if (degree - 1 === 0) {
          queue.push(dependent);
        }
      }
    }
  }

  /**
   * Analyze the impact of changing a prerequisite
   */
  async analyzePrerequisiteImpact(
    courseId: string,
    newPrerequisites: string[]
  ): Promise<PrerequisiteImpactAnalysis> {
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      throw new Error(`Course not found: ${courseId}`);
    }

    // Find students currently enrolled or planning to enroll
    const affectedEnrollments = await prisma.enrollment.findMany({
      where: {
        courseId,
        status: { in: ['ENROLLED', 'PENDING'] }
      }
    });

    // Find downstream courses that depend on this course
    const downstreamCourses = await prisma.course.findMany({
      where: {
        prerequisites: {
          has: courseId
        }
      },
      select: { id: true, code: true, title: true }
    });

    const affectedStudents = affectedEnrollments.length;
    const impactLevel =
      affectedStudents > 100
        ? 'CRITICAL'
        : affectedStudents > 50
        ? 'HIGH'
        : affectedStudents > 10
        ? 'MEDIUM'
        : 'LOW';

    const recommendations: string[] = [];

    if (affectedStudents > 0) {
      recommendations.push(
        `Notify ${affectedStudents} affected student(s) of prerequisite changes`
      );
      recommendations.push('Consider grandfathering currently enrolled students');
    }

    if (downstreamCourses.length > 0) {
      recommendations.push(
        `Review ${downstreamCourses.length} downstream course(s) for sequencing impact`
      );
    }

    return {
      courseId,
      affectedStudents,
      affectedEnrollments: affectedEnrollments.map(e => e.id),
      downstreamCourses: downstreamCourses.map(c => c.id),
      impactLevel,
      recommendations
    };
  }

  /**
   * Get all courses that have a specific course as a prerequisite
   */
  async getCoursesRequiringPrerequisite(prerequisiteCourseId: string): Promise<string[]> {
    const courses = await prisma.course.findMany({
      where: {
        prerequisites: {
          has: prerequisiteCourseId
        }
      },
      select: { id: true }
    });

    return courses.map(c => c.id);
  }

  /**
   * Get the complete prerequisite chain for a course
   */
  async getPrerequisiteChain(courseId: string): Promise<string[]> {
    const visited = new Set<string>();
    const chain: string[] = [];

    const traverse = async (id: string): Promise<void> => {
      if (visited.has(id)) return;
      visited.add(id);

      const course = await prisma.course.findUnique({
        where: { id },
        select: { prerequisites: true }
      });

      if (course && course.prerequisites.length > 0) {
        for (const prereqId of course.prerequisites) {
          chain.push(prereqId);
          await traverse(prereqId);
        }
      }
    };

    await traverse(courseId);
    return Array.from(new Set(chain)); // Remove duplicates
  }
}
