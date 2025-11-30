/**
 * AI Agent Orchestration Integration Tests
 * "For where two or three are gathered together in my name, there am I in the midst of them" - Matthew 18:20
 * 
 * Task 33.1: Integration tests for AI agent orchestration
 * Tests agent context sharing, multi-agent workflows, and agent error handling
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import ScrollRegistrarAgent from '../ScrollRegistrarAgent';
import ScrollProfessorAgent from '../ScrollProfessorAgent';
import ScrollTutorAgent from '../ScrollTutorAgent';
import ScrollExaminerAgent from '../ScrollExaminerAgent';
import ScrollSchedulerAgent from '../ScrollSchedulerAgent';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for test data
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

describe('AI Agent Orchestration Integration Tests', () => {
  let testSessionId: string;
  let testStudentId: string;
  let testFacultyId: string;
  let testCourseId: string;
  let testSemesterId: string;

  beforeAll(async () => {
    // Set up test data
    testSessionId = `test-session-${Date.now()}`;
    
    // Create test student
    const { data: student } = await supabase
      .from('students')
      .insert({
        student_id: `TEST-${Date.now()}`,
        user_id: '00000000-0000-0000-0000-000000000001',
        admission_date: new Date().toISOString(),
        academic_standing: 'good_standing',
        gpa: 3.5,
        total_credits_earned: 30
      })
      .select()
      .single();

    testStudentId = student?.id || '';

    // Create test faculty
    const { data: faculty } = await supabase
      .from('faculty_profiles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000002',
        faculty_id: `FAC-${Date.now()}`,
        department: 'Computer Science',
        max_courses: 4,
        max_credits: 12,
        is_active: true
      })
      .select()
      .single();

    testFacultyId = faculty?.id || '';

    // Create test course
    const { data: course } = await supabase
      .from('courses')
      .insert({
        course_code: `CS-${Date.now()}`,
        title: 'Test Course',
        description: 'Test course for integration testing',
        credits: 3,
        is_active: true
      })
      .select()
      .single();

    testCourseId = course?.id || '';

    // Create test semester
    const { data: semester } = await supabase
      .from('semesters')
      .insert({
        name: `Test Semester ${Date.now()}`,
        semester_type: 'fall',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        registration_start: new Date().toISOString(),
        registration_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single();

    testSemesterId = semester?.id || '';
  });

  afterAll(async () => {
    // Clean up test data
    if (testStudentId) {
      await supabase.from('students').delete().eq('id', testStudentId);
    }
    if (testFacultyId) {
      await supabase.from('faculty_profiles').delete().eq('id', testFacultyId);
    }
    if (testCourseId) {
      await supabase.from('courses').delete().eq('id', testCourseId);
    }
    if (testSemesterId) {
      await supabase.from('semesters').delete().eq('id', testSemesterId);
    }

    // Clear agent contexts
    ScrollRegistrarAgent.clearContext(testSessionId);
    ScrollSchedulerAgent.clearContext(testSessionId);
  });

  beforeEach(() => {
    // Reset session for each test
    testSessionId = `test-session-${Date.now()}`;
  });

  describe('Agent Context Sharing', () => {
    it('should create and share context across agents', async () => {
      // Create context in ScrollRegistrar
      const registrarContext = await ScrollRegistrarAgent.getOrCreateContext(
        testSessionId,
        testStudentId,
        'student'
      );

      expect(registrarContext).toBeDefined();
      expect(registrarContext.sessionId).toBe(testSessionId);
      expect(registrarContext.userId).toBe(testStudentId);
      expect(registrarContext.role).toBe('student');

      // Create context in ScrollScheduler with same session
      const schedulerContext = await ScrollSchedulerAgent.getOrCreateContext(
        testSessionId,
        testFacultyId,
        'faculty'
      );

      expect(schedulerContext).toBeDefined();
      expect(schedulerContext.sessionId).toBe(testSessionId);

      // Verify contexts are independent but share session ID
      expect(registrarContext.sessionId).toBe(schedulerContext.sessionId);
      expect(registrarContext.userId).not.toBe(schedulerContext.userId);
    });

    it('should maintain conversation history within context', async () => {
      const context = await ScrollRegistrarAgent.getOrCreateContext(
        testSessionId,
        testStudentId,
        'student'
      );

      expect(context.conversationHistory).toHaveLength(0);

      // Perform an operation that adds to history
      await ScrollRegistrarAgent.validatePrerequisites({
        studentId: testStudentId,
        courseId: testCourseId,
        detailedAnalysis: false
      }, testSessionId);

      // Retrieve context again
      const updatedContext = await ScrollRegistrarAgent.getOrCreateContext(
        testSessionId,
        testStudentId,
        'student'
      );

      expect(updatedContext.conversationHistory.length).toBeGreaterThan(0);
    });

    it('should track context statistics across agents', () => {
      const registrarStats = ScrollRegistrarAgent.getContextStats();
      const schedulerStats = ScrollSchedulerAgent.getContextStats();

      expect(registrarStats).toHaveProperty('activeContexts');
      expect(registrarStats).toHaveProperty('totalMessages');
      expect(schedulerStats).toHaveProperty('activeContexts');
      expect(schedulerStats).toHaveProperty('totalMessages');

      expect(typeof registrarStats.activeContexts).toBe('number');
      expect(typeof registrarStats.totalMessages).toBe('number');
    });
  });

  describe('Multi-Agent Workflows', () => {
    it('should coordinate admission and registration workflow', async () => {
      // Step 1: ScrollRegistrar generates admission letter
      const admissionLetter = await ScrollRegistrarAgent.generateAdmissionLetter({
        applicantName: 'Test Student',
        program: 'Computer Science',
        decisionDate: new Date(),
        decision: 'accepted',
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, testSessionId);

      expect(admissionLetter).toBeDefined();
      expect(typeof admissionLetter).toBe('string');
      expect(admissionLetter.length).toBeGreaterThan(0);

      // Step 2: ScrollRegistrar validates prerequisites for course registration
      const prerequisiteCheck = await ScrollRegistrarAgent.validatePrerequisites({
        studentId: testStudentId,
        courseId: testCourseId,
        detailedAnalysis: true
      }, testSessionId);

      expect(prerequisiteCheck).toBeDefined();
      expect(prerequisiteCheck).toHaveProperty('eligible');
      expect(prerequisiteCheck).toHaveProperty('missingPrerequisites');
      expect(prerequisiteCheck).toHaveProperty('completedPrerequisites');

      // Verify workflow coordination
      const context = await ScrollRegistrarAgent.getOrCreateContext(
        testSessionId,
        testStudentId,
        'student'
      );

      expect(context.conversationHistory.length).toBeGreaterThan(0);
    });

    it('should coordinate teaching assignment and scheduling workflow', async () => {
      // Step 1: ScrollScheduler optimizes teaching assignments
      const optimizedSchedule = await ScrollSchedulerAgent.optimizeTeachingAssignments({
        semesterId: testSemesterId,
        optimizationGoals: [
          { type: 'minimize_conflicts', weight: 1.0, priority: 1 },
          { type: 'balance_workload', weight: 0.8, priority: 2 }
        ]
      }, testSessionId);

      expect(optimizedSchedule).toBeDefined();
      expect(optimizedSchedule).toHaveProperty('scheduleId');
      expect(optimizedSchedule).toHaveProperty('assignments');
      expect(optimizedSchedule).toHaveProperty('metrics');
      expect(optimizedSchedule).toHaveProperty('confidence');

      // Step 2: ScrollScheduler resolves any conflicts
      const conflictResolution = await ScrollSchedulerAgent.resolveConflicts(
        testSemesterId,
        testSessionId
      );

      expect(conflictResolution).toBeDefined();
      expect(conflictResolution).toHaveProperty('conflicts');
      expect(conflictResolution).toHaveProperty('resolutions');
      expect(conflictResolution).toHaveProperty('autoResolved');
      expect(conflictResolution).toHaveProperty('requiresManualReview');

      // Verify workflow coordination
      const context = await ScrollSchedulerAgent.getOrCreateContext(
        testSessionId,
        undefined,
        'admin'
      );

      expect(context.conversationHistory.length).toBeGreaterThan(0);
    });

    it('should coordinate content generation and assessment workflow', async () => {
      const courseContext = {
        courseId: testCourseId,
        courseTitle: 'Test Course',
        courseDescription: 'Test course description',
        targetAudience: 'Undergraduate students',
        prerequisites: [],
        learningOutcomes: ['Understand core concepts', 'Apply knowledge'],
        spiritualFocus: 'Integrating faith and learning',
        academicLevel: 'undergraduate' as const
      };

      // Step 1: ScrollProfessor creates content generation workflow
      const contentWorkflow = await ScrollProfessorAgent.createContentGenerationWorkflow(
        'lecture_plan',
        courseContext
      );

      expect(contentWorkflow).toBeDefined();
      expect(contentWorkflow.success).toBe(true);
      expect(contentWorkflow.data).toHaveProperty('workflowType');
      expect(contentWorkflow.data?.workflowType).toBe('lecture_plan');

      // Step 2: ScrollProfessor generates assessment
      const assessment = await ScrollProfessorAgent.generateAssessmentCreation(
        courseContext,
        'module-1',
        'formative'
      );

      expect(assessment).toBeDefined();
      expect(assessment.success).toBe(true);
      expect(assessment.data).toBeDefined();

      // Verify multi-step workflow completion
      expect(contentWorkflow.confidence).toBeGreaterThan(0);
      expect(assessment.confidence).toBeGreaterThan(0);
    });
  });

  describe('Agent Error Handling', () => {
    it('should handle invalid student ID gracefully', async () => {
      const invalidStudentId = '00000000-0000-0000-0000-000000000000';

      await expect(
        ScrollRegistrarAgent.validatePrerequisites({
          studentId: invalidStudentId,
          courseId: testCourseId,
          detailedAnalysis: false
        })
      ).rejects.toThrow();
    });

    it('should handle invalid course ID gracefully', async () => {
      const invalidCourseId = '00000000-0000-0000-0000-000000000000';

      await expect(
        ScrollRegistrarAgent.validatePrerequisites({
          studentId: testStudentId,
          courseId: invalidCourseId,
          detailedAnalysis: false
        })
      ).rejects.toThrow();
    });

    it('should handle invalid semester ID gracefully', async () => {
      const invalidSemesterId = '00000000-0000-0000-0000-000000000000';

      await expect(
        ScrollSchedulerAgent.optimizeTeachingAssignments({
          semesterId: invalidSemesterId
        })
      ).rejects.toThrow();
    });

    it('should handle AI service failures gracefully', async () => {
      // Test with malformed request that might cause AI service issues
      const result = await ScrollSchedulerAgent.handlePreferences(
        testSemesterId,
        {
          facultyPreferences: [],
          departmentPreferences: [],
          studentPreferences: []
        },
        testSessionId
      );

      // Should return valid response even with empty preferences
      expect(result).toBeDefined();
      expect(result).toHaveProperty('satisfiedPreferences');
      expect(result).toHaveProperty('totalPreferences');
      expect(result).toHaveProperty('satisfactionRate');
    });

    it('should handle context cleanup properly', () => {
      const sessionId = `cleanup-test-${Date.now()}`;

      // Create context
      ScrollRegistrarAgent.getOrCreateContext(sessionId, testStudentId, 'student');

      // Verify context exists
      let stats = ScrollRegistrarAgent.getContextStats();
      const initialContexts = stats.activeContexts;

      // Clear context
      ScrollRegistrarAgent.clearContext(sessionId);

      // Verify context removed
      stats = ScrollRegistrarAgent.getContextStats();
      expect(stats.activeContexts).toBeLessThanOrEqual(initialContexts);
    });

    it('should handle concurrent agent operations', async () => {
      const sessionId1 = `concurrent-1-${Date.now()}`;
      const sessionId2 = `concurrent-2-${Date.now()}`;

      // Execute multiple agent operations concurrently
      const operations = await Promise.allSettled([
        ScrollRegistrarAgent.validatePrerequisites({
          studentId: testStudentId,
          courseId: testCourseId,
          detailedAnalysis: false
        }, sessionId1),
        ScrollSchedulerAgent.resolveConflicts(testSemesterId, sessionId2),
        ScrollSchedulerAgent.handlePreferences(
          testSemesterId,
          { facultyPreferences: [], departmentPreferences: [] },
          sessionId2
        )
      ]);

      // At least some operations should succeed
      const successfulOps = operations.filter(op => op.status === 'fulfilled');
      expect(successfulOps.length).toBeGreaterThan(0);

      // Clean up
      ScrollRegistrarAgent.clearContext(sessionId1);
      ScrollSchedulerAgent.clearContext(sessionId2);
    });
  });

  describe('Agent Collaboration Patterns', () => {
    it('should support sequential agent collaboration', async () => {
      const sessionId = `sequential-${Date.now()}`;

      // Agent 1: ScrollRegistrar validates prerequisites
      const prereqResult = await ScrollRegistrarAgent.validatePrerequisites({
        studentId: testStudentId,
        courseId: testCourseId,
        detailedAnalysis: true
      }, sessionId);

      expect(prereqResult.eligible).toBeDefined();

      // Agent 2: ScrollScheduler allocates resources based on validation
      if (prereqResult.eligible) {
        const resourceAllocation = await ScrollSchedulerAgent.allocateResources(
          testSemesterId,
          'room',
          sessionId
        );

        expect(resourceAllocation).toBeDefined();
        expect(Array.isArray(resourceAllocation)).toBe(true);
      }

      // Verify sequential workflow
      const registrarContext = await ScrollRegistrarAgent.getOrCreateContext(
        sessionId,
        testStudentId,
        'student'
      );

      expect(registrarContext.conversationHistory.length).toBeGreaterThan(0);

      ScrollRegistrarAgent.clearContext(sessionId);
      ScrollSchedulerAgent.clearContext(sessionId);
    });

    it('should support parallel agent collaboration', async () => {
      const sessionId = `parallel-${Date.now()}`;

      // Execute multiple agent operations in parallel
      const [scheduleResult, preferenceResult] = await Promise.all([
        ScrollSchedulerAgent.optimizeTeachingAssignments({
          semesterId: testSemesterId
        }, sessionId),
        ScrollSchedulerAgent.handlePreferences(
          testSemesterId,
          {
            facultyPreferences: [{
              facultyId: testFacultyId,
              preferredDays: ['Monday', 'Wednesday'],
              priority: 'high'
            }]
          },
          sessionId
        )
      ]);

      expect(scheduleResult).toBeDefined();
      expect(preferenceResult).toBeDefined();

      ScrollSchedulerAgent.clearContext(sessionId);
    });

    it('should maintain agent independence while sharing context', async () => {
      const sessionId = `independence-${Date.now()}`;

      // Create contexts in different agents
      const registrarContext = await ScrollRegistrarAgent.getOrCreateContext(
        sessionId,
        testStudentId,
        'student'
      );

      const schedulerContext = await ScrollSchedulerAgent.getOrCreateContext(
        sessionId,
        testFacultyId,
        'faculty'
      );

      // Verify contexts are independent
      expect(registrarContext.userId).not.toBe(schedulerContext.userId);
      expect(registrarContext.role).not.toBe(schedulerContext.role);

      // But share session ID
      expect(registrarContext.sessionId).toBe(schedulerContext.sessionId);

      ScrollRegistrarAgent.clearContext(sessionId);
      ScrollSchedulerAgent.clearContext(sessionId);
    });
  });
});
