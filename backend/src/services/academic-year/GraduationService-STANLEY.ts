/**
 * Graduation Service
 * "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future." - Jeremiah 29:11
 * 
 * Task 12: Implement GraduationService
 * Manages degree audit logic, graduation eligibility evaluation, and graduation timeline prediction.
 * Requirements: 2.5
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/productionLogger';
import { eventBus } from '../../utils/eventBus';

const prisma = new PrismaClient();

// Configuration from environment with fallbacks
const MINIMUM_GPA_FOR_GRADUATION = parseFloat(process.env.MINIMUM_GPA_FOR_GRADUATION || '2.0');
const MINIMUM_CREDITS_FOR_GRADUATION = parseInt(process.env.MINIMUM_CREDITS_FOR_GRADUATION || '120', 10);

export interface DegreeRequirement {
  id: string;
  requirementType: 'core' | 'major' | 'minor' | 'elective' | 'general_education';
  requirementName: string;
  requiredCredits: number;
  requiredCourses: string[];
  minimumGrade?: string;
  description?: string;
}

export interface DegreeAudit {
  studentId: string;
  degreeProgramId: string;
  totalCreditsRequired: number;
  totalCreditsEarned: number;
  totalCreditsInProgress: number;
  totalCreditsRemaining: number;
  currentGPA: number;
  minimumGPARequired: number;
  requirementsFulfilled: RequirementFulfillment[];
  requirementsInProgress: RequirementFulfillment[];
  requirementsRemaining: RequirementFulfillment[];
  overallCompletionPercentage: number;
  estimatedGraduationDate?: Date;
  isEligibleForGraduation: boolean;
  blockingIssues: string[];
  auditDate: Date;
}

export interface RequirementFulfillment {
  requirementId: string;
  requirementType: string;
  requirementName: string;
  requiredCredits: number;
  earnedCredits: number;
  inProgressCredits: number;
  remainingCredits: number;
  completionPercentage: number;
  isFulfilled: boolean;
  fulfilledCourses: CourseCompletion[];
  inProgressCourses: CourseCompletion[];
  remainingCourses: string[];
}

export interface CourseCompletion {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  grade?: string;
  gradePoints?: number;
  completionDate?: Date;
  semesterId?: string;
}

export interface GraduationEvaluation {
  studentId: string;
  isEligible: boolean;
  eligibilityDate?: Date;
  blockers: GraduationBlocker[];
  requirements: {
    creditsCompleted: boolean;
    gpaRequirementMet: boolean;
    allRequirementsFulfilled: boolean;
    noFinancialHolds: boolean;
    noAcademicHolds: boolean;
    noDisciplinaryHolds: boolean;
  };
  estimatedGraduationDate?: Date;
  recommendedActions: string[];
  evaluationDate: Date;
}

export interface GraduationBlocker {
  blockerType: 'credits' | 'gpa' | 'requirements' | 'holds' | 'other';
  description: string;
  severity: 'critical' | 'warning' | 'info';
  resolutionSteps: string[];
}

export interface GraduationTimeline {
  studentId: string;
  currentSemester: string;
  creditsPerSemester: number;
  remainingCredits: number;
  estimatedSemesters: number;
  estimatedGraduationDate: Date;
  milestones: GraduationMilestone[];
  assumptions: string[];
}

export interface GraduationMilestone {
  semesterName: string;
  semesterStartDate: Date;
  plannedCredits: number;
  cumulativeCredits: number;
  completionPercentage: number;
  keyRequirements: string[];
}

export class GraduationService {
  /**
   * Evaluate graduation eligibility for a student
   * Performs comprehensive degree audit and checks all requirements
   * Requirements: 2.5
   */
  async evaluateGraduationEligibility(studentId: string): Promise<GraduationEvaluation> {
    try {
      logger.info('Evaluating graduation eligibility', { studentId });

      // Get student record
      const studentResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
        gpa: number;
        total_credits_earned: number;
        academic_standing: string;
        financial_hold: boolean;
        academic_hold: boolean;
        disciplinary_hold: boolean;
        is_active: boolean;
      }>>`
        SELECT id, student_id, gpa, total_credits_earned, academic_standing,
               financial_hold, academic_hold, disciplinary_hold, is_active
        FROM students
        WHERE id = ${studentId}::uuid
        LIMIT 1
      `;

      if (studentResult.length === 0) {
        throw new Error('Student not found');
      }

      const student = studentResult[0];

      // Perform degree audit
      const degreeAudit = await this.generateDegreeAudit(studentId);

      // Check all eligibility criteria
      const blockers: GraduationBlocker[] = [];
      const requirements = {
        creditsCompleted: false,
        gpaRequirementMet: false,
        allRequirementsFulfilled: false,
        noFinancialHolds: false,
        noAcademicHolds: false,
        noDisciplinaryHolds: false
      };

      // Check credits
      if (student.total_credits_earned >= degreeAudit.totalCreditsRequired) {
        requirements.creditsCompleted = true;
      } else {
        blockers.push({
          blockerType: 'credits',
          description: `Need ${degreeAudit.totalCreditsRemaining} more credits to graduate`,
          severity: 'critical',
          resolutionSteps: [
            'Complete remaining required courses',
            'Ensure all courses are passed with minimum grades',
            'Consider summer or winter term enrollment'
          ]
        });
      }

      // Check GPA
      if (student.gpa >= MINIMUM_GPA_FOR_GRADUATION) {
        requirements.gpaRequirementMet = true;
      } else {
        blockers.push({
          blockerType: 'gpa',
          description: `GPA ${student.gpa.toFixed(2)} is below minimum ${MINIMUM_GPA_FOR_GRADUATION.toFixed(2)}`,
          severity: 'critical',
          resolutionSteps: [
            'Retake courses with low grades',
            'Seek academic tutoring support',
            'Meet with academic advisor for GPA improvement plan'
          ]
        });
      }

      // Check all requirements fulfilled
      if (degreeAudit.requirementsRemaining.length === 0) {
        requirements.allRequirementsFulfilled = true;
      } else {
        blockers.push({
          blockerType: 'requirements',
          description: `${degreeAudit.requirementsRemaining.length} degree requirements not yet fulfilled`,
          severity: 'critical',
          resolutionSteps: degreeAudit.requirementsRemaining.map(req => 
            `Complete ${req.requirementName}: ${req.remainingCredits} credits remaining`
          )
        });
      }

      // Check holds
      if (!student.financial_hold) {
        requirements.noFinancialHolds = true;
      } else {
        blockers.push({
          blockerType: 'holds',
          description: 'Financial hold on account',
          severity: 'critical',
          resolutionSteps: [
            'Contact bursar office',
            'Resolve outstanding balance',
            'Set up payment plan if needed'
          ]
        });
      }

      if (!student.academic_hold) {
        requirements.noAcademicHolds = true;
      } else {
        blockers.push({
          blockerType: 'holds',
          description: 'Academic hold on account',
          severity: 'critical',
          resolutionSteps: [
            'Contact academic advisor',
            'Resolve academic standing issues',
            'Complete required academic interventions'
          ]
        });
      }

      if (!student.disciplinary_hold) {
        requirements.noDisciplinaryHolds = true;
      } else {
        blockers.push({
          blockerType: 'holds',
          description: 'Disciplinary hold on account',
          severity: 'critical',
          resolutionSteps: [
            'Contact student affairs office',
            'Complete disciplinary requirements',
            'Resolve conduct violations'
          ]
        });
      }

      // Determine eligibility
      const isEligible = Object.values(requirements).every(req => req === true);

      // Generate recommended actions
      const recommendedActions: string[] = [];
      if (isEligible) {
        recommendedActions.push('Apply for graduation through student portal');
        recommendedActions.push('Order cap and gown');
        recommendedActions.push('Complete exit survey');
        recommendedActions.push('Update contact information for diploma mailing');
      } else {
        recommendedActions.push('Review degree audit with academic advisor');
        recommendedActions.push('Create plan to resolve blocking issues');
        if (!requirements.creditsCompleted) {
          recommendedActions.push('Register for remaining required courses');
        }
        if (!requirements.gpaRequirementMet) {
          recommendedActions.push('Develop GPA improvement strategy');
        }
      }

      // Calculate estimated graduation date
      let estimatedGraduationDate: Date | undefined;
      if (!isEligible && degreeAudit.estimatedGraduationDate) {
        estimatedGraduationDate = degreeAudit.estimatedGraduationDate;
      } else if (isEligible) {
        // Get next graduation ceremony date
        estimatedGraduationDate = await this.getNextGraduationDate();
      }

      const evaluation: GraduationEvaluation = {
        studentId,
        isEligible,
        eligibilityDate: isEligible ? new Date() : undefined,
        blockers,
        requirements,
        estimatedGraduationDate,
        recommendedActions,
        evaluationDate: new Date()
      };

      // Emit event if eligible
      if (isEligible) {
        eventBus.emit('graduation.eligible', {
          studentId,
          evaluationDate: new Date(),
          estimatedGraduationDate,
          timestamp: new Date()
        });

        logger.info('Student is eligible for graduation', { studentId });
      } else {
        logger.info('Student not yet eligible for graduation', { 
          studentId, 
          blockerCount: blockers.length 
        });
      }

      return evaluation;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error evaluating graduation eligibility', { 
        error: errorMessage, 
        studentId 
      });
      throw error;
    }
  }

  /**
   * Generate comprehensive degree audit for a student
   * Calculates completed, in-progress, and remaining requirements
   * Requirements: 2.5
   */
  async generateDegreeAudit(studentId: string): Promise<DegreeAudit> {
    try {
      logger.info('Generating degree audit', { studentId });

      // Get student record
      const studentResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
        gpa: number;
        total_credits_earned: number;
      }>>`
        SELECT id, student_id, gpa, total_credits_earned
        FROM students
        WHERE id = ${studentId}::uuid
        LIMIT 1
      `;

      if (studentResult.length === 0) {
        throw new Error('Student not found');
      }

      const student = studentResult[0];

      // Get degree program (for now, use default program)
      // In production, this would be fetched from student's degree program assignment
      const degreeProgramId = 'default_program';
      const degreeRequirements = await this.getDegreeRequirements(degreeProgramId);

      // Get completed courses
      const completedCoursesResult = await prisma.$queryRaw<Array<{
        course_id: string;
        credits: number;
        grade: string | null;
        grade_points: number | null;
        completion_date: Date | null;
        semester_id: string | null;
      }>>`
        SELECT ce.course_id, ce.credits, ce.grade, ce.grade_points, 
               ce.completion_date, ce.semester_id
        FROM course_enrollments ce
        WHERE ce.student_id = ${studentId}::uuid
          AND ce.enrollment_status = 'completed'
          AND ce.grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'P')
      `;

      // Get in-progress courses
      const inProgressCoursesResult = await prisma.$queryRaw<Array<{
        course_id: string;
        credits: number;
        semester_id: string | null;
      }>>`
        SELECT ce.course_id, ce.credits, ce.semester_id
        FROM course_enrollments ce
        WHERE ce.student_id = ${studentId}::uuid
          AND ce.enrollment_status IN ('enrolled', 'active')
      `;

      // Calculate fulfillment for each requirement
      const requirementsFulfilled: RequirementFulfillment[] = [];
      const requirementsInProgress: RequirementFulfillment[] = [];
      const requirementsRemaining: RequirementFulfillment[] = [];

      let totalCreditsRequired = 0;
      let totalCreditsInProgress = 0;

      for (const requirement of degreeRequirements) {
        totalCreditsRequired += requirement.requiredCredits;

        const fulfillment = await this.calculateRequirementFulfillment(
          requirement,
          completedCoursesResult,
          inProgressCoursesResult
        );

        if (fulfillment.isFulfilled) {
          requirementsFulfilled.push(fulfillment);
        } else if (fulfillment.inProgressCredits > 0) {
          requirementsInProgress.push(fulfillment);
          totalCreditsInProgress += fulfillment.inProgressCredits;
        } else {
          requirementsRemaining.push(fulfillment);
        }
      }

      const totalCreditsEarned = student.total_credits_earned;
      const totalCreditsRemaining = Math.max(0, totalCreditsRequired - totalCreditsEarned - totalCreditsInProgress);
      const overallCompletionPercentage = totalCreditsRequired > 0 
        ? (totalCreditsEarned / totalCreditsRequired) * 100 
        : 0;

      // Predict graduation timeline
      const estimatedGraduationDate = await this.predictGraduationDate(
        studentId,
        totalCreditsRemaining
      );

      const isEligibleForGraduation = totalCreditsRemaining === 0 && 
                                      requirementsRemaining.length === 0 &&
                                      student.gpa >= MINIMUM_GPA_FOR_GRADUATION;

      const blockingIssues: string[] = [];
      if (totalCreditsRemaining > 0) {
        blockingIssues.push(`${totalCreditsRemaining} credits remaining`);
      }
      if (requirementsRemaining.length > 0) {
        blockingIssues.push(`${requirementsRemaining.length} requirements not fulfilled`);
      }
      if (student.gpa < MINIMUM_GPA_FOR_GRADUATION) {
        blockingIssues.push(`GPA ${student.gpa.toFixed(2)} below minimum ${MINIMUM_GPA_FOR_GRADUATION.toFixed(2)}`);
      }

      const audit: DegreeAudit = {
        studentId,
        degreeProgramId,
        totalCreditsRequired,
        totalCreditsEarned,
        totalCreditsInProgress,
        totalCreditsRemaining,
        currentGPA: student.gpa,
        minimumGPARequired: MINIMUM_GPA_FOR_GRADUATION,
        requirementsFulfilled,
        requirementsInProgress,
        requirementsRemaining,
        overallCompletionPercentage,
        estimatedGraduationDate,
        isEligibleForGraduation,
        blockingIssues,
        auditDate: new Date()
      };

      logger.info('Degree audit generated', { 
        studentId, 
        completionPercentage: overallCompletionPercentage.toFixed(1),
        isEligible: isEligibleForGraduation
      });

      return audit;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating degree audit', { 
        error: errorMessage, 
        studentId 
      });
      throw error;
    }
  }

  /**
   * Predict graduation timeline based on current progress
   * Requirements: 2.5
   */
  async predictGraduationDate(
    studentId: string,
    remainingCredits: number
  ): Promise<Date | undefined> {
    try {
      if (remainingCredits <= 0) {
        return await this.getNextGraduationDate();
      }

      // Calculate average credits per semester from student history
      const enrollmentHistoryResult = await prisma.$queryRaw<Array<{
        semester_id: string;
        total_credits: bigint;
      }>>`
        SELECT semester_id, SUM(credits)::bigint as total_credits
        FROM course_enrollments
        WHERE student_id = ${studentId}::uuid
          AND enrollment_status = 'completed'
        GROUP BY semester_id
      `;

      let averageCreditsPerSemester = 15; // Default assumption
      if (enrollmentHistoryResult.length > 0) {
        const totalCredits = enrollmentHistoryResult.reduce(
          (sum, sem) => sum + Number(sem.total_credits), 
          0
        );
        averageCreditsPerSemester = Math.round(totalCredits / enrollmentHistoryResult.length);
      }

      // Ensure minimum of 12 credits per semester
      averageCreditsPerSemester = Math.max(12, averageCreditsPerSemester);

      // Calculate semesters needed
      const semestersNeeded = Math.ceil(remainingCredits / averageCreditsPerSemester);

      // Get current date and add semesters
      const currentDate = new Date();
      const monthsToAdd = semestersNeeded * 4; // Assuming 4 months per semester
      const estimatedDate = new Date(currentDate);
      estimatedDate.setMonth(estimatedDate.getMonth() + monthsToAdd);

      logger.info('Graduation date predicted', { 
        studentId, 
        remainingCredits,
        semestersNeeded,
        estimatedDate: estimatedDate.toISOString()
      });

      return estimatedDate;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error predicting graduation date', { 
        error: errorMessage, 
        studentId 
      });
      return undefined;
    }
  }

  /**
   * Get detailed graduation timeline with milestones
   * Requirements: 2.5
   */
  async getGraduationTimeline(studentId: string): Promise<GraduationTimeline> {
    try {
      logger.info('Generating graduation timeline', { studentId });

      const degreeAudit = await this.generateDegreeAudit(studentId);

      // Calculate average credits per semester
      const enrollmentHistoryResult = await prisma.$queryRaw<Array<{
        semester_id: string;
        total_credits: bigint;
      }>>`
        SELECT semester_id, SUM(credits)::bigint as total_credits
        FROM course_enrollments
        WHERE student_id = ${studentId}::uuid
          AND enrollment_status = 'completed'
        GROUP BY semester_id
      `;

      let creditsPerSemester = 15;
      if (enrollmentHistoryResult.length > 0) {
        const totalCredits = enrollmentHistoryResult.reduce(
          (sum, sem) => sum + Number(sem.total_credits), 
          0
        );
        creditsPerSemester = Math.round(totalCredits / enrollmentHistoryResult.length);
      }
      creditsPerSemester = Math.max(12, creditsPerSemester);

      const remainingCredits = degreeAudit.totalCreditsRemaining;
      const estimatedSemesters = Math.ceil(remainingCredits / creditsPerSemester);

      // Generate milestones
      const milestones: GraduationMilestone[] = [];
      let cumulativeCredits = degreeAudit.totalCreditsEarned;
      const currentDate = new Date();

      for (let i = 1; i <= estimatedSemesters; i++) {
        const semesterStartDate = new Date(currentDate);
        semesterStartDate.setMonth(semesterStartDate.getMonth() + (i - 1) * 4);

        const plannedCredits = Math.min(creditsPerSemester, remainingCredits - (cumulativeCredits - degreeAudit.totalCreditsEarned));
        cumulativeCredits += plannedCredits;

        const completionPercentage = (cumulativeCredits / degreeAudit.totalCreditsRequired) * 100;

        milestones.push({
          semesterName: `Semester ${i}`,
          semesterStartDate,
          plannedCredits,
          cumulativeCredits,
          completionPercentage,
          keyRequirements: degreeAudit.requirementsRemaining
            .slice(0, 2)
            .map(req => req.requirementName)
        });
      }

      const estimatedGraduationDate = degreeAudit.estimatedGraduationDate || new Date();

      const timeline: GraduationTimeline = {
        studentId,
        currentSemester: 'Current',
        creditsPerSemester,
        remainingCredits,
        estimatedSemesters,
        estimatedGraduationDate,
        milestones,
        assumptions: [
          `Average ${creditsPerSemester} credits per semester`,
          'All courses passed on first attempt',
          'No breaks in enrollment',
          'All prerequisites met on schedule'
        ]
      };

      logger.info('Graduation timeline generated', { 
        studentId, 
        estimatedSemesters,
        estimatedGraduationDate: estimatedGraduationDate.toISOString()
      });

      return timeline;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating graduation timeline', { 
        error: errorMessage, 
        studentId 
      });
      throw error;
    }
  }

  /**
   * Calculate fulfillment status for a specific requirement
   */
  private async calculateRequirementFulfillment(
    requirement: DegreeRequirement,
    completedCourses: Array<{
      course_id: string;
      credits: number;
      grade: string | null;
      grade_points: number | null;
      completion_date: Date | null;
      semester_id: string | null;
    }>,
    inProgressCourses: Array<{
      course_id: string;
      credits: number;
      semester_id: string | null;
    }>
  ): Promise<RequirementFulfillment> {
    // Get course details for completed courses
    const fulfilledCourses: CourseCompletion[] = [];
    let earnedCredits = 0;

    for (const completed of completedCourses) {
      // Check if course fulfills this requirement
      if (requirement.requiredCourses.length === 0 || 
          requirement.requiredCourses.includes(completed.course_id)) {
        
        // Get course details
        const courseResult = await prisma.$queryRaw<Array<{
          id: string;
          code: string;
          title: string;
        }>>`
          SELECT id, code, title
          FROM courses
          WHERE id = ${completed.course_id}::uuid
          LIMIT 1
        `;

        if (courseResult && courseResult.length > 0) {
          const course = courseResult[0];
          fulfilledCourses.push({
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            credits: completed.credits,
            grade: completed.grade || undefined,
            gradePoints: completed.grade_points || undefined,
            completionDate: completed.completion_date || undefined,
            semesterId: completed.semester_id || undefined
          });
          earnedCredits += completed.credits;
        }
      }
    }

    // Get in-progress courses
    const inProgressCoursesList: CourseCompletion[] = [];
    let inProgressCredits = 0;

    for (const inProgress of inProgressCourses) {
      if (requirement.requiredCourses.length === 0 || 
          requirement.requiredCourses.includes(inProgress.course_id)) {
        
        const courseResult = await prisma.$queryRaw<Array<{
          id: string;
          code: string;
          title: string;
        }>>`
          SELECT id, code, title
          FROM courses
          WHERE id = ${inProgress.course_id}::uuid
          LIMIT 1
        `;

        if (courseResult.length > 0) {
          const course = courseResult[0];
          inProgressCoursesList.push({
            courseId: course.id,
            courseCode: course.code,
            courseTitle: course.title,
            credits: inProgress.credits,
            semesterId: inProgress.semester_id || undefined
          });
          inProgressCredits += inProgress.credits;
        }
      }
    }

    const remainingCredits = Math.max(0, requirement.requiredCredits - earnedCredits - inProgressCredits);
    const completionPercentage = requirement.requiredCredits > 0 
      ? (earnedCredits / requirement.requiredCredits) * 100 
      : 0;
    const isFulfilled = earnedCredits >= requirement.requiredCredits;

    return {
      requirementId: requirement.id,
      requirementType: requirement.requirementType,
      requirementName: requirement.requirementName,
      requiredCredits: requirement.requiredCredits,
      earnedCredits,
      inProgressCredits,
      remainingCredits,
      completionPercentage,
      isFulfilled,
      fulfilledCourses,
      inProgressCourses: inProgressCoursesList,
      remainingCourses: requirement.requiredCourses.filter(
        courseId => !fulfilledCourses.some(fc => fc.courseId === courseId) &&
                    !inProgressCoursesList.some(ip => ip.courseId === courseId)
      )
    };
  }

  /**
   * Get degree requirements for a program
   */
  private async getDegreeRequirements(degreeProgramId: string): Promise<DegreeRequirement[]> {
    // In production, this would fetch from degree_requirements table
    // For now, return default requirements
    return [
      {
        id: 'req_core',
        requirementType: 'core',
        requirementName: 'Core Requirements',
        requiredCredits: 30,
        requiredCourses: [],
        minimumGrade: 'C'
      },
      {
        id: 'req_major',
        requirementType: 'major',
        requirementName: 'Major Requirements',
        requiredCredits: 45,
        requiredCourses: [],
        minimumGrade: 'C'
      },
      {
        id: 'req_elective',
        requirementType: 'elective',
        requirementName: 'Electives',
        requiredCredits: 30,
        requiredCourses: [],
        minimumGrade: 'D'
      },
      {
        id: 'req_gen_ed',
        requirementType: 'general_education',
        requirementName: 'General Education',
        requiredCredits: 15,
        requiredCourses: [],
        minimumGrade: 'C'
      }
    ];
  }

  /**
   * Get next graduation ceremony date
   */
  private async getNextGraduationDate(): Promise<Date> {
    // In production, this would fetch from academic calendar
    // For now, calculate next May or December
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    let graduationDate: Date;
    if (currentMonth < 5) {
      // Next graduation is May of current year
      graduationDate = new Date(currentYear, 4, 15); // May 15
    } else if (currentMonth < 12) {
      // Next graduation is December of current year
      graduationDate = new Date(currentYear, 11, 15); // December 15
    } else {
      // Next graduation is May of next year
      graduationDate = new Date(currentYear + 1, 4, 15);
    }

    return graduationDate;
  }

  /**
   * Initiate graduation workflow for eligible student
   * Requirements: 2.5
   */
  async initiateGraduationWorkflow(studentId: string): Promise<void> {
    try {
      logger.info('Initiating graduation workflow', { studentId });

      const evaluation = await this.evaluateGraduationEligibility(studentId);

      if (!evaluation.isEligible) {
        throw new Error('Student is not eligible for graduation');
      }

      // Emit workflow trigger event
      eventBus.emit('workflow.triggered', {
        workflowType: 'graduation',
        entityType: 'student',
        entityId: studentId,
        context: {
          studentId,
          evaluationDate: evaluation.evaluationDate,
          estimatedGraduationDate: evaluation.estimatedGraduationDate
        },
        timestamp: new Date()
      });

      logger.info('Graduation workflow initiated', { studentId });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error initiating graduation workflow', { 
        error: errorMessage, 
        studentId 
      });
      throw error;
    }
  }
}

export default new GraduationService();
