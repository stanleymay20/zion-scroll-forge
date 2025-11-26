/**
 * Content Quality Integrator Service Tests
 */

import ContentQualityIntegrator, {
  QualityCheckRequest,
} from '../ContentQualityIntegrator';

describe('ContentQualityIntegrator', () => {
  let qualityIntegrator: ContentQualityIntegrator;

  beforeEach(() => {
    qualityIntegrator = new ContentQualityIntegrator();
  });

  describe('performComprehensiveCheck', () => {
    it('should perform comprehensive quality check', async () => {
      const request: QualityCheckRequest = {
        contentId: 'test-content-1',
        content:
          'Water is H2O. According to John 3:16, God loved the world. This is a well-structured lecture.',
        contentType: 'lecture',
        courseId: 'course-1',
        moduleId: 'module-1',
        subject: 'Chemistry',
        academicLevel: 'undergraduate',
        citationFormat: 'APA',
        requireSources: false,
        checkTheology: true,
      };

      const result = await qualityIntegrator.performComprehensiveCheck(request);

      expect(result).toBeDefined();
      expect(result.contentId).toBe(request.contentId);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
      expect(typeof result.passed).toBe('boolean');
      expect(result.factualAccuracy).toBeDefined();
      expect(result.consistency).toBeDefined();
      expect(result.attribution).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.requiresReview).toBe('boolean');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('should include theological alignment when requested', async () => {
      const request: QualityCheckRequest = {
        contentId: 'test-content-2',
        content: 'God is love. Jesus Christ is the Son of God.',
        contentType: 'reading',
        courseId: 'course-1',
        subject: 'Theology',
        academicLevel: 'graduate',
        checkTheology: true,
      };

      const result = await qualityIntegrator.performComprehensiveCheck(request);

      expect(result.theologicalAlignment).toBeDefined();
      expect(result.theologicalAlignment?.score).toBeGreaterThanOrEqual(0);
      expect(result.theologicalAlignment?.score).toBeLessThanOrEqual(1);
      expect(typeof result.theologicalAlignment?.approved).toBe('boolean');
    });

    it('should not include theological alignment when not requested', async () => {
      const request: QualityCheckRequest = {
        contentId: 'test-content-3',
        content: 'Mathematics is the study of numbers and patterns.',
        contentType: 'lecture',
        courseId: 'course-1',
        subject: 'Mathematics',
        academicLevel: 'undergraduate',
        checkTheology: false,
      };

      const result = await qualityIntegrator.performComprehensiveCheck(request);

      expect(result.theologicalAlignment).toBeUndefined();
    });

    it('should flag content requiring review', async () => {
      const request: QualityCheckRequest = {
        contentId: 'test-content-4',
        content: 'Unverified claim without sources. Contradictory statements.',
        contentType: 'lecture',
        courseId: 'course-1',
        subject: 'Science',
        academicLevel: 'undergraduate',
        requireSources: true,
      };

      const result = await qualityIntegrator.performComprehensiveCheck(request);

      expect(result.requiresReview).toBe(true);
      expect(result.passed).toBe(false);
    });
  });

  describe('batchPerformChecks', () => {
    it('should perform multiple quality checks', async () => {
      const requests: QualityCheckRequest[] = [
        {
          contentId: 'batch-1',
          content: 'Water is H2O.',
          contentType: 'lecture',
          courseId: 'course-1',
          subject: 'Chemistry',
          academicLevel: 'undergraduate',
        },
        {
          contentId: 'batch-2',
          content: 'The Earth orbits the Sun.',
          contentType: 'lecture',
          courseId: 'course-1',
          subject: 'Astronomy',
          academicLevel: 'undergraduate',
        },
      ];

      const results = await qualityIntegrator.batchPerformChecks(requests);

      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      expect(results[0].contentId).toBe('batch-1');
      expect(results[1].contentId).toBe('batch-2');
    });
  });

  describe('getQualityCheckHistory', () => {
    it('should retrieve quality check history', async () => {
      const contentId = 'test-content-1';

      const history = await qualityIntegrator.getQualityCheckHistory(contentId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('getCourseQualityMetrics', () => {
    it('should calculate course quality metrics', async () => {
      const courseId = 'course-1';

      const metrics = await qualityIntegrator.getCourseQualityMetrics(courseId);

      expect(metrics).toBeDefined();
      expect(metrics.averageScore).toBeGreaterThanOrEqual(0);
      expect(metrics.averageScore).toBeLessThanOrEqual(1);
      expect(metrics.passRate).toBeGreaterThanOrEqual(0);
      expect(metrics.passRate).toBeLessThanOrEqual(1);
      expect(Array.isArray(metrics.commonIssues)).toBe(true);
      expect(['improving', 'declining', 'stable']).toContain(
        metrics.improvementTrend
      );
    });
  });
});
