/**
 * Academic Year Database Integration Tests
 * Tests the complete database schema and service integration
 * 
 * Test Coverage:
 * - Schema validation and constraints
 * - Database functions and triggers
 * - Service-database integration
 * - Data integrity and relationships
 * - Conflict detection mechanisms
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AcademicCalendarService from '../../services/academic-year/AcademicCalendarService';
import RegistrationService from '../../services/academic-year/RegistrationService';
import { CalendarType, SemesterType } from '../../types/academic-year.types';

describe('Academic Year Database Integration Tests', () => {
  let supabase: SupabaseClient;
  let calendarService: AcademicCalendarService;
  let registrationService: RegistrationService;
  let testAcademicYearId: string;
  let testSemesterId: string;
  let testStudentId: string;

  beforeAll(async () => {
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    supabase = createClient(supabaseUrl, supabaseKey);
    calendarService = new AcademicCalendarService();
    registrationService = new RegistrationService();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await cleanupTestData();
  });

  afterAll(async () => {
    // Final cleanup
    await cleanupTestData();
  });

  async function cleanupTestData() {
    // Delete in reverse order of dependencies
    await supabase.from('course_enrollments').delete().like('id', '%');
    await supabase.from('enrollment_waitlist').delete().like('id', '%');
    await supabase.from('academic_standing_history').delete().like('id', '%');
    await supabase.from('students').delete().like('student_id', 'TEST%');
    await supabase.from('calendar_conflicts').delete().like('id', '%');
    await supabase.from('academic_deadlines').delete().like('id', '%');
    await supabase.from('academic_events').delete().like('id', '%');
    await supabase.from('semesters').delete().like('name', 'Test%');
    await supabase.from('academic_years').delete().like('name', 'Test%');
  }

  describe('Schema Validation Tests', () => {
    test('should enforce academic year date constraints', async () => {
      const invalidYear = {
        name: 'Test Invalid Year',
        start_date: '2024-12-31',
        end_date: '2024-01-01', // End before start
        calendar_type: 'semester',
        is_active: false
      };

      const { error } = await supabase
        .from('academic_years')
        .insert(invalidYear);

      expect(error).toBeTruthy();
      expect(error?.message).toContain('valid_date_range');
    });

    test('should enforce unique active academic year constraint', async () => {
      // Create first active year
      const { data: year1 } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Active Year 1',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: true
        })
        .select()
        .single();

      expect(year1).toBeTruthy();

      // Try to create second active year
      const { error } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Active Year 2',
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          calendar_type: 'semester',
          is_active: true
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('unique_active_year');
    });

    test('should enforce semester date constraints', async () => {
      // Create academic year first
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Semester',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      // Try to create semester with invalid registration window
      const { error } = await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Invalid Semester',
          semester_type: 'fall',
          start_date: '2024-09-01',
          end_date: '2024-12-15',
          registration_start: '2024-08-15',
          registration_end: '2024-08-10', // End before start
          add_drop_deadline: '2024-09-15',
          withdrawal_deadline: '2024-11-01',
          final_exams_start: '2024-12-01',
          final_exams_end: '2024-12-14',
          grades_due: '2024-12-20'
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('valid_registration_window');
    });

    test('should enforce student GPA constraints', async () => {
      // Create a test user first
      const { data: user } = await supabase.auth.admin.createUser({
        email: 'test.student@scrolluniversity.edu',
        password: 'TestPassword123!',
        email_confirm: true
      });

      // Try to create student with invalid GPA
      const { error } = await supabase
        .from('students')
        .insert({
          user_id: user.user!.id,
          student_id: 'TEST001',
          admission_date: '2024-01-01',
          gpa: 5.0, // Invalid: > 4.0
          academic_standing: 'good_standing'
        });

      expect(error).toBeTruthy();
      expect(error?.message).toContain('gpa');

      // Cleanup
      await supabase.auth.admin.deleteUser(user.user!.id);
    });
  });

  describe('Database Functions Tests', () => {
    test('should calculate business days correctly', async () => {
      const { data, error } = await supabase
        .rpc('calculate_business_days', {
          start_date: '2024-01-01', // Monday
          end_date: '2024-01-05'    // Friday
        });

      expect(error).toBeNull();
      expect(data).toBe(5); // 5 business days
    });

    test('should exclude weekends from business days calculation', async () => {
      const { data, error } = await supabase
        .rpc('calculate_business_days', {
          start_date: '2024-01-01', // Monday
          end_date: '2024-01-07'    // Sunday
        });

      expect(error).toBeNull();
      expect(data).toBe(5); // Only weekdays
    });

    test('should check if date is in semester', async () => {
      // Create academic year and semester
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Date Check',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      const { data: semester } = await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Semester',
          semester_type: 'fall',
          start_date: '2024-09-01',
          end_date: '2024-12-15',
          registration_start: '2024-08-01',
          registration_end: '2024-08-31',
          add_drop_deadline: '2024-09-15',
          withdrawal_deadline: '2024-11-01',
          final_exams_start: '2024-12-01',
          final_exams_end: '2024-12-14',
          grades_due: '2024-12-15'
        })
        .select()
        .single();

      // Test date within semester
      const { data: isInSemester } = await supabase
        .rpc('is_date_in_semester', {
          check_date: '2024-10-15',
          semester_id: semester!.id
        });

      expect(isInSemester).toBe(true);

      // Test date outside semester
      const { data: isNotInSemester } = await supabase
        .rpc('is_date_in_semester', {
          check_date: '2024-08-15',
          semester_id: semester!.id
        });

      expect(isNotInSemester).toBe(false);
    });

    test('should get current active semester', async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 30);

      // Create academic year
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Current Year',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          calendar_type: 'semester',
          is_active: true
        })
        .select()
        .single();

      // Create active semester
      const { data: semester } = await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Current Semester',
          semester_type: 'fall',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          registration_start: new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          registration_end: new Date(startDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          add_drop_deadline: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          withdrawal_deadline: new Date(endDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          final_exams_start: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          final_exams_end: new Date(endDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          grades_due: endDate.toISOString().split('T')[0],
          is_active: true
        })
        .select()
        .single();

      const { data: currentSemesterId } = await supabase
        .rpc('get_current_semester');

      expect(currentSemesterId).toBe(semester!.id);
    });
  });

  describe('Service Integration Tests', () => {
    test('should create academic year through service', async () => {
      const result = await calendarService.createAcademicYear({
        name: 'Test Academic Year 2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        calendarType: 'semester' as CalendarType,
        isActive: false
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Academic Year 2024-2025');
      
      testAcademicYearId = result.data!.id;
    });

    test('should generate semester schedule through service', async () => {
      // First create academic year
      const yearResult = await calendarService.createAcademicYear({
        name: 'Test Year for Semesters',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        calendarType: 'semester' as CalendarType,
        isActive: false
      });

      expect(yearResult.success).toBe(true);

      // Generate semesters
      const semesterResult = await calendarService.generateSemesterSchedule(
        yearResult.data!.id,
        'semester' as CalendarType
      );

      expect(semesterResult.success).toBe(true);
      expect(semesterResult.data).toHaveLength(2); // Fall and Spring
      expect(semesterResult.data![0].name).toContain('Fall');
      expect(semesterResult.data![1].name).toContain('Spring');
    });

    test('should handle trimester calendar generation', async () => {
      const yearResult = await calendarService.createAcademicYear({
        name: 'Test Trimester Year',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        calendarType: 'trimester' as CalendarType,
        isActive: false
      });

      const semesterResult = await calendarService.generateSemesterSchedule(
        yearResult.data!.id,
        'trimester' as CalendarType
      );

      expect(semesterResult.success).toBe(true);
      expect(semesterResult.data).toHaveLength(3); // Three trimesters
    });

    test('should handle quarter calendar generation', async () => {
      const yearResult = await calendarService.createAcademicYear({
        name: 'Test Quarter Year',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-05-31'),
        calendarType: 'quarter' as CalendarType,
        isActive: false
      });

      const semesterResult = await calendarService.generateSemesterSchedule(
        yearResult.data!.id,
        'quarter' as CalendarType
      );

      expect(semesterResult.success).toBe(true);
      expect(semesterResult.data).toHaveLength(4); // Four quarters
    });
  });

  describe('Conflict Detection Tests', () => {
    test('should detect overlapping academic years', async () => {
      // Create first academic year
      await calendarService.createAcademicYear({
        name: 'Test Year 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        calendarType: 'semester' as CalendarType,
        isActive: false
      });

      // Try to create overlapping year
      const result = await calendarService.createAcademicYear({
        name: 'Test Year 2 (Overlapping)',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2025-05-31'),
        calendarType: 'semester' as CalendarType,
        isActive: false
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Conflicts detected');
    });

    test('should detect semester conflicts through trigger', async () => {
      // Create academic year
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Conflict',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      // Create first semester
      await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Semester 1',
          semester_type: 'fall',
          start_date: '2024-09-01',
          end_date: '2024-12-15',
          registration_start: '2024-08-01',
          registration_end: '2024-08-31',
          add_drop_deadline: '2024-09-15',
          withdrawal_deadline: '2024-11-01',
          final_exams_start: '2024-12-01',
          final_exams_end: '2024-12-14',
          grades_due: '2024-12-15'
        });

      // Create overlapping semester
      const { data: semester2 } = await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Semester 2 (Overlapping)',
          semester_type: 'spring',
          start_date: '2024-10-01',
          end_date: '2025-01-15',
          registration_start: '2024-09-01',
          registration_end: '2024-09-30',
          add_drop_deadline: '2024-10-15',
          withdrawal_deadline: '2024-12-01',
          final_exams_start: '2025-01-01',
          final_exams_end: '2025-01-14',
          grades_due: '2025-01-15'
        })
        .select()
        .single();

      // Check if conflicts were detected
      const { data: conflicts } = await supabase
        .from('calendar_conflicts')
        .select('*')
        .eq('entity1_id', semester2!.id);

      expect(conflicts).toBeDefined();
      expect(conflicts!.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity Tests', () => {
    test('should maintain referential integrity on cascade delete', async () => {
      // Create academic year with semesters
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Cascade',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      const { data: semester } = await supabase
        .from('semesters')
        .insert({
          academic_year_id: academicYear!.id,
          name: 'Test Semester for Cascade',
          semester_type: 'fall',
          start_date: '2024-09-01',
          end_date: '2024-12-15',
          registration_start: '2024-08-01',
          registration_end: '2024-08-31',
          add_drop_deadline: '2024-09-15',
          withdrawal_deadline: '2024-11-01',
          final_exams_start: '2024-12-01',
          final_exams_end: '2024-12-14',
          grades_due: '2024-12-15'
        })
        .select()
        .single();

      // Delete academic year
      await supabase
        .from('academic_years')
        .delete()
        .eq('id', academicYear!.id);

      // Verify semester was also deleted
      const { data: deletedSemester } = await supabase
        .from('semesters')
        .select('*')
        .eq('id', semester!.id)
        .single();

      expect(deletedSemester).toBeNull();
    });

    test('should update timestamps automatically', async () => {
      // Create academic year
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Timestamp',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      const originalUpdatedAt = new Date(academicYear!.updated_at);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update the academic year
      const { data: updatedYear } = await supabase
        .from('academic_years')
        .update({ name: 'Test Year Updated' })
        .eq('id', academicYear!.id)
        .select()
        .single();

      const newUpdatedAt = new Date(updatedYear!.updated_at);

      expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Index Performance Tests', () => {
    test('should efficiently query active academic year', async () => {
      // Create multiple academic years
      for (let i = 0; i < 5; i++) {
        await supabase
          .from('academic_years')
          .insert({
            name: `Test Year ${i}`,
            start_date: `202${i}-01-01`,
            end_date: `202${i}-12-31`,
            calendar_type: 'semester',
            is_active: i === 2 // Only one active
          });
      }

      const startTime = Date.now();
      
      const { data } = await supabase
        .from('academic_years')
        .select('*')
        .eq('is_active', true)
        .single();

      const queryTime = Date.now() - startTime;

      expect(data).toBeDefined();
      expect(data!.name).toBe('Test Year 2');
      expect(queryTime).toBeLessThan(100); // Should be fast with index
    });

    test('should efficiently query semesters by academic year', async () => {
      // Create academic year with multiple semesters
      const { data: academicYear } = await supabase
        .from('academic_years')
        .insert({
          name: 'Test Year for Index',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          calendar_type: 'semester',
          is_active: false
        })
        .select()
        .single();

      // Create multiple semesters
      for (let i = 0; i < 10; i++) {
        await supabase
          .from('semesters')
          .insert({
            academic_year_id: academicYear!.id,
            name: `Test Semester ${i}`,
            semester_type: 'fall',
            start_date: '2024-09-01',
            end_date: '2024-12-15',
            registration_start: '2024-08-01',
            registration_end: '2024-08-31',
            add_drop_deadline: '2024-09-15',
            withdrawal_deadline: '2024-11-01',
            final_exams_start: '2024-12-01',
            final_exams_end: '2024-12-14',
            grades_due: '2024-12-15'
          });
      }

      const startTime = Date.now();
      
      const { data } = await supabase
        .from('semesters')
        .select('*')
        .eq('academic_year_id', academicYear!.id);

      const queryTime = Date.now() - startTime;

      expect(data).toHaveLength(10);
      expect(queryTime).toBeLessThan(100); // Should be fast with index
    });
  });
});
