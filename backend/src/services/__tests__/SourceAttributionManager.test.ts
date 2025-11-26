/**
 * Source Attribution Manager Service Tests
 */

import SourceAttributionManager, {
  AttributionCheckRequest,
  CitationGenerationRequest,
} from '../SourceAttributionManager';

describe('SourceAttributionManager', () => {
  let attributionManager: SourceAttributionManager;

  beforeEach(() => {
    attributionManager = new SourceAttributionManager();
  });

  describe('checkAttribution', () => {
    it('should check source attribution', async () => {
      const request: AttributionCheckRequest = {
        contentId: 'test-content-1',
        content:
          'According to John 3:16, God loved the world. Smith (2020) argues that...',
        contentType: 'lecture',
        citationFormat: 'APA',
        requireAttribution: true,
      };

      const result = await attributionManager.checkAttribution(request);

      expect(result).toBeDefined();
      expect(result.contentId).toBe(request.contentId);
      expect(result.attributionScore).toBeGreaterThanOrEqual(0);
      expect(result.attributionScore).toBeLessThanOrEqual(1);
      expect(result.citations).toBeDefined();
      expect(Array.isArray(result.citations)).toBe(true);
      expect(result.missingAttributions).toBeDefined();
      expect(Array.isArray(result.missingAttributions)).toBe(true);
      expect(result.ipIssues).toBeDefined();
      expect(Array.isArray(result.ipIssues)).toBe(true);
      expect(result.recommendations).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.compliant).toBe('boolean');
      expect(result.checkedAt).toBeInstanceOf(Date);
    });

    it('should extract scripture citations', async () => {
      const request: AttributionCheckRequest = {
        contentId: 'test-content-2',
        content:
          'As stated in John 3:16 and 1 Corinthians 13:4-7, love is central.',
        contentType: 'reading',
        requireAttribution: false,
      };

      const result = await attributionManager.checkAttribution(request);

      expect(result.citations.length).toBeGreaterThan(0);
      const scriptureCitations = result.citations.filter(
        c => c.type === 'scripture'
      );
      expect(scriptureCitations.length).toBeGreaterThan(0);
    });

    it('should identify missing attributions', async () => {
      const request: AttributionCheckRequest = {
        contentId: 'test-content-3',
        content:
          'Recent studies show that 75% of students prefer online learning.',
        contentType: 'lecture',
        requireAttribution: true,
      };

      const result = await attributionManager.checkAttribution(request);

      expect(result.compliant).toBe(false);
      expect(result.missingAttributions.length).toBeGreaterThan(0);
    });
  });

  describe('generateCitation', () => {
    it('should generate APA citation for book', async () => {
      const request: CitationGenerationRequest = {
        sourceType: 'book',
        format: 'APA',
        sourceInfo: {
          author: ['Smith, J.', 'Doe, A.'],
          year: 2020,
          title: 'Introduction to Theology',
          publisher: 'Academic Press',
        },
      };

      const citation = await attributionManager.generateCitation(request);

      expect(citation).toBeDefined();
      expect(typeof citation).toBe('string');
      expect(citation.length).toBeGreaterThan(0);
    });

    it('should generate scripture citation', async () => {
      const request: CitationGenerationRequest = {
        sourceType: 'scripture',
        format: 'APA',
        sourceInfo: {
          book: 'John',
          chapter: '3',
          verse: '16',
        },
      };

      const citation = await attributionManager.generateCitation(request);

      expect(citation).toBe('John 3:16');
    });

    it('should generate MLA citation for journal', async () => {
      const request: CitationGenerationRequest = {
        sourceType: 'journal',
        format: 'MLA',
        sourceInfo: {
          author: ['Johnson, M.'],
          year: 2021,
          title: 'Modern Theological Perspectives',
          volume: '15',
          issue: '3',
          pages: '45-67',
        },
      };

      const citation = await attributionManager.generateCitation(request);

      expect(citation).toBeDefined();
      expect(typeof citation).toBe('string');
    });
  });

  describe('batchGenerateCitations', () => {
    it('should generate multiple citations', async () => {
      const requests: CitationGenerationRequest[] = [
        {
          sourceType: 'scripture',
          format: 'APA',
          sourceInfo: { book: 'John', chapter: '3', verse: '16' },
        },
        {
          sourceType: 'book',
          format: 'APA',
          sourceInfo: {
            author: ['Smith, J.'],
            year: 2020,
            title: 'Test Book',
            publisher: 'Test Publisher',
          },
        },
      ];

      const citations = await attributionManager.batchGenerateCitations(requests);

      expect(citations).toBeDefined();
      expect(citations.length).toBe(2);
      expect(citations[0]).toBe('John 3:16');
    });
  });

  describe('validateCitation', () => {
    it('should validate APA citation format', async () => {
      const citation = 'Smith, J. (2020). Test book. Academic Press.';
      const format = 'APA';

      const result = await attributionManager.validateCitation(citation, format);

      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should identify invalid citation format', async () => {
      const citation = 'This is not a valid citation';
      const format = 'APA';

      const result = await attributionManager.validateCitation(citation, format);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('getAttributionHistory', () => {
    it('should retrieve attribution check history', async () => {
      const contentId = 'test-content-1';

      const history = await attributionManager.getAttributionHistory(contentId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
    });
  });
});
