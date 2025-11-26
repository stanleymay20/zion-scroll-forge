/**
 * Property-Based Tests for ScrollPedagogyEnforcerService
 * 
 * Tests universal properties that should hold across all inputs using fast-check.
 * Each test runs 100+ iterations with randomly generated inputs.
 */

import * as fc from 'fast-check';
import ScrollPedagogyEnforcerService from '../ScrollPedagogyEnforcerService';
import { ProgressionLevel } from '../../types/course-content.types';

describe('ScrollPedagogyEnforcerService - Property-Based Tests', () => {
  let service: ScrollPedagogyEnforcerService;

  beforeEach(() => {
    service = new ScrollPedagogyEnforcerService();
  });

  /**
   * Feature: course-content-creation, Property 80: Six-Step Lesson Flow Enforcement
   * Validates: Requirements 18.1
   * 
   * For any lesson creation, the system should enforce the 6-step lesson flow
   * (Ignition → Download → Demonstration → Activation → Reflection → Commission)
   * with all steps present.
   */
  describe('Property 80: Six-Step Lesson Flow Enforcement', () => {
    it('should enforce 6-step lesson flow with all steps present', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            content: fc.record({
              ignition: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
              download: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
              demonstration: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
              activation: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
              reflection: fc.option(fc.string({ minLength: 10 }), { nil: undefined }),
              commission: fc.option(fc.string({ minLength: 10 }), { nil: undefined })
            })
          }),
          async (lesson) => {
            // Mock the getLessonContent method to return our generated lesson
            jest.spyOn(service as any, 'getLessonContent').mockResolvedValue(lesson);

            const validation = await service.validateLessonFlow(lesson.id);

            // Verify validation structure
            expect(validation).toHaveProperty('lessonId', lesson.id);
            expect(validation).toHaveProperty('hasIgnition');
            expect(validation).toHaveProperty('hasDownload');
            expect(validation).toHaveProperty('hasDemonstration');
            expect(validation).toHaveProperty('hasActivation');
            expect(validation).toHaveProperty('hasReflection');
            expect(validation).toHaveProperty('hasCommission');
            expect(validation).toHaveProperty('allStepsPresent');
            expect(validation).toHaveProperty('flowQuality');
            expect(validation).toHaveProperty('missingSteps');

            // Verify step detection matches content
            expect(validation.hasIgnition).toBe(!!lesson.content.ignition);
            expect(validation.hasDownload).toBe(!!lesson.content.download);
            expect(validation.hasDemonstration).toBe(!!lesson.content.demonstration);
            expect(validation.hasActivation).toBe(!!lesson.content.activation);
            expect(validation.hasReflection).toBe(!!lesson.content.reflection);
            expect(validation.hasCommission).toBe(!!lesson.content.commission);

            // Verify allStepsPresent is correct
            const expectedAllSteps = 
              !!lesson.content.ignition &&
              !!lesson.content.download &&
              !!lesson.content.demonstration &&
              !!lesson.content.activation &&
              !!lesson.content.reflection &&
              !!lesson.content.commission;
            
            expect(validation.allStepsPresent).toBe(expectedAllSteps);

            // Verify flowQuality calculation
            const presentSteps = [
              validation.hasIgnition,
              validation.hasDownload,
              validation.hasDemonstration,
              validation.hasActivation,
              validation.hasReflection,
              validation.hasCommission
            ].filter(Boolean).length;
            
            expect(validation.flowQuality).toBeCloseTo(presentSteps / 6, 2);

            // Verify missingSteps array
            if (validation.allStepsPresent) {
              expect(validation.missingSteps).toHaveLength(0);
            } else {
              expect(validation.missingSteps.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should identify all missing steps correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (lessonId) => {
            // Create lesson with no steps
            const emptyLesson = {
              id: lessonId,
              title: 'Empty Lesson',
              content: {}
            };

            jest.spyOn(service as any, 'getLessonContent').mockResolvedValue(emptyLesson);

            const validation = await service.validateLessonFlow(lessonId);

            // All steps should be missing
            expect(validation.allStepsPresent).toBe(false);
            expect(validation.flowQuality).toBe(0);
            expect(validation.missingSteps).toHaveLength(6);
            expect(validation.missingSteps).toContain('Ignition');
            expect(validation.missingSteps).toContain('Download');
            expect(validation.missingSteps).toContain('Demonstration');
            expect(validation.missingSteps).toContain('Activation');
            expect(validation.missingSteps).toContain('Reflection');
            expect(validation.missingSteps).toContain('Commission');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 81: AI Tutor Dual-Explanation Pattern
   * Validates: Requirements 18.2
   * 
   * For any AI tutor response generation, the system should implement dual-explanation pattern
   * (conceptual + practical) and maintain warm, wise, prophetic-but-grounded tone.
   */
  describe('Property 81: AI Tutor Dual-Explanation Pattern', () => {
    it('should validate dual-explanation pattern and tone', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            content: fc.string({ minLength: 50, maxLength: 500 }),
            tone: fc.constantFrom('warm', 'wise', 'prophetic', 'grounded', 'neutral')
          }),
          async (response) => {
            jest.spyOn(service as any, 'getTutorResponse').mockResolvedValue(response);

            const validation = await service.validateAITutorTone(response.id);

            // Verify validation structure
            expect(validation).toHaveProperty('tutorResponseId', response.id);
            expect(validation).toHaveProperty('isWarm');
            expect(validation).toHaveProperty('isWise');
            expect(validation).toHaveProperty('isPropheticButGrounded');
            expect(validation).toHaveProperty('hasDualExplanation');
            expect(validation).toHaveProperty('toneScore');
            expect(validation).toHaveProperty('issues');

            // Verify tone score is between 0 and 1
            expect(validation.toneScore).toBeGreaterThanOrEqual(0);
            expect(validation.toneScore).toBeLessThanOrEqual(1);

            // Verify issues array exists
            expect(Array.isArray(validation.issues)).toBe(true);

            // If all checks pass, tone score should be 1
            if (validation.isWarm && validation.isWise && 
                validation.isPropheticButGrounded && validation.hasDualExplanation) {
              expect(validation.toneScore).toBe(1);
              expect(validation.issues).toHaveLength(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should detect missing dual-explanation pattern', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (responseId) => {
            // Create response with only conceptual explanation
            const conceptualOnly = {
              id: responseId,
              content: 'This concept is based on theory and principle',
              tone: 'neutral'
            };

            jest.spyOn(service as any, 'getTutorResponse').mockResolvedValue(conceptualOnly);

            const validation = await service.validateAITutorTone(responseId);

            // Should detect missing practical explanation
            if (!validation.hasDualExplanation) {
              expect(validation.issues.some(issue => 
                issue.includes('dual-explanation')
              )).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 82: Assessment Type Inclusion
   * Validates: Requirements 18.3
   * 
   * For any assessment design, the system should include all three assessment types
   * (formative, summative, reflective) distributed across the course.
   */
  describe('Property 82: Assessment Type Inclusion', () => {
    it('should validate all three assessment types are present', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            courseId: fc.string({ minLength: 1, maxLength: 50 }),
            assessments: fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                type: fc.constantFrom('formative', 'summative', 'reflective'),
                moduleId: fc.string({ minLength: 1 })
              }),
              { minLength: 0, maxLength: 20 }
            )
          }),
          async (course) => {
            jest.spyOn(service as any, 'getCourseAssessments').mockResolvedValue(course.assessments);

            const distribution = await service.validateAssessmentDistribution(course.courseId);

            // Verify distribution structure
            expect(distribution).toHaveProperty('courseId', course.courseId);
            expect(distribution).toHaveProperty('formativeCount');
            expect(distribution).toHaveProperty('summativeCount');
            expect(distribution).toHaveProperty('reflectiveCount');
            expect(distribution).toHaveProperty('distributionBalanced');
            expect(distribution).toHaveProperty('recommendations');

            // Verify counts match actual assessments
            const expectedFormative = course.assessments.filter(a => a.type === 'formative').length;
            const expectedSummative = course.assessments.filter(a => a.type === 'summative').length;
            const expectedReflective = course.assessments.filter(a => a.type === 'reflective').length;

            expect(distribution.formativeCount).toBe(expectedFormative);
            expect(distribution.summativeCount).toBe(expectedSummative);
            expect(distribution.reflectiveCount).toBe(expectedReflective);

            // Verify balance calculation
            const hasAll = expectedFormative > 0 && expectedSummative > 0 && expectedReflective > 0;
            expect(distribution.distributionBalanced).toBe(hasAll);

            // Verify recommendations
            expect(Array.isArray(distribution.recommendations)).toBe(true);
            if (!hasAll) {
              expect(distribution.recommendations.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should recommend missing assessment types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }),
          async (courseId) => {
            // Create course with only formative assessments
            const formativeOnly = [
              { id: 'a1', type: 'formative', moduleId: 'm1' },
              { id: 'a2', type: 'formative', moduleId: 'm2' }
            ];

            jest.spyOn(service as any, 'getCourseAssessments').mockResolvedValue(formativeOnly);

            const distribution = await service.validateAssessmentDistribution(courseId);

            // Should not be balanced
            expect(distribution.distributionBalanced).toBe(false);

            // Should recommend adding missing types
            expect(distribution.recommendations.some(r => 
              r.includes('summative')
            )).toBe(true);
            expect(distribution.recommendations.some(r => 
              r.includes('reflective')
            )).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 83: Progression Level Mapping
   * Validates: Requirements 18.4
   * 
   * For any course declaring progression levels, the system should map content to the 5-level model
   * (Awareness → Understanding → Application → System Design → Multiplication).
   */
  describe('Property 83: Progression Level Mapping', () => {
    it('should map course to appropriate progression level', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 5, maxLength: 100 }),
            level: fc.constantFrom('beginner', 'intermediate', 'advanced', 'strategic'),
            modules: fc.array(fc.record({ id: fc.string() }), { maxLength: 12 })
          }),
          async (course) => {
            jest.spyOn(service as any, 'getCourseDetails').mockResolvedValue(course);

            const mapping = await service.mapToProgressionLevel(course.id);

            // Verify mapping structure
            expect(mapping).toHaveProperty('courseId', course.id);
            expect(mapping).toHaveProperty('targetLevel');
            expect(mapping).toHaveProperty('contentMappedToLevel');
            expect(mapping).toHaveProperty('assessmentsMappedToLevel');
            expect(mapping).toHaveProperty('levelAppropriate');
            expect(mapping).toHaveProperty('gaps');

            // Verify target level is valid
            expect(Object.values(ProgressionLevel)).toContain(mapping.targetLevel);

            // Verify level mapping based on course level
            const expectedLevelMap: Record<string, ProgressionLevel> = {
              'beginner': ProgressionLevel.AWARENESS_VOCABULARY,
              'intermediate': ProgressionLevel.APPLICATION_PROBLEM_SOLVING,
              'advanced': ProgressionLevel.SYSTEM_DESIGN_GOVERNANCE,
              'strategic': ProgressionLevel.MULTIPLICATION_TEACHING
            };

            expect(mapping.targetLevel).toBe(expectedLevelMap[course.level]);

            // Verify gaps array
            expect(Array.isArray(mapping.gaps)).toBe(true);
            if (!mapping.levelAppropriate) {
              expect(mapping.gaps.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: course-content-creation, Property 84: Pedagogical Priority Enforcement
   * Validates: Requirements 18.5
   * 
   * For any pedagogy conflict with velocity, the system should prioritize pedagogical integrity
   * over delivery speed per enforcement priority.
   */
  describe('Property 84: Pedagogical Priority Enforcement', () => {
    it('should enforce correct priority hierarchy', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            type: fc.constantFrom(
              'spiritual_vs_pedagogy',
              'pedagogy_vs_depth',
              'pedagogy_vs_technical',
              'pedagogy_vs_speed',
              'depth_vs_speed',
              'technical_vs_speed'
            ),
            options: fc.tuple(fc.string({ minLength: 5 }), fc.string({ minLength: 5 })),
            context: fc.string({ minLength: 10, maxLength: 200 })
          }),
          async (conflict) => {
            const decision = await service.enforcePedagogicalPriority(conflict);

            // Verify decision structure
            expect(decision).toHaveProperty('conflictType', conflict.type);
            expect(decision).toHaveProperty('chosenOption');
            expect(decision).toHaveProperty('rationale');
            expect(decision).toHaveProperty('priorityLevel');
            expect(decision).toHaveProperty('requiresManualReview');
            expect(decision).toHaveProperty('decidedAt');

            // Verify priority levels are correct
            expect(decision.priorityLevel).toBeGreaterThanOrEqual(1);
            expect(decision.priorityLevel).toBeLessThanOrEqual(5);

            // Verify priority hierarchy
            const priorityMap: Record<string, number> = {
              'spiritual_vs_pedagogy': 1,
              'pedagogy_vs_depth': 2,
              'pedagogy_vs_technical': 2,
              'pedagogy_vs_speed': 2,
              'depth_vs_speed': 3,
              'technical_vs_speed': 4
            };

            expect(decision.priorityLevel).toBe(priorityMap[conflict.type]);

            // Verify chosen option is always first (higher priority)
            expect(decision.chosenOption).toBe(conflict.options[0]);

            // Verify rationale exists
            expect(decision.rationale.length).toBeGreaterThan(0);

            // Verify manual review flag
            expect(typeof decision.requiresManualReview).toBe('boolean');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always prioritize pedagogy over speed', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 200 }),
          async (context) => {
            const conflict = {
              type: 'pedagogy_vs_speed' as const,
              options: ['Maintain pedagogical integrity', 'Deliver faster'],
              context
            };

            const decision = await service.enforcePedagogicalPriority(conflict);

            // Should always choose pedagogy
            expect(decision.chosenOption).toBe('Maintain pedagogical integrity');
            expect(decision.priorityLevel).toBe(2);
            expect(decision.rationale).toContain('non-negotiable');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always prioritize spiritual alignment over pedagogy', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 200 }),
          async (context) => {
            const conflict = {
              type: 'spiritual_vs_pedagogy' as const,
              options: ['Maintain spiritual alignment', 'Optimize pedagogy'],
              context
            };

            const decision = await service.enforcePedagogicalPriority(conflict);

            // Should always choose spiritual alignment
            expect(decision.chosenOption).toBe('Maintain spiritual alignment');
            expect(decision.priorityLevel).toBe(1);
            expect(decision.rationale).toContain('highest priority');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
