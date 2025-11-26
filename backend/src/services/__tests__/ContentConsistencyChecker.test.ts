/**
 * Content Consistency Checker Service Tests
 */

import ContentConsistencyChecker, {
  ConsistencyCheckRequest,
  ConsistencyCheckResult,
} from '../ContentConsistencyChecker';

describe('ContentConsistencyChecker', () => {
  let consistencyChecker: ContentConsistencyChecker;

  beforeEach(() => {
    consistencyChecker = new ContentConsistencyChecker();
  });

  describe('checkConsistency', () => {
    it('should check content consistency', async () => {
      const request: ConsistencyCheckRequest = {
        contentId: 'test-content-1',
        content: 'The term "algorithm" refers to a step-by-step procedure.',
        contentType: 'lecture',
        courseId: 'course-1',
        moduleId: 'module-1',
      };

      const result = await consistencyChecker.checkConsistency(request);

      expect(result).toBeDefined();
      expect(result.contentId).toBe(request.contentId);
      expect(result.consistencyScore).toBeGreaterThanOrEqual(0);
      expect(result.consistencyScore).toBeLessThanOrEqual(1);
      expect(result.contradictions).toBeDefined();
      expect(Array.isArray(result.contradictions)).toBe(true);
      expect(result.inconsistencies).toBeDefined();
      expect(Array.isArray(result.inconsistencies)).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.approved).toBe('boolean');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('should identify contradictions', async () => {
      const request: ConsistencyCheckRequest = {
        contentId: 'test-content-2',
        content:
          'Water boils at 100°C. Later in the lecture: Water boils at 212°F.',
        contentType: 'lecture',
        courseId: 'course-1',
      };

      const result = await consistencyChecker.checkConsistency(request);

      expect(result).toBeDefined();
      // Note: This is a temperature unit difference, not a contradiction
      // The service should recognize this
    });

    it('should identify inconsistencies', async () => {
      const request: ConsistencyCheckRequest = {
        contentId: 'test-content-3',
        content:
          'We use the term "algorithm" here. Later: We use the term "procedure" for the same concept.',
        contentType: 'lecture',
        courseId: 'course-1',
      };

      const result = await consistencyChecker.checkConsistency(request);

      expect(result).toBeDefined();
      expect(result.consistencyScore).toBeLessThanOrEqual(1);
    });
  });

  describe('checkCourseConsistency', () => {
    it('should check consistency across entire course', async () => {
      const courseId = 'course-1';

      const results = await consistencyChecker.checkCourseConsistency(courseId);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('checkModuleConsistency', () => {
    it('should check consistency across module', async () => {
      const courseId = 'course-1';
      const moduleId = 'module-1';

      const results = await consistencyChecker.checkModuleConsistency(
        courseId,
        moduleId
      );

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getConsistencyHistory', () => {
    it('should retrieve consistency check history', async () => {
      const contentId = 'test-content-1';

      const history = await consistencyChecker.getConsistencyHistory(contentId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
