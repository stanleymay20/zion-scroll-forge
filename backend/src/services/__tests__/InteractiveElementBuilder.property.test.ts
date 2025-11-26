// Interactive Element Builder Property Tests
// "Iron sharpens iron" - Proverbs 27:17

import InteractiveElementBuilder, { InteractiveElementType } from '../InteractiveElementBuilder';

describe('InteractiveElementBuilder - Property Tests', () => {
  let builder: InteractiveElementBuilder;

  beforeEach(() => {
    builder = new InteractiveElementBuilder();
  });

  describe('Quiz Element Building', () => {
    it('should build comprehensive quiz element', async () => {
      const sourceContent = {
        title: 'Test Lecture on AI Ethics',
        introduction: 'Introduction to AI ethics and moral considerations',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Ethical Frameworks',
            content: 'Detailed explanation of ethical frameworks in AI',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        keyTakeaways: [
          'Understanding ethical frameworks is crucial',
          'AI systems must align with human values',
          'Transparency and accountability are essential'
        ],
        estimatedDuration: 60
      };

      const quiz = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        {
          difficulty: 'intermediate',
          duration: 20,
          includeSpiritual: false,
          learningObjectives: ['Understand ethical frameworks', 'Apply ethical principles']
        }
      );

      expect(quiz).toBeDefined();
      expect(quiz.type).toBe(InteractiveElementType.QUIZ);
      expect(quiz.title).toContain('Test Lecture on AI Ethics');
      expect(quiz.description).toBeDefined();
      expect(quiz.instructions).toBeDefined();
      expect(quiz.instructions.length).toBeGreaterThan(0);
      expect(quiz.content).toBeDefined();
      expect(quiz.content.questions).toBeDefined();
      expect(quiz.content.questions.length).toBeGreaterThan(0);
      expect(quiz.estimatedDuration).toBeGreaterThan(0);
      expect(quiz.difficulty).toBe('intermediate');
      expect(quiz.pedagogicalAlignment).toBeDefined();
      expect(quiz.accessibility).toBeDefined();
      expect(quiz.metadata).toBeDefined();
    });

    it('should include spiritual integration when requested', async () => {
      const sourceContent = {
        title: 'Biblical Leadership',
        introduction: 'Leadership principles from Scripture',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Servant Leadership',
            content: 'Jesus modeled servant leadership',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        biblicalIntegration: {
          scriptureReferences: [
            { reference: 'Mark 10:45', text: 'For even the Son of Man...', relevance: 'Servant leadership' }
          ],
          theologicalIntegration: 'Leadership as service',
          spiritualApplication: 'Lead with humility',
          prayerPoints: ['Pray for servant hearts'],
          reflectionQuestions: ['How do you serve others?']
        },
        keyTakeaways: ['Leadership is service'],
        estimatedDuration: 45
      };

      const quiz = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        {
          difficulty: 'intermediate',
          includeSpiritual: true,
          learningObjectives: ['Understand servant leadership']
        }
      );

      expect(quiz.spiritualIntegration).toBeDefined();
      expect(quiz.spiritualIntegration?.scriptureReferences).toBeDefined();
      expect(quiz.spiritualIntegration?.prayerPrompts).toBeDefined();
      expect(quiz.spiritualIntegration?.reflectionQuestions).toBeDefined();
    });

    it('should generate valid quiz questions', async () => {
      const sourceContent = {
        title: 'Data Structures',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Arrays and Lists',
            content: 'Understanding arrays and linked lists',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        keyTakeaways: ['Arrays provide O(1) access', 'Lists allow dynamic sizing'],
        estimatedDuration: 50
      };

      const quiz = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        { difficulty: 'beginner' }
      );

      expect(quiz.content.questions).toBeDefined();
      quiz.content.questions.forEach((question: any) => {
        expect(question.questionId).toBeDefined();
        expect(question.question).toBeDefined();
        expect(question.type).toBeDefined();
        expect(question.correctAnswer).toBeDefined();
        expect(question.explanation).toBeDefined();
        expect(question.points).toBeGreaterThan(0);
      });
    });
  });

  describe('Simulation Element Building', () => {
    it('should build simulation with proper structure', async () => {
      const sourceContent = {
        title: 'Network Protocols',
        introduction: 'Understanding TCP/IP',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'TCP Handshake',
            content: 'Three-way handshake process',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        keyTakeaways: ['TCP ensures reliable delivery'],
        estimatedDuration: 60
      };

      const simulation = await builder.buildInteractiveElement(
        InteractiveElementType.SIMULATION,
        sourceContent,
        {
          difficulty: 'advanced',
          duration: 30,
          learningObjectives: ['Understand TCP handshake', 'Simulate network behavior']
        }
      );

      expect(simulation).toBeDefined();
      expect(simulation.type).toBe(InteractiveElementType.SIMULATION);
      expect(simulation.content).toBeDefined();
      expect(simulation.content.scenario).toBeDefined();
      expect(simulation.content.objectives).toBeDefined();
      expect(simulation.content.successCriteria).toBeDefined();
      expect(simulation.content.feedback).toBeDefined();
      expect(simulation.pedagogicalAlignment.flowStep).toBe('activation');
      expect(simulation.pedagogicalAlignment.bloomLevel).toBe('apply');
    });
  });

  describe('Exercise Element Building', () => {
    it('should build exercise with rubric', async () => {
      const sourceContent = {
        title: 'Algorithm Design',
        introduction: 'Designing efficient algorithms',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Sorting Algorithms',
            content: 'Comparison of sorting algorithms',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        practiceProblems: [
          { problem: 'Implement quicksort', solution: 'Solution provided' }
        ],
        furtherReading: [
          { title: 'Algorithm Analysis', url: 'https://example.com' }
        ],
        keyTakeaways: ['Choose appropriate algorithms'],
        estimatedDuration: 90
      };

      const exercise = await builder.buildInteractiveElement(
        InteractiveElementType.EXERCISE,
        sourceContent,
        {
          difficulty: 'advanced',
          duration: 60,
          learningObjectives: ['Design efficient algorithms']
        }
      );

      expect(exercise).toBeDefined();
      expect(exercise.type).toBe(InteractiveElementType.EXERCISE);
      expect(exercise.content).toBeDefined();
      expect(exercise.content.problem).toBeDefined();
      expect(exercise.content.steps).toBeDefined();
      expect(exercise.content.steps.length).toBeGreaterThan(0);
      expect(exercise.content.rubric).toBeDefined();
      expect(exercise.content.rubric.criteria).toBeDefined();
      expect(exercise.content.rubric.totalPoints).toBe(100);
      
      // Verify rubric structure
      exercise.content.rubric.criteria.forEach((criterion: any) => {
        expect(criterion.name).toBeDefined();
        expect(criterion.description).toBeDefined();
        expect(criterion.points).toBeGreaterThan(0);
        expect(criterion.levels).toBeDefined();
        expect(criterion.levels.length).toBeGreaterThan(0);
      });
    });

    it('should include resources in exercise', async () => {
      const sourceContent = {
        title: 'Web Development',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'HTML Basics',
            content: 'Introduction to HTML',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        furtherReading: [
          { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
          { title: 'W3C Standards', url: 'https://w3.org' }
        ],
        keyTakeaways: ['HTML structures content'],
        estimatedDuration: 40
      };

      const exercise = await builder.buildInteractiveElement(
        InteractiveElementType.EXERCISE,
        sourceContent,
        { difficulty: 'beginner' }
      );

      expect(exercise.content.resources).toBeDefined();
      expect(Array.isArray(exercise.content.resources)).toBe(true);
    });
  });

  describe('Reflection Element Building', () => {
    it('should build reflection with spiritual integration', async () => {
      const sourceContent = {
        title: 'Kingdom Economics',
        introduction: 'Biblical principles of stewardship',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Stewardship',
            content: 'Managing resources for God\'s glory',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        biblicalIntegration: {
          scriptureReferences: [
            { reference: 'Matthew 25:14-30', text: 'Parable of the talents', relevance: 'Stewardship' }
          ],
          theologicalIntegration: 'All belongs to God',
          spiritualApplication: 'Faithful stewardship',
          prayerPoints: ['Pray for wisdom in stewardship', 'Ask for faithful hearts'],
          reflectionQuestions: ['How are you stewarding your resources?', 'What is God calling you to?']
        },
        keyTakeaways: ['Stewardship is worship'],
        estimatedDuration: 50
      };

      const reflection = await builder.buildInteractiveElement(
        InteractiveElementType.REFLECTION,
        sourceContent,
        {
          difficulty: 'intermediate',
          duration: 20,
          includeSpiritual: true
        }
      );

      expect(reflection).toBeDefined();
      expect(reflection.type).toBe(InteractiveElementType.REFLECTION);
      expect(reflection.content).toBeDefined();
      expect(reflection.content.identityQuestions).toBeDefined();
      expect(reflection.content.callingQuestions).toBeDefined();
      expect(reflection.content.prayerPrompts).toBeDefined();
      expect(reflection.content.journalPrompts).toBeDefined();
      expect(reflection.spiritualIntegration).toBeDefined();
      expect(reflection.pedagogicalAlignment.flowStep).toBe('reflection');
      expect(reflection.pedagogicalAlignment.bloomLevel).toBe('evaluate');
    });

    it('should include identity and calling questions', async () => {
      const sourceContent = {
        title: 'Calling Discovery',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Understanding Calling',
            content: 'God\'s unique purpose for your life',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        biblicalIntegration: {
          scriptureReferences: [],
          theologicalIntegration: 'Calling',
          spiritualApplication: 'Discover your calling',
          prayerPoints: ['Pray for clarity'],
          reflectionQuestions: ['What is God saying?']
        },
        keyTakeaways: ['You have a unique calling'],
        estimatedDuration: 30
      };

      const reflection = await builder.buildInteractiveElement(
        InteractiveElementType.REFLECTION,
        sourceContent,
        { includeSpiritual: true }
      );

      expect(reflection.content.identityQuestions).toBeDefined();
      expect(reflection.content.identityQuestions.length).toBeGreaterThan(0);
      expect(reflection.content.callingQuestions).toBeDefined();
      expect(reflection.content.callingQuestions.length).toBeGreaterThan(0);
      
      // Verify questions are meaningful
      reflection.content.identityQuestions.forEach((question: string) => {
        expect(question.length).toBeGreaterThan(10);
        expect(question).toMatch(/\?$/); // Should end with question mark
      });
    });
  });

  describe('Prayer Activity Building', () => {
    it('should build prayer activity with spiritual focus', async () => {
      const sourceContent = {
        title: 'Intercession',
        introduction: 'The ministry of intercession',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Prayer Principles',
            content: 'Biblical principles of prayer',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        biblicalIntegration: {
          scriptureReferences: [
            { reference: '1 Thessalonians 5:17', text: 'Pray without ceasing', relevance: 'Prayer life' }
          ],
          theologicalIntegration: 'Prayer as communion',
          spiritualApplication: 'Develop prayer life',
          prayerPoints: ['Pray for the nations', 'Intercede for leaders', 'Pray for revival'],
          reflectionQuestions: ['How is your prayer life?']
        },
        keyTakeaways: ['Prayer changes things'],
        estimatedDuration: 40
      };

      const prayerActivity = await builder.buildInteractiveElement(
        InteractiveElementType.PRAYER_ACTIVITY,
        sourceContent,
        {
          difficulty: 'beginner',
          duration: 15,
          includeSpiritual: true
        }
      );

      expect(prayerActivity).toBeDefined();
      expect(prayerActivity.type).toBe(InteractiveElementType.PRAYER_ACTIVITY);
      expect(prayerActivity.content).toBeDefined();
      expect(prayerActivity.content.prayerFocus).toBeDefined();
      expect(prayerActivity.content.prayerPrompts).toBeDefined();
      expect(prayerActivity.content.prayerPrompts.length).toBeGreaterThan(0);
      expect(prayerActivity.content.contemplativeQuestions).toBeDefined();
      expect(prayerActivity.spiritualIntegration).toBeDefined();
    });
  });

  describe('Coding Challenge Building', () => {
    it('should build coding challenge with test cases', async () => {
      const sourceContent = {
        title: 'Binary Search Trees',
        introduction: 'Understanding BST operations',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'BST Implementation',
            content: 'Implementing insert, search, and delete',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        keyTakeaways: ['BST provides O(log n) operations'],
        estimatedDuration: 75
      };

      const codingChallenge = await builder.buildInteractiveElement(
        InteractiveElementType.CODING_CHALLENGE,
        sourceContent,
        {
          difficulty: 'advanced',
          duration: 60,
          learningObjectives: ['Implement BST operations']
        }
      );

      expect(codingChallenge).toBeDefined();
      expect(codingChallenge.type).toBe(InteractiveElementType.CODING_CHALLENGE);
      expect(codingChallenge.content).toBeDefined();
      expect(codingChallenge.content.problem).toBeDefined();
      expect(codingChallenge.content.starterCode).toBeDefined();
      expect(codingChallenge.content.testCases).toBeDefined();
      expect(codingChallenge.content.hints).toBeDefined();
      expect(codingChallenge.pedagogicalAlignment.bloomLevel).toBe('create');
    });
  });

  describe('Design Task Building', () => {
    it('should build design task with requirements', async () => {
      const sourceContent = {
        title: 'System Architecture',
        introduction: 'Designing scalable systems',
        mainContent: [
          {
            sectionNumber: 1,
            title: 'Architecture Patterns',
            content: 'Common architectural patterns',
            subsections: [],
            visualAids: [],
            interactiveElements: []
          }
        ],
        keyTakeaways: ['Choose appropriate architecture'],
        estimatedDuration: 90
      };

      const designTask = await builder.buildInteractiveElement(
        InteractiveElementType.DESIGN_TASK,
        sourceContent,
        {
          difficulty: 'advanced',
          duration: 90,
          learningObjectives: ['Design scalable systems']
        }
      );

      expect(designTask).toBeDefined();
      expect(designTask.type).toBe(InteractiveElementType.DESIGN_TASK);
      expect(designTask.content).toBeDefined();
      expect(designTask.content.designBrief).toBeDefined();
      expect(designTask.content.requirements).toBeDefined();
      expect(designTask.content.constraints).toBeDefined();
      expect(designTask.content.deliverables).toBeDefined();
      expect(designTask.pedagogicalAlignment.bloomLevel).toBe('create');
    });
  });

  describe('Accessibility Features', () => {
    it('should include accessibility features in all elements', async () => {
      const sourceContent = {
        title: 'Accessible Content',
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
        keyTakeaways: ['Accessibility matters'],
        estimatedDuration: 30
      };

      const elementTypes = [
        InteractiveElementType.QUIZ,
        InteractiveElementType.EXERCISE,
        InteractiveElementType.REFLECTION
      ];

      for (const type of elementTypes) {
        const element = await builder.buildInteractiveElement(type, sourceContent, {});
        
        expect(element.accessibility).toBeDefined();
        expect(element.accessibility.screenReaderCompatible).toBe(true);
        expect(element.accessibility.keyboardNavigable).toBe(true);
        expect(element.accessibility.alternativeFormats).toBeDefined();
        expect(element.accessibility.captionsAvailable).toBe(true);
        expect(element.accessibility.colorBlindFriendly).toBe(true);
      }
    });
  });

  describe('Pedagogical Alignment', () => {
    it('should align elements with pedagogical flow', async () => {
      const sourceContent = {
        title: 'Pedagogical Test',
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
        keyTakeaways: ['Key point'],
        estimatedDuration: 30
      };

      // Quiz and Exercise should be 'activation'
      const quiz = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        {}
      );
      expect(quiz.pedagogicalAlignment.flowStep).toBe('activation');

      const exercise = await builder.buildInteractiveElement(
        InteractiveElementType.EXERCISE,
        sourceContent,
        {}
      );
      expect(exercise.pedagogicalAlignment.flowStep).toBe('activation');

      // Reflection should be 'reflection'
      const reflection = await builder.buildInteractiveElement(
        InteractiveElementType.REFLECTION,
        sourceContent,
        {}
      );
      expect(reflection.pedagogicalAlignment.flowStep).toBe('reflection');
    });

    it('should assign appropriate Bloom levels', async () => {
      const sourceContent = {
        title: 'Bloom Level Test',
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
        keyTakeaways: ['Key point'],
        estimatedDuration: 30
      };

      // Quiz: understand
      const quiz = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        {}
      );
      expect(quiz.pedagogicalAlignment.bloomLevel).toBe('understand');

      // Exercise/Simulation: apply
      const exercise = await builder.buildInteractiveElement(
        InteractiveElementType.EXERCISE,
        sourceContent,
        {}
      );
      expect(quiz.pedagogicalAlignment.bloomLevel).toBe('understand');

      // Reflection: evaluate
      const reflection = await builder.buildInteractiveElement(
        InteractiveElementType.REFLECTION,
        sourceContent,
        {}
      );
      expect(reflection.pedagogicalAlignment.bloomLevel).toBe('evaluate');

      // Coding/Design: create
      const codingChallenge = await builder.buildInteractiveElement(
        InteractiveElementType.CODING_CHALLENGE,
        sourceContent,
        {}
      );
      expect(codingChallenge.pedagogicalAlignment.bloomLevel).toBe('create');
    });
  });

  describe('Metadata Tracking', () => {
    it('should include comprehensive metadata', async () => {
      const sourceContent = {
        title: 'Metadata Test',
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
        keyTakeaways: ['Key point'],
        estimatedDuration: 30
      };

      const element = await builder.buildInteractiveElement(
        InteractiveElementType.QUIZ,
        sourceContent,
        {}
      );

      expect(element.metadata).toBeDefined();
      expect(element.metadata.createdBy).toBeDefined();
      expect(element.metadata.createdAt).toBeInstanceOf(Date);
      expect(element.metadata.lastModified).toBeInstanceOf(Date);
      expect(element.metadata.version).toBeDefined();
      expect(element.metadata.tags).toBeDefined();
      expect(Array.isArray(element.metadata.tags)).toBe(true);
      expect(typeof element.metadata.usageCount).toBe('number');
      expect(typeof element.metadata.averageCompletionTime).toBe('number');
      expect(typeof element.metadata.successRate).toBe('number');
    });
  });
});
