/**
 * Comprehensive Academic Year Automation System Integration Tests
 * "Test all things; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Complete database schema and integration testing for Phase 1-3
 */

import { PrismaClient } from '@prisma/client';
import AcademicCalendarService from '../../services/academic-year/AcademicCalendarService';
import EventSchedulerService from '../../services/academic-year/EventSchedulerService';
import AdmissionService from '../../services/academic-year/AdmissionService';
import RegistrationService from '../../services/academic-year/RegistrationService';
import GraduationService from '../../services/academic-year/GraduationService';
import WorkflowEngineService from '../../services/academic-year/WorkflowEngineService';

const prisma = new PrismaClient();

describe('Academic Year Automation - Comprehensive Integration Tests', () => {
  let testAcademicYearId: string;
  let testSemesterId: string;
  let testStudentId: string;
  let testCourseId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.$executeRaw`DELETE FROM academic_events WHERE name LIKE 'TEST_%'`;
    await prisma.$executeRaw`DELETE FROM semesters WHERE name LIKE 'TEST_%'`;
    await prisma.$executeRaw`DELETE FROM academic_years WHERE name LIKE 'TEST_%'`;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.$executeRaw`DELETE FROM academic_events WHERE name LIKE 'TEST_%'`;
    await prisma.$executeRaw`DELETE FROM semesters WHERE name LIKE 'TEST_%'`;
    await prisma.$executeRaw`DELETE FROM academic_years WHERE name LIKE 'TEST_%'`;
    await prisma.$disconnect();
  });

  describe('Phase 1: Database Schema Validation', () => {
    test('should verify academic_years table exists with correct structure', async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'academic_years'
        ORDER BY ordinal_position
      `;

      expect(result.length).toBeGreaterThan(0);
      const columnNames = result.map(r => r.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('start_date');
      expect(columnNames).toContain('end_date');
      expect(columnNames).toContain('calendar_type');
    });

    test('should verify semesters table exists with correct structure', async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'semesters'
        ORDER BY ordinal_position
      `;

      expect(result.length).toBeGreaterThan(0);
      const columnNames = result.map(r => r.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('academic_year_id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('start_date');
      expect(columnNames).toContain('end_date');
    });

    test('should verify academic_events table exists with correct structure', async () => {
      const result = await prisma.$queryRaw<any[]>`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'academic_events'
        ORDER BY ordinal_position
      `;

      expect(result.length).toBeGreaterThan(0);
      const columnNames = result.map(r => r.column_name);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('event_type');
      expect(columnNames).toContain('start_date');
      expect(columnNames).toContain('end_date');
    });

    test('should verify foreign key constraints exist', async () => {
      const constraints = await prisma.$queryRaw<any[]>`
        SELECT
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN ('semesters', 'academic_events')
      `;

      expect(constraints.length).toBeGreaterThan(0);
    });

    test('should verify indexes exist for performance', async () => {
      const indexes = await prisma.$queryRaw<any[]>`
        SELECT
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename IN ('academic_years', 'semesters', 'academic_events')
          AND schemaname = 'public'
      `;

      expect(indexes.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 2: Academic Calendar Engine Integration', () => {
    const calendarService = new AcademicCalendarService();
    const eventScheduler = new EventSchedulerService();

    test('should create academic year with complete structure', async () => {
      const academicYear = await calendarService.createAcademicYear({
        name: 'TEST_2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        calendarType: 'semester'
      });

      expect(academicYear).toBeDefined();
      expect(academicYear.id).toBeDefined();
      expect(academicYear.name).toBe('TEST_2024-2025');
      
      testAcademicYearId = academicYear.id;
    });

    test('should generate semesters for academic year', async () => {
      const semesters = await calendarService.generateSemesters(testAcademicYearId);

      expect(semesters).toBeDefined();
      expect(semesters.length).toBeGreaterThanOrEqual(2);
      expect(semesters[0].name).toContain('Fall');
      
      testSemesterId = semesters[0].id;
    });

    test('should schedule academic events', async () => {
      const event = await eventScheduler.scheduleEvent({
        name: 'TEST_Registration Opens',
        eventType: 'registration',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-09-05'),
        semesterId: testSemesterId,
        description: 'Test registration period'
      });

      expect(event).toBeDefined();
      expect(event.id).toBeDefined();
      expect(event.name).toBe('TEST_Registration Opens');
    });

    test('should detect event conflicts', async () => {
      const hasConflict = await eventScheduler.checkConflicts({
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-08-25'),
        semesterId: testSemesterId
      });

      expect(typeof hasConflict).toBe('boolean');
    });

    test('should retrieve upcoming deadlines', async () => {
      const deadlines = await eventScheduler.getUpcomingDeadlines(testSemesterId, 30);

      expect(Array.isArray(deadlines)).toBe(true);
    });
  });

  describe('Phase 3: Student Lifecycle Engine Integration', () => {
    const admissionService = new AdmissionService();
    const registrationService = new RegistrationService();
    const graduationService = new GraduationService();

    beforeAll(async () => {
      // Create test student
      const student = await prisma.user.create({
        data: {
          email: 'test.student@scrolluniversity.edu',
          username: 'teststudent',
          passwordHash: 'test-hash',
          firstName: 'Test',
          lastName: 'Student',
          role: 'STUDENT',
          enrollmentStatus: 'ACTIVE',
          academicLevel: 'SCROLL_OPEN',
          scrollGoldBalance: 100.0,
          scrollAlignment: 0.5
        }
      });
      testStudentId = student.id;

      // Create test course
      const course = await prisma.courseProject.create({
        data: {
          code: 'TEST101',
          title: 'Test Course',
          description: 'Test course for integration testing',
          credits: 3,
          level: 'UNDERGRADUATE',
          status: 'ACTIVE'
        }
      });
      testCourseId = course.id;
    });

    test('should process admission application', async () => {
      const application = await admissionService.createApplication({
        studentId: testStudentId,
        programId: 'test-program',
        applicationData: {
          personalStatement: 'Test statement',
          transcripts: [],
          recommendations: []
        }
      });

      expect(application).toBeDefined();
      expect(application.id).toBeDefined();
      expect(application.status).toBe('submitted');
    });

    test('should validate course prerequisites', async () => {
      const isValid = await registrationService.validatePrerequisites(
        testStudentId,
        testCourseId
      );

      expect(typeof isValid).toBe('boolean');
    });

    test('should enroll student in course', async () => {
      const enrollment = await registrationService.enrollStudent({
        studentId: testStudentId,
        courseId: testCourseId,
        semesterId: testSemesterId
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentId);
      expect(enrollment.courseId).toBe(testCourseId);
    });

    test('should check enrollment capacity', async () => {
      const capacity = await registrationService.checkCapacity(testCourseId);

      expect(capacity).toBeDefined();
      expect(capacity.available).toBeGreaterThanOrEqual(0);
    });

    test('should perform degree audit', async () => {
      const audit = await graduationService.performDegreeAudit(testStudentId);

      expect(audit).toBeDefined();
      expect(audit.studentId).toBe(testStudentId);
      expect(audit.requirements).toBeDefined();
    });

    test('should evaluate graduation eligibility', async () => {
      const eligibility = await graduationService.evaluateEligibility(testStudentId);

      expect(eligibility).toBeDefined();
      expect(typeof eligibility.isEligible).toBe('boolean');
      expect(eligibility.requirements).toBeDefined();
    });
  });

  describe('Phase 4: Workflow Engine Integration', () => {
    const workflowEngine = new WorkflowEngineService();

    test('should register workflow definition', async () => {
      const workflow = await workflowEngine.registerWorkflow({
        name: 'TEST_Student_Registration',
        description: 'Test registration workflow',
        steps: [
          { name: 'validate_prerequisites', type: 'validation' },
          { name: 'check_capacity', type: 'validation' },
          { name: 'create_enrollment', type: 'action' },
          { name: 'send_confirmation', type: 'notification' }
        ]
      });

      expect(workflow).toBeDefined();
      expect(workflow.id).toBeDefined();
    });

    test('should execute workflow instance', async () => {
      const instance = await workflowEngine.executeWorkflow({
        workflowName: 'TEST_Student_Registration',
        context: {
          studentId: testStudentId,
          courseId: testCourseId,
          semesterId: testSemesterId
        }
      });

      expect(instance).toBeDefined();
      expect(instance.status).toBeDefined();
    });

    test('should track workflow state transitions', async () => {
      const states = await workflowEngine.getWorkflowHistory(testStudentId);

      expect(Array.isArray(states)).toBe(true);
    });
  });

  describe('Phase 5: Data Integrity and Constraints', () => {
    test('should enforce date constraints on academic year', async () => {
      // This test verifies database constraint enforcement
      // The constraint should prevent end_date from being before start_date
      try {
        await prisma.$executeRaw`
          INSERT INTO academic_years (name, start_date, end_date, calendar_type)
          VALUES ('TEST_Invalid_Year', '2025-01-01', '2024-01-01', 'semester')
        `;
        fail('Should have thrown constraint violation error');
      } catch (error: any) {
        expect(error.message).toContain('valid_date_range');
      }
    });

    test('should prevent duplicate academic year names', async () => {
      // This test verifies unique constraint on academic year names
      try {
        await prisma.$executeRaw`
          INSERT INTO academic_years (name, start_date, end_date, calendar_type)
          VALUES ('TEST_2024-2025', '2024-09-01', '2025-06-30', 'semester')
        `;
        fail('Should have thrown unique constraint violation error');
      } catch (error: any) {
        // Expect unique constraint or duplicate key error
        expect(error.message.toLowerCase()).toMatch(/unique|duplicate/);
      }
    });

    test('should enforce semester belongs to academic year', async () => {
      // This test verifies foreign key constraint enforcement
      try {
        await prisma.$executeRaw`
          INSERT INTO semesters (
            name, academic_year_id, semester_type, start_date, end_date,
            registration_start, registration_end, add_drop_deadline,
            withdrawal_deadline, final_exams_start, final_exams_end, grades_due
          )
          VALUES (
            'TEST_Orphan_Semester', 
            '00000000-0000-0000-0000-000000000000'::uuid,
            'fall',
            '2024-09-01', '2024-12-31',
            '2024-08-01', '2024-08-31', '2024-09-15',
            '2024-11-15', '2024-12-15', '2024-12-20', '2024-12-25'
          )
        `;
        fail('Should have thrown foreign key constraint violation error');
      } catch (error: any) {
        expect(error.message.toLowerCase()).toMatch(/foreign key|violates/);
      }
    });

    test('should cascade delete academic year and semesters', async () => {
      // Create academic year via raw SQL to ensure proper structure
      const yearResult = await prisma.$queryRaw<any[]>`
        INSERT INTO academic_years (name, start_date, end_date, calendar_type)
        VALUES ('TEST_Delete_Year', '2026-09-01', '2027-06-30', 'semester')
        RETURNING id
      `;
      const yearId = yearResult[0].id;

      // Create semester
      await prisma.$executeRaw`
        INSERT INTO semesters (
          name, academic_year_id, semester_type, start_date, end_date,
          registration_start, registration_end, add_drop_deadline,
          withdrawal_deadline, final_exams_start, final_exams_end, grades_due
        )
        VALUES (
          'TEST_Delete_Semester', ${yearId}::uuid, 'fall',
          '2026-09-01', '2026-12-31',
          '2026-08-01', '2026-08-31', '2026-09-15',
          '2026-11-15', '2026-12-15', '2026-12-20', '2026-12-25'
        )
      `;

      // Delete academic year
      await prisma.$executeRaw`
        DELETE FROM academic_years WHERE id = ${yearId}::uuid
      `;

      // Verify cascade delete
      const semesters = await prisma.$queryRaw<any[]>`
        SELECT * FROM semesters WHERE academic_year_id = ${yearId}::uuid
      `;

      expect(semesters.length).toBe(0);
    });
  });

  describe('Phase 6: Performance and Scalability', () => {
    test('should handle bulk event creation efficiently', async () => {
      const startTime = Date.now();
      
      const events = Array.from({ length: 50 }, (_, i) => ({
        name: `TEST_Bulk_Event_${i}`,
        eventType: 'academic',
        startDate: new Date(`2024-09-${String(i % 28 + 1).padStart(2, '0')}`),
        endDate: new Date(`2024-09-${String((i % 28 + 1) + 1).padStart(2, '0')}`),
        semesterId: testSemesterId
      }));

      await prisma.academicEvent.createMany({
        data: events
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });

    test('should query academic year with related data efficiently', async () => {
      const startTime = Date.now();

      const academicYear = await prisma.academicYear.findUnique({
        where: { id: testAcademicYearId },
        include: {
          semesters: {
            include: {
              events: true
            }
          }
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(academicYear).toBeDefined();
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });

  describe('Phase 7: Cross-Service Integration', () => {
    test('should coordinate calendar and registration services', async () => {
      const calendarService = new AcademicCalendarService();
      const registrationService = new RegistrationService();

      // Get current semester
      const semester = await calendarService.getCurrentSemester();
      expect(semester).toBeDefined();

      // Check if registration is open
      const isOpen = await registrationService.isRegistrationOpen(semester.id);
      expect(typeof isOpen).toBe('boolean');
    });

    test('should coordinate admission and enrollment workflow', async () => {
      const admissionService = new AdmissionService();
      const registrationService = new RegistrationService();

      // Admit student
      const admission = await admissionService.admitStudent(testStudentId);
      expect(admission).toBeDefined();

      // Enable registration
      const canRegister = await registrationService.canStudentRegister(testStudentId);
      expect(typeof canRegister).toBe('boolean');
    });
  });
});
