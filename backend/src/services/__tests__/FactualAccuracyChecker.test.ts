/**
 * Factual Accuracy Checker Service Tests
 */

import FactualAccuracyChecker, {
  FactCheckRequest,
  FactCheckResult,
} from '../FactualAccuracyChecker';

describe('FactualAccuracyChecker', () => {
  let factChecker: FactualAccuracyChecker;

  beforeEach(() => {
    factChecker = new FactualAccuracyChecker();
  });

  describe('checkAccuracy', () => {
    it('should check factual accuracy of content', async () => {
      const request: FactCheckRequest = {
        contentId: 'test-content-1',
        content: 'The Earth orbits the Sun. Water boils at 100°C at sea level.',
        contentType: 'lecture',
        subject: 'Science',
        academicLevel: 'undergraduate',
        requireSources: false,
      };

      const result = await factChecker.checkAccuracy(request);

      expect(result).toBeDefined();
      expect(result.contentId).toBe(request.contentId);
      expect(result.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(result.overallAccuracy).toBeLessThanOrEqual(1);
      expect(result.claims).toBeDefined();
      expect(Array.isArray(result.claims)).toBe(true);
      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.verified).toBe('boolean');
      expect(result.verifiedAt).toBeInstanceOf(Date);
    });

    it('should identify unverified claims', async () => {
      const request: FactCheckRequest = {
        contentId: 'test-content-2',
        content: 'The moon is made of cheese. Dragons exist in Antarctica.',
        contentType: 'lecture',
        subject: 'Fiction',
        academicLevel: 'undergraduate',
        requireSources: false,
      };

      const result = await factChecker.checkAccuracy(request);

      expect(result.verified).toBe(false);
      expect(result.overallAccuracy).toBeLessThan(0.85);
    });

    it('should extract and verify sources', async () => {
      const request: FactCheckRequest = {
        contentId: 'test-content-3',
        content:
          'According to John 3:16, God loved the world. See https://example.com for more info.',
        contentType: 'reading',
        subject: 'Theology',
        academicLevel: 'graduate',
        requireSources: true,
      };

      const result = await factChecker.checkAccuracy(request);

      expect(result.sources.length).toBeGreaterThan(0);
      const scriptureSource = result.sources.find(s => s.type === 'scripture');
      expect(scriptureSource).toBeDefined();
    });
  });

  describe('batchCheckAccuracy', () => {
    it('should check multiple content items', async () => {
      const requests: FactCheckRequest[] = [
        {
          contentId: 'batch-1',
          content: 'Water is H2O.',
          contentType: 'lecture',
          subject: 'Chemistry',
          academicLevel: 'undergraduate',
        },
        {
          contentId: 'batch-2',
          content: 'The speed of light is approximately 299,792,458 m/s.',
          contentType: 'lecture',
          subject: 'Physics',
          academicLevel: 'undergraduate',
        },
      ];

      const results = await factChecker.batchCheckAccuracy(requests);

      expect(results).toBeDefined();
      expect(results.length).toBe(2);
      expect(results[0].contentId).toBe('batch-1');
      expect(results[1].contentId).toBe('batch-2');
    });
  });

  describe('getFactCheckHistory', () => {
    it('should retrieve fact check history', async () => {
      const contentId = 'test-content-1';

      const history = await factChecker.getFactCheckHistory(contentId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('reviewFactCheck', () => {
    it('should allow review of fact check', async () => {
      const factCheckId = 'fact-check-1';
      const reviewerId = 'reviewer-1';

      await expect(
        factChecker.reviewFactCheck(factCheckId, reviewerId, true, 'Approved')
      ).resolves.not.toThrow();
    });
  });
});
