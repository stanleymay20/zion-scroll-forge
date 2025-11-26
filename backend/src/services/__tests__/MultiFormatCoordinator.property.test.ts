// Multi-Format Coordinator Property Tests
// "Test everything; hold fast what is good" - 1 Thessalonians 5:21

import MultiFormatCoordinator, { ContentFormat, FormatTransformationRequest } from '../MultiFormatCoordinator';

describe('MultiFormatCoordinator - Property Tests', () => {
  let coordinator: MultiFormatCoordinator;

  beforeEach(() => {
    coordinator = new MultiFormatCoordinator();
  });

  describe('Format Transformation', () => {
    it('should successfully transform content to multiple formats', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_1',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.VIDEO, ContentFormat.AUDIO, ContentFormat.PDF],
        content: {
          title: 'Test Lecture',
          introduction: 'This is a test lecture introduction',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Section 1',
              content: 'Section 1 content with detailed explanation',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          keyTakeaways: ['Key point 1', 'Key point 2'],
          estimatedDuration: 60
        },
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      expect(result.transformations.size).toBeGreaterThan(0);
      expect(result.metadata.successfulTransformations).toBeGreaterThan(0);
      expect(result.metadata.totalProcessingTime).toBeGreaterThan(0);
    });

    it('should preserve pedagogical integrity across formats', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_2',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.INTERACTIVE, ContentFormat.MOBILE],
        content: {
          title: 'Pedagogical Test',
          introduction: 'Introduction with pedagogical flow',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Concept Teaching',
              content: 'Detailed concept explanation',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          examples: [
            {
              title: 'Example 1',
              description: 'Example description',
              explanation: 'Step-by-step explanation'
            }
          ],
          discussionQuestions: ['Question 1', 'Question 2'],
          keyTakeaways: ['Takeaway 1', 'Takeaway 2'],
          estimatedDuration: 45
        },
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: true,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      
      // Check each transformation maintains pedagogy
      result.transformations.forEach((transformed) => {
        expect(transformed.quality.pedagogyPreserved).toBe(true);
        expect(transformed.quality.overallScore).toBeGreaterThanOrEqual(80);
      });
    });

    it('should maintain spiritual integration when requested', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_3',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.VIDEO, ContentFormat.SLIDES],
        content: {
          title: 'Spiritual Integration Test',
          introduction: 'Introduction',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Main Content',
              content: 'Content',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          biblicalIntegration: {
            scriptureReferences: [
              { reference: 'John 3:16', text: 'For God so loved the world...', relevance: 'Test' }
            ],
            theologicalIntegration: 'Theological explanation',
            spiritualApplication: 'Spiritual application',
            prayerPoints: ['Prayer point 1'],
            reflectionQuestions: ['Reflection question 1']
          },
          keyTakeaways: ['Takeaway 1'],
          estimatedDuration: 30
        },
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      
      result.transformations.forEach((transformed) => {
        expect(transformed.quality.spiritualIntegrityMaintained).toBe(true);
      });
    });

    it('should include accessibility features when requested', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_4',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.VIDEO, ContentFormat.PDF],
        content: {
          title: 'Accessibility Test',
          introduction: 'Introduction',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Content',
              content: 'Content',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          keyTakeaways: ['Takeaway'],
          estimatedDuration: 20
        },
        options: {
          preserveSpiritual: false,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      
      result.transformations.forEach((transformed) => {
        // VR/AR may not be fully accessible
        if (transformed.format !== ContentFormat.VR_AR) {
          expect(transformed.quality.accessibilityCompliant).toBe(true);
        }
      });
    });

    it('should optimize for mobile when requested', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_5',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.MOBILE],
        content: {
          title: 'Mobile Optimization Test',
          introduction: 'Long introduction that should be optimized for mobile viewing and reading experience',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Section 1',
              content: 'Very long content that needs to be broken down for mobile devices with smaller screens and limited data connections',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          examples: [
            { title: 'Example 1', description: 'Description', explanation: 'Explanation' },
            { title: 'Example 2', description: 'Description', explanation: 'Explanation' },
            { title: 'Example 3', description: 'Description', explanation: 'Explanation' },
            { title: 'Example 4', description: 'Description', explanation: 'Explanation' }
          ],
          keyTakeaways: ['Takeaway'],
          estimatedDuration: 40
        },
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: true,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      
      const mobileTransform = result.transformations.get(ContentFormat.MOBILE);
      expect(mobileTransform).toBeDefined();
      expect(mobileTransform?.quality.formatOptimized).toBe(true);
      expect(mobileTransform?.content.offlineCapable).toBe(true);
      expect(mobileTransform?.content.simplifiedUI).toBe(true);
    });

    it('should handle transformation errors gracefully', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_content_6',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.VIDEO, ContentFormat.AUDIO],
        content: null, // Invalid content
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      // Should handle errors without crashing
      expect(result).toBeDefined();
      expect(result.metadata.failedTransformations).toBeGreaterThan(0);
    });
  });

  describe('Interactive Element Generation', () => {
    it('should generate interactive elements from content', async () => {
      const content = {
        title: 'Test Lecture',
        discussionQuestions: ['Question 1', 'Question 2', 'Question 3'],
        biblicalIntegration: {
          reflectionQuestions: ['Reflection 1', 'Reflection 2'],
          scriptureReferences: [{ reference: 'John 1:1', text: 'In the beginning...', relevance: 'Test' }]
        },
        practiceProblems: [
          { problem: 'Problem 1', solution: 'Solution 1' },
          { problem: 'Problem 2', solution: 'Solution 2' }
        ]
      };

      const elements = await coordinator.generateInteractiveElements(content, {
        preserveSpiritual: true,
        maintainPedagogy: true,
        optimizeForMobile: false,
        includeAccessibility: true
      });

      expect(elements).toBeDefined();
      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBeGreaterThan(0);
      
      // Should have quiz, reflection, and exercise elements
      const types = elements.map(e => e.type);
      expect(types).toContain('quiz');
      expect(types).toContain('reflection');
      expect(types).toContain('exercise');
    });

    it('should create elements with proper structure', async () => {
      const content = {
        title: 'Structured Test',
        discussionQuestions: ['Q1', 'Q2'],
        biblicalIntegration: {
          reflectionQuestions: ['R1'],
          scriptureReferences: []
        }
      };

      const elements = await coordinator.generateInteractiveElements(content, {
        preserveSpiritual: true,
        maintainPedagogy: true,
        optimizeForMobile: false,
        includeAccessibility: true
      });

      elements.forEach(element => {
        expect(element.elementId).toBeDefined();
        expect(element.type).toBeDefined();
        expect(element.title).toBeDefined();
        expect(element.description).toBeDefined();
        expect(element.content).toBeDefined();
        expect(element.estimatedDuration).toBeGreaterThan(0);
        expect(element.difficulty).toBeDefined();
      });
    });
  });

  describe('Quality Metrics', () => {
    it('should provide quality metrics for all transformations', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_quality',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.VIDEO, ContentFormat.PDF, ContentFormat.INTERACTIVE],
        content: {
          title: 'Quality Test',
          introduction: 'Introduction',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Content',
              content: 'Content',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          keyTakeaways: ['Takeaway'],
          estimatedDuration: 30
        },
        options: {
          preserveSpiritual: true,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: true
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.success).toBe(true);
      
      result.transformations.forEach((transformed) => {
        expect(transformed.quality).toBeDefined();
        expect(transformed.quality.overallScore).toBeGreaterThanOrEqual(0);
        expect(transformed.quality.overallScore).toBeLessThanOrEqual(100);
        expect(typeof transformed.quality.pedagogyPreserved).toBe('boolean');
        expect(typeof transformed.quality.spiritualIntegrityMaintained).toBe('boolean');
        expect(typeof transformed.quality.accessibilityCompliant).toBe('boolean');
        expect(typeof transformed.quality.formatOptimized).toBe('boolean');
      });
    });

    it('should track processing metadata', async () => {
      const request: FormatTransformationRequest = {
        sourceContentId: 'test_metadata',
        sourceFormat: ContentFormat.TEXT,
        targetFormats: [ContentFormat.AUDIO],
        content: {
          title: 'Metadata Test',
          introduction: 'Introduction',
          mainContent: [
            {
              sectionNumber: 1,
              title: 'Content',
              content: 'Content',
              subsections: [],
              visualAids: [],
              interactiveElements: []
            }
          ],
          keyTakeaways: ['Takeaway'],
          estimatedDuration: 15
        },
        options: {
          preserveSpiritual: false,
          maintainPedagogy: true,
          optimizeForMobile: false,
          includeAccessibility: false
        }
      };

      const result = await coordinator.transformToMultipleFormats(request);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.totalTransformations).toBe(request.targetFormats.length);
      expect(result.metadata.successfulTransformations).toBeGreaterThanOrEqual(0);
      expect(result.metadata.failedTransformations).toBeGreaterThanOrEqual(0);
      expect(result.metadata.totalProcessingTime).toBeGreaterThan(0);
      expect(result.metadata.totalCost).toBeGreaterThanOrEqual(0);
      
      // Verify counts add up
      expect(
        result.metadata.successfulTransformations + result.metadata.failedTransformations
      ).toBe(result.metadata.totalTransformations);
    });
  });
});
