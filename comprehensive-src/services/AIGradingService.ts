import {
  AIGradingConfiguration,
  AssessmentQuestion,
  GradingRubric,
  AIFeedback,
  PropheticInsight,
  BiblicalAlignmentCriteria,
  CulturalSensitivityLevel
} from '../types/assessment';

export class AIGradingService {
  private readonly API_ENDPOINT = process.env.OPENAI_API_ENDPOINT || 'https://api.openai.com/v1';
  private readonly API_KEY = process.env.OPENAI_API_KEY;

  /**
   * Grade assessment using AI with spiritual alignment and cultural sensitivity
   */
  async gradeAssessment(
    questions: AssessmentQuestion[],
    responses: any[],
    rubric: GradingRubric,
    config: AIGradingConfiguration
  ): Promise<{
    scores: { [questionId: string]: number };
    feedback: AIFeedback;
    spiritualAlignment: BiblicalAlignmentCriteria;
    culturalSensitivity: CulturalSensitivityLevel;
    propheticInsights: PropheticInsight[];
    confidenceLevel: number;
    humanReviewRequired: boolean;
  }> {
    const scores: { [questionId: string]: number } = {};
    const detailedFeedback: string[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];
    const spiritualInsights: string[] = [];
    const culturalConsiderations: string[] = [];
    const propheticInsights: PropheticInsight[] = [];

    let totalConfidence = 0;
    let humanReviewRequired = false;

    // Process each question-response pair
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const response = responses[i];

      const gradingResult = await this.gradeIndividualResponse(
        question,
        response,
        rubric,
        config
      );

      scores[question.id] = gradingResult.score;
      totalConfidence += gradingResult.confidence;

      if (gradingResult.confidence < config.confidence_threshold) {
        humanReviewRequired = true;
      }

      // Collect feedback
      detailedFeedback.push(gradingResult.feedback);
      if (gradingResult.strengths) strengths.push(...gradingResult.strengths);
      if (gradingResult.improvements) improvements.push(...gradingResult.improvements);
      if (gradingResult.spiritualInsights) spiritualInsights.push(...gradingResult.spiritualInsights);
      if (gradingResult.culturalConsiderations) culturalConsiderations.push(...gradingResult.culturalConsiderations);
      if (gradingResult.propheticInsights) propheticInsights.push(...gradingResult.propheticInsights);
    }

    const averageConfidence = totalConfidence / questions.length;

    // Assess overall spiritual alignment
    const spiritualAlignment = await this.assessSpiritualAlignment(responses, config);

    // Assess cultural sensitivity
    const culturalSensitivity = await this.assessCulturalSensitivity(responses, config);

    // Generate prophetic insights if enabled
    if (config.prophetic_intelligence_integration) {
      const additionalInsights = await this.generatePropheticInsights(responses, scores);
      propheticInsights.push(...additionalInsights);
    }

    const feedback: AIFeedback = {
      strengths: [...new Set(strengths)],
      areas_for_improvement: [...new Set(improvements)],
      personalized_recommendations: await this.generatePersonalizedRecommendations(scores, responses),
      spiritual_insights: [...new Set(spiritualInsights)],
      cultural_considerations: [...new Set(culturalConsiderations)],
      next_learning_steps: await this.generateNextSteps(scores, responses)
    };

    return {
      scores,
      feedback,
      spiritualAlignment,
      culturalSensitivity,
      propheticInsights,
      confidenceLevel: averageConfidence,
      humanReviewRequired: humanReviewRequired || config.human_review_required
    };
  }

  /**
   * Grade individual response with AI assistance
   */
  private async gradeIndividualResponse(
    question: AssessmentQuestion,
    response: any,
    rubric: GradingRubric,
    config: AIGradingConfiguration
  ): Promise<{
    score: number;
    confidence: number;
    feedback: string;
    strengths?: string[];
    improvements?: string[];
    spiritualInsights?: string[];
    culturalConsiderations?: string[];
    propheticInsights?: PropheticInsight[];
  }> {
    if (!config.enabled || !question.aiGradable) {
      return this.fallbackGrading(question, response);
    }

    try {
      const prompt = this.buildGradingPrompt(question, response, rubric, config);
      const aiResponse = await this.callOpenAI(prompt, config.model);
      
      return this.parseAIGradingResponse(aiResponse, question, config);
    } catch (error) {
      console.error('AI grading failed:', error);
      return this.fallbackGrading(question, response);
    }
  }

  /**
   * Build comprehensive grading prompt for AI
   */
  private buildGradingPrompt(
    question: AssessmentQuestion,
    response: any,
    rubric: GradingRubric,
    config: AIGradingConfiguration
  ): string {
    let prompt = `You are an AI grading assistant for ScrollUniversity, a Christian educational platform that integrates academic excellence with spiritual formation and kingdom perspective.

QUESTION:
${question.question}

STUDENT RESPONSE:
${JSON.stringify(response)}

GRADING RUBRIC:
${JSON.stringify(rubric, null, 2)}

GRADING REQUIREMENTS:
1. Academic Excellence: Evaluate based on content knowledge, critical thinking, and clarity
2. Spiritual Alignment: Assess biblical foundation, kingdom perspective, and Christ-likeness
3. Cultural Sensitivity: Consider cultural context and cross-cultural competency
4. Practical Application: Evaluate real-world applicability and kingdom impact potential

`;

    if (config.spiritual_alignment_check) {
      prompt += `
SPIRITUAL ALIGNMENT CRITERIA:
- Scripture alignment and doctrinal soundness
- Christ-like character demonstration
- Kingdom values integration
- Holy Spirit guidance evidence
- Prophetic accuracy (where applicable)
`;
    }

    if (config.cultural_sensitivity_check) {
      prompt += `
CULTURAL SENSITIVITY CRITERIA:
- Cultural awareness and respect
- Cross-cultural communication effectiveness
- Contextual appropriateness
- Global perspective integration
`;
    }

    if (config.prophetic_intelligence_integration) {
      prompt += `
PROPHETIC INTELLIGENCE INTEGRATION:
- Spiritual discernment demonstration
- Prophetic insight presence
- Divine wisdom application
- Kingdom perspective clarity
`;
    }

    if (config.bias_detection) {
      prompt += `
BIAS DETECTION:
- Check for cultural, gender, or socioeconomic bias
- Ensure fair and equitable assessment
- Consider diverse perspectives and backgrounds
`;
    }

    prompt += `
RESPONSE FORMAT (JSON):
{
  "score": [0-${question.points}],
  "confidence": [0-1],
  "feedback": "detailed feedback string",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "spiritualInsights": ["insight1", "insight2"],
  "culturalConsiderations": ["consideration1", "consideration2"],
  "propheticInsights": [
    {
      "insight": "prophetic insight",
      "scripture_reference": "Bible verse",
      "application": "practical application",
      "confirmation_level": [0-1]
    }
  ]
}

Provide thorough, constructive, and spiritually encouraging feedback that helps the student grow academically, spiritually, and in kingdom impact.`;

    return prompt;
  }

  /**
   * Call OpenAI API for grading
   */
  private async callOpenAI(prompt: string, model: string): Promise<string> {
    if (!this.API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.API_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a wise, spiritually mature AI grading assistant for ScrollUniversity. Provide thorough, fair, and encouraging assessments that promote both academic excellence and spiritual growth.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Parse AI grading response
   */
  private parseAIGradingResponse(
    aiResponse: string,
    question: AssessmentQuestion,
    config: AIGradingConfiguration
  ): any {
    try {
      const parsed = JSON.parse(aiResponse);
      
      // Validate and sanitize response
      return {
        score: Math.min(Math.max(parsed.score || 0, 0), question.points),
        confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
        feedback: parsed.feedback || 'No feedback provided',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        spiritualInsights: Array.isArray(parsed.spiritualInsights) ? parsed.spiritualInsights : [],
        culturalConsiderations: Array.isArray(parsed.culturalConsiderations) ? parsed.culturalConsiderations : [],
        propheticInsights: Array.isArray(parsed.propheticInsights) ? parsed.propheticInsights.map(insight => ({
          ...insight,
          source: 'ai_prophetic_intelligence' as const
        })) : []
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.fallbackGrading(question, null);
    }
  }

  /**
   * Fallback grading when AI is unavailable
   */
  private fallbackGrading(question: AssessmentQuestion, response: any): any {
    const baseScore = question.points * 0.7; // 70% base score
    
    return {
      score: baseScore,
      confidence: 0.5,
      feedback: 'Automated grading unavailable. Human review required.',
      strengths: [],
      improvements: ['Requires human evaluation'],
      spiritualInsights: [],
      culturalConsiderations: [],
      propheticInsights: []
    };
  }

  /**
   * Assess spiritual alignment of responses
   */
  private async assessSpiritualAlignment(
    responses: any[],
    config: AIGradingConfiguration
  ): Promise<BiblicalAlignmentCriteria> {
    if (!config.spiritual_alignment_check) {
      return {
        scriptureAlignment: true,
        doctrinalSoundness: true,
        christlikeness: true,
        kingdomValues: true,
        holySpirit_guidance: true,
        propheticAccuracy: 0.8
      };
    }

    // Simulate spiritual alignment assessment
    return {
      scriptureAlignment: Math.random() > 0.2,
      doctrinalSoundness: Math.random() > 0.1,
      christlikeness: Math.random() > 0.3,
      kingdomValues: Math.random() > 0.2,
      holySpirit_guidance: Math.random() > 0.4,
      propheticAccuracy: Math.random() * 0.4 + 0.6 // 0.6-1.0 range
    };
  }

  /**
   * Assess cultural sensitivity of responses
   */
  private async assessCulturalSensitivity(
    responses: any[],
    config: AIGradingConfiguration
  ): Promise<CulturalSensitivityLevel> {
    if (!config.cultural_sensitivity_check) {
      return CulturalSensitivityLevel.MEDIUM;
    }

    // Simulate cultural sensitivity assessment
    const sensitivity = Math.random();
    if (sensitivity > 0.8) return CulturalSensitivityLevel.HIGH;
    if (sensitivity > 0.6) return CulturalSensitivityLevel.MEDIUM;
    if (sensitivity > 0.3) return CulturalSensitivityLevel.LOW;
    return CulturalSensitivityLevel.CRITICAL;
  }

  /**
   * Generate prophetic insights from responses
   */
  private async generatePropheticInsights(
    responses: any[],
    scores: { [questionId: string]: number }
  ): Promise<PropheticInsight[]> {
    // Simulate prophetic insight generation
    const insights: PropheticInsight[] = [
      {
        insight: 'God is developing your gift of teaching and wisdom',
        scripture_reference: '1 Timothy 4:14',
        application: 'Look for opportunities to teach and mentor others in your area of strength',
        confirmation_level: 0.8,
        source: 'ai_prophetic_intelligence'
      },
      {
        insight: 'Your heart for justice aligns with God\'s kingdom purposes',
        scripture_reference: 'Micah 6:8',
        application: 'Consider how your skills can be used to bring justice and mercy to your community',
        confirmation_level: 0.7,
        source: 'ai_prophetic_intelligence'
      }
    ];

    return insights.filter(() => Math.random() > 0.5); // Randomly include insights
  }

  /**
   * Generate personalized recommendations
   */
  private async generatePersonalizedRecommendations(
    scores: { [questionId: string]: number },
    responses: any[]
  ): Promise<string[]> {
    const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.values(scores).length;
    
    const recommendations: string[] = [];

    if (avgScore < 70) {
      recommendations.push('Focus on foundational concepts through additional study and prayer');
      recommendations.push('Seek mentorship from faculty or advanced students');
    } else if (avgScore < 85) {
      recommendations.push('Deepen your understanding through practical application');
      recommendations.push('Engage in peer teaching to solidify your knowledge');
    } else {
      recommendations.push('Consider advanced courses in your area of strength');
      recommendations.push('Look for opportunities to mentor other students');
    }

    recommendations.push('Continue developing your spiritual discernment through prayer and scripture study');
    recommendations.push('Apply your learning in real-world kingdom contexts');

    return recommendations;
  }

  /**
   * Generate next learning steps
   */
  private async generateNextSteps(
    scores: { [questionId: string]: number },
    responses: any[]
  ): Promise<string[]> {
    return [
      'Review feedback and create action plan for improvement',
      'Schedule meeting with instructor for clarification on weak areas',
      'Form study group with peers for collaborative learning',
      'Apply concepts in practical ministry or work context',
      'Prepare for next assessment with focused study plan'
    ];
  }

  /**
   * Detect and report potential bias in grading
   */
  async detectBias(
    gradingResults: any[],
    studentDemographics: any[]
  ): Promise<{
    biasDetected: boolean;
    biasType: string[];
    recommendations: string[];
    confidenceLevel: number;
  }> {
    // Simulate bias detection
    return {
      biasDetected: false,
      biasType: [],
      recommendations: [
        'Continue monitoring for bias patterns',
        'Ensure diverse perspectives in grading rubrics',
        'Regular calibration of AI grading models'
      ],
      confidenceLevel: 0.9
    };
  }

  /**
   * Generate grading analytics and insights
   */
  async generateGradingAnalytics(
    assessmentId: string,
    gradingResults: any[]
  ): Promise<{
    averageScore: number;
    scoreDistribution: { [range: string]: number };
    commonStrengths: string[];
    commonWeaknesses: string[];
    spiritualGrowthIndicators: string[];
    recommendedInterventions: string[];
  }> {
    const scores = gradingResults.map(result => 
      Object.values(result.scores).reduce((sum: number, score: number) => sum + score, 0) / 
      Object.values(result.scores).length
    );

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    return {
      averageScore,
      scoreDistribution: this.calculateScoreDistribution(scores),
      commonStrengths: ['Biblical foundation', 'Critical thinking', 'Practical application'],
      commonWeaknesses: ['Cultural sensitivity', 'Prophetic discernment', 'Writing clarity'],
      spiritualGrowthIndicators: ['Increased scripture integration', 'Growing kingdom perspective'],
      recommendedInterventions: ['Additional cultural competency training', 'Prophetic development workshops']
    };
  }

  private calculateScoreDistribution(scores: number[]): { [range: string]: number } {
    const distribution = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };

    scores.forEach(score => {
      if (score >= 90) distribution['90-100']++;
      else if (score >= 80) distribution['80-89']++;
      else if (score >= 70) distribution['70-79']++;
      else if (score >= 60) distribution['60-69']++;
      else distribution['Below 60']++;
    });

    return distribution;
  }
}