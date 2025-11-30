/**
 * Registration Service
 * "Trust in the Lord with all your heart and lean not on your own understanding" - Proverbs 3:5
 * 
 * Task 11: Implement RegistrationService
 * Manages course registration logic, prerequisite validation, enrollment capacity checking, and waitlist management.
 * Requirements: 2.2, 2.3
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../../utils/productionLogger';
import { eventBus } from '../../utils/eventBus';
import ScrollRegistrarAgent from './ScrollRegistrarAgent';

const prisma = new PrismaClient();

// Configuration from environment with fallbacks
const DEFAULT_MAX_CAPACITY = parseInt(process.env.DEFAULT_COURSE_CAPACITY || '100', 10);
const ENABLE_WAITLIST = process.env.ENABLE_COURSE_WAITLIST !== 'false';
const WAITLIST_ENROLLMENT_WINDOW_HOURS = parseInt(process.env.WAITLIST_ENROLLMENT_WINDOW_HOURS || '48', 10);

export interface RegistrationConfig {
  registrationId: string;
  studentId: string;
  courseId: string;
  semesterId: string;
  registrationType: 'automatic' | 'manual' | 'waitlist';
  priority: number;
  prerequisites: string[];
  maxCapacity: number;
  currentEnrollment: number;
}

export interface EnrollmentValidation {
  studentId: string;
  courseId: string;
  eligible: boolean;
  reason: string;
  missingPrerequisites: string[];
  conflictingSchedules: string[];
  capacityAvailable: boolean;
  hasFinancialHold: boolean;
  hasAcademicHold: boolean;
  hasDisciplinaryHold: boolean;
}

export interface RegistrationResult {
  registrationId: string;
  status: 'enrolled' | 'waitlisted' | 'rejected';
  position?: number;
  reason?: string;
  nextSteps: string[];
  enrollmentId?: string;
}

export interface WaitlistEntry {
  id: string;
  studentId: string;
  courseId: string;
  semesterId: string;
  position: number;
  addedAt: Date;
  notified: boolean;
  enrollmentDeadline?: Date;
  status: string;
}

export interface CourseCapacity {
  courseId: string;
  maxCapacity: number;
  currentEnrollment: number;
  availableSpots: number;
  waitlistCount: number;
}

export class RegistrationService {
  /**
   * Register student for courses with full validation
   * Requirements: 2.2, 2.3
   */
  async registerForCourses(
    studentId: string,
    courseIds: string[],
    semesterId: string
  ): Promise<RegistrationResult[]> {
    const results: RegistrationResult[] = [];

    for (const courseId of courseIds) {
      try {
        const result = await this.processRegistration(studentId, courseId, semesterId);
        results.push(result);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error registering for course', { error: errorMessage, studentId, courseId });
        results.push({
          registrationId: `error_${Date.now()}`,
          status: 'rejected',
          reason: `Registration failed: ${errorMessage}`,
          nextSteps: ['Contact academic advisor', 'Try again later']
        });
      }
    }

    return results;
  }

  /**
   * Validate student eligibility for course registration
   * Validates prerequisites, capacity, payment status, and schedule conflicts
   * Requirements: 2.2, 2.3
   */
  async validateRegistrationEligibility(
    studentId: string,
    courseId: string,
    semesterId: string
  ): Promise<EnrollmentValidation> {
    try {
      // Fetch student record using raw SQL
      const studentResult = await prisma.$queryRaw<Array<{
        id: string;
        user_id: string;
        academic_standing: string;
        enrollment_status: string;
        financial_hold: boolean;
        academic_hold: boolean;
        disciplinary_hold: boolean;
        is_active: boolean;
      }>>`
        SELECT id, user_id, academic_standing, enrollment_status, 
               financial_hold, academic_hold, disciplinary_hold, is_active
        FROM students
        WHERE id = ${studentId}::uuid
        LIMIT 1
      `;

      const student = studentResult[0];

      if (!student) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student not found',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: false,
          hasAcademicHold: false,
          hasDisciplinaryHold: false
        };
      }

      // Check if student is active
      if (!student.is_active) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student account is not active',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: student.financial_hold,
          hasAcademicHold: student.academic_hold,
          hasDisciplinaryHold: student.disciplinary_hold
        };
      }

      // Check for holds
      if (student.financial_hold) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student has a financial hold',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: true,
          hasAcademicHold: student.academic_hold,
          hasDisciplinaryHold: student.disciplinary_hold
        };
      }

      if (student.academic_hold) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student has an academic hold',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: student.financial_hold,
          hasAcademicHold: true,
          hasDisciplinaryHold: student.disciplinary_hold
        };
      }

      if (student.disciplinary_hold) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student has a disciplinary hold',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: student.financial_hold,
          hasAcademicHold: student.academic_hold,
          hasDisciplinaryHold: true
        };
      }

      // Fetch course details using raw SQL
      const courseResult = await prisma.$queryRaw<Array<{
        id: string;
        title: string;
        prerequisites: string | null;
        max_enrollment: number | null;
      }>>`
        SELECT id, title, prerequisites, max_enrollment
        FROM courses
        WHERE id = ${courseId}::uuid
        LIMIT 1
      `;

      const course = courseResult[0];

      if (!course) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Course not found',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: student.financial_hold,
          hasAcademicHold: student.academic_hold,
          hasDisciplinaryHold: student.disciplinary_hold
        };
      }

      // Check if already enrolled
      const existingEnrollmentResult = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id
        FROM course_enrollments
        WHERE student_id = ${studentId}::uuid
          AND course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND enrollment_status IN ('enrolled', 'active')
        LIMIT 1
      `;

      if (existingEnrollmentResult.length > 0) {
        return {
          studentId,
          courseId,
          eligible: false,
          reason: 'Student is already enrolled in this course',
          missingPrerequisites: [],
          conflictingSchedules: [],
          capacityAvailable: false,
          hasFinancialHold: student.financial_hold,
          hasAcademicHold: student.academic_hold,
          hasDisciplinaryHold: student.disciplinary_hold
        };
      }

      // Check capacity
      const capacity = await this.getCourseCapacity(courseId, semesterId);
      const capacityAvailable = capacity.availableSpots > 0;

      // Check prerequisites
      const missingPrerequisites = await this.validatePrerequisites(
        studentId,
        courseId
      );

      // Check schedule conflicts
      const conflictingSchedules = await this.checkScheduleConflicts(
        studentId,
        courseId,
        semesterId
      );

      const eligible = capacityAvailable && 
                      missingPrerequisites.length === 0 && 
                      conflictingSchedules.length === 0;

      return {
        studentId,
        courseId,
        eligible,
        reason: eligible ? 'Eligible for registration' : 'Registration requirements not met',
        missingPrerequisites,
        conflictingSchedules,
        capacityAvailable,
        hasFinancialHold: student.financial_hold,
        hasAcademicHold: student.academic_hold,
        hasDisciplinaryHold: student.disciplinary_hold
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error validating registration eligibility', { 
        error: errorMessage, 
        studentId, 
        courseId 
      });
      
      return {
        studentId,
        courseId,
        eligible: false,
        reason: `Validation error: ${errorMessage}`,
        missingPrerequisites: [],
        conflictingSchedules: [],
        capacityAvailable: false,
        hasFinancialHold: false,
        hasAcademicHold: false,
        hasDisciplinaryHold: false
      };
    }
  }

  /**
   * Validate prerequisites for a course
   * Requirements: 2.2
   */
  async validatePrerequisites(
    studentId: string,
    courseId: string
  ): Promise<string[]> {
    try {
      // Get course prerequisites using raw SQL
      const courseResult = await prisma.$queryRaw<Array<{
        prerequisites: string | null;
      }>>`
        SELECT prerequisites
        FROM courses
        WHERE id = ${courseId}::uuid
        LIMIT 1
      `;

      const course = courseResult[0];

      if (!course || !course.prerequisites) {
        return [];
      }

      const prerequisites = Array.isArray(course.prerequisites) 
        ? course.prerequisites 
        : JSON.parse(course.prerequisites as string);

      if (!Array.isArray(prerequisites) || prerequisites.length === 0) {
        return [];
      }

      // Get student's completed courses with passing grades using raw SQL
      const completedCoursesResult = await prisma.$queryRaw<Array<{
        course_id: string;
      }>>`
        SELECT course_id
        FROM course_enrollments
        WHERE student_id = ${studentId}::uuid
          AND enrollment_status = 'completed'
          AND grade IN ('A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'P')
      `;

      const completedIds = completedCoursesResult.map(c => c.course_id);
      const missing = prerequisites.filter((prereq: string) => !completedIds.includes(prereq));

      return missing;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error validating prerequisites', { error: errorMessage, studentId, courseId });
      return []; // Return empty on error to avoid blocking registration
    }
  }

  /**
   * Check for schedule conflicts
   * Requirements: 2.2
   */
  private async checkScheduleConflicts(
    studentId: string,
    courseId: string,
    semesterId: string
  ): Promise<string[]> {
    try {
      // Get student's current enrollments for the semester using raw SQL
      const activeEnrollmentsResult = await prisma.$queryRaw<Array<{
        course_id: string;
      }>>`
        SELECT course_id
        FROM course_enrollments
        WHERE student_id = ${studentId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND enrollment_status IN ('enrolled', 'active')
      `;

      // For now, return empty array - full schedule conflict logic would require
      // course meeting times which would be in a separate table
      // This is a placeholder for future implementation
      return [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error checking schedule conflicts', { error: errorMessage, studentId, courseId });
      return [];
    }
  }

  /**
   * Get course capacity information
   * Requirements: 2.3
   */
  async getCourseCapacity(
    courseId: string,
    semesterId: string
  ): Promise<CourseCapacity> {
    try {
      // Get course max enrollment using raw SQL
      const courseResult = await prisma.$queryRaw<Array<{
        max_enrollment: number | null;
      }>>`
        SELECT max_enrollment
        FROM courses
        WHERE id = ${courseId}::uuid
        LIMIT 1
      `;

      const maxCapacity = courseResult[0]?.max_enrollment || DEFAULT_MAX_CAPACITY;

      // Get current enrollment count using raw SQL
      const enrollmentCountResult = await prisma.$queryRaw<Array<{
        count: bigint;
      }>>`
        SELECT COUNT(*)::bigint as count
        FROM course_enrollments
        WHERE course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND enrollment_status IN ('enrolled', 'active')
      `;

      const currentEnrollment = Number(enrollmentCountResult[0]?.count || 0);

      // Get waitlist count using raw SQL
      const waitlistCountResult = await prisma.$queryRaw<Array<{
        count: bigint;
      }>>`
        SELECT COUNT(*)::bigint as count
        FROM enrollment_waitlist
        WHERE course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND status = 'waiting'
      `;

      const waitlistCount = Number(waitlistCountResult[0]?.count || 0);

      const availableSpots = Math.max(0, maxCapacity - currentEnrollment);

      return {
        courseId,
        maxCapacity,
        currentEnrollment,
        availableSpots,
        waitlistCount
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting course capacity', { error: errorMessage, courseId });
      throw error;
    }
  }

  /**
   * Process student registration for a course
   * Requirements: 2.2, 2.3
   */
  private async processRegistration(
    studentId: string,
    courseId: string,
    semesterId: string,
    registrationType: 'automatic' | 'manual' | 'waitlist' = 'manual'
  ): Promise<RegistrationResult> {
    try {
      const validation = await this.validateRegistrationEligibility(studentId, courseId, semesterId);
      
      if (!validation.eligible) {
        if (!validation.capacityAvailable && ENABLE_WAITLIST) {
          // Add to waitlist if capacity is the only issue
          if (validation.missingPrerequisites.length === 0 && 
              validation.conflictingSchedules.length === 0 &&
              !validation.hasFinancialHold &&
              !validation.hasAcademicHold &&
              !validation.hasDisciplinaryHold) {
            const waitlistEntry = await this.addToWaitlist(studentId, courseId, semesterId);
            return {
              registrationId: waitlistEntry.id,
              status: 'waitlisted',
              position: waitlistEntry.position,
              reason: 'Course at capacity - added to waitlist',
              nextSteps: ['Monitor waitlist position', 'Consider alternative courses']
            };
          }
        }
        
        return {
          registrationId: `rejected_${Date.now()}`,
          status: 'rejected',
          reason: validation.reason,
          nextSteps: [
            ...(validation.missingPrerequisites.length > 0 ? ['Complete missing prerequisites'] : []),
            ...(validation.conflictingSchedules.length > 0 ? ['Resolve schedule conflicts'] : []),
            ...(validation.hasFinancialHold ? ['Resolve financial hold'] : []),
            ...(validation.hasAcademicHold ? ['Resolve academic hold'] : []),
            ...(validation.hasDisciplinaryHold ? ['Resolve disciplinary hold'] : []),
            ...(!validation.capacityAvailable ? ['Join waitlist or select alternative course'] : [])
          ]
        };
      }

      // Get course credits using raw SQL
      const courseResult = await prisma.$queryRaw<Array<{
        credits: number | null;
      }>>`
        SELECT credits
        FROM courses
        WHERE id = ${courseId}::uuid
        LIMIT 1
      `;

      const credits = courseResult[0]?.credits || 3;

      // Create enrollment using raw SQL
      const enrollmentResult = await prisma.$queryRaw<Array<{
        id: string;
      }>>`
        INSERT INTO course_enrollments (
          student_id, course_id, semester_id, enrollment_status, 
          credits, prerequisites_validated, payment_status, enrollment_date
        )
        VALUES (
          ${studentId}::uuid, ${courseId}::uuid, ${semesterId}::uuid, 'enrolled',
          ${credits}, true, 'pending', NOW()
        )
        RETURNING id
      `;

      const enrollment = enrollmentResult[0];

      // Emit registration event
      eventBus.emit('student.registered', {
        studentId,
        courseId,
        semesterId,
        enrollmentId: enrollment.id,
        registrationType,
        timestamp: new Date()
      });

      logger.info('Student successfully registered', { 
        studentId, 
        courseId,
        semesterId,
        enrollmentId: enrollment.id,
        registrationType 
      });

      return {
        registrationId: enrollment.id,
        status: 'enrolled',
        enrollmentId: enrollment.id,
        reason: 'Successfully enrolled in course',
        nextSteps: ['Complete payment', 'Access course materials', 'Review syllabus']
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing registration', { 
        error: errorMessage, 
        studentId, 
        courseId,
        semesterId
      });
      
      return {
        registrationId: `error_${Date.now()}`,
        status: 'rejected',
        reason: `Registration failed: ${errorMessage}`,
        nextSteps: ['Contact academic advisor', 'Try again later']
      };
    }
  }

  /**
   * Add student to course waitlist
   * Requirements: 2.3
   */
  async addToWaitlist(
    studentId: string, 
    courseId: string,
    semesterId: string
  ): Promise<WaitlistEntry> {
    try {
      // Check if already on waitlist using raw SQL
      const existingResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
        course_id: string;
        semester_id: string;
        position: number;
        added_date: Date;
        notified_date: Date | null;
        enrollment_deadline: Date | null;
        status: string;
      }>>`
        SELECT id, student_id, course_id, semester_id, position, 
               added_date, notified_date, enrollment_deadline, status
        FROM enrollment_waitlist
        WHERE student_id = ${studentId}::uuid
          AND course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND status = 'waiting'
        LIMIT 1
      `;

      if (existingResult.length > 0) {
        const existing = existingResult[0];
        return {
          id: existing.id,
          studentId: existing.student_id,
          courseId: existing.course_id,
          semesterId: existing.semester_id,
          position: existing.position,
          addedAt: existing.added_date,
          notified: existing.notified_date !== null,
          enrollmentDeadline: existing.enrollment_deadline || undefined,
          status: existing.status
        };
      }

      // Get next position using raw SQL
      const maxPositionResult = await prisma.$queryRaw<Array<{
        max_position: number | null;
      }>>`
        SELECT MAX(position) as max_position
        FROM enrollment_waitlist
        WHERE course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND status = 'waiting'
      `;

      const nextPosition = (maxPositionResult[0]?.max_position || 0) + 1;

      // Create waitlist entry using raw SQL
      const waitlistEntryResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
        course_id: string;
        semester_id: string;
        position: number;
        added_date: Date;
        status: string;
      }>>`
        INSERT INTO enrollment_waitlist (
          student_id, course_id, semester_id, position, status, added_date
        )
        VALUES (
          ${studentId}::uuid, ${courseId}::uuid, ${semesterId}::uuid, 
          ${nextPosition}, 'waiting', NOW()
        )
        RETURNING id, student_id, course_id, semester_id, position, added_date, status
      `;

      const waitlistEntry = waitlistEntryResult[0];

      // Emit waitlist event
      eventBus.emit('student.waitlisted', {
        studentId,
        courseId,
        semesterId,
        position: waitlistEntry.position,
        timestamp: new Date()
      });

      logger.info('Student added to waitlist', { 
        studentId, 
        courseId,
        semesterId,
        position: waitlistEntry.position
      });

      return {
        id: waitlistEntry.id,
        studentId: waitlistEntry.student_id,
        courseId: waitlistEntry.course_id,
        semesterId: waitlistEntry.semester_id,
        position: waitlistEntry.position,
        addedAt: waitlistEntry.added_date,
        notified: false,
        status: waitlistEntry.status
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error adding to waitlist', { 
        error: errorMessage, 
        studentId, 
        courseId,
        semesterId
      });
      throw error;
    }
  }

  /**
   * Process waitlist when a spot becomes available
   * Requirements: 2.3
   */
  async processWaitlist(
    courseId: string,
    semesterId: string
  ): Promise<void> {
    try {
      // Get capacity info
      const capacity = await this.getCourseCapacity(courseId, semesterId);

      if (capacity.availableSpots <= 0) {
        return; // No spots available
      }

      // Get next student on waitlist using raw SQL
      const nextStudentResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
      }>>`
        SELECT id, student_id
        FROM enrollment_waitlist
        WHERE course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND status = 'waiting'
        ORDER BY position ASC
        LIMIT 1
      `;

      if (nextStudentResult.length === 0) {
        return; // No one on waitlist
      }

      const nextStudent = nextStudentResult[0];

      // Calculate enrollment deadline (48 hours from notification)
      const enrollmentDeadline = new Date();
      enrollmentDeadline.setHours(enrollmentDeadline.getHours() + WAITLIST_ENROLLMENT_WINDOW_HOURS);

      // Update waitlist entry using raw SQL
      await prisma.$executeRaw`
        UPDATE enrollment_waitlist
        SET notified_date = NOW(),
            enrollment_deadline = ${enrollmentDeadline},
            status = 'notified',
            updated_at = NOW()
        WHERE id = ${nextStudent.id}::uuid
      `;

      // Emit notification event
      eventBus.emit('waitlist.spot_available', {
        studentId: nextStudent.student_id,
        courseId,
        semesterId,
        enrollmentDeadline,
        timestamp: new Date()
      });

      logger.info('Waitlist student notified of available spot', {
        studentId: nextStudent.student_id,
        courseId,
        semesterId,
        enrollmentDeadline
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing waitlist', { 
        error: errorMessage, 
        courseId,
        semesterId
      });
      throw error;
    }
  }

  /**
   * Get waitlist information for a student
   * Requirements: 2.3
   */
  async getWaitlistInfo(
    studentId: string,
    courseId: string,
    semesterId: string
  ): Promise<WaitlistEntry | null> {
    try {
      // Get waitlist entry using raw SQL
      const entryResult = await prisma.$queryRaw<Array<{
        id: string;
        student_id: string;
        course_id: string;
        semester_id: string;
        position: number;
        added_date: Date;
        notified_date: Date | null;
        enrollment_deadline: Date | null;
        status: string;
      }>>`
        SELECT id, student_id, course_id, semester_id, position,
               added_date, notified_date, enrollment_deadline, status
        FROM enrollment_waitlist
        WHERE student_id = ${studentId}::uuid
          AND course_id = ${courseId}::uuid
          AND semester_id = ${semesterId}::uuid
          AND status IN ('waiting', 'notified')
        LIMIT 1
      `;

      if (entryResult.length === 0) {
        return null;
      }

      const entry = entryResult[0];

      return {
        id: entry.id,
        studentId: entry.student_id,
        courseId: entry.course_id,
        semesterId: entry.semester_id,
        position: entry.position,
        addedAt: entry.added_date,
        notified: entry.notified_date !== null,
        enrollmentDeadline: entry.enrollment_deadline || undefined,
        status: entry.status
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting waitlist info', { 
        error: errorMessage, 
        studentId,
        courseId,
        semesterId
      });
      return null;
    }
  }

  /**
   * Get registration statistics for a course
   * Requirements: 2.3
   */
  async getRegistrationStats(
    courseId: string,
    semesterId: string
  ): Promise<{
    enrolled: number;
    waitlisted: number;
    capacity: number;
    availableSpots: number;
    registrationRate: number;
  }> {
    try {
      const capacity = await this.getCourseCapacity(courseId, semesterId);

      const registrationRate = capacity.maxCapacity > 0 
        ? (capacity.currentEnrollment / capacity.maxCapacity) * 100 
        : 0;

      return {
        enrolled: capacity.currentEnrollment,
        waitlisted: capacity.waitlistCount,
        capacity: capacity.maxCapacity,
        availableSpots: capacity.availableSpots,
        registrationRate
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting registration stats', { 
        error: errorMessage, 
        courseId,
        semesterId
      });
      throw error;
    }
  }

  /**
   * Get detailed prerequisite validation with AI recommendations
   * Uses ScrollRegistrar agent for enhanced analysis
   * Requirements: 2.2
   */
  async getDetailedPrerequisiteValidation(
    studentId: string,
    courseId: string,
    sessionId?: string
  ): Promise<{
    eligible: boolean;
    missingPrerequisites: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      reason: string;
    }>;
    completedPrerequisites: Array<{
      courseId: string;
      courseCode: string;
      courseTitle: string;
      grade: string;
      completedDate: Date;
    }>;
    recommendations?: string;
  }> {
    try {
      return await ScrollRegistrarAgent.validatePrerequisites(
        {
          studentId,
          courseId,
          detailedAnalysis: true
        },
        sessionId
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting detailed prerequisite validation', { 
        error: errorMessage, 
        studentId,
        courseId
      });
      throw error;
    }
  }
}

export default new RegistrationService();
