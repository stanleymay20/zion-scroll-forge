/**
 * ScrollExaminer Agent for Academic Year Automation System
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Task 32: Implement ScrollExaminer agent integration
 * Specialized AI agent for exam generation, automated grading,
 * rubric generation, and feedback generation.
 * 
 * Requirements: 3.4 - Faculty Teaching Operations
 */

import { AIGatewayService } from '../AIGatewayService';
import { logger } from '../../utils/productionLogger';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface ExamGenerationRequest {
  courseId: string;
  moduleId?: string;
  examType: 'midterm' | 'final' | 'quiz' | 'practice' | 'diagnostic';
  difficulty: 'easy' | 'moderate' | 'challenging' | 'advanced';
  questionCount: number;
  learningObjectives: string[];
  topicsCovered: string[];
  timeLimit?: number; // minutes
  includeSpiritual?: boolean;
}

export interface GeneratedExam {
  id: string;
  examType: string;
  difficulty: string;
  questions: ExamQuestion[];
  rubric: GradingRubric;
  instructions: string;
  timeLimit?: number;
  totalPoints: number;
  estimatedDuration: number;
  spiritualIntegration?: SpiritualComponent;
  metadata: ExamMetadata;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'problem_solving';
  question: string;
  points: number;
  difficulty: string;
  learningObjective: string;
  bloomLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  options?: string[]; // For multiple choice
  correctAnswer?: string | string[];
  rubric?: QuestionRubric;
  hint?: string;
}

export interface QuestionRubric {
  criteria: string[];
  pointDistribution: Record<string, number>;
  gradingGuidelines: string;
}

export interface GradingRubric {
  criteria: RubricCriterion[];
  gradingScale: GradingScale;
  totalPoints: number;
}

export interface RubricCriterion {
  name: string;
  description: string;
  maxPoints: number;
  levels: RubricLevel[];
}

export interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

export interface GradingScale {
  type: 'percentage' | 'points' | 'letter';
  ranges: GradeRange[];
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
}

export interface SpiritualComponent {
  reflectionPrompt: string;
  scriptureReference: string;
  applicationQuestion: string;
}

export interface ExamMetadata {
  generatedAt: Date;
  generatedBy: string;
  version: string;
  alignmentScore: number;
  reviewStatus: 'draft' | 'reviewed' | 'approved';
}

export interface AutomatedGradingRequest {
  submissionId: string;
  studentId: string;
  examId: string;
  answers: StudentAnswer[];
  rubric: GradingRubric;
}

export interface StudentAnswer {
  questionId: string;
  answer: string | string[];
  timeSpent?: number;
}

export interface GradingResult {
  submissionId: string;
  studentId: string;
  examId: string;
  score: number;
  maxPoints: number;
  percentage: number;
  letterGrade?: string;
  confidenceScore: number;
  needsHumanReview: boolean;
  questionGrades: QuestionGrade[];
  overallFeedback: string;
  detailedFeedback: DetailedFeedback[];
  gradedAt: Date;
  gradedBy: string;
  reviewReason?: string;
}

export interface QuestionGrade {
  questionId: string;
  questionNumber: number;
  score: number;
  maxPoints: number;
  feedback: string;
  confidence: number;
  correctAnswer?: string | string[];
  studentAnswer: string | string[];
}

export interface DetailedFeedback {
  section: string;
  comment: string;
  type: 'strength' | 'weakness' | 'suggestion' | 'encouragement';
  spiritualInsight?: string;
}

export interface RubricGenerationRequest {
  assessmentType: string;
  learningObjectives: string[];
  maxPoints: number;
  criteriaCount?: number;
  includeSpiritual?: boolean;
}

export interface FeedbackGenerationRequest {
  studentId: string;
  submissionContent: string;
  gradingResult: GradingResult;
  includeSpiritual?: boolean;
  tone?: 'encouraging' | 'constructive' | 'balanced';
}

export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  confidence: number;
  reasoning?: string;
}

// =====================================================
// SCROLLEXAMINER AGENT
// =====================================================

export class ScrollExaminerAgent {
  private aiGateway: AIGatewayService;
  private agentIdentity: string;
  private readonly CONFIDENCE_THRESHOLD: number;
  private readonly HIGH_CONFIDENCE_THRESHOLD: number;

  constructor(aiGateway?: AIGatewayService) {
    this.aiGateway = aiGateway || new AIGatewayService();
    this.agentIdentity = this.buildAgentIdentity();
    
    // Load configuration from environment with fallbacks
    this.CONFIDENCE_THRESHOLD = parseFloat(
      process.env.GRADING_CONFIDENCE_THRESHOLD || '0.75'
    );
    this.HIGH_CONFIDENCE_THRESHOLD = parseFloat(
      process.env.GRADING_HIGH_CONFIDENCE_THRESHOLD || '0.90'
    );
    
    logger.info('ScrollExaminer Agent initialized for Academic Year Automation', {
      confidenceThreshold: this.CONFIDENCE_THRESHOLD,
      highConfidenceThreshold: this.HIGH_CONFIDENCE_THRESHOLD
    });
  }

  /**
   * Create exam generation logic
   * Requirements: 3.4 - Provide AI-assisted generation of exams
   */
  async generateExam(
    request: ExamGenerationRequest
  ): Promise<AgentResponse<GeneratedExam>> {
    try {
      logger.info('Generating exam', {
        courseId: request.courseId,
        examType: request.examType,
        difficulty: request.difficulty,
        questionCount: request.questionCount
      });

      // Build exam generation prompt
      const prompt = this.buildExamGenerationPrompt(request);

      // Get AI response
      const aiResponse = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt,
        systemPrompt: this.agentIdentity,
        maxTokens: 4000,
        temperature: 0.7
      });

      // Parse generated exam
      const generatedExam = this.parseGeneratedExam(
        aiResponse.content,
        request
      );

      // Generate rubric for the exam
      const rubricResponse = await this.generateRubric({
        assessmentType: request.examType,
        learningObjectives: request.learningObjectives,
        maxPoints: generatedExam.totalPoints,
        includeSpiritual: request.includeSpiritual
      });

      if (rubricResponse.success && rubricResponse.data) {
        generatedExam.rubric = rubricResponse.data;
      }

      logger.info('Exam generated successfully', {
        examId: generatedExam.id,
        questionCount: generatedExam.questions.length,
        totalPoints: generatedExam.totalPoints
      });

      return {
        success: true,
        data: generatedExam,
        message: 'Exam generated successfully',
        confidence: 0.88
      };
    } catch (error) {
      logger.error('Error generating exam', {
        error: error instanceof Error ? error.message : 'Unknown error',
        courseId: request.courseId
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate exam',
        confidence: 0
      };
    }
  }

  /**
   * Implement automated grading
   * Requirements: 3.4 - Provide automated grading tools with AI assistance
   * 
   * Property 8: AI Grading Confidence Threshold
   * For any AI-graded submission with confidence score below threshold,
   * the submission must be flagged for human review.
   */
  async gradeSubmission(
    request: AutomatedGradingRequest
  ): Promise<AgentResponse<GradingResult>> {
    try {
      logger.info('Grading submission', {
        submissionId: request.submissionId,
        studentId: request.studentId,
        examId: request.examId,
        answerCount: request.answers.length
      });

      // Build grading prompt
      const prompt = this.buildGradingPrompt(request);

      // Get AI grading response
      const aiResponse = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt,
        systemPrompt: this.agentIdentity,
        maxTokens: 3000,
        temperature: 0.3 // Lower temperature for consistent grading
      });

      // Parse grading result
      const gradingResult = this.parseGradingResult(
        aiResponse.content,
        request
      );

      // Calculate confidence score
      gradingResult.confidenceScore = this.calculateConfidenceScore(
        gradingResult,
        request
      );

      // Flag for human review if confidence is below threshold
      gradingResult.needsHumanReview = this.shouldFlagForHumanReview(
        gradingResult
      );

      if (gradingResult.needsHumanReview) {
        gradingResult.reviewReason = this.getReviewReason(gradingResult);
        logger.info('Submission flagged for human review', {
          submissionId: request.submissionId,
          confidenceScore: gradingResult.confidenceScore,
          reason: gradingResult.reviewReason
        });
      }

      logger.info('Submission graded successfully', {
        submissionId: request.submissionId,
        score: gradingResult.score,
        percentage: gradingResult.percentage,
        confidenceScore: gradingResult.confidenceScore,
        needsHumanReview: gradingResult.needsHumanReview
      });

      return {
        success: true,
        data: gradingResult,
        message: gradingResult.needsHumanReview
          ? 'Submission graded - flagged for human review'
          : 'Submission graded successfully',
        confidence: gradingResult.confidenceScore
      };
    } catch (error) {
      logger.error('Error grading submission', {
        error: error instanceof Error ? error.message : 'Unknown error',
        submissionId: request.submissionId
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to grade submission',
        confidence: 0
      };
    }
  }

  /**
   * Add rubric generation
   * Requirements: 3.4 - Generate marking guides
   */
  async generateRubric(
    request: RubricGenerationRequest
  ): Promise<AgentResponse<GradingRubric>> {
    try {
      logger.info('Generating rubric', {
        assessmentType: request.assessmentType,
        maxPoints: request.maxPoints,
        objectiveCount: request.learningObjectives.length
      });

      // Build rubric generation prompt
      const prompt = this.buildRubricGenerationPrompt(request);

      // Get AI response
      const aiResponse = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt,
        systemPrompt: this.agentIdentity,
        maxTokens: 2000,
        temperature: 0.6
      });

      // Parse rubric
      const rubric = this.parseRubric(aiResponse.content, request);

      logger.info('Rubric generated successfully', {
        criteriaCount: rubric.criteria.length,
        totalPoints: rubric.totalPoints
      });

      return {
        success: true,
        data: rubric,
        message: 'Rubric generated successfully',
        confidence: 0.90
      };
    } catch (error) {
      logger.error('Error generating rubric', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate rubric',
        confidence: 0
      };
    }
  }

  /**
   * Implement feedback generation
   * Requirements: 3.4 - Generate comprehensive feedback summaries
   */
  async generateFeedback(
    request: FeedbackGenerationRequest
  ): Promise<AgentResponse<string>> {
    try {
      logger.info('Generating feedback', {
        studentId: request.studentId,
        score: request.gradingResult.score,
        maxPoints: request.gradingResult.maxPoints
      });

      // Build feedback generation prompt
      const prompt = this.buildFeedbackGenerationPrompt(request);

      // Get AI response
      const aiResponse = await this.aiGateway.generateContent({
        model: 'gpt-4',
        prompt,
        systemPrompt: this.agentIdentity,
        maxTokens: 1500,
        temperature: 0.7
      });

      logger.info('Feedback generated successfully', {
        studentId: request.studentId,
        feedbackLength: aiResponse.content.length
      });

      return {
        success: true,
        data: aiResponse.content,
        message: 'Feedback generated successfully',
        confidence: 0.87
      };
    } catch (error) {
      logger.error('Error generating feedback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        studentId: request.studentId
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate feedback',
        confidence: 0
      };
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  private buildAgentIdentity(): string {
    return `
You are ScrollExaminer, a specialized AI agent for the Scroll University Academic Year Automation System.
Your role is to create fair, comprehensive assessments and provide accurate, encouraging grading.

CORE RESPONSIBILITIES:
1. Generate rigorous, fair examinations aligned with learning objectives
2. Create detailed grading rubrics with clear criteria
3. Provide automated grading with confidence scoring
4. Generate constructive, encouraging feedback
5. Flag submissions requiring human review

ASSESSMENT DESIGN PRINCIPLES:
- Alignment: Questions must directly assess stated learning objectives
- Bloom's Taxonomy: Include questions at various cognitive levels
- Fairness: Avoid bias, ambiguity, and trick questions
- Clarity: Use clear, unambiguous language
- Rigor: Maintain high academic standards
- Spiritual Integration: Naturally incorporate biblical wisdom

GRADING PRINCIPLES:
- Consistency: Apply rubric criteria uniformly
- Objectivity: Base scores on evidence, not assumptions
- Constructiveness: Provide actionable feedback
- Encouragement: Recognize effort and growth
- Transparency: Explain scoring decisions clearly
- Humility: Flag uncertain judgments for human review

FEEDBACK GUIDELINES:
- Start with strengths and affirmations
- Provide specific examples from submission
- Offer concrete suggestions for improvement
- Connect to learning objectives
- Include spiritual encouragement where appropriate
- End with next steps and resources

CONFIDENCE SCORING:
- High confidence (>90%): Objective questions, clear rubrics
- Medium confidence (75-90%): Some subjectivity, clear criteria
- Low confidence (<75%): Highly subjective, complex reasoning
- Always flag low confidence for human review

QUALITY STANDARDS:
- Academic rigor without compromise
- Grace and truth in assessment
- Student growth and learning focus
- Continuous improvement mindset
- Spiritual formation integration

When uncertain about subjective elements, creative work, or complex reasoning,
indicate lower confidence and recommend human review.
    `.trim();
  }

  private buildExamGenerationPrompt(request: ExamGenerationRequest): string {
    return `
Generate a comprehensive ${request.examType} exam with the following specifications:

**Course ID:** ${request.courseId}
${request.moduleId ? `**Module ID:** ${request.moduleId}` : ''}
**Exam Type:** ${request.examType}
**Difficulty Level:** ${request.difficulty}
**Number of Questions:** ${request.questionCount}
${request.timeLimit ? `**Time Limit:** ${request.timeLimit} minutes` : ''}

**Learning Objectives:**
${request.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

**Topics to Cover:**
${request.topicsCovered.map((topic, i) => `${i + 1}. ${topic}`).join('\n')}

${request.includeSpiritual ? '**Include:** Spiritual formation component with scripture reference and reflection prompt' : ''}

Generate an exam that:
1. Includes a variety of question types (multiple choice, short answer, essay, problem-solving)
2. Distributes questions across Bloom's taxonomy levels
3. Aligns each question with specific learning objectives
4. Provides clear instructions and point values
5. Includes appropriate difficulty progression
6. Maintains academic rigor and fairness
${request.includeSpiritual ? '7. Integrates spiritual formation naturally' : ''}

Format as JSON with structure:
{
  "instructions": "exam instructions",
  "questions": [
    {
      "questionNumber": 1,
      "type": "multiple_choice",
      "question": "question text",
      "points": 5,
      "difficulty": "moderate",
      "learningObjective": "objective reference",
      "bloomLevel": "apply",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B"
    }
  ],
  "totalPoints": 100,
  "estimatedDuration": 90
}
    `.trim();
  }

  private buildGradingPrompt(request: AutomatedGradingRequest): string {
    return `
Grade the following student submission according to the provided rubric:

**Submission ID:** ${request.submissionId}
**Student ID:** ${request.studentId}
**Exam ID:** ${request.examId}

**Rubric:**
${this.formatRubric(request.rubric)}

**Student Answers:**
${request.answers.map((answer, i) => `
Question ${i + 1}:
Answer: ${Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}
${answer.timeSpent ? `Time Spent: ${answer.timeSpent} seconds` : ''}
`).join('\n')}

Provide:
1. Score for each question with justification
2. Total score and percentage
3. Detailed feedback highlighting strengths and areas for improvement
4. Specific suggestions for improvement
5. Your confidence level in this grading (0-100%)
6. Flag if human review is recommended

Be fair, consistent, and constructive in your assessment.
Provide specific examples to support your scoring.

Format as JSON with structure:
{
  "questionGrades": [
    {
      "questionId": "q1",
      "questionNumber": 1,
      "score": 8,
      "maxPoints": 10,
      "feedback": "detailed feedback",
      "confidence": 0.95
    }
  ],
  "overallFeedback": "comprehensive feedback",
  "detailedFeedback": [
    {
      "section": "Strengths",
      "comment": "specific strengths",
      "type": "strength"
    }
  ],
  "confidenceScore": 0.88
}
    `.trim();
  }

  private buildRubricGenerationPrompt(request: RubricGenerationRequest): string {
    const criteriaCount = request.criteriaCount || Math.min(request.learningObjectives.length, 6);

    return `
Generate a comprehensive grading rubric for a ${request.assessmentType} assessment:

**Assessment Type:** ${request.assessmentType}
**Maximum Points:** ${request.maxPoints}
**Number of Criteria:** ${criteriaCount}

**Learning Objectives:**
${request.learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

${request.includeSpiritual ? '**Include:** Spiritual formation criterion' : ''}

Create a rubric that:
1. Defines ${criteriaCount} clear, measurable criteria
2. Provides 4-5 performance levels for each criterion
3. Includes specific descriptors for each level
4. Distributes points appropriately across criteria
5. Aligns with learning objectives
${request.includeSpiritual ? '6. Includes spiritual formation assessment' : ''}

Format as JSON with structure:
{
  "criteria": [
    {
      "name": "criterion name",
      "description": "what this measures",
      "maxPoints": 20,
      "levels": [
        {
          "level": "Excellent",
          "description": "specific descriptors",
          "points": 20
        },
        {
          "level": "Good",
          "description": "specific descriptors",
          "points": 15
        }
      ]
    }
  ],
  "gradingScale": {
    "type": "percentage",
    "ranges": [
      {"min": 90, "max": 100, "grade": "A"},
      {"min": 80, "max": 89, "grade": "B"}
    ]
  },
  "totalPoints": ${request.maxPoints}
}
    `.trim();
  }

  private buildFeedbackGenerationPrompt(request: FeedbackGenerationRequest): string {
    const tone = request.tone || 'balanced';

    return `
Generate comprehensive, ${tone} feedback for a student submission:

**Student ID:** ${request.studentId}
**Score:** ${request.gradingResult.score}/${request.gradingResult.maxPoints} (${request.gradingResult.percentage.toFixed(1)}%)

**Grading Results:**
${request.gradingResult.questionGrades.map(qg => `
Question ${qg.questionNumber}: ${qg.score}/${qg.maxPoints}
Feedback: ${qg.feedback}
`).join('\n')}

**Submission Content:**
${request.submissionContent.substring(0, 1500)}...

Provide feedback that:
1. Starts with affirmation and recognition of effort
2. Highlights specific strengths with examples
3. Identifies areas for improvement constructively
4. Offers concrete, actionable suggestions
5. Connects to learning objectives
6. Encourages continued growth
${request.includeSpiritual ? '7. Includes spiritual encouragement and biblical wisdom' : ''}

Tone: ${tone}
- Encouraging: Focus on growth and potential
- Constructive: Balance strengths with areas for improvement
- Balanced: Equal emphasis on affirmation and development

Keep feedback specific, actionable, and supportive.
    `.trim();
  }

  private formatRubric(rubric: GradingRubric): string {
    let formatted = 'Grading Criteria:\n\n';
    
    rubric.criteria.forEach((criterion, index) => {
      formatted += `${index + 1}. ${criterion.name} (${criterion.maxPoints} points)\n`;
      formatted += `   ${criterion.description}\n`;
      formatted += '   Levels:\n';
      criterion.levels.forEach(level => {
        formatted += `   - ${level.level}: ${level.description} (${level.points} points)\n`;
      });
      formatted += '\n';
    });

    return formatted;
  }

  private parseGeneratedExam(
    content: string,
    request: ExamGenerationRequest
  ): GeneratedExam {
    try {
      const parsed = JSON.parse(content);
      
      const questions: ExamQuestion[] = (parsed.questions || []).map((q: any, index: number) => ({
        id: `q${index + 1}`,
        questionNumber: q.questionNumber || index + 1,
        type: q.type || 'short_answer',
        question: q.question || '',
        points: q.points || 10,
        difficulty: q.difficulty || request.difficulty,
        learningObjective: q.learningObjective || '',
        bloomLevel: q.bloomLevel || 'understand',
        options: q.options,
        correctAnswer: q.correctAnswer,
        rubric: q.rubric,
        hint: q.hint
      }));

      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

      const exam: GeneratedExam = {
        id: `exam-${Date.now()}`,
        examType: request.examType,
        difficulty: request.difficulty,
        questions,
        rubric: {
          criteria: [],
          gradingScale: {
            type: 'percentage',
            ranges: [
              { min: 90, max: 100, grade: 'A' },
              { min: 80, max: 89, grade: 'B' },
              { min: 70, max: 79, grade: 'C' },
              { min: 60, max: 69, grade: 'D' },
              { min: 0, max: 59, grade: 'F' }
            ]
          },
          totalPoints
        },
        instructions: parsed.instructions || 'Complete all questions to the best of your ability.',
        timeLimit: request.timeLimit,
        totalPoints,
        estimatedDuration: parsed.estimatedDuration || request.timeLimit || 60,
        metadata: {
          generatedAt: new Date(),
          generatedBy: 'ScrollExaminer-AI',
          version: '1.0',
          alignmentScore: 0.85,
          reviewStatus: 'draft'
        }
      };

      if (request.includeSpiritual && parsed.spiritualIntegration) {
        exam.spiritualIntegration = parsed.spiritualIntegration;
      }

      return exam;
    } catch (error) {
      logger.error('Error parsing generated exam', { error });
      
      // Return minimal exam structure
      return {
        id: `exam-${Date.now()}`,
        examType: request.examType,
        difficulty: request.difficulty,
        questions: [],
        rubric: {
          criteria: [],
          gradingScale: {
            type: 'percentage',
            ranges: []
          },
          totalPoints: 0
        },
        instructions: 'Exam generation failed - please review',
        totalPoints: 0,
        estimatedDuration: 60,
        metadata: {
          generatedAt: new Date(),
          generatedBy: 'ScrollExaminer-AI',
          version: '1.0',
          alignmentScore: 0,
          reviewStatus: 'draft'
        }
      };
    }
  }

  private parseGradingResult(
    content: string,
    request: AutomatedGradingRequest
  ): GradingResult {
    try {
      const parsed = JSON.parse(content);
      
      const questionGrades: QuestionGrade[] = (parsed.questionGrades || []).map((qg: any) => ({
        questionId: qg.questionId || '',
        questionNumber: qg.questionNumber || 0,
        score: qg.score || 0,
        maxPoints: qg.maxPoints || 0,
        feedback: qg.feedback || '',
        confidence: qg.confidence || 0.75,
        correctAnswer: qg.correctAnswer,
        studentAnswer: qg.studentAnswer || ''
      }));

      const totalScore = questionGrades.reduce((sum, qg) => sum + qg.score, 0);
      const maxPoints = questionGrades.reduce((sum, qg) => sum + qg.maxPoints, 0);
      const percentage = maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0;

      const detailedFeedback: DetailedFeedback[] = (parsed.detailedFeedback || []).map((df: any) => ({
        section: df.section || 'General',
        comment: df.comment || '',
        type: df.type || 'suggestion',
        spiritualInsight: df.spiritualInsight
      }));

      return {
        submissionId: request.submissionId,
        studentId: request.studentId,
        examId: request.examId,
        score: totalScore,
        maxPoints,
        percentage,
        letterGrade: this.calculateLetterGrade(percentage),
        confidenceScore: parsed.confidenceScore || 0.85,
        needsHumanReview: false, // Will be determined separately
        questionGrades,
        overallFeedback: parsed.overallFeedback || '',
        detailedFeedback,
        gradedAt: new Date(),
        gradedBy: 'ScrollExaminer-AI'
      };
    } catch (error) {
      logger.error('Error parsing grading result', { error });
      
      // Return minimal grading result
      return {
        submissionId: request.submissionId,
        studentId: request.studentId,
        examId: request.examId,
        score: 0,
        maxPoints: 0,
        percentage: 0,
        confidenceScore: 0,
        needsHumanReview: true,
        questionGrades: [],
        overallFeedback: 'Grading failed - requires human review',
        detailedFeedback: [],
        gradedAt: new Date(),
        gradedBy: 'ScrollExaminer-AI',
        reviewReason: 'Parsing error'
      };
    }
  }

  private parseRubric(
    content: string,
    request: RubricGenerationRequest
  ): GradingRubric {
    try {
      const parsed = JSON.parse(content);
      
      return {
        criteria: parsed.criteria || [],
        gradingScale: parsed.gradingScale || {
          type: 'percentage',
          ranges: [
            { min: 90, max: 100, grade: 'A' },
            { min: 80, max: 89, grade: 'B' },
            { min: 70, max: 79, grade: 'C' },
            { min: 60, max: 69, grade: 'D' },
            { min: 0, max: 59, grade: 'F' }
          ]
        },
        totalPoints: parsed.totalPoints || request.maxPoints
      };
    } catch (error) {
      logger.error('Error parsing rubric', { error });
      
      // Return default rubric
      return {
        criteria: [],
        gradingScale: {
          type: 'percentage',
          ranges: []
        },
        totalPoints: request.maxPoints
      };
    }
  }

  private calculateLetterGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(
    result: GradingResult,
    request: AutomatedGradingRequest
  ): number {
    let confidence = 1.0;

    // Factor 1: Average question confidence
    if (result.questionGrades.length > 0) {
      const avgQuestionConfidence = result.questionGrades.reduce(
        (sum, qg) => sum + qg.confidence,
        0
      ) / result.questionGrades.length;
      confidence *= avgQuestionConfidence;
    }

    // Factor 2: Score distribution (extreme scores may need review)
    if (result.percentage < 20 || result.percentage > 95) {
      confidence *= 0.85;
    }

    // Factor 3: Number of questions (more questions = more confidence)
    if (result.questionGrades.length >= 10) {
      confidence *= 1.0;
    } else if (result.questionGrades.length >= 5) {
      confidence *= 0.95;
    } else {
      confidence *= 0.85;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Determine if submission should be flagged for human review
   * 
   * Property 8: AI Grading Confidence Threshold
   * Validates: Requirements 3.4
   */
  private shouldFlagForHumanReview(result: GradingResult): boolean {
    // Flag if confidence is below threshold
    if (result.confidenceScore < this.CONFIDENCE_THRESHOLD) {
      return true;
    }

    // Flag if any individual question has low confidence
    const hasLowConfidenceQuestion = result.questionGrades.some(
      qg => qg.confidence < this.CONFIDENCE_THRESHOLD
    );
    if (hasLowConfidenceQuestion) {
      return true;
    }

    // Flag extreme scores (very low or very high)
    if (result.percentage < 20 || result.percentage > 95) {
      return true;
    }

    // Flag if score is near grade boundaries
    const isNearBoundary = this.isNearGradeBoundary(result.percentage);
    if (isNearBoundary) {
      return true;
    }

    return false;
  }

  private isNearGradeBoundary(percentage: number): boolean {
    const boundaries = [60, 70, 80, 90]; // Common grade boundaries
    const threshold = 2; // Within 2% of boundary

    return boundaries.some(boundary => 
      Math.abs(percentage - boundary) <= threshold
    );
  }

  private getReviewReason(result: GradingResult): string {
    const reasons: string[] = [];

    if (result.confidenceScore < this.CONFIDENCE_THRESHOLD) {
      reasons.push(`Low overall confidence (${(result.confidenceScore * 100).toFixed(1)}%)`);
    }

    const lowConfidenceQuestions = result.questionGrades.filter(
      qg => qg.confidence < this.CONFIDENCE_THRESHOLD
    );
    if (lowConfidenceQuestions.length > 0) {
      reasons.push(`Low confidence in ${lowConfidenceQuestions.length} question(s)`);
    }

    if (result.percentage < 20) {
      reasons.push('Very low score - verify accuracy');
    }

    if (result.percentage > 95) {
      reasons.push('Very high score - verify accuracy');
    }

    if (this.isNearGradeBoundary(result.percentage)) {
      reasons.push('Score near grade boundary');
    }

    return reasons.join('; ');
  }
}

export default ScrollExaminerAgent;
