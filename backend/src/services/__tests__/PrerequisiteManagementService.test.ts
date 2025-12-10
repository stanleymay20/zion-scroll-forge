/**
 * Unit Tests for Prerequisite Management Service
 * "Testing the foundations of knowledge progression"
 */

import PrerequisiteManagementService from '../PrerequisiteManagementService';
import { PrismaClient } from '@prisma/client';
import {
  PrerequisiteType,
  PrerequisiteStatus
} from '../../types/prerequisite.types';

// Mock Prisma Client
jest.mock('@prisma/client');

describe('PrerequisiteManagementService', () => {
  let service: PrerequisiteManagementService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    service = new PrerequisiteManagementService();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPrerequisite', () => {
    it('should create a new prerequisite definition', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        prerequisites: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockRequiredCourses = [
        { id: 'prereq-1', code: 'MATH101', title: 'Calculus I' }
      ];

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(mockRequiredCourses);
      (mockPrisma.course.update as jest.Mock).mockResolvedValue({
        ...mockCourse,
        prerequisites: ['prereq-1']
      });

      const input = {
        courseId: 'course-1',
        type: PrerequisiteType.AND,
        requiredCourses: ['prereq-1'],
        minimumGrade: 'C',
        description: 'Must complete Calculus I'
      };

      const result = await service.createPrerequisite(input);

      expect(result).toBeDefined();
      expect(result.courseId).toBe('course-1');
      expect(result.type).toBe(PrerequisiteType.AND);
      expect(result.requiredCourses).toEqual(['prereq-1']);
      expect(result.minimumGrade).toBe('C');
    });

    it('should throw error if course not found', async () => {
      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(null);

      const input = {
        courseId: 'invalid-course',
        type: PrerequisiteType.AND,
        requiredCourses: ['prereq-1']
      };

      await expect(service.createPrerequisite(input)).rejects.toThrow(
        'Course not found: invalid-course'
      );
    });

    it('should throw error if required courses not found', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        prerequisites: []
      };

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue([]);

      const input = {
        courseId: 'course-1',
        type: PrerequisiteType.AND,
        requiredCourses: ['invalid-prereq']
      };

      await expect(service.createPrerequisite(input)).rejects.toThrow(
        'One or more required courses not found'
      );
    });
  });

  describe('validatePrerequisites', () => {
    it('should return satisfied when all prerequisites are met', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS201',
        title: 'Data Structures',
        prerequisites: ['prereq-1', 'prereq-2']
      };

      const mockEnrollments = [
        { userId: 'user-1', courseId: 'prereq-1', status: 'COMPLETED' },
        { userId: 'user-1', courseId: 'prereq-2', status: 'COMPLETED' }
      ];

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);

      const result = await service.validatePrerequisites({
        userId: 'user-1',
        courseId: 'course-1'
      });

      expect(result.satisfied).toBe(true);
      expect(result.status).toBe(PrerequisiteStatus.SATISFIED);
      expect(result.missingPrerequisites).toHaveLength(0);
      expect(result.satisfiedPrerequisites).toHaveLength(2);
    });

    it('should return not satisfied when prerequisites are missing', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS201',
        title: 'Data Structures',
        prerequisites: ['prereq-1', 'prereq-2']
      };

      const mockEnrollments = [
        { userId: 'user-1', courseId: 'prereq-1', status: 'COMPLETED' }
      ];

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);

      const result = await service.validatePrerequisites({
        userId: 'user-1',
        courseId: 'course-1'
      });

      expect(result.satisfied).toBe(false);
      expect(result.status).toBe(PrerequisiteStatus.NOT_SATISFIED);
      expect(result.missingPrerequisites).toContain('prereq-2');
      expect(result.satisfiedPrerequisites).toContain('prereq-1');
    });

    it('should return in progress when some prerequisites are enrolled', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS201',
        title: 'Data Structures',
        prerequisites: ['prereq-1', 'prereq-2']
      };

      const mockEnrollments = [
        { userId: 'user-1', courseId: 'prereq-1', status: 'COMPLETED' },
        { userId: 'user-1', courseId: 'prereq-2', status: 'ENROLLED' }
      ];

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);

      const result = await service.validatePrerequisites({
        userId: 'user-1',
        courseId: 'course-1'
      });

      expect(result.satisfied).toBe(false);
      expect(result.status).toBe(PrerequisiteStatus.IN_PROGRESS);
      expect(result.inProgressPrerequisites).toContain('prereq-2');
    });

    it('should return satisfied when no prerequisites required', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS101',
        title: 'Introduction to Computer Science',
        prerequisites: []
      };

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

      const result = await service.validatePrerequisites({
        userId: 'user-1',
        courseId: 'course-1'
      });

      expect(result.satisfied).toBe(true);
      expect(result.status).toBe(PrerequisiteStatus.SATISFIED);
      expect(result.message).toBe('No prerequisites required');
    });
  });

  describe('detectCircularDependencies', () => {
    it('should detect no cycles in a valid prerequisite graph', async () => {
      const mockCourses = [
        { id: 'course-1', code: 'CS101', title: 'Intro CS', prerequisites: [] },
        { id: 'course-2', code: 'CS201', title: 'Data Structures', prerequisites: ['course-1'] },
        { id: 'course-3', code: 'CS301', title: 'Algorithms', prerequisites: ['course-2'] }
      ];

      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const result = await service.detectCircularDependencies();

      expect(result.detected).toBe(false);
      expect(result.cycles).toHaveLength(0);
      expect(result.message).toBe('No circular dependencies detected');
    });

    it('should detect circular dependencies', async () => {
      const mockCourses = [
        { id: 'course-1', code: 'CS101', title: 'Intro CS', prerequisites: ['course-3'] },
        { id: 'course-2', code: 'CS201', title: 'Data Structures', prerequisites: ['course-1'] },
        { id: 'course-3', code: 'CS301', title: 'Algorithms', prerequisites: ['course-2'] }
      ];

      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const result = await service.detectCircularDependencies();

      expect(result.detected).toBe(true);
      expect(result.cycles.length).toBeGreaterThan(0);
      expect(result.affectedCourses.length).toBeGreaterThan(0);
    });
  });

  describe('analyzePrerequisiteImpact', () => {
    it('should analyze impact of prerequisite changes', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS201',
        title: 'Data Structures',
        prerequisites: ['prereq-1']
      };

      const mockEnrollments = [
        { id: 'enroll-1', userId: 'user-1', courseId: 'course-1', status: 'ENROLLED' },
        { id: 'enroll-2', userId: 'user-2', courseId: 'course-1', status: 'ENROLLED' }
      ];

      const mockDownstreamCourses = [
        { id: 'course-2', code: 'CS301', title: 'Algorithms' }
      ];

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);
      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(mockDownstreamCourses);

      const result = await service.analyzePrerequisiteImpact('course-1', ['prereq-1', 'prereq-2']);

      expect(result.courseId).toBe('course-1');
      expect(result.affectedStudents).toBe(2);
      expect(result.affectedEnrollments).toHaveLength(2);
      expect(result.downstreamCourses).toHaveLength(1);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should classify impact level correctly', async () => {
      const mockCourse = {
        id: 'course-1',
        code: 'CS201',
        title: 'Data Structures',
        prerequisites: []
      };

      // Create 150 mock enrollments for CRITICAL impact
      const mockEnrollments = Array.from({ length: 150 }, (_, i) => ({
        id: `enroll-${i}`,
        userId: `user-${i}`,
        courseId: 'course-1',
        status: 'ENROLLED'
      }));

      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);
      (mockPrisma.enrollment.findMany as jest.Mock).mockResolvedValue(mockEnrollments);
      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.analyzePrerequisiteImpact('course-1', ['prereq-1']);

      expect(result.impactLevel).toBe('CRITICAL');
    });
  });

  describe('getPrerequisiteChain', () => {
    it('should return complete prerequisite chain', async () => {
      const mockCourses = {
        'course-3': { id: 'course-3', prerequisites: ['course-2'] },
        'course-2': { id: 'course-2', prerequisites: ['course-1'] },
        'course-1': { id: 'course-1', prerequisites: [] }
      };

      (mockPrisma.course.findUnique as jest.Mock).mockImplementation(({ where }) => {
        return Promise.resolve(mockCourses[where.id as keyof typeof mockCourses]);
      });

      const result = await service.getPrerequisiteChain('course-3');

      expect(result).toContain('course-2');
      expect(result).toContain('course-1');
      expect(result).toHaveLength(2);
    });

    it('should handle courses with no prerequisites', async () => {
      (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue({
        id: 'course-1',
        prerequisites: []
      });

      const result = await service.getPrerequisiteChain('course-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('buildDependencyGraph', () => {
    it('should build a valid dependency graph', async () => {
      const mockCourses = [
        { id: 'course-1', code: 'CS101', title: 'Intro CS', prerequisites: [] },
        { id: 'course-2', code: 'CS201', title: 'Data Structures', prerequisites: ['course-1'] },
        { id: 'course-3', code: 'CS301', title: 'Algorithms', prerequisites: ['course-2'] }
      ];

      (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const result = await service.buildDependencyGraph();

      expect(result.nodes.size).toBe(3);
      expect(result.edges.size).toBe(3);
      expect(result.hasCycle).toBe(false);

      const course1Node = result.nodes.get('course-1');
      expect(course1Node?.level).toBe(0);
      expect(course1Node?.dependents).toContain('course-2');

      const course2Node = result.nodes.get('course-2');
      expect(course2Node?.level).toBe(1);
      expect(course2Node?.dependents).toContain('course-3');

      const course3Node = result.nodes.get('course-3');
      expect(course3Node?.level).toBe(2);
    });
  });
});
