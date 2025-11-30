/**
 * Academic Calendar API Integration Tests
 * Part of: Scroll University Academic Year Automation System (SU-AYAS)
 * Purpose: Integration tests for Academic Calendar API endpoints
 * 
 * Tests:
 * - Academic year creation workflow
 * - Semester generation
 * - Event scheduling
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import request from 'supertest';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import academicCalendarRoutes from '../../routes/academic-calendar';
import { authenticate } from '../../middleware/auth';

// Mock authentication middleware for testing
jest.mock('../../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@scrolluniversity.edu',
      role: 'admin'
    };
    next();
  }
}));

describe('Academic Calendar API Integration Tests', () => {
  let app: express.Application;
  let supabase: any;
  let testAcademicYearId: string;
  let testSemesterId: string;

  beforeAll(async () => {
    // Initialize Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api/academic-calendar', academicCalendarRoutes);

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  afterAll(async () => {
    // Clean up test data
    if (testAcademicYearId) {
      await supabase
        .from('academic_events')
        .delete()
        .eq('academic_year_id', testAcademicYearId);

      await supabase
        .from('semesters')
        .delete()
        .eq('academic_year_id', testAcademicYearId);

      await supabase
        .from('academic_years')
        .delete()
        .eq('id', testAcademicYearId);
    }
  });

  describe('POST /api/academic-calendar/years - Create Academic Year', () => {
    it('should create a new academic year successfully', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Academic Year 2024-2025',
          startDate: '2024-08-15',
          endDate: '2025-05-31',
          calendarType: 'semester',
          isActive: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Academic Year 2024-2025');
      expect(response.body.data.calendarType).toBe('semester');
      expect(response.body.data.isActive).toBe(true);

      // Store for cleanup
      testAcademicYearId = response.body.data.id;
    });

    it('should reject academic year with invalid dates', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Invalid Academic Year',
          startDate: '2025-05-31',
          endDate: '2024-08-15', // End date before start date
          calendarType: 'semester'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject academic year with invalid calendar type', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Invalid Calendar Type',
          startDate: '2024-08-15',
          endDate: '2025-05-31',
          calendarType: 'invalid_type'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject academic year with missing required fields', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Incomplete Academic Year'
          // Missing startDate, endDate, calendarType
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject academic year with short name', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'AY', // Too short
          startDate: '2024-08-15',
          endDate: '2025-05-31',
          calendarType: 'semester'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/academic-calendar/years/:id - Get Academic Year', () => {
    it('should retrieve academic year by ID', async () => {
      const response = await request(app)
        .get(`/api/academic-calendar/years/${testAcademicYearId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testAcademicYearId);
      expect(response.body.data.name).toBe('Academic Year 2024-2025');
    });

    it('should return 404 for non-existent academic year', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/academic-calendar/years/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Academic year not found');
    });

    it('should reject invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/years/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid academic year ID format');
    });
  });

  describe('POST /api/academic-calendar/semesters - Generate Semester Schedule', () => {
    it('should generate semester schedule for academic year', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: testAcademicYearId,
          calendarType: 'semester'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2); // Fall and Spring semesters
      
      // Verify semester structure
      const fallSemester = response.body.data[0];
      expect(fallSemester).toHaveProperty('id');
      expect(fallSemester).toHaveProperty('name');
      expect(fallSemester).toHaveProperty('startDate');
      expect(fallSemester).toHaveProperty('endDate');
      expect(fallSemester).toHaveProperty('registrationStart');
      expect(fallSemester).toHaveProperty('registrationEnd');
      expect(fallSemester).toHaveProperty('addDropDeadline');
      expect(fallSemester).toHaveProperty('withdrawalDeadline');
      expect(fallSemester).toHaveProperty('finalExamsStart');
      expect(fallSemester).toHaveProperty('finalExamsEnd');
      expect(fallSemester).toHaveProperty('gradesDue');

      // Store first semester ID for later tests
      testSemesterId = fallSemester.id;
    });

    it('should generate trimester schedule', async () => {
      // Create a new academic year for trimester test
      const yearResponse = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Trimester Year 2025-2026',
          startDate: '2025-08-15',
          endDate: '2026-05-31',
          calendarType: 'trimester'
        });

      const trimesterYearId = yearResponse.body.data.id;

      const response = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: trimesterYearId,
          calendarType: 'trimester'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(3); // Three trimesters

      // Cleanup
      await supabase
        .from('semesters')
        .delete()
        .eq('academic_year_id', trimesterYearId);
      await supabase
        .from('academic_years')
        .delete()
        .eq('id', trimesterYearId);
    });

    it('should generate quarter schedule', async () => {
      // Create a new academic year for quarter test
      const yearResponse = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Quarter Year 2026-2027',
          startDate: '2026-08-15',
          endDate: '2027-05-31',
          calendarType: 'quarter'
        });

      const quarterYearId = yearResponse.body.data.id;

      const response = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: quarterYearId,
          calendarType: 'quarter'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(4); // Four quarters

      // Cleanup
      await supabase
        .from('semesters')
        .delete()
        .eq('academic_year_id', quarterYearId);
      await supabase
        .from('academic_years')
        .delete()
        .eq('id', quarterYearId);
    });

    it('should reject semester generation for non-existent academic year', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: fakeId,
          calendarType: 'semester'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid academic year ID format', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: 'invalid-uuid',
          calendarType: 'semester'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/academic-calendar/events - Schedule Event', () => {
    it('should schedule a holiday event successfully', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: testAcademicYearId,
          semesterId: testSemesterId,
          eventType: 'holiday',
          name: 'Thanksgiving Break',
          description: 'University closed for Thanksgiving',
          startDate: '2024-11-28',
          endDate: '2024-11-29',
          isHoliday: true,
          affectsClasses: true
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Thanksgiving Break');
      expect(response.body.data.eventType).toBe('holiday');
      expect(response.body.data.isHoliday).toBe(true);
      expect(response.body.data.affectsClasses).toBe(true);
    });

    it('should schedule an event with time', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: testAcademicYearId,
          eventType: 'orientation',
          name: 'New Student Orientation',
          description: 'Welcome event for new students',
          startDate: '2024-08-10',
          startTime: '09:00',
          endTime: '17:00',
          location: 'Main Auditorium',
          isHoliday: false,
          affectsClasses: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.startTime).toBe('09:00');
      expect(response.body.data.endTime).toBe('17:00');
      expect(response.body.data.location).toBe('Main Auditorium');
    });

    it('should reject event with invalid date range', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: testAcademicYearId,
          eventType: 'exam',
          name: 'Invalid Event',
          startDate: '2024-12-15',
          endDate: '2024-12-10', // End before start
          isHoliday: false,
          affectsClasses: true
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject event with invalid time format', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: testAcademicYearId,
          eventType: 'meeting',
          name: 'Faculty Meeting',
          startDate: '2024-09-15',
          startTime: '25:00', // Invalid hour
          isHoliday: false,
          affectsClasses: false
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject event with missing required fields', async () => {
      const response = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: testAcademicYearId,
          eventType: 'exam'
          // Missing name and startDate
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/academic-calendar/deadlines - Get Upcoming Deadlines', () => {
    beforeAll(async () => {
      // Create test deadlines
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 15);

      await supabase
        .from('academic_deadlines')
        .insert([
          {
            academic_year_id: testAcademicYearId,
            semester_id: testSemesterId,
            entity_type: 'student',
            entity_id: 'test-student-id',
            deadline_type: 'registration',
            title: 'Registration Deadline',
            description: 'Last day to register for courses',
            deadline_date: futureDate.toISOString().split('T')[0],
            notification_intervals: [10080, 4320, 1440],
            is_hard_deadline: true,
            grace_period_days: 0
          }
        ]);
    });

    it('should retrieve upcoming deadlines for entity', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/deadlines')
        .query({
          entityType: 'student',
          entityId: 'test-student-id',
          daysAhead: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const deadline = response.body.data[0];
      expect(deadline).toHaveProperty('title');
      expect(deadline).toHaveProperty('deadlineDate');
      expect(deadline).toHaveProperty('deadlineType');
    });

    it('should reject request with missing entity type', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/deadlines')
        .query({
          entityId: 'test-student-id'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject request with invalid daysAhead', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/deadlines')
        .query({
          entityType: 'student',
          entityId: 'test-student-id',
          daysAhead: 500 // Exceeds maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/academic-calendar/years - List Academic Years', () => {
    it('should list all academic years', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/years');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('count');
    });
  });

  describe('GET /api/academic-calendar/semesters/:academicYearId - Get Semesters', () => {
    it('should retrieve all semesters for academic year', async () => {
      const response = await request(app)
        .get(`/api/academic-calendar/semesters/${testAcademicYearId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/academic-calendar/events/:academicYearId - Get Events', () => {
    it('should retrieve all events for academic year', async () => {
      const response = await request(app)
        .get(`/api/academic-calendar/events/${testAcademicYearId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/academic-calendar/health - Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/academic-calendar/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Academic Calendar API is healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Complete Workflow Tests', () => {
    it('should complete full academic year setup workflow', async () => {
      // Step 1: Create academic year
      const yearResponse = await request(app)
        .post('/api/academic-calendar/years')
        .send({
          name: 'Workflow Test Year 2027-2028',
          startDate: '2027-08-15',
          endDate: '2028-05-31',
          calendarType: 'semester',
          isActive: false
        });

      expect(yearResponse.status).toBe(201);
      const workflowYearId = yearResponse.body.data.id;

      // Step 2: Generate semesters
      const semesterResponse = await request(app)
        .post('/api/academic-calendar/semesters')
        .send({
          academicYearId: workflowYearId,
          calendarType: 'semester'
        });

      expect(semesterResponse.status).toBe(201);
      expect(semesterResponse.body.data.length).toBe(2);
      const workflowSemesterId = semesterResponse.body.data[0].id;

      // Step 3: Schedule events
      const eventResponse = await request(app)
        .post('/api/academic-calendar/events')
        .send({
          academicYearId: workflowYearId,
          semesterId: workflowSemesterId,
          eventType: 'orientation',
          name: 'Fall Orientation',
          startDate: '2027-08-12',
          isHoliday: false,
          affectsClasses: false
        });

      expect(eventResponse.status).toBe(201);

      // Step 4: Verify complete setup
      const verifyResponse = await request(app)
        .get(`/api/academic-calendar/years/${workflowYearId}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.data.name).toBe('Workflow Test Year 2027-2028');

      // Cleanup
      await supabase
        .from('academic_events')
        .delete()
        .eq('academic_year_id', workflowYearId);
      await supabase
        .from('semesters')
        .delete()
        .eq('academic_year_id', workflowYearId);
      await supabase
        .from('academic_years')
        .delete()
        .eq('id', workflowYearId);
    });
  });
});
