/**
 * ScrollUniversity Degree Program Service
 * Manages academic degree programs from Certificate to Doctorate
 * 
 * "For I know the plans I have for you, declares the Lord, plans for welfare 
 * and not for evil, to give you a future and a hope." - Jeremiah 29:11
 */

import { PrismaClient, DegreeType, RequirementCategory, DegreeEnrollmentStatus } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateDegreeProgramInput {
  name: string;
  code: string;
  degreeType: DegreeType;
  facultyId: string;
  description: string;
  totalCredits: number;
  minimumGpa: number;
  estimatedDurationMonths: number;
  accreditationStatus?: string;
}

export interface CreateDegreeRequirementInput {
  degreeProgramId: string;
  category: RequirementCategory;
  name: string;
  description: string;
  creditHours: number;
  requiredCourses?: string[];
  electiveOptions?: string[];
  minimumGrade?: string;
  orderIndex?: number;
}

export interface EnrollInDegreeInput {
  userId: string;
  degreeProgramId: string;
  expectedGraduationDate?: Date;
}

export interface DegreeProgressSummary {
  enrollmentId: string;
  degreeProgramName: string;
  degreeType: DegreeType;
  status: DegreeEnrollmentStatus;
  overallProgress: number;
  creditsCompleted: number;
  creditsRequired: number;
  cumulativeGpa: number | null;
  requirementsMet: number;
  requirementsTotal: number;
  spiritualFormationComplete: boolean;
  eligibleForGraduation: boolean;
  estimatedCompletionDate: Date | null;
}

export class DegreeProgramService {
  /**
   * Create a new degree program
   */
  async createDegreeProgram(input: CreateDegreeProgramInput): Promise<any> {
    try {
      const degreeProgram = await prisma.degreeProgram.create({
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

      return degreeProgram;
    } catch (error) {
      console.error('Error creating degree program:', error);
      throw new Error(`Failed to create degree program: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add requirement to degree program
   */
  async addDegreeRequirement(input: CreateDegreeRequirementInput): Promise<any> {
    try {
      const requirement = await prisma.degreeRequirement.create({
        data: {
          degreeProgramId: input.degreeProgramId,
          category: input.category,
          name: input.name,
          description: input.description,
          creditHours: input.creditHours,
          requiredCourses: input.requiredCourses || [],
          electiveOptions: input.electiveOptions || [],
          minimumGrade: input.minimumGrade,
          orderIndex: input.orderIndex || 0,
        },
      });

      return requirement;
    } catch (error) {
      console.error('Error adding degree requirement:', error);
      throw new Error(`Failed to add degree requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enroll student in degree program
   */
  async enrollInDegree(input: EnrollInDegreeInput): Promise<any> {
    try {
      // Check if already enrolled
      const existing = await prisma.degreeEnrollment.findUnique({
        where: {
          userId_degreeProgramId: {
            userId: input.userId,
            degreeProgramId: input.degreeProgramId,
          },
        },
      });

      if (existing) {
        throw new Error('Student is already enrolled in this degree program');
      }

      // Get degree program with requirements
      const degreeProgram = await prisma.degreeProgram.findUnique({
        where: { id: input.degreeProgramId },
        include: {
          requirements: true,
          spiritualFormationRequirements: true,
        },
      });

      if (!degreeProgram) {
        throw new Error('Degree program not found');
      }

      // Create enrollment
      const enrollment = await prisma.degreeEnrollment.create({
        data: {
          userId: input.userId,
          degreeProgramId: input.degreeProgramId,
          expectedGraduationDate: input.expectedGraduationDate,
          status: 'ACTIVE',
        },
      });

      // Initialize requirement progress tracking
      for (const requirement of degreeProgram.requirements) {
        await prisma.degreeRequirementProgress.create({
          data: {
            degreeEnrollmentId: enrollment.id,
            degreeRequirementId: requirement.id,
          },
        });
      }

      // Initialize spiritual formation progress tracking
      for (const spiritualReq of degreeProgram.spiritualFormationRequirements) {
        await prisma.spiritualFormationProgress.create({
          data: {
            degreeEnrollmentId: enrollment.id,
            spiritualRequirementId: spiritualReq.id,
          },
        });
      }

      return enrollment;
    } catch (error) {
      console.error('Error enrolling in degree:', error);
      throw new Error(`Failed to enroll in degree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get degree progress for a student
   */
  async getDegreeProgress(userId: string, degreeProgramId: string): Promise<DegreeProgressSummary> {
    try {
      const enrollment = await prisma.degreeEnrollment.findUnique({
        where: {
          userId_degreeProgramId: {
            userId,
            degreeProgramId,
          },
        },
        include: {
          degreeProgram: {
            include: {
              requirements: true,
              spiritualFormationRequirements: true,
            },
          },
          requirementProgress: {
            include: {
              degreeRequirement: true,
            },
          },
          spiritualFormationProgress: {
            include: {
              spiritualRequirement: true,
            },
          },
        },
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Calculate progress
      const requirementsMet = enrollment.requirementProgress.filter(p => p.completed).length;
      const requirementsTotal = enrollment.degreeProgram.requirements.length;
      const overallProgress = requirementsTotal > 0 ? (requirementsMet / requirementsTotal) * 100 : 0;

      // Check spiritual formation completion
      const spiritualFormationComplete = enrollment.spiritualFormationProgress
        .filter(p => p.spiritualRequirement.required)
        .every(p => p.completed);

      // Check graduation eligibility
      const creditsComplete = enrollment.creditsCompleted >= enrollment.degreeProgram.totalCredits;
      const gpaRequirement = enrollment.cumulativeGpa ? enrollment.cumulativeGpa >= enrollment.degreeProgram.minimumGpa : false;
      const allRequirementsMet = requirementsMet === requirementsTotal;
      
      const eligibleForGraduation = creditsComplete && gpaRequirement && allRequirementsMet && spiritualFormationComplete;

      return {
        enrollmentId: enrollment.id,
        degreeProgramName: enrollment.degreeProgram.name,
        degreeType: enrollment.degreeProgram.degreeType,
        status: enrollment.status,
        overallProgress,
        creditsCompleted: enrollment.creditsCompleted,
        creditsRequired: enrollment.degreeProgram.totalCredits,
        cumulativeGpa: enrollment.cumulativeGpa,
        requirementsMet,
        requirementsTotal,
        spiritualFormationComplete,
        eligibleForGraduation,
        estimatedCompletionDate: enrollment.expectedGraduationDate,
      };
    } catch (error) {
      console.error('Error getting degree progress:', error);
      throw new Error(`Failed to get degree progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update degree progress when course is completed
   */
  async updateProgressOnCourseCompletion(
    userId: string,
    courseId: string,
    grade: string,
    credits: number
  ): Promise<void> {
    try {
      // Get all active degree enrollments for user
      const enrollments = await prisma.degreeEnrollment.findMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        include: {
          requirementProgress: {
            include: {
              degreeRequirement: true,
            },
          },
        },
      });

      for (const enrollment of enrollments) {
        // Find requirements that include this course
        for (const progress of enrollment.requirementProgress) {
          const requirement = progress.degreeRequirement;
          
          if (
            requirement.requiredCourses.includes(courseId) ||
            requirement.electiveOptions.includes(courseId)
          ) {
            // Update progress
            const completedCourses = [...progress.completedCourses, courseId];
            const creditsCompleted = progress.creditsCompleted + credits;
            const completed = creditsCompleted >= requirement.creditHours;

            await prisma.degreeRequirementProgress.update({
              where: { id: progress.id },
              data: {
                completedCourses,
                creditsCompleted,
                completed,
                completionDate: completed ? new Date() : null,
              },
            });
          }
        }

        // Update enrollment credits
        await prisma.degreeEnrollment.update({
          where: { id: enrollment.id },
          data: {
            creditsCompleted: {
              increment: credits,
            },
          },
        });
      }
    } catch (error) {
      console.error('Error updating degree progress:', error);
      throw new Error(`Failed to update degree progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all degree programs by type
   */
  async getDegreePrograms(degreeType?: DegreeType, facultyId?: string): Promise<any[]> {
    try {
      const programs = await prisma.degreeProgram.findMany({
        where: {
          ...(degreeType && { degreeType }),
          ...(facultyId && { facultyId }),
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

      return programs;
    } catch (error) {
      console.error('Error getting degree programs:', error);
      throw new Error(`Failed to get degree programs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get student's degree enrollments
   */
  async getStudentDegreeEnrollments(userId: string): Promise<any[]> {
    try {
      const enrollments = await prisma.degreeEnrollment.findMany({
        where: { userId },
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

      return enrollments;
    } catch (error) {
      console.error('Error getting student enrollments:', error);
      throw new Error(`Failed to get student enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get degree program details with full curriculum
   */
  async getDegreeProgramDetails(degreeProgramId: string): Promise<any> {
    try {
      const program = await prisma.degreeProgram.findUnique({
        where: { id: degreeProgramId },
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

      if (!program) {
        throw new Error('Degree program not found');
      }

      return program;
    } catch (error) {
      console.error('Error getting degree program details:', error);
      throw new Error(`Failed to get degree program details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default DegreeProgramService;
