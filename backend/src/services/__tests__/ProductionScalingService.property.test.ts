/**
 * Property-Based Tests for ProductionScalingService
 * 
 * Tests universal properties that should hold across all inputs using fast-check.
 * Each test runs 100+ iterations with randomly generated inputs.
 */

import * as fc from 'fast-check';
import ProductionScalingService, {
  ResourceType,
  TeamRole,
  TemplateType,
  AutomatedTaskType,
  TaskStatus
} from '../ProductionScalingService';

describe('ProductionScalingService - Property-Based Tests', () => {
  let service: ProductionScalingService;

  beforeEach(() => {
    service = new ProductionScalingService();
  });

  /**
   * Feature: course-content-creation, Property 46: Concurrent Course Support
   * Validates: Requirements 11.1
   */
  describe('Property 46: Concurrent Course Support', () => {
    it('should support at least 5 courses in development concurrently without degradation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (activeCourses) => {
            // Mock the capacity metrics to simulate different scenarios
            const originalGetCapacityMetrics = service.getCapacityMetrics.bind(service);
            service.getCapacityMetrics = async () => ({
              totalCourses: 10,
              activeCourses,
              resourceUtilization: {
                [ResourceType.STUDIO_TIME]: 50,
                [ResourceType.EDITING_WORKSTATION]: 60,
                [ResourceType.FACULTY_TIME]: 45,
                [ResourceType.DESIGNER_TIME]: 55,
                [ResourceType.REVIEWER_TIME]: 40
              },
              teamUtilization: {
                [TeamRole.INSTRUCTIONAL_DESIGNER]: 50,
                [TeamRole.SUBJECT_MATTER_EXPERT]: 45,
                [TeamRole.VIDEO_PRODUCER]: 60,
                [TeamRole.VIDEO_EDITOR]: 65,
                [TeamRole.GRAPHIC_DESIGNER]: 55,
                [TeamRole.QA_REVIEWER]: 40,
                [TeamRole.PROJECT_MANAGER]: 50
              },
              bottlenecks: [],
              performanceDegradation: false
            });

            const canSupport = await service.supportsConcurrentCourses(5);

            // Property: System should support up to 5 concurrent courses without degradation
            expect(canSupport).toBe(true);

            // Restore original method
            service.getCapacityMetrics = originalGetCapacityMetrics;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect performance degradation when exceeding capacity', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 6, max: 10 }),
          async (activeCourses) => {
            // Mock the capacity metrics to simulate overload
            const originalGetCapacityMetrics = service.getCapacityMetrics.bind(service);
            service.getCapacityMetrics = async () => ({
              totalCourses: 10,
              activeCourses,
              resourceUtilization: {
                [ResourceType.STUDIO_TIME]: 85,
                [ResourceType.EDITING_WORKSTATION]: 90,
                [ResourceType.FACULTY_TIME]: 80,
                [ResourceType.DESIGNER_TIME]: 95,
                [ResourceType.REVIEWER_TIME]: 75
              },
              teamUtilization: {
                [TeamRole.INSTRUCTIONAL_DESIGNER]: 85,
                [TeamRole.SUBJECT_MATTER_EXPERT]: 80,
                [TeamRole.VIDEO_PRODUCER]: 95,
                [TeamRole.VIDEO_EDITOR]: 90,
                [TeamRole.GRAPHIC_DESIGNER]: 85,
                [TeamRole.QA_REVIEWER]: 75,
                [TeamRole.PROJECT_MANAGER]: 80
              },
              bottlenecks: [],
              performanceDegradation: true
            });

            const canSupport = await service.supportsConcurrentCourses(5);

            // Property: System should detect when it cannot support concurrent courses
            expect(canSupport).toBe(false);

            // Restore original method
            service.getCapacityMetrics = originalGetCapacityMetrics;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 47: Dedicated Team Assignment
   * Validates: Requirements 11.2
   */
  describe('Property 47: Dedicated Team Assignment', () => {
    it('should assign dedicated team members with no overlap in core roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom(...Object.values(TeamRole)), { minLength: 1, maxLength: 7 }),
          fc.uuid(),
          async (requiredRoles, courseId) => {
            const assignment = await service.assignDedicatedTeam(courseId, requiredRoles);

            // Property: System should deduplicate roles to ensure no overlap
            const uniqueRequiredRoles = Array.from(new Set(requiredRoles));
            expect(assignment.teamMembers.length).toBe(uniqueRequiredRoles.length);
            expect(assignment.dedicatedRoles).toEqual(uniqueRequiredRoles);
            expect(assignment.courseId).toBe(courseId);

            // Property: No team member should have duplicate roles
            const assignedRoles = assignment.teamMembers.map(m => m.role);
            const uniqueRoles = new Set(assignedRoles);
            expect(assignedRoles.length).toBe(uniqueRoles.size);

            // Property: All team members should be assigned to this course
            assignment.teamMembers.forEach(member => {
              expect(member.currentAssignments).toContain(courseId);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create team assignments with valid timestamps', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.constantFrom(...Object.values(TeamRole)), { minLength: 1, maxLength: 3 }),
          fc.uuid(),
          async (requiredRoles, courseId) => {
            const beforeAssignment = new Date();
            const assignment = await service.assignDedicatedTeam(courseId, requiredRoles);
            const afterAssignment = new Date();

            // Property: Assignment timestamp should be between before and after
            expect(assignment.assignedAt.getTime()).toBeGreaterThanOrEqual(beforeAssignment.getTime());
            expect(assignment.assignedAt.getTime()).toBeLessThanOrEqual(afterAssignment.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 48: Template Reuse Across Courses
   * Validates: Requirements 11.3
   */
  describe('Property 48: Template Reuse Across Courses', () => {
    it('should enable reuse of templates across multiple courses', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom(...Object.values(TemplateType)),
          fc.oneof(
            fc.record({
              title: fc.string(),
              sections: fc.array(fc.string())
            }),
            fc.record({
              format: fc.string(),
              data: fc.array(fc.integer())
            })
          ),
          fc.array(fc.uuid(), { minLength: 2, maxLength: 5 }),
          async (name, description, templateType, content, courseIds) => {
            // Create template
            const template = await service.createTemplate(name, description, templateType, content);

            // Property: Template should be created with correct properties
            expect(template.name).toBe(name);
            expect(template.description).toBe(description);
            expect(template.templateType).toBe(templateType);
            expect(template.content).toEqual(content);
            expect(template.usageCount).toBe(0);

            // Reuse template across multiple courses
            const reusedContents = [];
            for (const courseId of courseIds) {
              const reusedContent = await service.reuseTemplate(template.id, courseId);
              reusedContents.push(reusedContent);
            }

            // Property: Each reuse should return a copy of the content
            expect(reusedContents.length).toBe(courseIds.length);
            reusedContents.forEach(reusedContent => {
              // Content should be deeply equal after JSON round-trip
              expect(JSON.stringify(reusedContent)).toEqual(JSON.stringify(content));
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should create templates with valid timestamps', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.constantFrom(...Object.values(TemplateType)),
          fc.object(),
          async (name, description, templateType, content) => {
            const beforeCreation = new Date();
            const template = await service.createTemplate(name, description, templateType, content);
            const afterCreation = new Date();

            // Property: Creation timestamp should be between before and after
            expect(template.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(template.createdAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
            expect(template.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
            expect(template.updatedAt.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 49: Task Automation
   * Validates: Requirements 11.4
   */
  describe('Property 49: Task Automation', () => {
    it('should automate repetitive tasks without manual intervention', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...Object.values(AutomatedTaskType)),
          fc.object(),
          async (taskType, inputData) => {
            const task = await service.automateTask(taskType, inputData);

            // Property: Task should be created and executed automatically
            expect(task.taskType).toBe(taskType);
            expect(task.inputData).toEqual(inputData);
            expect(task.startedAt).toBeDefined();

            // Property: Task should complete with either success or failure status
            expect([TaskStatus.COMPLETED, TaskStatus.FAILED]).toContain(task.status);

            // Property: Completed tasks should have output data
            if (task.status === TaskStatus.COMPLETED) {
              expect(task.outputData).toBeDefined();
              expect(task.completedAt).toBeDefined();
              expect(task.error).toBeUndefined();
            }

            // Property: Failed tasks should have error message
            if (task.status === TaskStatus.FAILED) {
              expect(task.error).toBeDefined();
              expect(task.completedAt).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should complete automated tasks within reasonable time', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...Object.values(AutomatedTaskType)),
          fc.object(),
          async (taskType, inputData) => {
            const task = await service.automateTask(taskType, inputData);

            // Property: Task should complete (success or failure) with timestamps
            expect(task.startedAt).toBeDefined();
            expect(task.completedAt).toBeDefined();

            // Property: Completion time should be after start time
            expect(task.completedAt!.getTime()).toBeGreaterThanOrEqual(task.startedAt!.getTime());
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 50: Capacity Bottleneck Detection
   * Validates: Requirements 11.5
   */
  describe('Property 50: Capacity Bottleneck Detection', () => {
    it('should identify bottlenecks and recommend additional resources', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 80, max: 100 }),
          fc.constantFrom(...Object.values(ResourceType)),
          async (utilization, resourceType) => {
            // Mock capacity metrics with high utilization
            const originalGetCapacityMetrics = service.getCapacityMetrics.bind(service);
            service.getCapacityMetrics = async () => ({
              totalCourses: 10,
              activeCourses: 5,
              resourceUtilization: {
                [ResourceType.STUDIO_TIME]: resourceType === ResourceType.STUDIO_TIME ? utilization : 50,
                [ResourceType.EDITING_WORKSTATION]: resourceType === ResourceType.EDITING_WORKSTATION ? utilization : 50,
                [ResourceType.FACULTY_TIME]: resourceType === ResourceType.FACULTY_TIME ? utilization : 50,
                [ResourceType.DESIGNER_TIME]: resourceType === ResourceType.DESIGNER_TIME ? utilization : 50,
                [ResourceType.REVIEWER_TIME]: resourceType === ResourceType.REVIEWER_TIME ? utilization : 50
              },
              teamUtilization: {
                [TeamRole.INSTRUCTIONAL_DESIGNER]: 50,
                [TeamRole.SUBJECT_MATTER_EXPERT]: 50,
                [TeamRole.VIDEO_PRODUCER]: 50,
                [TeamRole.VIDEO_EDITOR]: 50,
                [TeamRole.GRAPHIC_DESIGNER]: 50,
                [TeamRole.QA_REVIEWER]: 50,
                [TeamRole.PROJECT_MANAGER]: 50
              },
              bottlenecks: [],
              performanceDegradation: false
            });

            const metrics = await service.getCapacityMetrics();
            const bottlenecks = await service.detectBottlenecks(metrics);

            // Property: High utilization should be detected as bottleneck
            if (utilization >= 80) {
              expect(bottlenecks.length).toBeGreaterThan(0);

              // Property: Bottleneck should have recommendations
              bottlenecks.forEach(bottleneck => {
                expect(bottleneck.recommendations.length).toBeGreaterThan(0);
                expect(bottleneck.currentLoad).toBeGreaterThanOrEqual(80);
                expect(bottleneck.severity).toBeDefined();
                expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(bottleneck.severity);
              });
            }

            // Restore original method
            service.getCapacityMetrics = originalGetCapacityMetrics;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate scaling reports with capacity metrics and recommendations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (activeCourses) => {
            // Mock capacity metrics
            const originalGetCapacityMetrics = service.getCapacityMetrics.bind(service);
            service.getCapacityMetrics = async () => ({
              totalCourses: 10,
              activeCourses,
              resourceUtilization: {
                [ResourceType.STUDIO_TIME]: 60,
                [ResourceType.EDITING_WORKSTATION]: 70,
                [ResourceType.FACULTY_TIME]: 55,
                [ResourceType.DESIGNER_TIME]: 65,
                [ResourceType.REVIEWER_TIME]: 50
              },
              teamUtilization: {
                [TeamRole.INSTRUCTIONAL_DESIGNER]: 60,
                [TeamRole.SUBJECT_MATTER_EXPERT]: 55,
                [TeamRole.VIDEO_PRODUCER]: 70,
                [TeamRole.VIDEO_EDITOR]: 75,
                [TeamRole.GRAPHIC_DESIGNER]: 65,
                [TeamRole.QA_REVIEWER]: 50,
                [TeamRole.PROJECT_MANAGER]: 60
              },
              bottlenecks: [],
              performanceDegradation: activeCourses > 5
            });

            const report = await service.generateScalingReport();

            // Property: Report should contain capacity metrics
            expect(report.capacityMetrics).toBeDefined();
            expect(report.capacityMetrics.activeCourses).toBe(activeCourses);

            // Property: Report should have timestamp
            expect(report.timestamp).toBeDefined();
            expect(report.timestamp).toBeInstanceOf(Date);

            // Property: Report should have recommendations array
            expect(Array.isArray(report.recommendations)).toBe(true);

            // Property: Report should have projected capacity
            expect(report.projectedCapacity).toBeDefined();
            expect(report.projectedCapacity).toBeGreaterThanOrEqual(activeCourses);

            // Restore original method
            service.getCapacityMetrics = originalGetCapacityMetrics;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect critical bottlenecks at very high utilization', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 90, max: 100 }),
          async (utilization) => {
            // Mock capacity metrics with critical utilization
            const originalGetCapacityMetrics = service.getCapacityMetrics.bind(service);
            service.getCapacityMetrics = async () => ({
              totalCourses: 10,
              activeCourses: 5,
              resourceUtilization: {
                [ResourceType.STUDIO_TIME]: utilization,
                [ResourceType.EDITING_WORKSTATION]: utilization,
                [ResourceType.FACULTY_TIME]: 50,
                [ResourceType.DESIGNER_TIME]: 50,
                [ResourceType.REVIEWER_TIME]: 50
              },
              teamUtilization: {
                [TeamRole.INSTRUCTIONAL_DESIGNER]: 50,
                [TeamRole.SUBJECT_MATTER_EXPERT]: 50,
                [TeamRole.VIDEO_PRODUCER]: 50,
                [TeamRole.VIDEO_EDITOR]: 50,
                [TeamRole.GRAPHIC_DESIGNER]: 50,
                [TeamRole.QA_REVIEWER]: 50,
                [TeamRole.PROJECT_MANAGER]: 50
              },
              bottlenecks: [],
              performanceDegradation: false
            });

            const metrics = await service.getCapacityMetrics();
            const bottlenecks = await service.detectBottlenecks(metrics);

            // Property: Utilization >= 90% should be flagged as CRITICAL
            const criticalBottlenecks = bottlenecks.filter(b => b.severity === 'CRITICAL');
            expect(criticalBottlenecks.length).toBeGreaterThan(0);

            // Property: Critical bottlenecks should have urgent recommendations
            criticalBottlenecks.forEach(bottleneck => {
              expect(bottleneck.recommendations.length).toBeGreaterThan(0);
              expect(bottleneck.currentLoad).toBeGreaterThanOrEqual(90);
            });

            // Restore original method
            service.getCapacityMetrics = originalGetCapacityMetrics;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
