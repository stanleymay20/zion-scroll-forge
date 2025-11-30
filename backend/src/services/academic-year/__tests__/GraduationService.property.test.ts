/**
 * Property-Based Tests for Graduation Service
 * Tests graduation requirement completeness
 * 
 * **Feature: academic-year-automation-system, Property 6: Graduation Requirement Completeness**
 * **Validates: Requirements 2.5**
 */

import * as fc from 'fast-check';

// Mock dependencies BEFORE importing the service
jest.mock('@prisma/client', () => {
  const mockQueryRaw = jest.fn();
  const mockExecuteRaw = jest.fn();
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRaw: mockQueryRaw,
      $executeRaw: mockExecuteRaw
    }))
  };
});
jest.mock('../../../utils/productionLogger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));
jest.mock('../../../utils/eventBus', () => ({
  eventBus: {
    emit: jest.fn()
  }
}));

import { GraduationService } from '../GraduationService';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient();

describe('Graduation Service Property-Based Tests', () => {
  let graduationService: GraduationService;

  beforeEach(() => {
    jest.clearAllMocks();
    graduationService = new GraduationService();
  });

  // ============================================================================
  // Custom Generators for Graduation Domain
  // ============================================================================

  /**
   * Generate a valid student with graduation-relevant data
   * Note: total_credits_earned will be calculated from completed courses
   */
  const studentGenerator = fc.record({
    id: fc.uuid(),
    student_id: fc.string({ minLength: 8, maxLength: 12 }).map(s => `STU-${s}`),
    gpa: fc.float({ min: 0.0, max: 4.0, noNaN: true }),
    total_credits_earned: fc.integer({ min: 0, max: 180 }),
    academic_standing: fc.constantFrom('good_standing', 'probation', 'suspension', 'dismissed'),
    financial_hold: fc.boolean(),
    academic_hold: fc.boolean(),
    disciplinary_hold: fc.boolean(),
    is_active: fc.constant(true)
  });

  /**
   * Generate a degree requirement
   */
  const degreeRequirementGenerator = fc.record({
    id: fc.uuid(),
    requirementType: fc.constantFrom('core', 'major', 'minor', 'elective', 'general_education'),
    requirementName: fc.string({ minLength: 5, maxLength: 50 }),
    requiredCredits: fc.integer({ min: 3, max: 60 }),
    requiredCourses: fc.array(fc.uuid(), { maxLength: 10 }),
    minimumGrade: fc.constantFrom('A', 'B', 'C', 'D')
  });

  /**
   * Generate a completed course enrollment
   */
  const completedCourseGenerator = fc.record({
    course_id: fc.uuid(),
    credits: fc.integer({ min: 1, max: 6 }),
    grade: fc.constantFrom('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'P'),
    grade_points: fc.float({ min: 2.0, max: 4.0, noNaN: true }),
    completion_date: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') }),
    semester_id: fc.uuid()
  });

  /**
   * Generate an in-progress course enrollment
   */
  const inProgressCourseGenerator = fc.record({
    course_id: fc.uuid(),
    credits: fc.integer({ min: 1, max: 6 }),
    semester_id: fc.uuid()
  });

  /**
   * Generate course details
   */
  const courseDetailsGenerator = (courseId: string) => fc.record({
    id: fc.constant(courseId),
    code: fc.string({ minLength: 6, maxLength: 10 }).map(s => `COURSE-${s}`),
    title: fc.string({ minLength: 10, maxLength: 100 })
  });

  // ============================================================================
  // Property 6: Graduation Requirement Completeness
  // ============================================================================

  describe('Property 6: Graduation Requirement Completeness', () => {
    /**
     * Property: For any student marked as graduation-eligible, all degree requirements 
     * must be satisfied with sufficient credits and GPA.
     * 
     * This property ensures that the graduation eligibility evaluation is correct and
     * that no student can be marked as eligible without meeting all requirements.
     */
    it('should only mark students as eligible when ALL requirements are met', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          fc.array(completedCourseGenerator, { minLength: 0, maxLength: 50 }),
          fc.array(inProgressCourseGenerator, { minLength: 0, maxLength: 10 }),
          async (student, completedCourses, inProgressCourses) => {
            // Service uses hardcoded 120 credit requirement
            const TOTAL_CREDITS_REQUIRED = 120;
            const MINIMUM_GPA = 2.0;
            
            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            
            // First call: Student query for evaluateGraduationEligibility
            mockQueryRaw.mockResolvedValueOnce([student]);
            
            // Second call: Student query for generateDegreeAudit
            mockQueryRaw.mockResolvedValueOnce([student]);
            
            // Third call: Completed courses query
            mockQueryRaw.mockResolvedValueOnce(completedCourses);
            
            // Fourth call: In-progress courses query
            mockQueryRaw.mockResolvedValueOnce(inProgressCourses);

            // Mock course details queries for each course
            for (const course of [...completedCourses, ...inProgressCourses]) {
              mockQueryRaw.mockResolvedValueOnce([{
                id: course.course_id,
                code: `COURSE-${course.course_id.substring(0, 6)}`,
                title: 'Test Course'
              }]);
            }

            // Calculate expected values
            // Sync student's total_credits_earned with completed courses
            const calculatedCredits = completedCourses.reduce((sum, c) => sum + c.credits, 0);
            student.total_credits_earned = calculatedCredits;
            const totalCreditsEarned = calculatedCredits;
            const inProgressCredits = inProgressCourses.reduce((sum, c) => sum + c.credits, 0);

            // Determine if student should be eligible
            // Note: In-progress credits don't count toward graduation eligibility
            const hasEnoughCredits = totalCreditsEarned >= TOTAL_CREDITS_REQUIRED;
            const hasMinimumGPA = student.gpa >= MINIMUM_GPA;
            const hasNoHolds = !student.financial_hold && !student.academic_hold && !student.disciplinary_hold;

            const shouldBeEligible = hasEnoughCredits && hasMinimumGPA && hasNoHolds;

            // Execute: Evaluate graduation eligibility
            const evaluation = await graduationService.evaluateGraduationEligibility(student.id);

            // Verify: Eligibility matches expected criteria
            if (shouldBeEligible) {
              expect(evaluation.isEligible).toBe(true);
              expect(evaluation.requirements.creditsCompleted).toBe(true);
              expect(evaluation.requirements.gpaRequirementMet).toBe(true);
              expect(evaluation.requirements.noFinancialHolds).toBe(true);
              expect(evaluation.requirements.noAcademicHolds).toBe(true);
              expect(evaluation.requirements.noDisciplinaryHolds).toBe(true);
              expect(evaluation.blockers).toHaveLength(0);
            } else {
              expect(evaluation.isEligible).toBe(false);
              expect(evaluation.blockers.length).toBeGreaterThan(0);
            }

            // Additional invariants
            expect(evaluation.studentId).toBe(student.id);
            expect(evaluation.evaluationDate).toBeInstanceOf(Date);
            expect(evaluation.recommendedActions).toBeDefined();
            expect(Array.isArray(evaluation.recommendedActions)).toBe(true);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: Credits requirement must be strictly enforced
     * A student cannot be eligible if they have fewer credits than required
     * Note: Service uses hardcoded 120 credit requirement
     */
    it('should never mark student as eligible with insufficient credits', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          async (student) => {
            // Service uses hardcoded 120 credit requirement
            const REQUIRED_CREDITS = 120;
            
            // Ensure student has fewer credits than required
            const studentWithInsufficientCredits = {
              ...student,
              total_credits_earned: Math.min(student.total_credits_earned, REQUIRED_CREDITS - 1),
              gpa: 3.5, // Good GPA
              financial_hold: false,
              academic_hold: false,
              disciplinary_hold: false
            };

            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw
              .mockResolvedValueOnce([studentWithInsufficientCredits]) // Student query for evaluateGraduationEligibility
              .mockResolvedValueOnce([studentWithInsufficientCredits]) // Student query for generateDegreeAudit
              .mockResolvedValueOnce([]) // No completed courses
              .mockResolvedValueOnce([]); // No in-progress courses

            // Execute
            const evaluation = await graduationService.evaluateGraduationEligibility(studentWithInsufficientCredits.id);

            // Verify: Must not be eligible due to insufficient credits
            expect(evaluation.isEligible).toBe(false);
            expect(evaluation.requirements.creditsCompleted).toBe(false);
            
            // Should have a blocker about credits
            const creditsBlocker = evaluation.blockers.find(b => b.blockerType === 'credits');
            expect(creditsBlocker).toBeDefined();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: GPA requirement must be strictly enforced
     * A student cannot be eligible if their GPA is below minimum
     * Note: Service uses hardcoded 2.0 minimum GPA
     */
    it('should never mark student as eligible with insufficient GPA', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          async (student) => {
            // Service uses hardcoded 2.0 minimum GPA
            const MINIMUM_GPA = 2.0;
            
            // Ensure student has GPA below minimum (with margin for floating point)
            const studentWithLowGPA = {
              ...student,
              gpa: Math.min(student.gpa, MINIMUM_GPA - 0.01),
              total_credits_earned: 150, // Sufficient credits
              financial_hold: false,
              academic_hold: false,
              disciplinary_hold: false
            };

            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw
              .mockResolvedValueOnce([studentWithLowGPA]) // Student query for evaluateGraduationEligibility
              .mockResolvedValueOnce([studentWithLowGPA]) // Student query for generateDegreeAudit
              .mockResolvedValueOnce([]) // Completed courses
              .mockResolvedValueOnce([]); // In-progress courses

            // Execute
            const evaluation = await graduationService.evaluateGraduationEligibility(studentWithLowGPA.id);

            // Verify: Must not be eligible due to low GPA
            expect(evaluation.isEligible).toBe(false);
            expect(evaluation.requirements.gpaRequirementMet).toBe(false);
            
            // Should have a blocker about GPA
            const gpaBlocker = evaluation.blockers.find(b => b.blockerType === 'gpa');
            expect(gpaBlocker).toBeDefined();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: Holds must prevent graduation eligibility
     * Any type of hold (financial, academic, disciplinary) should block graduation
     */
    it('should never mark student as eligible with any active holds', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          fc.constantFrom('financial_hold', 'academic_hold', 'disciplinary_hold'),
          async (student, holdType) => {
            // Create student with sufficient credits and GPA but with a hold
            const studentWithHold = {
              ...student,
              gpa: 3.5,
              total_credits_earned: 150,
              financial_hold: holdType === 'financial_hold',
              academic_hold: holdType === 'academic_hold',
              disciplinary_hold: holdType === 'disciplinary_hold'
            };

            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw
              .mockResolvedValueOnce([studentWithHold]) // Student query for evaluateGraduationEligibility
              .mockResolvedValueOnce([studentWithHold]) // Student query for generateDegreeAudit
              .mockResolvedValueOnce([]) // Completed courses
              .mockResolvedValueOnce([]); // In-progress courses

            // Execute
            const evaluation = await graduationService.evaluateGraduationEligibility(studentWithHold.id);

            // Verify: Must not be eligible due to hold
            expect(evaluation.isEligible).toBe(false);
            
            // Verify specific hold requirement is false
            if (holdType === 'financial_hold') {
              expect(evaluation.requirements.noFinancialHolds).toBe(false);
            } else if (holdType === 'academic_hold') {
              expect(evaluation.requirements.noAcademicHolds).toBe(false);
            } else if (holdType === 'disciplinary_hold') {
              expect(evaluation.requirements.noDisciplinaryHolds).toBe(false);
            }
            
            // Should have a blocker about holds
            const holdsBlocker = evaluation.blockers.find(b => b.blockerType === 'holds');
            expect(holdsBlocker).toBeDefined();
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: Degree audit completion percentage must be accurate
     * The completion percentage should accurately reflect credits earned vs required
     * Note: Service uses hardcoded 120 credit requirement
     */
    it('should calculate accurate completion percentage in degree audit', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          async (student) => {
            // Service uses hardcoded 120 credit requirement
            const TOTAL_CREDITS_REQUIRED = 120;
            
            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw
              .mockResolvedValueOnce([student]) // Student query
              .mockResolvedValueOnce([]) // Completed courses
              .mockResolvedValueOnce([]); // In-progress courses

            // Execute
            const audit = await graduationService.generateDegreeAudit(student.id);

            // Calculate expected completion percentage
            const expectedPercentage = TOTAL_CREDITS_REQUIRED > 0 
              ? (student.total_credits_earned / TOTAL_CREDITS_REQUIRED) * 100 
              : 0;

            // Verify: Completion percentage is accurate (within 0.1% tolerance)
            expect(Math.abs(audit.overallCompletionPercentage - expectedPercentage)).toBeLessThan(0.1);
            
            // Additional invariants
            expect(audit.totalCreditsEarned).toBe(student.total_credits_earned);
            expect(audit.currentGPA).toBe(student.gpa);
            expect(audit.overallCompletionPercentage).toBeGreaterThanOrEqual(0);
            // Allow for > 100% if student has more credits than required
            expect(audit.overallCompletionPercentage).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: Graduation timeline prediction must be reasonable
     * Estimated graduation date should be in the future if credits remain
     */
    it('should predict reasonable graduation timeline based on remaining credits', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.integer({ min: 1, max: 60 }), // Remaining credits
          async (studentId, remainingCredits) => {
            // Setup: Mock enrollment history
            const mockEnrollmentHistory = [
              { semester_id: 'sem1', total_credits: BigInt(15) },
              { semester_id: 'sem2', total_credits: BigInt(15) },
              { semester_id: 'sem3', total_credits: BigInt(12) }
            ];

            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw.mockResolvedValueOnce(mockEnrollmentHistory);

            // Execute
            const estimatedDate = await graduationService.predictGraduationDate(studentId, remainingCredits);

            // Verify: Estimated date should be in the future
            if (estimatedDate) {
              const currentDate = new Date();
              expect(estimatedDate.getTime()).toBeGreaterThan(currentDate.getTime());
              
              // Should be within reasonable timeframe (not more than 10 years in future)
              const tenYearsFromNow = new Date();
              tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
              expect(estimatedDate.getTime()).toBeLessThan(tenYearsFromNow.getTime());
            }
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });

    /**
     * Property: All eligible students must have zero blocking issues
     * If a student is marked eligible, they should have no blockers
     */
    it('should have zero blockers if and only if student is eligible', async () => {
      await fc.assert(
        fc.asyncProperty(
          studentGenerator,
          async (student) => {
            // Setup: Mock database responses
            const mockQueryRaw = mockPrisma.$queryRaw as jest.Mock;
            mockQueryRaw.mockReset();
            mockQueryRaw
              .mockResolvedValueOnce([student]) // Student query for evaluateGraduationEligibility
              .mockResolvedValueOnce([student]) // Student query for generateDegreeAudit
              .mockResolvedValueOnce([]) // Completed courses
              .mockResolvedValueOnce([]); // In-progress courses

            // Execute
            const evaluation = await graduationService.evaluateGraduationEligibility(student.id);

            // Verify: Eligibility and blockers are consistent
            if (evaluation.isEligible) {
              expect(evaluation.blockers).toHaveLength(0);
            } else {
              expect(evaluation.blockers.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100, verbose: false }
      );
    });
  });
});
