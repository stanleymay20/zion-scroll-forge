// Content Flow Enhancement Tests
// Tests for pedagogical flow validation, version control, and coherence checking

import ScrollPedagogyValidator from '../ScrollPedagogyValidator';
import ContentVersionControl from '../ContentVersionControl';
import ContentCoherenceChecker from '../ContentCoherenceChecker';

describe('ScrollPedagogyValidator', () => {
  let validator: ScrollPedagogyValidator;

  beforeEach(() => {
    validator = new ScrollPedagogyValidator();
  });

  describe('validatePedagogicalFlow', () => {
    it('should validate complete pedagogical flow', async () => {
      const content = {
        introduction: 'This is a compelling introduction that hooks students with a story about transformation. It sets the stage for deep learning and spiritual growth. The introduction is over 200 characters to meet minimum requirements.',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Core Concept 1',
            content: 'Detailed explanation of the first core concept with examples and applications. This section provides comprehensive coverage of the topic with practical insights and theoretical foundations. It includes multiple perspectives and real-world scenarios to enhance understanding.'
          },
          {
            sectionNumber: 2,
            title: 'Core Concept 2',
            content: 'Detailed explanation of the second core concept building on the first. This section deepens understanding through advanced examples and case studies. It connects theory to practice and shows how concepts integrate with each other.'
          },
          {
            sectionNumber: 3,
            title: 'Core Concept 3',
            content: 'Detailed explanation of the third core concept with synthesis. This section brings together all previous concepts and shows their interconnections. It provides a holistic view and prepares students for practical application.'
          }
        ],
        examples: [
          {
            title: 'Practical Example 1',
            description: 'Detailed scenario showing concept application',
            explanation: 'Step-by-step walkthrough of how to apply the concept in real situations. This includes specific actions, expected outcomes, and common pitfalls to avoid.'
          },
          {
            title: 'Practical Example 2',
            description: 'Another detailed scenario',
            explanation: 'Additional walkthrough demonstrating alternative approaches and advanced techniques for applying the concepts learned.'
          }
        ],
        caseStudies: [
          {
            title: 'Case Study 1',
            scenario: 'Real-world case demonstrating concepts',
            background: 'Context and background information',
            challenges: ['Challenge 1', 'Challenge 2'],
            questions: ['Analysis question 1', 'Analysis question 2'],
            learningPoints: ['Key learning 1', 'Key learning 2']
          }
        ],
        discussionQuestions: [
          'How does this concept relate to your calling?',
          'What transformation do you see in your understanding?',
          'How will you apply this in your ministry?',
          'What questions remain for deeper exploration?'
        ],
        biblicalIntegration: {
          scriptureReferences: [
            { reference: 'John 3:16', text: 'For God so loved...', relevance: 'Shows God\'s love' }
          ],
          theologicalIntegration: 'Theological explanation connecting faith and learning',
          spiritualApplication: 'Practical spiritual application for students',
          prayerPoints: ['Prayer point 1', 'Prayer point 2'],
          reflectionQuestions: [
            'How does this deepen your faith?',
            'What is God teaching you?',
            'How does this shape your calling?'
          ]
        },
        keyTakeaways: [
          'First key takeaway with specific actionable insight and clear application',
          'Second key takeaway connecting theory to practice with concrete examples',
          'Third key takeaway synthesizing all concepts with spiritual integration'
        ],
        summary: 'Comprehensive summary synthesizing all key points and preparing students for next steps. This summary reinforces learning and provides clear direction for continued growth.',
        assignments: [
          {
            title: 'Practical Application Assignment',
            description: 'Apply concepts in real-world context',
            type: 'practical_application'
          }
        ]
      };

      const result = await validator.validatePedagogicalFlow(content, 'lecture');

      expect(result.isValid).toBe(true);
      expect(result.overallScore).toBeGreaterThan(75);
      expect(result.componentScores.ignition).toBeGreaterThan(70);
      expect(result.componentScores.download).toBeGreaterThan(70);
      expect(result.componentScores.demonstration).toBeGreaterThan(70);
      expect(result.componentScores.activation).toBeGreaterThan(70);
      expect(result.componentScores.reflection).toBeGreaterThan(70);
      expect(result.componentScores.commission).toBeGreaterThan(70);
    });

    it('should detect missing ignition component', async () => {
      const content = {
        introduction: 'Short intro',
        mainContent: [],
        keyTakeaways: []
      };

      const result = await validator.validatePedagogicalFlow(content, 'lecture');

      expect(result.isValid).toBe(false);
      expect(result.violations.some(v => v.component === 'ignition')).toBe(true);
    });

    it('should detect missing demonstration component', async () => {
      const content = {
        introduction: 'This is a compelling introduction that hooks students with a story about transformation. It sets the stage for deep learning and spiritual growth. The introduction is over 200 characters to meet minimum requirements.',
        mainContent: [
          { sectionNumber: 1, title: 'Concept', content: 'Content here with sufficient length to meet requirements. This section provides detailed explanation and examples.' }
        ],
        examples: [], // Missing examples
        keyTakeaways: ['Takeaway 1', 'Takeaway 2', 'Takeaway 3']
      };

      const result = await validator.validatePedagogicalFlow(content, 'lecture');

      expect(result.violations.some(v => v.component === 'demonstration')).toBe(true);
    });
  });

  describe('validateProgressionLevel', () => {
    it('should validate content at correct progression level', async () => {
      const content = {
        mainContent: [
          { title: 'Basic Concept 1', content: 'Introduction to fundamental ideas' },
          { title: 'Basic Concept 2', content: 'Building on fundamentals' },
          { title: 'Basic Concept 3', content: 'Expanding understanding' }
        ],
        examples: [
          { title: 'Example 1', explanation: 'Simple example' },
          { title: 'Example 2', explanation: 'Another example' }
        ]
      };

      const result = await validator.validateProgressionLevel(content, 2); // Understanding & Analysis

      expect(result.actualLevel).toBe(2);
      expect(result.isValid).toBe(true);
    });
  });
});

describe('ContentVersionControl', () => {
  let versionControl: ContentVersionControl;

  beforeEach(() => {
    versionControl = new ContentVersionControl();
  });

  describe('createVersion', () => {
    it('should create new version of content', async () => {
      const content = {
        title: 'Test Lecture',
        introduction: 'Introduction text',
        mainContent: []
      };

      const version = await versionControl.createVersion(
        'lecture_123',
        'lecture',
        content,
        { title: 'Version 1', tags: ['test'] },
        'test_user'
      );

      expect(version.versionNumber).toBe(1);
      expect(version.contentId).toBe('lecture_123');
      expect(version.createdBy).toBe('test_user');
      expect(version.status).toBe('draft');
    });

    it('should increment version number', async () => {
      const content1 = { title: 'Version 1' };
      const content2 = { title: 'Version 2' };

      await versionControl.createVersion('lecture_123', 'lecture', content1, {}, 'user1');
      const version2 = await versionControl.createVersion('lecture_123', 'lecture', content2, {}, 'user2');

      expect(version2.versionNumber).toBe(2);
    });

    it('should detect changes between versions', async () => {
      const content1 = { title: 'Original', introduction: 'Original intro' };
      const content2 = { title: 'Updated', introduction: 'Updated intro' };

      await versionControl.createVersion('lecture_123', 'lecture', content1, {}, 'user1');
      const version2 = await versionControl.createVersion('lecture_123', 'lecture', content2, {}, 'user2');

      expect(version2.changes.length).toBeGreaterThan(0);
      expect(version2.changes.some(c => c.field === 'title')).toBe(true);
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions', async () => {
      const content1 = { title: 'Version 1', mainContent: ['Section 1'] };
      const content2 = { title: 'Version 2', mainContent: ['Section 1', 'Section 2'] };

      await versionControl.createVersion('lecture_123', 'lecture', content1, {}, 'user1');
      await versionControl.createVersion('lecture_123', 'lecture', content2, {}, 'user2');

      const comparison = await versionControl.compareVersions('lecture_123', 1, 2);

      expect(comparison.differences.length).toBeGreaterThan(0);
      expect(comparison.summary.totalChanges).toBeGreaterThan(0);
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to previous version', async () => {
      const content1 = { title: 'Version 1' };
      const content2 = { title: 'Version 2' };

      const v1 = await versionControl.createVersion('lecture_123', 'lecture', content1, {}, 'user1');
      await versionControl.createVersion('lecture_123', 'lecture', content2, {}, 'user2');

      const rollback = await versionControl.rollbackToVersion({
        contentId: 'lecture_123',
        targetVersionId: v1.versionId,
        reason: 'Reverting changes',
        requestedBy: 'admin',
        preserveApprovals: false
      });

      expect(rollback.success).toBe(true);
      expect(rollback.restoredVersion).toBe(1);
    });
  });

  describe('getVersionHistory', () => {
    it('should return all versions', async () => {
      await versionControl.createVersion('lecture_123', 'lecture', { v: 1 }, {}, 'user1');
      await versionControl.createVersion('lecture_123', 'lecture', { v: 2 }, {}, 'user2');
      await versionControl.createVersion('lecture_123', 'lecture', { v: 3 }, {}, 'user3');

      const history = await versionControl.getVersionHistory('lecture_123');

      expect(history.length).toBe(3);
      expect(history[0].versionNumber).toBe(1);
      expect(history[2].versionNumber).toBe(3);
    });
  });
});

describe('ContentCoherenceChecker', () => {
  let checker: ContentCoherenceChecker;

  beforeEach(() => {
    checker = new ContentCoherenceChecker();
  });

  describe('checkCoherence', () => {
    it('should validate coherent content sequence', async () => {
      const contentPieces = [
        {
          id: 'lecture_1',
          type: 'lecture',
          content: {
            title: 'Introduction to Concepts',
            mainContent: [
              { title: 'Basic Concept', content: 'Introduction to basic ideas and foundational principles' }
            ],
            examples: [
              { title: 'Example 1', explanation: 'Detailed example' }
            ],
            biblicalIntegration: {
              scriptureReferences: [{ reference: 'John 1:1', text: 'In the beginning...' }],
              spiritualApplication: 'Application text'
            }
          }
        },
        {
          id: 'lecture_2',
          type: 'lecture',
          content: {
            title: 'Advanced Concepts',
            mainContent: [
              { title: 'Advanced Topic', content: 'Building on basic concepts with advanced applications' }
            ],
            examples: [
              { title: 'Example 2', explanation: 'Advanced example' },
              { title: 'Example 3', explanation: 'Complex scenario' }
            ],
            caseStudies: [
              { title: 'Case Study', scenario: 'Real-world application' }
            ],
            biblicalIntegration: {
              scriptureReferences: [{ reference: 'Romans 12:2', text: 'Be transformed...' }],
              spiritualApplication: 'Transformation application'
            }
          }
        }
      ];

      const result = await checker.checkCoherence(contentPieces);

      expect(result.isCoherent).toBe(true);
      expect(result.overallScore).toBeGreaterThan(70);
    });

    it('should detect conceptual gaps', async () => {
      const contentPieces = [
        {
          id: 'lecture_1',
          type: 'lecture',
          content: {
            mainContent: [{ title: 'Basic Concept', content: 'Basic content' }]
          }
        },
        {
          id: 'lecture_2',
          type: 'lecture',
          content: {
            mainContent: [{ title: 'Very Advanced Concept', content: 'Assumes knowledge not yet taught' }]
          }
        }
      ];

      const result = await checker.checkCoherence(contentPieces);

      expect(result.issues.some(i => i.type === 'conceptual_gap' || i.type === 'progression_jump')).toBe(true);
    });

    it('should detect missing spiritual integration', async () => {
      const contentPieces = [
        {
          id: 'lecture_1',
          type: 'lecture',
          content: {
            mainContent: [{ title: 'Concept', content: 'Content without spiritual integration' }]
            // Missing biblicalIntegration
          }
        }
      ];

      const result = await checker.checkCoherence(contentPieces);

      expect(result.issues.some(i => i.type === 'spiritual_disconnect')).toBe(true);
    });
  });
});
