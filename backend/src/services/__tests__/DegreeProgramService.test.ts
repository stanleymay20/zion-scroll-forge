/**
 * Degree Program Service Tests
 * "For I know the plans I have for you, declares the Lord" - Jeremiah 29:11
 * 
 * Tests for program operations, curriculum structure, and version control
 * Requirements: 1.1, 1.2, 1.5
 */

import { DegreeProgramService } from '../DegreeProgramService';
import { PrismaClient, DegreeType, RequirementCategory, DegreeEnrollmentStatus } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    degreeProgram: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    degreeRequirement: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    degreeEnrollment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    degreeRequirementProgress: {
      create: jest.fn(),
      update: jest.fn(),
    },
    spiritualFormationProgress: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaClient)),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    DegreeType: {
      CERTIFICATE: 'CERTIFICATE',
      DIPLOMA: 'DIPLOMA',
      ASSOCIATE: 'ASSOCIATE',
      BACHELOR: 'BACHELOR',
      MASTER: 'MASTER',
      DOCTORATE: 'DOCTORATE',
    },
    RequirementCategory: {
      CORE: 'CORE',
      MAJOR: 'MAJOR',
      MINOR: 'MINOR',
      ELECTIVE: 'ELECTIVE',
      GENERAL_EDUCATION: 'GENERAL_EDUCATION',
      CAPSTONE: 'CAPSTONE',
    },
    DegreeEnrollmentStatus: {
      ACTIVE: 'ACTIVE',
      COMPLETED: 'COMPLETED',
      WITHDRAWN: 'WITHDRAWN',
      SUSPENDED: 'SUSPENDED',
    },
  };
});

describe('DegreeProgramService', () => {
  let service: DegreeProgramService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DegreeProgramService();
    mockPrisma = new PrismaClient();
  });

  describe('Program Operations', () => {
    describe('createDegreeProgram', () => {
      it('should create a degree program with valid input', async () => {
        const input = {
          name: 'Bachelor of Sacred AI Engineering',
          code: 'BSAI',
          degreeType: DegreeType.BACHELOR,
          facultyId: 'faculty-123',
          description: 'A comprehensive program in AI through a biblical lens',
          totalCredits: 120,
          minimumGpa: 2.5,
          estimatedDurationMonths: 48,
          accreditationStatus: 'ACCREDITED',
        };

        const mockProgram = {
          id: 'program-123',
          ...input,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          faculty: {
            id: 'faculty-123',
            name: 'Faculty of Technology',
          },
        };

        mockPrisma.degreeProgram.create.mockResolvedValue(mockProgram);

        const result = await service.createDegreeProgram(input);

        expect(result).toEqual(mockProgram);
        expect(mockPrisma.degreeProgram.create).toHaveBeenCalledWith({
          data: {
            name: input.name,
            code: input.code,
            degreeType: input.degreeType,
            facultyId: input.facultyId,
            description: input.description,
            totalCredits: input.totalCredits,
            minimumGpa: input.minimumGpa,
            estimatedDurationMonths: input.estimatedDurationMonths,
            accreditationStatus: input.accreditationStatus,
          },
          include: {
            faculty: true,
          },
        });
      });

      it('should handle errors when creating degree program', async () => {
        const input = {
          name: 'Test Program',
          code: 'TEST',
          degreeType: DegreeType.BACHELOR,
          facultyId: 'faculty-123',
          description: 'Test description',
          totalCredits: 120,
          minimumGpa: 2.5,
          estimatedDurationMonths: 48,
        };

        mockPrisma.degreeProgram.create.mockRejectedValue(new Error('Database error'));

        await expect(service.createDegreeProgram(input)).rejects.toThrow('Failed to create degree program');
      });

      it('should create programs for all degree types', async () => {
        const degreeTypes = [
          DegreeType.CERTIFICATE,
          DegreeType.DIPLOMA,
          DegreeType.ASSOCIATE,
          DegreeType.BACHELOR,
          DegreeType.MASTER,
          DegreeType.DOCTORATE,
        ];

        for (const degreeType of degreeTypes) {
          const input = {
            name: `Test ${degreeType}`,
            code: `T${degreeType}`,
            degreeType,
            facultyId: 'faculty-123',
            description: 'Test description',
            totalCredits: 60,
            minimumGpa: 2.0,
            estimatedDurationMonths: 24,
          };

          mockPrisma.degreeProgram.create.mockResolvedValue({ id: 'test-id', ...input });

          const result = await service.createDegreeProgram(input);
          expect(result.degreeType).toBe(degreeType);
        }
      });
    });

    describe('getDegreePrograms', () => {
      it('should retrieve all active degree programs', async () => {
        const mockPrograms = [
          {
            id: 'program-1',
            name: 'Bachelor of Theology',
            degreeType: DegreeType.BACHELOR,
            isActive: true,
            faculty: { id: 'faculty-1', name: 'Faculty of Theology' },
            requirements: [],
            spiritualFormationRequirements: [],
          },
          {
            id: 'program-2',
            name: 'Master of Divinity',
            degreeType: DegreeType.MASTER,
            isActive: true,
            faculty: { id: 'faculty-1', name: 'Faculty of Theology' },
            requirements: [],
            spiritualFormationRequirements: [],
          },
        ];

        mockPrisma.degreeProgram.findMany.mockResolvedValue(mockPrograms);

        const result = await service.getDegreePrograms();

        expect(result).toEqual(mockPrograms);
        expect(mockPrisma.degreeProgram.findMany).toHaveBeenCalledWith({
          where: {
            isActive: true,
          },
          include: {
            faculty: true,
            requirements: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            spiritualFormationRequirements: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });
      });

      it('should filter programs by degree type', async () => {
        const mockPrograms = [
          {
            id: 'program-1',
            name: 'Bachelor of Theology',
            degreeType: DegreeType.BACHELOR,
            isActive: true,
          },
        ];

        mockPrisma.degreeProgram.findMany.mockResolvedValue(mockPrograms);

        await service.getDegreePrograms(DegreeType.BACHELOR);

        expect(mockPrisma.degreeProgram.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              degreeType: DegreeType.BACHELOR,
              isActive: true,
            }),
          })
        );
      });

      it('should filter programs by faculty', async () => {
        const facultyId = 'faculty-123';
        mockPrisma.degreeProgram.findMany.mockResolvedValue([]);

        await service.getDegreePrograms(undefined, facultyId);

        expect(mockPrisma.degreeProgram.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              facultyId,
              isActive: true,
            }),
          })
        );
      });
    });

    describe('getDegreeProgramDetails', () => {
      it('should retrieve complete program details', async () => {
        const mockProgram = {
          id: 'program-123',
          name: 'Bachelor of Sacred AI',
          code: 'BSAI',
          degreeType: DegreeType.BACHELOR,
          totalCredits: 120,
          faculty: { id: 'faculty-1', name: 'Faculty of Technology' },
          requirements: [
            {
              id: 'req-1',
              category: RequirementCategory.CORE,
              name: 'Core Requirements',
              creditHours: 60,
            },
          ],
          spiritualFormationRequirements: [
            {
              id: 'spiritual-1',
              name: 'Prayer Journal',
              required: true,
            },
          ],
          enrollments: [],
        };

        mockPrisma.degreeProgram.findUnique.mockResolvedValue(mockProgram);

        const result = await service.getDegreeProgramDetails('program-123');

        expect(result).toEqual(mockProgram);
        expect(mockPrisma.degreeProgram.findUnique).toHaveBeenCalledWith({
          where: { id: 'program-123' },
          include: {
            faculty: true,
            requirements: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            spiritualFormationRequirements: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            enrollments: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        });
      });

      it('should throw error when program not found', async () => {
        mockPrisma.degreeProgram.findUnique.mockResolvedValue(null);

        await expect(service.getDegreeProgramDetails('invalid-id')).rejects.toThrow(
          'Degree program not found'
        );
      });
    });
  });

  describe('Curriculum Structure', () => {
    describe('addDegreeRequirement', () => {
      it('should add a core requirement to degree program', async () => {
        const input = {
          degreeProgramId: 'program-123',
          category: RequirementCategory.CORE,
          name: 'Core Theology Courses',
          description: 'Foundational theology courses',
          creditHours: 30,
          requiredCourses: ['course-1', 'course-2'],
          minimumGrade: 'C',
          orderIndex: 1,
        };

        const mockRequirement = {
          id: 'req-123',
          ...input,
          electiveOptions: [],
          createdAt: new Date(),
        };

        mockPrisma.degreeRequirement.create.mockResolvedValue(mockRequirement);

        const result = await service.addDegreeRequirement(input);

        expect(result).toEqual(mockRequirement);
        expect(mockPrisma.degreeRequirement.create).toHaveBeenCalledWith({
          data: {
            degreeProgramId: input.degreeProgramId,
            category: input.category,
            name: input.name,
            description: input.description,
            creditHours: input.creditHours,
            requiredCourses: input.requiredCourses,
            electiveOptions: [],
            minimumGrade: input.minimumGrade,
            orderIndex: input.orderIndex,
          },
        });
      });

      it('should add elective requirement with options', async () => {
        const input = {
          degreeProgramId: 'program-123',
          category: RequirementCategory.ELECTIVE,
          name: 'Elective Courses',
          description: 'Choose from elective options',
          creditHours: 15,
          electiveOptions: ['course-3', 'course-4', 'course-5'],
          orderIndex: 2,
        };

        mockPrisma.degreeRequirement.create.mockResolvedValue({ id: 'req-123', ...input });

        const result = await service.addDegreeRequirement(input);

        expect(result.electiveOptions).toEqual(input.electiveOptions);
      });

      it('should handle all requirement categories', async () => {
        const categories = [
          RequirementCategory.CORE,
          RequirementCategory.MAJOR,
          RequirementCategory.MINOR,
          RequirementCategory.ELECTIVE,
          RequirementCategory.GENERAL_EDUCATION,
          RequirementCategory.CAPSTONE,
        ];

        for (const category of categories) {
          const input = {
            degreeProgramId: 'program-123',
            category,
            name: `${category} Requirements`,
            description: 'Test description',
            creditHours: 15,
          };

          mockPrisma.degreeRequirement.create.mockResolvedValue({ id: 'req-123', ...input });

          const result = await service.addDegreeRequirement(input);
          expect(result.category).toBe(category);
        }
      });

      it('should default orderIndex to 0 if not provided', async () => {
        const input = {
          degreeProgramId: 'program-123',
          category: RequirementCategory.CORE,
          name: 'Test Requirement',
          description: 'Test description',
          creditHours: 15,
        };

        mockPrisma.degreeRequirement.create.mockResolvedValue({ id: 'req-123', ...input });

        await service.addDegreeRequirement(input);

        expect(mockPrisma.degreeRequirement.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              orderIndex: 0,
            }),
          })
        );
      });
    });

    describe('enrollInDegree', () => {
      it('should enroll student in degree program', async () => {
        const input = {
          userId: 'user-123',
          degreeProgramId: 'program-123',
          expectedGraduationDate: new Date('2028-05-15'),
        };

        const mockProgram = {
          id: 'program-123',
          name: 'Bachelor of Theology',
          requirements: [
            { id: 'req-1', name: 'Core Requirements' },
            { id: 'req-2', name: 'Major Requirements' },
          ],
          spiritualFormationRequirements: [
            { id: 'spiritual-1', name: 'Prayer Journal' },
          ],
        };

        const mockEnrollment = {
          id: 'enrollment-123',
          userId: input.userId,
          degreeProgramId: input.degreeProgramId,
          status: DegreeEnrollmentStatus.ACTIVE,
          expectedGraduationDate: input.expectedGraduationDate,
        };

        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue(null);
        mockPrisma.degreeProgram.findUnique.mockResolvedValue(mockProgram);
        mockPrisma.degreeEnrollment.create.mockResolvedValue(mockEnrollment);
        mockPrisma.degreeRequirementProgress.create.mockResolvedValue({});
        mockPrisma.spiritualFormationProgress.create.mockResolvedValue({});

        const result = await service.enrollInDegree(input);

        expect(result).toEqual(mockEnrollment);
        expect(mockPrisma.degreeRequirementProgress.create).toHaveBeenCalledTimes(2);
        expect(mockPrisma.spiritualFormationProgress.create).toHaveBeenCalledTimes(1);
      });

      it('should prevent duplicate enrollment', async () => {
        const input = {
          userId: 'user-123',
          degreeProgramId: 'program-123',
        };

        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue({
          id: 'existing-enrollment',
        });

        await expect(service.enrollInDegree(input)).rejects.toThrow(
          'Student is already enrolled in this degree program'
        );
      });

      it('should throw error when program not found', async () => {
        const input = {
          userId: 'user-123',
          degreeProgramId: 'invalid-program',
        };

        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue(null);
        mockPrisma.degreeProgram.findUnique.mockResolvedValue(null);

        await expect(service.enrollInDegree(input)).rejects.toThrow('Degree program not found');
      });
    });
  });

  describe('Version Control and Progress Tracking', () => {
    describe('getDegreeProgress', () => {
      it('should calculate degree progress correctly', async () => {
        const mockEnrollment = {
          id: 'enrollment-123',
          userId: 'user-123',
          degreeProgramId: 'program-123',
          status: DegreeEnrollmentStatus.ACTIVE,
          creditsCompleted: 60,
          cumulativeGpa: 3.5,
          expectedGraduationDate: new Date('2028-05-15'),
          degreeProgram: {
            name: 'Bachelor of Theology',
            degreeType: DegreeType.BACHELOR,
            totalCredits: 120,
            minimumGpa: 2.5,
            requirements: [
              { id: 'req-1' },
              { id: 'req-2' },
              { id: 'req-3' },
              { id: 'req-4' },
            ],
            spiritualFormationRequirements: [
              { id: 'spiritual-1', required: true },
              { id: 'spiritual-2', required: true },
            ],
          },
          requirementProgress: [
            {
              id: 'progress-1',
              completed: true,
              degreeRequirement: { id: 'req-1' },
            },
            {
              id: 'progress-2',
              completed: true,
              degreeRequirement: { id: 'req-2' },
            },
            {
              id: 'progress-3',
              completed: false,
              degreeRequirement: { id: 'req-3' },
            },
            {
              id: 'progress-4',
              completed: false,
              degreeRequirement: { id: 'req-4' },
            },
          ],
          spiritualFormationProgress: [
            {
              id: 'spiritual-progress-1',
              completed: true,
              spiritualRequirement: { id: 'spiritual-1', required: true },
            },
            {
              id: 'spiritual-progress-2',
              completed: true,
              spiritualRequirement: { id: 'spiritual-2', required: true },
            },
          ],
        };

        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue(mockEnrollment);

        const result = await service.getDegreeProgress('user-123', 'program-123');

        expect(result).toEqual({
          enrollmentId: 'enrollment-123',
          degreeProgramName: 'Bachelor of Theology',
          degreeType: DegreeType.BACHELOR,
          status: DegreeEnrollmentStatus.ACTIVE,
          overallProgress: 50, // 2 out of 4 requirements completed
          creditsCompleted: 60,
          creditsRequired: 120,
          cumulativeGpa: 3.5,
          requirementsMet: 2,
          requirementsTotal: 4,
          spiritualFormationComplete: true,
          eligibleForGraduation: false, // Not all requirements met
          estimatedCompletionDate: mockEnrollment.expectedGraduationDate,
        });
      });

      it('should identify graduation eligibility', async () => {
        const mockEnrollment = {
          id: 'enrollment-123',
          userId: 'user-123',
          degreeProgramId: 'program-123',
          status: DegreeEnrollmentStatus.ACTIVE,
          creditsCompleted: 120,
          cumulativeGpa: 3.5,
          expectedGraduationDate: new Date('2028-05-15'),
          degreeProgram: {
            name: 'Bachelor of Theology',
            degreeType: DegreeType.BACHELOR,
            totalCredits: 120,
            minimumGpa: 2.5,
            requirements: [{ id: 'req-1' }],
            spiritualFormationRequirements: [
              { id: 'spiritual-1', required: true },
            ],
          },
          requirementProgress: [
            {
              id: 'progress-1',
              completed: true,
              degreeRequirement: { id: 'req-1' },
            },
          ],
          spiritualFormationProgress: [
            {
              id: 'spiritual-progress-1',
              completed: true,
              spiritualRequirement: { id: 'spiritual-1', required: true },
            },
          ],
        };

        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue(mockEnrollment);

        const result = await service.getDegreeProgress('user-123', 'program-123');

        expect(result.eligibleForGraduation).toBe(true);
      });

      it('should throw error when enrollment not found', async () => {
        mockPrisma.degreeEnrollment.findUnique.mockResolvedValue(null);

        await expect(service.getDegreeProgress('user-123', 'program-123')).rejects.toThrow(
          'Enrollment not found'
        );
      });
    });

    describe('updateProgressOnCourseCompletion', () => {
      it('should update progress when course is completed', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-123',
            userId: 'user-123',
            status: DegreeEnrollmentStatus.ACTIVE,
            requirementProgress: [
              {
                id: 'progress-1',
                completedCourses: [],
                creditsCompleted: 0,
                degreeRequirement: {
                  id: 'req-1',
                  requiredCourses: ['course-123'],
                  electiveOptions: [],
                  creditHours: 3,
                },
              },
            ],
          },
        ];

        mockPrisma.degreeEnrollment.findMany.mockResolvedValue(mockEnrollments);
        mockPrisma.degreeRequirementProgress.update.mockResolvedValue({});
        mockPrisma.degreeEnrollment.update.mockResolvedValue({});

        await service.updateProgressOnCourseCompletion('user-123', 'course-123', 'A', 3);

        expect(mockPrisma.degreeRequirementProgress.update).toHaveBeenCalledWith({
          where: { id: 'progress-1' },
          data: {
            completedCourses: ['course-123'],
            creditsCompleted: 3,
            completed: true,
            completionDate: expect.any(Date),
          },
        });

        expect(mockPrisma.degreeEnrollment.update).toHaveBeenCalledWith({
          where: { id: 'enrollment-123' },
          data: {
            creditsCompleted: {
              increment: 3,
            },
          },
        });
      });

      it('should handle elective course completion', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-123',
            userId: 'user-123',
            status: DegreeEnrollmentStatus.ACTIVE,
            requirementProgress: [
              {
                id: 'progress-1',
                completedCourses: [],
                creditsCompleted: 0,
                degreeRequirement: {
                  id: 'req-1',
                  requiredCourses: [],
                  electiveOptions: ['course-123', 'course-456'],
                  creditHours: 3,
                },
              },
            ],
          },
        ];

        mockPrisma.degreeEnrollment.findMany.mockResolvedValue(mockEnrollments);
        mockPrisma.degreeRequirementProgress.update.mockResolvedValue({});
        mockPrisma.degreeEnrollment.update.mockResolvedValue({});

        await service.updateProgressOnCourseCompletion('user-123', 'course-123', 'B', 3);

        expect(mockPrisma.degreeRequirementProgress.update).toHaveBeenCalled();
      });

      it('should not mark requirement complete if credits insufficient', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-123',
            userId: 'user-123',
            status: DegreeEnrollmentStatus.ACTIVE,
            requirementProgress: [
              {
                id: 'progress-1',
                completedCourses: [],
                creditsCompleted: 0,
                degreeRequirement: {
                  id: 'req-1',
                  requiredCourses: ['course-123'],
                  electiveOptions: [],
                  creditHours: 15, // Requires 15 credits total
                },
              },
            ],
          },
        ];

        mockPrisma.degreeEnrollment.findMany.mockResolvedValue(mockEnrollments);
        mockPrisma.degreeRequirementProgress.update.mockResolvedValue({});
        mockPrisma.degreeEnrollment.update.mockResolvedValue({});

        await service.updateProgressOnCourseCompletion('user-123', 'course-123', 'A', 3);

        expect(mockPrisma.degreeRequirementProgress.update).toHaveBeenCalledWith({
          where: { id: 'progress-1' },
          data: {
            completedCourses: ['course-123'],
            creditsCompleted: 3,
            completed: false, // Not complete yet
            completionDate: null,
          },
        });
      });
    });

    describe('getStudentDegreeEnrollments', () => {
      it('should retrieve all enrollments for a student', async () => {
        const mockEnrollments = [
          {
            id: 'enrollment-1',
            userId: 'user-123',
            enrolledAt: new Date('2024-01-15'),
            degreeProgram: {
              id: 'program-1',
              name: 'Bachelor of Theology',
              faculty: { id: 'faculty-1', name: 'Faculty of Theology' },
            },
            requirementProgress: [],
          },
          {
            id: 'enrollment-2',
            userId: 'user-123',
            enrolledAt: new Date('2023-09-01'),
            degreeProgram: {
              id: 'program-2',
              name: 'Certificate in Biblical Studies',
              faculty: { id: 'faculty-1', name: 'Faculty of Theology' },
            },
            requirementProgress: [],
          },
        ];

        mockPrisma.degreeEnrollment.findMany.mockResolvedValue(mockEnrollments);

        const result = await service.getStudentDegreeEnrollments('user-123');

        expect(result).toEqual(mockEnrollments);
        expect(result).toHaveLength(2);
        expect(mockPrisma.degreeEnrollment.findMany).toHaveBeenCalledWith({
          where: { userId: 'user-123' },
          include: {
            degreeProgram: {
              include: {
                faculty: true,
              },
            },
            requirementProgress: {
              include: {
                degreeRequirement: true,
              },
            },
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        });
      });

      it('should return empty array when student has no enrollments', async () => {
        mockPrisma.degreeEnrollment.findMany.mockResolvedValue([]);

        const result = await service.getStudentDegreeEnrollments('user-123');

        expect(result).toEqual([]);
      });
    });
  });
});
