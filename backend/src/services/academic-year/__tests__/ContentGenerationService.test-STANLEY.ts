/**
 * Unit Tests for ContentGenerationService
 * Tests lecture plan generation, assessment creation, and spiritual integration
 */

import ContentGenerationService, {
  GenerateLecturePlanRequest,
  GenerateAssessmentRequest,
  LecturePlan,
  Assessment
} from '../ContentGenerationService';
import { AIGatewayService } from '../../AIGatewayService';

// Mock AIGatewayService
jest.mock('../../AIGatewayService');

describe('ContentGenerationService', () => {
  let service: ContentGenerationService;
  let mockAIGateway: jest.Mocked<AIGatewayService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock AI Gateway
    mockAIGateway = {
      generateContent: jest.fn()
    } as any;

    // Replace the AIGatewayService constructor to return our mock
    (AIGatewayService as jest.MockedClass<typeof AIGatewayService>).mockImplementation(() => mockAIGateway);
    
    service = new ContentGenerationService(mockAIGateway);
  });

  describe('generateLecturePlan', () => {
    it('should generate a comprehensive lecture plan', async () => {
      const request: GenerateLecturePlanRequest = {
        courseId: 'course-123',
        moduleId: 'module-456',
        moduleTitle: 'Introduction to Biblical Theology',
        learningObjectives: [
          'Understand core theological concepts',
          'Apply biblical principles to modern contexts'
        ],
        targetAudience: 'Undergraduate students',
        duration: 90,
        spiritualFocus: 'Understanding God\'s character'
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: `
Section 1: Introduction to Theology
Key concepts and foundations

Section 2: Biblical Foundations
Scripture references and analysis

Section 3: Practical Application
Modern applications and reflection
        `,
        usage: {
          totalTokens: 500,
          promptTokens: 200,
          completionTokens: 300
        }
      });

      const result = await service.generateLecturePlan(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.courseId).toBe('course-123');
      expect(result.data?.moduleId).toBe('module-456');
      expect(result.data?.title).toBe('Introduction to Biblical Theology');
      expect(result.data?.learningObjectives).toHaveLength(2);
      expect(result.data?.outline.length).toBeGreaterThan(0);
      expect(result.data?.spiritualFormationElements.length).toBeGreaterThan(0);
      expect(mockAIGateway.generateContent).toHaveBeenCalledTimes(1);
    });

    it('should include spiritual formation elements', async () => {
      const request: GenerateLecturePlanRequest = {
        courseId: 'course-123',
        moduleId: 'module-456',
        moduleTitle: 'Christian Ethics',
        learningObjectives: ['Understand ethical frameworks'],
        targetAudience: 'Graduate students',
        duration: 60,
        spiritualFocus: 'Moral decision-making'
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Lecture content with Scripture references and Prayer opportunities',
        usage: { totalTokens: 400, promptTokens: 150, completionTokens: 250 }
      });

      const result = await service.generateLecturePlan(request);

      expect(result.success).toBe(true);
      expect(result.data?.spiritualFormationElements).toBeDefined();
      expect(result.data?.spiritualFormationElements.length).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      const request: GenerateLecturePlanRequest = {
        courseId: 'course-123',
        moduleId: 'module-456',
        moduleTitle: 'Test Module',
        learningObjectives: ['Test objective'],
        targetAudience: 'Students',
        duration: 60
      };

      mockAIGateway.generateContent.mockRejectedValue(new Error('AI service unavailable'));

      const result = await service.generateLecturePlan(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('AI service unavailable');
    });
  });

  describe('generateAssessment', () => {
    it('should generate a comprehensive assessment', async () => {
      const request: GenerateAssessmentRequest = {
        courseId: 'course-123',
        assessmentType: 'quiz',
        topics: ['Theology', 'Biblical Studies'],
        learningObjectives: ['Demonstrate understanding of key concepts'],
        difficulty: 'intermediate',
        numberOfQuestions: 10,
        timeLimit: 30,
        includeSpiritual: true
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Assessment questions and rubric',
        usage: { totalTokens: 600, promptTokens: 250, completionTokens: 350 }
      });

      const result = await service.generateAssessment(request);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.courseId).toBe('course-123');
      expect(result.data?.assessmentType).toBe('quiz');
      expect(result.data?.questions).toHaveLength(10);
      expect(result.data?.rubric).toBeDefined();
      expect(result.data?.totalPoints).toBeGreaterThan(0);
      expect(result.data?.timeLimit).toBe(30);
      expect(result.data?.spiritualReflection).toBeDefined();
      expect(mockAIGateway.generateContent).toHaveBeenCalledTimes(1);
    });

    it('should generate different assessment types', async () => {
      const assessmentTypes: Array<'quiz' | 'exam' | 'assignment' | 'project' | 'discussion'> = [
        'quiz',
        'exam',
        'assignment',
        'project',
        'discussion'
      ];

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Assessment content',
        usage: { totalTokens: 400, promptTokens: 150, completionTokens: 250 }
      });

      for (const type of assessmentTypes) {
        const request: GenerateAssessmentRequest = {
          courseId: 'course-123',
          assessmentType: type,
          topics: ['Topic 1'],
          learningObjectives: ['Objective 1'],
          difficulty: 'beginner',
          numberOfQuestions: 5,
          includeSpiritual: false
        };

        const result = await service.generateAssessment(request);

        expect(result.success).toBe(true);
        expect(result.data?.assessmentType).toBe(type);
      }
    });

    it('should include rubric with grading criteria', async () => {
      const request: GenerateAssessmentRequest = {
        courseId: 'course-123',
        assessmentType: 'exam',
        topics: ['Advanced Theology'],
        learningObjectives: ['Analyze theological concepts'],
        difficulty: 'advanced',
        numberOfQuestions: 5,
        includeSpiritual: true
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Exam with detailed rubric',
        usage: { totalTokens: 500, promptTokens: 200, completionTokens: 300 }
      });

      const result = await service.generateAssessment(request);

      expect(result.success).toBe(true);
      expect(result.data?.rubric).toBeDefined();
      expect(result.data?.rubric.criteria).toBeDefined();
      expect(result.data?.rubric.criteria.length).toBeGreaterThan(0);
      expect(result.data?.rubric.gradingScale).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const request: GenerateAssessmentRequest = {
        courseId: 'course-123',
        assessmentType: 'quiz',
        topics: ['Test Topic'],
        learningObjectives: ['Test Objective'],
        difficulty: 'beginner',
        numberOfQuestions: 5,
        includeSpiritual: false
      };

      mockAIGateway.generateContent.mockRejectedValue(new Error('Generation failed'));

      const result = await service.generateAssessment(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Generation failed');
    });
  });

  describe('generateTeachingMaterials', () => {
    it('should generate slides', async () => {
      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Slide content with spiritual elements',
        usage: { totalTokens: 300, promptTokens: 100, completionTokens: 200 }
      });

      const result = await service.generateTeachingMaterials(
        'course-123',
        'module-456',
        'slides'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('slides generated successfully');
    });

    it('should generate handouts', async () => {
      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Handout content',
        usage: { totalTokens: 300, promptTokens: 100, completionTokens: 200 }
      });

      const result = await service.generateTeachingMaterials(
        'course-123',
        'module-456',
        'handout'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should generate activities', async () => {
      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Activity instructions',
        usage: { totalTokens: 300, promptTokens: 100, completionTokens: 200 }
      });

      const result = await service.generateTeachingMaterials(
        'course-123',
        'module-456',
        'activity'
      );

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      mockAIGateway.generateContent.mockRejectedValue(new Error('Material generation failed'));

      const result = await service.generateTeachingMaterials(
        'course-123',
        'module-456',
        'guide'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Integration with ScrollProfessor and ScrollExaminer', () => {
    it('should use ScrollProfessor system prompt for lecture plans', async () => {
      const request: GenerateLecturePlanRequest = {
        courseId: 'course-123',
        moduleId: 'module-456',
        moduleTitle: 'Test Module',
        learningObjectives: ['Test'],
        targetAudience: 'Students',
        duration: 60
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Lecture content',
        usage: { totalTokens: 400, promptTokens: 150, completionTokens: 250 }
      });

      await service.generateLecturePlan(request);

      expect(mockAIGateway.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.stringContaining('ScrollProfessor')
        })
      );
    });

    it('should use ScrollExaminer system prompt for assessments', async () => {
      const request: GenerateAssessmentRequest = {
        courseId: 'course-123',
        assessmentType: 'quiz',
        topics: ['Test'],
        learningObjectives: ['Test'],
        difficulty: 'beginner',
        numberOfQuestions: 5,
        includeSpiritual: false
      };

      mockAIGateway.generateContent.mockResolvedValue({
        content: 'Assessment content',
        usage: { totalTokens: 400, promptTokens: 150, completionTokens: 250 }
      });

      await service.generateAssessment(request);

      expect(mockAIGateway.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: expect.stringContaining('ScrollExaminer')
        })
      );
    });
  });
});
