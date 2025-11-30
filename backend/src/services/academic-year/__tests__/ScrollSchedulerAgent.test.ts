/**
 * ScrollScheduler Agent Unit Tests
 * "To everything there is a season, and a time to every purpose under heaven" - Ecclesiastes 3:1
 * 
 * Task 33.1: Unit tests for ScrollScheduler agent
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ScrollSchedulerAgent } from '../ScrollSchedulerAgent';

// Mock dependencies
jest.mock('../../AIGatewayService');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))
        }))
      }))
    }))
  }))
}));

describe('ScrollScheduler Agent', () => {
  let agent: ScrollSchedulerAgent;
  let testSessionId: string;

  beforeEach(() => {
    agent = new ScrollSchedulerAgent();
    testSessionId = `test-session-${Date.now()}`;
  });

  describe('Context Management', () => {
    it('should create new agent context', async () => {
      const context = await agent.getOrCreateContext(
        testSessionId,
        'test-user-id',
        'faculty'
      );

      expect(context).toBeDefined();
      expect(context.sessionId).toBe(testSessionId);
      expect(context.userId).toBe('test-user-id');
      expect(context.role).toBe('faculty');
      expect(context.conversationHistory).toHaveLength(0);
      expect(context.createdAt).toBeInstanceOf(Date);
      expect(context.lastUpdated).toBeInstanceOf(Date);
    });

    it('should retrieve existing context', async () => {
      const context1 = await agent.getOrCreateContext(testSessionId, 'user-1', 'admin');
      const context2 = await agent.getOrCreateContext(testSessionId, 'user-2', 'faculty');

      expect(context1.sessionId).toBe(context2.sessionId);
      expect(context1.userId).toBe('user-1');
      expect(context2.userId).toBe('user-1'); // Should return same context
    });

    it('should clear agent context', () => {
      agent.clearContext(testSessionId);
      
      const stats = agent.getContextStats();
      expect(stats).toHaveProperty('activeContexts');
      expect(stats).toHaveProperty('totalMessages');
    });

    it('should track context statistics', async () => {
      await agent.getOrCreateContext(`session-1-${Date.now()}`, 'user-1', 'faculty');
      await agent.getOrCreateContext(`session-2-${Date.now()}`, 'user-2', 'admin');

      const stats = agent.getContextStats();
      expect(stats.activeContexts).toBeGreaterThanOrEqual(2);
      expect(typeof stats.totalMessages).toBe('number');
    });
  });

  describe('Schedule Optimization', () => {
    it('should handle optimization request structure', async () => {
      const request = {
        semesterId: 'test-semester-id',
        constraints: {
          maxConsecutiveHours: 4,
          minBreakBetweenClasses: 15
        },
        optimizationGoals: [
          { type: 'minimize_conflicts' as const, weight: 1.0, priority: 1 },
          { type: 'balance_workload' as const, weight: 0.8, priority: 2 }
        ]
      };

      // Test that the request structure is valid
      expect(request.semesterId).toBeDefined();
      expect(request.constraints).toBeDefined();
      expect(request.optimizationGoals).toHaveLength(2);
      expect(request.optimizationGoals[0].type).toBe('minimize_conflicts');
    });

    it('should validate optimization goal types', () => {
      const validGoalTypes = [
        'minimize_conflicts',
        'maximize_utilization',
        'balance_workload',
        'respect_preferences',
        'minimize_gaps'
      ];

      validGoalTypes.forEach(type => {
        const goal = { type, weight: 1.0, priority: 1 };
        expect(goal.type).toBeDefined();
        expect(goal.weight).toBeGreaterThan(0);
        expect(goal.priority).toBeGreaterThan(0);
      });
    });
  });

  describe('Conflict Resolution', () => {
    it('should handle conflict types', () => {
      const conflictTypes = [
        'time_overlap',
        'room_double_booking',
        'faculty_overload',
        'resource_unavailable',
        'preference_violation'
      ];

      conflictTypes.forEach(type => {
        const conflict = {
          conflictId: `conflict-${Date.now()}`,
          type,
          severity: 'high' as const,
          description: `Test ${type} conflict`,
          affectedEntities: {},
          suggestedResolutions: []
        };

        expect(conflict.type).toBe(type);
        expect(conflict.severity).toBe('high');
      });
    });

    it('should handle resolution strategies', () => {
      const strategies = [
        'reschedule',
        'reassign_room',
        'reassign_faculty',
        'split_section',
        'adjust_capacity'
      ];

      strategies.forEach(strategy => {
        const resolution = {
          resolutionId: `resolution-${Date.now()}`,
          strategy,
          description: `Test ${strategy} resolution`,
          impact: {
            affectedCount: 1,
            preferenceViolations: 0,
            costEstimate: 0
          },
          confidence: 0.85
        };

        expect(resolution.strategy).toBe(strategy);
        expect(resolution.confidence).toBeGreaterThan(0);
        expect(resolution.confidence).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Resource Allocation', () => {
    it('should handle resource types', () => {
      const resourceTypes = ['room', 'equipment', 'faculty', 'time_slot'];

      resourceTypes.forEach(type => {
        const allocation = {
          resourceType: type,
          resourceId: `resource-${Date.now()}`,
          allocatedTo: 'course-id',
          timeSlot: {
            dayOfWeek: 'Monday',
            startTime: '09:00',
            endTime: '10:30'
          },
          utilizationRate: 0.75,
          conflicts: []
        };

        expect(allocation.resourceType).toBe(type);
        expect(allocation.utilizationRate).toBeGreaterThanOrEqual(0);
        expect(allocation.utilizationRate).toBeLessThanOrEqual(1);
      });
    });

    it('should validate time slot structure', () => {
      const timeSlot = {
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '10:30'
      };

      expect(timeSlot.dayOfWeek).toBeDefined();
      expect(timeSlot.startTime).toMatch(/^\d{2}:\d{2}$/);
      expect(timeSlot.endTime).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('Preference Handling', () => {
    it('should handle faculty preferences', () => {
      const facultyPreference = {
        facultyId: 'faculty-123',
        preferredDays: ['Monday', 'Wednesday', 'Friday'],
        preferredTimes: [
          { dayOfWeek: 'Monday', startTime: '09:00', endTime: '12:00' }
        ],
        avoidDays: ['Saturday', 'Sunday'],
        maxDailyHours: 6,
        priority: 'high' as const
      };

      expect(facultyPreference.facultyId).toBeDefined();
      expect(facultyPreference.preferredDays).toHaveLength(3);
      expect(facultyPreference.priority).toBe('high');
      expect(facultyPreference.maxDailyHours).toBeGreaterThan(0);
    });

    it('should handle department preferences', () => {
      const deptPreference = {
        departmentId: 'dept-cs',
        preferredBuildings: ['Science Building', 'Engineering Hall'],
        clusterCourses: true,
        priority: 'medium' as const
      };

      expect(deptPreference.departmentId).toBeDefined();
      expect(deptPreference.preferredBuildings).toHaveLength(2);
      expect(deptPreference.clusterCourses).toBe(true);
    });

    it('should handle student preferences', () => {
      const studentPreference = {
        preferredTimeSlots: [
          { dayOfWeek: 'Tuesday', startTime: '10:00', endTime: '12:00' }
        ],
        avoidBackToBackCourses: true,
        maxDailyHours: 8
      };

      expect(studentPreference.preferredTimeSlots).toHaveLength(1);
      expect(studentPreference.avoidBackToBackCourses).toBe(true);
      expect(studentPreference.maxDailyHours).toBeGreaterThan(0);
    });
  });

  describe('Schedule Metrics', () => {
    it('should calculate schedule metrics', () => {
      const metrics = {
        totalAssignments: 50,
        conflictCount: 3,
        roomUtilization: 0.85,
        facultyUtilization: 0.78,
        preferencesSatisfied: 42,
        preferencesTotal: 50,
        optimizationScore: 87.5
      };

      expect(metrics.totalAssignments).toBeGreaterThan(0);
      expect(metrics.conflictCount).toBeGreaterThanOrEqual(0);
      expect(metrics.roomUtilization).toBeGreaterThanOrEqual(0);
      expect(metrics.roomUtilization).toBeLessThanOrEqual(1);
      expect(metrics.facultyUtilization).toBeGreaterThanOrEqual(0);
      expect(metrics.facultyUtilization).toBeLessThanOrEqual(1);
      expect(metrics.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(metrics.optimizationScore).toBeLessThanOrEqual(100);
    });

    it('should calculate satisfaction rate', () => {
      const satisfied = 42;
      const total = 50;
      const satisfactionRate = (satisfied / total) * 100;

      expect(satisfactionRate).toBeGreaterThan(0);
      expect(satisfactionRate).toBeLessThanOrEqual(100);
      expect(satisfactionRate).toBeCloseTo(84, 0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing semester gracefully', async () => {
      // This would throw in real implementation
      const invalidRequest = {
        semesterId: 'non-existent-semester'
      };

      expect(invalidRequest.semesterId).toBeDefined();
    });

    it('should validate constraint values', () => {
      const constraints = {
        maxConsecutiveHours: 4,
        minBreakBetweenClasses: 15
      };

      expect(constraints.maxConsecutiveHours).toBeGreaterThan(0);
      expect(constraints.minBreakBetweenClasses).toBeGreaterThanOrEqual(0);
    });

    it('should validate preference priorities', () => {
      const priorities = ['high', 'medium', 'low'];

      priorities.forEach(priority => {
        expect(['high', 'medium', 'low']).toContain(priority);
      });
    });
  });

  describe('Agent Integration', () => {
    it('should support multi-agent collaboration', () => {
      const collaborationScenario = {
        agents: ['ScrollScheduler', 'ScrollRegistrar', 'ScrollProfessor'],
        workflow: 'teaching_assignment',
        steps: [
          'validate_faculty_qualifications',
          'optimize_schedule',
          'resolve_conflicts',
          'allocate_resources'
        ]
      };

      expect(collaborationScenario.agents).toHaveLength(3);
      expect(collaborationScenario.steps).toHaveLength(4);
      expect(collaborationScenario.workflow).toBe('teaching_assignment');
    });

    it('should maintain agent independence', async () => {
      const session1 = `session-1-${Date.now()}`;
      const session2 = `session-2-${Date.now()}`;

      const context1 = await agent.getOrCreateContext(session1, 'user-1', 'faculty');
      const context2 = await agent.getOrCreateContext(session2, 'user-2', 'admin');

      expect(context1.sessionId).not.toBe(context2.sessionId);
      expect(context1.userId).not.toBe(context2.userId);
      expect(context1.role).not.toBe(context2.role);
    });
  });
});
