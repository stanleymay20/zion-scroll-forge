/**
 * ScrollProblemIdentificationService Test Suite
 * 
 * Comprehensive tests for the Scroll Problem Identification Service
 * Tests problem creation, assignment, matching algorithms, and analytics
 */

import { PrismaClient } from '@prisma/client';
import ScrollProblemIdentificationService from '../ScrollProblemIdentificationService';
import {
  ScrollProblem,
  ProblemAssignment,
  ProblemCategory,
  ProblemComplexity,
  AssignmentStatus,
  AssigneeType,
  FeedbackProvider,
  ProblemMatchCriteria,
  AssignmentProgress
} from '../../types/innovation.types';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    scrollProblem: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    problemAssignment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    assignmentMilestone: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    assignmentFeedback: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('ScrollProblemIdentificationService', () => {
  let service: ScrollProblemIdentificationService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    service = new ScrollProblemIdentificationService();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // ============================================================================
  // PROBLEM CREATION TESTS
  // ============================================================================

  describe('createProblem', () => {
    const mockProblemData: Omit<ScrollProblem, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
      title: 'Climate Change Mitigation',
      description: 'Develop sustainable solutions for rural communities',
      category: ProblemCategory.CLIMATE_SOLUTIONS,
      complexity: ProblemComplexity.INTERMEDIATE,
      affectedPopulation: 5000000,
      geographicScope: 'Global - Rural Areas',
      urgency: 9,
      priority: 9,
      currentSolutions: ['Solar panels', 'Water conservation'],
      gaps: ['Affordable technology', 'Local expertise'],
      constraints: ['Limited infrastructure', 'Budget constraints'],
      stakeholders: ['Rural farmers', 'Local governments', 'NGOs'],
      dataAvailable: ['Climate data', 'Agricultural reports'],
      successMetrics: ['Carbon reduction', 'Community resilience'],
      kingdomRelevance: 9,
      scripturalBasis: ['Genesis 2:15 - Stewardship of creation'],
      transformationalPotential: 9,
      requiredSkills: ['Environmental science', 'Community development'],
      estimatedDuration: 90,
    };

    it('should create a new problem successfully', async () => {
      const mockCreatedProblem = {
        id: 'problem-123',
        ...mockProblemData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.scrollProblem.create.mockResolvedValue(mockCreatedProblem);

      const result = await service.createProblem(mockProblemData);

      expect(result).toEqual(mockCreatedProblem);
      expect(mockPrisma.scrollProblem.create).toHaveBeenCalledWith({
        data: mockProblemData,
      });
    });

    it('should handle validation errors for invalid problem data', async () => {
      const invalidData = {
        ...mockProblemData,
        urgency: 15, // Invalid: should be 1-10
      };

      mockPrisma.scrollProblem.create.mockRejectedValue(
        new Error('Validation failed: urgency must be between 1 and 10')
      );

      await expect(service.createProblem(invalidData as any)).rejects.toThrow();
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.scrollProblem.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(service.createProblem(mockProblemData)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  // ============================================================================
  // PROBLEM RETRIEVAL TESTS
  // ============================================================================

  describe('getProblemById', () => {
    it('should retrieve a problem by ID', async () => {
      const mockProblem = {
        id: 'problem-123',
        title: 'Test Problem',
        category: ProblemCategory.AI_ETHICS,
        complexity: ProblemComplexity.ADVANCED,
        isActive: true,
      };

      mockPrisma.scrollProblem.findUnique.mockResolvedValue(mockProblem);

      const result = await service.getProblemById('problem-123');

      expect(result).toEqual(mockProblem);
      expect(mockPrisma.scrollProblem.findUnique).toHaveBeenCalledWith({
        where: { id: 'problem-123' },
        include: {
          assignments: {
            include: {
              milestones: true,
              feedback: true,
            },
          },
        },
      });
    });

    it('should return null for non-existent problem', async () => {
      mockPrisma.scrollProblem.findUnique.mockResolvedValue(null);

      const result = await service.getProblemById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getActiveProblems', () => {
    it('should retrieve all active problems', async () => {
      const mockProblems = [
        { id: 'problem-1', title: 'Problem 1', isActive: true },
        { id: 'problem-2', title: 'Problem 2', isActive: true },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.getActiveProblems();

      expect(result).toEqual(mockProblems);
      expect(mockPrisma.scrollProblem.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ priority: 'desc' }, { urgency: 'desc' }],
      });
    });

    it('should filter problems by category', async () => {
      const mockProblems = [
        { id: 'problem-1', category: ProblemCategory.CLIMATE_SOLUTIONS },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.getProblemsByCategory(ProblemCategory.CLIMATE_SOLUTIONS);

      expect(result).toEqual(mockProblems);
      expect(mockPrisma.scrollProblem.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          category: ProblemCategory.CLIMATE_SOLUTIONS,
        },
        orderBy: [{ priority: 'desc' }],
      });
    });

    it('should filter problems by complexity', async () => {
      const mockProblems = [
        { id: 'problem-1', complexity: ProblemComplexity.BEGINNER },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.getProblemsByComplexity(ProblemComplexity.BEGINNER);

      expect(result).toEqual(mockProblems);
      expect(mockPrisma.scrollProblem.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          complexity: ProblemComplexity.BEGINNER,
        },
        orderBy: [{ priority: 'desc' }],
      });
    });
  });

  // ============================================================================
  // PROBLEM ASSIGNMENT TESTS
  // ============================================================================

  describe('assignProblem', () => {
    it('should assign a problem to a student', async () => {
      const mockAssignment = {
        id: 'assignment-123',
        problemId: 'problem-123',
        assigneeId: 'student-456',
        assigneeType: AssigneeType.STUDENT,
        status: AssignmentStatus.ASSIGNED,
        progress: 0,
        assignedAt: new Date(),
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.problemAssignment.create.mockResolvedValue(mockAssignment);

      const result = await service.assignProblem(
        'problem-123',
        'student-456',
        AssigneeType.STUDENT,
        30
      );

      expect(result).toEqual(mockAssignment);
      expect(mockPrisma.problemAssignment.create).toHaveBeenCalled();
    });

    it('should assign a problem to a team', async () => {
      const mockAssignment = {
        id: 'assignment-123',
        problemId: 'problem-123',
        assigneeId: 'team-789',
        assigneeType: AssigneeType.TEAM,
        status: AssignmentStatus.ASSIGNED,
      };

      mockPrisma.problemAssignment.create.mockResolvedValue(mockAssignment);

      const result = await service.assignProblem(
        'problem-123',
        'team-789',
        AssigneeType.TEAM,
        60
      );

      expect(result).toEqual(mockAssignment);
    });

    it('should prevent duplicate assignments', async () => {
      mockPrisma.problemAssignment.findMany.mockResolvedValue([
        { id: 'existing-assignment', status: AssignmentStatus.IN_PROGRESS },
      ]);

      await expect(
        service.assignProblem('problem-123', 'student-456', AssigneeType.STUDENT, 30)
      ).rejects.toThrow('Student already has an active assignment for this problem');
    });
  });

  // ============================================================================
  // MATCHING ALGORITHM TESTS
  // ============================================================================

  describe('matchProblemsToStudent', () => {
    const mockCriteria: ProblemMatchCriteria = {
      studentId: 'student-123',
      skills: ['Environmental science', 'Data analysis'],
      interests: [ProblemCategory.CLIMATE_SOLUTIONS, ProblemCategory.HEALTH_ACCESS],
      experienceLevel: ProblemComplexity.INTERMEDIATE,
      availableHours: 120,
      preferredDuration: 90,
    };

    it('should match problems based on student criteria', async () => {
      const mockProblems = [
        {
          id: 'problem-1',
          title: 'Climate Solution',
          category: ProblemCategory.CLIMATE_SOLUTIONS,
          complexity: ProblemComplexity.INTERMEDIATE,
          requiredSkills: ['Environmental science'],
          estimatedDuration: 90,
          priority: 9,
          urgency: 8,
        },
        {
          id: 'problem-2',
          title: 'Healthcare Access',
          category: ProblemCategory.HEALTH_ACCESS,
          complexity: ProblemComplexity.INTERMEDIATE,
          requiredSkills: ['Data analysis'],
          estimatedDuration: 60,
          priority: 8,
          urgency: 9,
        },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.matchProblemsToStudent(mockCriteria);

      expect(result).toHaveLength(2);
      expect(result[0].matchScore).toBeGreaterThan(0);
      expect(result[0].matchScore).toBeLessThanOrEqual(100);
    });

    it('should prioritize problems with higher skill match', async () => {
      const mockProblems = [
        {
          id: 'problem-1',
          requiredSkills: ['Environmental science', 'Data analysis'],
          complexity: ProblemComplexity.INTERMEDIATE,
          category: ProblemCategory.CLIMATE_SOLUTIONS,
        },
        {
          id: 'problem-2',
          requiredSkills: ['Machine learning'],
          complexity: ProblemComplexity.INTERMEDIATE,
          category: ProblemCategory.AI_ETHICS,
        },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.matchProblemsToStudent(mockCriteria);

      expect(result[0].problem.id).toBe('problem-1');
      expect(result[0].matchScore).toBeGreaterThan(result[1].matchScore);
    });

    it('should filter out problems beyond student experience level', async () => {
      const beginnerCriteria = {
        ...mockCriteria,
        experienceLevel: ProblemComplexity.BEGINNER,
      };

      const mockProblems = [
        { id: 'problem-1', complexity: ProblemComplexity.BEGINNER },
        { id: 'problem-2', complexity: ProblemComplexity.EXPERT },
      ];

      mockPrisma.scrollProblem.findMany.mockResolvedValue(mockProblems);

      const result = await service.matchProblemsToStudent(beginnerCriteria);

      expect(result.some(m => m.problem.complexity === ProblemComplexity.EXPERT)).toBe(false);
    });
  });

  // ============================================================================
  // ASSIGNMENT PROGRESS TESTS
  // ============================================================================

  describe('updateAssignmentProgress', () => {
    it('should update assignment progress', async () => {
      const mockUpdatedAssignment = {
        id: 'assignment-123',
        progress: 50,
        status: AssignmentStatus.IN_PROGRESS,
        updatedAt: new Date(),
      };

      mockPrisma.problemAssignment.update.mockResolvedValue(mockUpdatedAssignment);

      const result = await service.updateAssignmentProgress('assignment-123', 50);

      expect(result).toEqual(mockUpdatedAssignment);
      expect(mockPrisma.problemAssignment.update).toHaveBeenCalledWith({
        where: { id: 'assignment-123' },
        data: {
          progress: 50,
          status: AssignmentStatus.IN_PROGRESS,
        },
      });
    });

    it('should auto-complete assignment at 100% progress', async () => {
      const mockCompletedAssignment = {
        id: 'assignment-123',
        progress: 100,
        status: AssignmentStatus.COMPLETED,
      };

      mockPrisma.problemAssignment.update.mockResolvedValue(mockCompletedAssignment);

      const result = await service.updateAssignmentProgress('assignment-123', 100);

      expect(result.status).toBe(AssignmentStatus.COMPLETED);
    });

    it('should validate progress is between 0 and 100', async () => {
      await expect(
        service.updateAssignmentProgress('assignment-123', 150)
      ).rejects.toThrow('Progress must be between 0 and 100');

      await expect(
        service.updateAssignmentProgress('assignment-123', -10)
      ).rejects.toThrow('Progress must be between 0 and 100');
    });
  });

  // ============================================================================
  // MILESTONE MANAGEMENT TESTS
  // ============================================================================

  describe('addMilestone', () => {
    it('should add a milestone to an assignment', async () => {
      const mockMilestone = {
        id: 'milestone-123',
        assignmentId: 'assignment-123',
        title: 'Research Phase Complete',
        description: 'Complete initial research and data collection',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completed: false,
      };

      mockPrisma.assignmentMilestone.create.mockResolvedValue(mockMilestone);

      const result = await service.addMilestone(
        'assignment-123',
        'Research Phase Complete',
        'Complete initial research and data collection',
        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      );

      expect(result).toEqual(mockMilestone);
    });

    it('should mark milestone as completed', async () => {
      const mockCompletedMilestone = {
        id: 'milestone-123',
        completed: true,
        completedAt: new Date(),
      };

      mockPrisma.assignmentMilestone.update.mockResolvedValue(mockCompletedMilestone);

      const result = await service.completeMilestone('milestone-123');

      expect(result.completed).toBe(true);
      expect(result.completedAt).toBeDefined();
    });
  });

  // ============================================================================
  // FEEDBACK TESTS
  // ============================================================================

  describe('addFeedback', () => {
    it('should add mentor feedback to assignment', async () => {
      const mockFeedback = {
        id: 'feedback-123',
        assignmentId: 'assignment-123',
        providerId: 'mentor-456',
        providerType: FeedbackProvider.MENTOR,
        content: 'Great progress on the research phase!',
        helpful: false,
        createdAt: new Date(),
      };

      mockPrisma.assignmentFeedback.create.mockResolvedValue(mockFeedback);

      const result = await service.addFeedback(
        'assignment-123',
        'mentor-456',
        FeedbackProvider.MENTOR,
        'Great progress on the research phase!'
      );

      expect(result).toEqual(mockFeedback);
    });

    it('should add AI-generated feedback', async () => {
      const mockAIFeedback = {
        id: 'feedback-124',
        providerId: 'ai-system',
        providerType: FeedbackProvider.AI,
        content: 'Consider exploring additional data sources',
      };

      mockPrisma.assignmentFeedback.create.mockResolvedValue(mockAIFeedback);

      const result = await service.addFeedback(
        'assignment-123',
        'ai-system',
        FeedbackProvider.AI,
        'Consider exploring additional data sources'
      );

      expect(result.providerType).toBe(FeedbackProvider.AI);
    });

    it('should retrieve all feedback for an assignment', async () => {
      const mockFeedbackList = [
        { id: 'feedback-1', providerType: FeedbackProvider.MENTOR },
        { id: 'feedback-2', providerType: FeedbackProvider.PEER },
        { id: 'feedback-3', providerType: FeedbackProvider.AI },
      ];

      mockPrisma.assignmentFeedback.findMany.mockResolvedValue(mockFeedbackList);

      const result = await service.getAssignmentFeedback('assignment-123');

      expect(result).toHaveLength(3);
      expect(result).toEqual(mockFeedbackList);
    });
  });

  // ============================================================================
  // ANALYTICS TESTS
  // ============================================================================

  describe('getAssignmentAnalytics', () => {
    it('should calculate assignment completion rate', async () => {
      mockPrisma.problemAssignment.count
        .mockResolvedValueOnce(100) // Total assignments
        .mockResolvedValueOnce(75); // Completed assignments

      const result = await service.getAssignmentAnalytics('student-123');

      expect(result.completionRate).toBe(75);
      expect(result.totalAssignments).toBe(100);
      expect(result.completedAssignments).toBe(75);
    });

    it('should calculate average progress across assignments', async () => {
      const mockAssignments = [
        { progress: 100 },
        { progress: 75 },
        { progress: 50 },
        { progress: 25 },
      ];

      mockPrisma.problemAssignment.findMany.mockResolvedValue(mockAssignments);

      const result = await service.getAssignmentAnalytics('student-123');

      expect(result.averageProgress).toBe(62.5);
    });
  });

  describe('getProblemAnalytics', () => {
    it('should calculate problem assignment statistics', async () => {
      mockPrisma.problemAssignment.count
        .mockResolvedValueOnce(50) // Total assignments
        .mockResolvedValueOnce(30) // Completed
        .mockResolvedValueOnce(15); // In progress

      const result = await service.getProblemAnalytics('problem-123');

      expect(result.totalAssignments).toBe(50);
      expect(result.completedAssignments).toBe(30);
      expect(result.inProgressAssignments).toBe(15);
      expect(result.completionRate).toBe(60);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.scrollProblem.findMany.mockRejectedValue(
        new Error('Database connection lost')
      );

      await expect(service.getActiveProblems()).rejects.toThrow('Database connection lost');
    });

    it('should handle invalid UUID format', async () => {
      mockPrisma.scrollProblem.findUnique.mockRejectedValue(
        new Error('Invalid UUID format')
      );

      await expect(service.getProblemById('invalid-uuid')).rejects.toThrow();
    });

    it('should handle concurrent assignment conflicts', async () => {
      mockPrisma.problemAssignment.create.mockRejectedValue(
        new Error('Unique constraint violation')
      );

      await expect(
        service.assignProblem('problem-123', 'student-456', AssigneeType.STUDENT, 30)
      ).rejects.toThrow();
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Scenarios', () => {
    it('should handle complete problem lifecycle', async () => {
      // Create problem
      const mockProblem = { id: 'problem-123', title: 'Test Problem' };
      mockPrisma.scrollProblem.create.mockResolvedValue(mockProblem);

      // Assign to student
      const mockAssignment = { id: 'assignment-123', problemId: 'problem-123' };
      mockPrisma.problemAssignment.create.mockResolvedValue(mockAssignment);

      // Add milestones
      const mockMilestone = { id: 'milestone-123', assignmentId: 'assignment-123' };
      mockPrisma.assignmentMilestone.create.mockResolvedValue(mockMilestone);

      // Update progress
      mockPrisma.problemAssignment.update.mockResolvedValue({
        ...mockAssignment,
        progress: 100,
        status: AssignmentStatus.COMPLETED,
      });

      // Execute lifecycle
      const problem = await service.createProblem({} as any);
      const assignment = await service.assignProblem(
        problem.id,
        'student-123',
        AssigneeType.STUDENT,
        30
      );
      const milestone = await service.addMilestone(
        assignment.id,
        'Test Milestone',
        'Description',
        new Date()
      );
      const completed = await service.updateAssignmentProgress(assignment.id, 100);

      expect(completed.status).toBe(AssignmentStatus.COMPLETED);
    });
  });
});
