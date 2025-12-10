/**
 * Prophetic Reasoning Evaluation Engine
 * "Test everything; hold fast what is good" - 1 Thessalonians 5:21
 * 
 * Assesses logical consistency combined with spiritual alignment
 * Implements Requirements: 1.1, 1.2, 1.3, 8.1
 */

import { Evidence, ReasoningSubmission } from '../types/critical-thinking.types';
import { logger } from '../utils/logger';
import AIGatewayService from './AIGatewayService';

export interface LogicalAnalysis {
  structureScore: number;
  coherenceScore: number;
  premisesValid: boolean;
  conclusionSupported: boolean;
  logicalFallacies: string[];
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface SpiritualAnalysis {
  scripturalAlignment: number;
  propheticInsight: number;
  kingdomFocus: number;
  loveAndTruthBalance: number;
  spiritualDepth: number;
  scripturalReferences: string[];
  spiritualStrengths: string[];
  spiritualGrowthAreas: string[];
}

export interface EvidenceAnalysis {
  overallQuality: number;
  credibilityScore: number;
  diversityScore: number;
  relevanceScore: number;
  spiritualRootExamination: number;
  evidenceStrengths: string[];
  evidenceWeaknesses: string[];
  recommendedSources: string[];
}

export interface NarrativeChallengeResult {
  narrativeIdentified: string;
  assumptionsUncovered: string[];
  counterNarratives: string[];
  loveAndTruthMaintained: boolean;
  challengeQuality: number;
  feedback: string;
}

export default class PropheticReasoningEngine {
  private aiGateway: typeof AIGatewayService;

  constructor() {
    this.aiGateway = AIGatewayService;
  }

  /**
   * Evaluate logical consistency of an argument
   */
  async evaluateLogicalConsistency(submission: ReasoningSubmission): Promise<LogicalAnalysis> {
    try {
      logger.info('Evaluating logical consistency', { submissionId: submission.id });

      const prompt = `Analyze the following argument for logical consistency:

Argument: ${submission.argument}

Evaluate:
1. Logical structure and organization (0-100)
2. Coherence and flow (0-100)
3. Are the premises valid?
4. Is the conclusion properly supported?
5. Identify any logical fallacies
6. Identify strength areas
7. Identify areas for improvement

Provide a detailed analysis in JSON format.`;

      const response = await this.aiGateway.generateCompletion({
        prompt,
        systemPrompt: 'You are an expert in logic, critical thinking, and philosophical reasoning. Analyze arguments with precision and clarity.',
        temperature: 0.3,
        maxTokens: 1500
      });

      const analysis = this.parseLogicalAnalysis(response.content);

      logger.info('Logical consistency evaluation complete', {
        submissionId: submission.id,
        structureScore: analysis.structureScore
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to evaluate logical consistency', {
        error: errorMessage,
        submissionId: submission.id
      });
      throw new Error(`Logical consistency evaluation failed: ${errorMessage}`);
    }
  }

  /**
   * Evaluate spiritual alignment of reasoning
   */
  async evaluateSpiritualAlignment(submission: ReasoningSubmission): Promise<SpiritualAnalysis> {
    try {
      logger.info('Evaluating spiritual alignment', { submissionId: submission.id });

      const prompt = `Evaluate the spiritual alignment of this reasoning:

Argument: ${submission.argument}

Assess:
1. Scriptural alignment (0-100)
2. Prophetic insight depth (0-100)
3. Kingdom focus (0-100)
4. Balance of love and truth (0-100)
5. Overall spiritual depth (0-100)
6. Relevant scriptural references
7. Spiritual strengths
8. Areas for spiritual growth

Provide analysis in JSON format with biblical grounding.`;

      const response = await this.aiGateway.generateCompletion({
        prompt,
        systemPrompt: 'You are a theologian and spiritual director. Evaluate reasoning through the lens of Scripture, the Holy Spirit, and kingdom principles. Always maintain love and truth in balance.',
        temperature: 0.4,
        maxTokens: 1500
      });

      const analysis = this.parseSpiritualAnalysis(response.content);

      logger.info('Spiritual alignment evaluation complete', {
        submissionId: submission.id,
        scripturalAlignment: analysis.scripturalAlignment
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to evaluate spiritual alignment', {
        error: errorMessage,
        submissionId: submission.id
      });
      throw new Error(`Spiritual alignment evaluation failed: ${errorMessage}`);
    }
  }

  /**
   * Analyze quality and credibility of evidence
   */
  async analyzeEvidence(evidence: Evidence[]): Promise<EvidenceAnalysis> {
    try {
      logger.info('Analyzing evidence', { evidenceCount: evidence.length });

      const evidenceSummary = evidence.map(e => ({
        source: e.source,
        type: e.type,
        content: e.content.substring(0, 200)
      }));

      const prompt = `Analyze the quality and credibility of this evidence:

Evidence: ${JSON.stringify(evidenceSummary, null, 2)}

Evaluate:
1. Overall quality (0-100)
2. Credibility score (0-100)
3. Diversity of sources (0-100)
4. Relevance to argument (0-100)
5. Spiritual root examination (0-100)
6. Evidence strengths
7. Evidence weaknesses
8. Recommended additional sources

Provide comprehensive analysis in JSON format.`;

      const response = await this.aiGateway.generateCompletion({
        prompt,
        systemPrompt: 'You are an expert in research methodology, source evaluation, and evidence analysis. Assess evidence with academic rigor and spiritual discernment.',
        temperature: 0.3,
        maxTokens: 1500
      });

      const analysis = this.parseEvidenceAnalysis(response.content);

      logger.info('Evidence analysis complete', {
        evidenceCount: evidence.length,
        overallQuality: analysis.overallQuality
      });

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to analyze evidence', {
        error: errorMessage,
        evidenceCount: evidence.length
      });
      throw new Error(`Evidence analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Challenge dominant narratives with love and truth
   */
  async challengeNarrative(
    narrative: string,
    context: string
  ): Promise<NarrativeChallengeResult> {
    try {
      logger.info('Challenging narrative', { narrative: narrative.substring(0, 50) });

      const prompt = `Challenge this dominant narrative with love and truth:

Narrative: ${narrative}
Context: ${context}

Provide:
1. Identify the core narrative
2. Uncover hidden assumptions
3. Present counter-narratives grounded in truth
4. Ensure love and truth are maintained
5. Rate the quality of the challenge (0-100)
6. Provide constructive feedback

Respond in JSON format with biblical wisdom and prophetic insight.`;

      const response = await this.aiGateway.generateCompletion({
        prompt,
        systemPrompt: 'You are a prophetic voice speaking truth in love. Challenge narratives with wisdom, discernment, and grace. Always maintain the balance of love and truth as Jesus did.',
        temperature: 0.5,
        maxTokens: 2000
      });

      const result = this.parseNarrativeChallengeResult(response.content);

      logger.info('Narrative challenge complete', {
        challengeQuality: result.challengeQuality,
        loveAndTruthMaintained: result.loveAndTruthMaintained
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to challenge narrative', {
        error: errorMessage,
        narrative: narrative.substring(0, 50)
      });
      throw new Error(`Narrative challenge failed: ${errorMessage}`);
    }
  }

  /**
   * Parse logical analysis from AI response
   */
  private parseLogicalAnalysis(content: string): LogicalAnalysis {
    try {
      const parsed = JSON.parse(content);
      return {
        structureScore: parsed.structureScore || 0,
        coherenceScore: parsed.coherenceScore || 0,
        premisesValid: parsed.premisesValid || false,
        conclusionSupported: parsed.conclusionSupported || false,
        logicalFallacies: parsed.logicalFallacies || [],
        strengthAreas: parsed.strengthAreas || [],
        improvementAreas: parsed.improvementAreas || []
      };
    } catch (error) {
      logger.warn('Failed to parse logical analysis, using defaults', { error });
      return {
        structureScore: 50,
        coherenceScore: 50,
        premisesValid: false,
        conclusionSupported: false,
        logicalFallacies: ['Unable to parse analysis'],
        strengthAreas: [],
        improvementAreas: ['Resubmit for detailed analysis']
      };
    }
  }

  /**
   * Parse spiritual analysis from AI response
   */
  private parseSpiritualAnalysis(content: string): SpiritualAnalysis {
    try {
      const parsed = JSON.parse(content);
      return {
        scripturalAlignment: parsed.scripturalAlignment || 0,
        propheticInsight: parsed.propheticInsight || 0,
        kingdomFocus: parsed.kingdomFocus || 0,
        loveAndTruthBalance: parsed.loveAndTruthBalance || 0,
        spiritualDepth: parsed.spiritualDepth || 0,
        scripturalReferences: parsed.scripturalReferences || [],
        spiritualStrengths: parsed.spiritualStrengths || [],
        spiritualGrowthAreas: parsed.spiritualGrowthAreas || []
      };
    } catch (error) {
      logger.warn('Failed to parse spiritual analysis, using defaults', { error });
      return {
        scripturalAlignment: 50,
        propheticInsight: 50,
        kingdomFocus: 50,
        loveAndTruthBalance: 50,
        spiritualDepth: 50,
        scripturalReferences: [],
        spiritualStrengths: [],
        spiritualGrowthAreas: ['Seek deeper spiritual understanding']
      };
    }
  }

  /**
   * Parse evidence analysis from AI response
   */
  private parseEvidenceAnalysis(content: string): EvidenceAnalysis {
    try {
      const parsed = JSON.parse(content);
      return {
        overallQuality: parsed.overallQuality || 0,
        credibilityScore: parsed.credibilityScore || 0,
        diversityScore: parsed.diversityScore || 0,
        relevanceScore: parsed.relevanceScore || 0,
        spiritualRootExamination: parsed.spiritualRootExamination || 0,
        evidenceStrengths: parsed.evidenceStrengths || [],
        evidenceWeaknesses: parsed.evidenceWeaknesses || [],
        recommendedSources: parsed.recommendedSources || []
      };
    } catch (error) {
      logger.warn('Failed to parse evidence analysis, using defaults', { error });
      return {
        overallQuality: 50,
        credibilityScore: 50,
        diversityScore: 50,
        relevanceScore: 50,
        spiritualRootExamination: 50,
        evidenceStrengths: [],
        evidenceWeaknesses: ['Unable to parse analysis'],
        recommendedSources: []
      };
    }
  }

  /**
   * Parse narrative challenge result from AI response
   */
  private parseNarrativeChallengeResult(content: string): NarrativeChallengeResult {
    try {
      const parsed = JSON.parse(content);
      return {
        narrativeIdentified: parsed.narrativeIdentified || 'Unknown narrative',
        assumptionsUncovered: parsed.assumptionsUncovered || [],
        counterNarratives: parsed.counterNarratives || [],
        loveAndTruthMaintained: parsed.loveAndTruthMaintained !== false,
        challengeQuality: parsed.challengeQuality || 0,
        feedback: parsed.feedback || 'No feedback available'
      };
    } catch (error) {
      logger.warn('Failed to parse narrative challenge result, using defaults', { error });
      return {
        narrativeIdentified: 'Unable to identify narrative',
        assumptionsUncovered: [],
        counterNarratives: [],
        loveAndTruthMaintained: true,
        challengeQuality: 0,
        feedback: 'Analysis failed, please try again'
      };
    }
  }
}
  async evaluateLogicalConsistency(
    argument: string,
    evidence: Evidence[]
  ): Promise<LogicalAnalysis> {
    try {
      logger.info('Evaluating logical consistency');

      // Analyze argument structure
      const structureScore = this.analyzeArgumentStructure(argument);
      
      // Analyze coherence
      const coherenceScore = this.analyzeCoherence(argument);
      
      // Validate premises
      const premisesValid = this.validatePremises(argument, evidence);
      
      // Check conclusion support
      const conclusionSupported = this.checkConclusionSupport(argument, evidence);
      
      // Detect logical fallacies
      const logicalFallacies = this.detectLogicalFallacies(argument);
      
      // Identify strengths
      const strengthAreas = this.identifyLogicalStrengths(argument, evidence);
      
      // Identify improvement areas
      const improvementAreas = this.identifyLogicalImprovements(
        structureScore,
        coherenceScore,
        premisesValid,
        conclusionSupported,
        logicalFallacies
      );

      return {
        structureScore,
        coherenceScore,
        premisesValid,
        conclusionSupported,
        logicalFallacies,
        strengthAreas,
        improvementAreas
      };
    } catch (error) {
      logger.error('Error evaluating logical consistency', { error });
      throw error;
    }
  }

  /**
   * Evaluate spiritual alignment of reasoning
   */
  async evaluateSpiritualAlignment(
    argument: string,
    spiritualInsights: string[]
  ): Promise<SpiritualAnalysis> {
    try {
      logger.info('Evaluating spiritual alignment');

      // Assess scriptural alignment
      const scripturalAlignment = this.assessScripturalAlignment(argument);
      
      // Assess prophetic insight
      const propheticInsight = this.assessPropheticInsight(spiritualInsights);
      
      // Assess kingdom focus
      const kingdomFocus = this.assessKingdomFocus(argument);
      
      // Assess love and truth balance
      const loveAndTruthBalance = this.assessLoveAndTruthBalance(argument);
      
      // Assess spiritual depth
      const spiritualDepth = this.assessSpiritualDepth(argument, spiritualInsights);
      
      // Extract scriptural references
      const scripturalReferences = this.extractScripturalReferences(argument);
      
      // Identify spiritual strengths
      const spiritualStrengths = this.identifySpiritualStrengths(
        scripturalAlignment,
        propheticInsight,
        kingdomFocus,
        loveAndTruthBalance
      );
      
      // Identify growth areas
      const spiritualGrowthAreas = this.identifySpiritualGrowthAreas(
        scripturalAlignment,
        propheticInsight,
        kingdomFocus,
        loveAndTruthBalance,
        spiritualDepth
      );

      return {
        scripturalAlignment,
        propheticInsight,
        kingdomFocus,
        loveAndTruthBalance,
        spiritualDepth,
        scripturalReferences,
        spiritualStrengths,
        spiritualGrowthAreas
      };
    } catch (error) {
      logger.error('Error evaluating spiritual alignment', { error });
      throw error;
    }
  }

  /**
   * Evaluate evidence quality examining both data and spiritual roots
   */
  async evaluateEvidence(evidence: Evidence[]): Promise<EvidenceAnalysis> {
    try {
      logger.info('Evaluating evidence quality', { evidenceCount: evidence.length });

      if (evidence.length === 0) {
        return {
          overallQuality: 0.2,
          credibilityScore: 0,
          diversityScore: 0,
          relevanceScore: 0,
          spiritualRootExamination: 0,
          evidenceStrengths: [],
          evidenceWeaknesses: ['No evidence provided'],
          recommendedSources: this.getRecommendedSources()
        };
      }

      // Calculate credibility score
      const credibilityScore = this.calculateCredibilityScore(evidence);
      
      // Calculate diversity score
      const diversityScore = this.calculateDiversityScore(evidence);
      
      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(evidence);
      
      // Examine spiritual roots
      const spiritualRootExamination = this.examineSpiritualRoots(evidence);
      
      // Calculate overall quality
      const overallQuality = (
        credibilityScore * 0.3 +
        diversityScore * 0.2 +
        relevanceScore * 0.2 +
        spiritualRootExamination * 0.3
      );
      
      // Identify strengths
      const evidenceStrengths = this.identifyEvidenceStrengths(
        credibilityScore,
        diversityScore,
        relevanceScore,
        spiritualRootExamination
      );
      
      // Identify weaknesses
      const evidenceWeaknesses = this.identifyEvidenceWeaknesses(
        credibilityScore,
        diversityScore,
        relevanceScore,
        spiritualRootExamination
      );
      
      // Get recommended sources
      const recommendedSources = this.getRecommendedSources();

      return {
        overallQuality,
        credibilityScore,
        diversityScore,
        relevanceScore,
        spiritualRootExamination,
        evidenceStrengths,
        evidenceWeaknesses,
        recommendedSources
      };
    } catch (error) {
      logger.error('Error evaluating evidence', { error });
      throw error;
    }
  }

  /**
   * Evaluate narrative challenge - questioning while maintaining love and truth
   */
  async evaluateNarrativeChallenge(
    originalNarrative: string,
    challenge: string,
    evidence: Evidence[]
  ): Promise<NarrativeChallengeResult> {
    try {
      logger.info('Evaluating narrative challenge');

      // Identify the narrative being challenged
      const narrativeIdentified = this.identifyNarrative(originalNarrative);
      
      // Uncover assumptions
      const assumptionsUncovered = this.uncoverAssumptions(originalNarrative, challenge);
      
      // Identify counter-narratives
      const counterNarratives = this.identifyCounterNarratives(challenge);
      
      // Check if love and truth are maintained
      const loveAndTruthMaintained = this.checkLoveAndTruthMaintained(challenge);
      
      // Calculate challenge quality
      const challengeQuality = this.calculateChallengeQuality(
        assumptionsUncovered,
        counterNarratives,
        evidence,
        loveAndTruthMaintained
      );
      
      // Generate feedback
      const feedback = this.generateNarrativeChallengeFeedback(
        assumptionsUncovered,
        counterNarratives,
        loveAndTruthMaintained,
        challengeQuality
      );

      return {
        narrativeIdentified,
        assumptionsUncovered,
        counterNarratives,
        loveAndTruthMaintained,
        challengeQuality,
        feedback
      };
    } catch (error) {
      logger.error('Error evaluating narrative challenge', { error });
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods - Logical Analysis
  // ============================================================================

  private analyzeArgumentStructure(argument: string): number {
    let score = 0.4; // Base score

    // Check for introduction/thesis
    const hasThesis = /^.{0,200}(argue|propose|suggest|claim|assert|contend)/i.test(argument);
    if (hasThesis) score += 0.15;

    // Check for supporting points
    const supportingPoints = argument.match(/firstly|secondly|thirdly|furthermore|moreover|additionally/gi);
    if (supportingPoints && supportingPoints.length >= 2) score += 0.15;

    // Check for logical connectors
    const logicalConnectors = argument.match(/therefore|thus|hence|consequently|because|since|as a result/gi);
    if (logicalConnectors && logicalConnectors.length >= 2) score += 0.15;

    // Check for conclusion
    const hasConclusion = /in conclusion|to conclude|in summary|therefore|thus/i.test(argument);
    if (hasConclusion) score += 0.15;

    return Math.min(score, 1.0);
  }

  private analyzeCoherence(argument: string): number {
    const sentences = argument.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 3) return 0.3;

    let coherenceScore = 0.5;

    // Check for consistent topic
    const words = argument.toLowerCase().split(/\s+/);
    const wordFrequency = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 4) {
        wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
      }
    });

    const repeatedKeywords = Array.from(wordFrequency.values()).filter(count => count >= 3);
    if (repeatedKeywords.length >= 2) coherenceScore += 0.2;

    // Check for transitions
    const transitions = argument.match(/however|nevertheless|on the other hand|in contrast|similarly|likewise/gi);
    if (transitions && transitions.length >= 1) coherenceScore += 0.15;

    // Check for consistent tone
    const hasConsistentTone = !(/\?.*!|!.*\?/.test(argument));
    if (hasConsistentTone) coherenceScore += 0.15;

    return Math.min(coherenceScore, 1.0);
  }

  private validatePremises(argument: string, evidence: Evidence[]): boolean {
    // Check if argument has clear premises
    const hasPremises = /because|since|given that|assuming|if we accept/i.test(argument);
    
    // Check if premises are supported by evidence
    const hasEvidenceSupport = evidence.length > 0 && evidence.some(e => e.credibility > 0.6);
    
    return hasPremises && hasEvidenceSupport;
  }

  private checkConclusionSupport(argument: string, evidence: Evidence[]): boolean {
    // Check if argument has a conclusion
    const hasConclusion = /therefore|thus|hence|in conclusion|consequently/i.test(argument);
    
    // Check if conclusion follows from premises
    const sentences = argument.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const hasLogicalFlow = sentences.length >= 3;
    
    // Check if evidence supports conclusion
    const evidenceSupportsConclusion = evidence.length >= 2;
    
    return hasConclusion && hasLogicalFlow && evidenceSupportsConclusion;
  }

  private detectLogicalFallacies(argument: string): string[] {
    const fallacies: string[] = [];

    // Ad hominem
    if (/stupid|idiot|fool|ignorant person|moron/i.test(argument)) {
      fallacies.push('Ad hominem: Attacking the person rather than the argument');
    }

    // Straw man
    if (/they claim|they say.*but actually/i.test(argument)) {
      fallacies.push('Possible straw man: Misrepresenting opponent\'s position');
    }

    // False dichotomy
    if (/either.*or|only two options|must choose/i.test(argument)) {
      fallacies.push('Possible false dichotomy: Presenting only two options when more exist');
    }

    // Appeal to authority
    if (/expert says|authority claims|famous.*said/i.test(argument) && !/evidence|data|research/i.test(argument)) {
      fallacies.push('Appeal to authority without evidence');
    }

    // Circular reasoning
    const sentences = argument.toLowerCase().split(/[.!?]+/);
    for (let i = 0; i < sentences.length - 1; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        if (sentences[i].trim() === sentences[j].trim() && sentences[i].trim().length > 20) {
          fallacies.push('Circular reasoning: Conclusion restates premise');
          break;
        }
      }
    }

    return fallacies;
  }

  private identifyLogicalStrengths(argument: string, evidence: Evidence[]): string[] {
    const strengths: string[] = [];

    if (this.analyzeArgumentStructure(argument) > 0.7) {
      strengths.push('Well-structured argument with clear thesis and conclusion');
    }

    if (evidence.length >= 3) {
      strengths.push('Multiple sources of evidence provided');
    }

    if (/data|statistics|research|study|experiment/i.test(argument)) {
      strengths.push('Incorporates empirical evidence');
    }

    if (/however|nevertheless|although|while/i.test(argument)) {
      strengths.push('Acknowledges counterarguments or complexity');
    }

    return strengths;
  }

  private identifyLogicalImprovements(
    structureScore: number,
    coherenceScore: number,
    premisesValid: boolean,
    conclusionSupported: boolean,
    logicalFallacies: string[]
  ): string[] {
    const improvements: string[] = [];

    if (structureScore < 0.6) {
      improvements.push('Strengthen argument structure with clearer thesis and conclusion');
    }

    if (coherenceScore < 0.6) {
      improvements.push('Improve coherence with better transitions and consistent focus');
    }

    if (!premisesValid) {
      improvements.push('Provide clearer premises supported by evidence');
    }

    if (!conclusionSupported) {
      improvements.push('Ensure conclusion logically follows from premises');
    }

    if (logicalFallacies.length > 0) {
      improvements.push(`Address logical fallacies: ${logicalFallacies.join('; ')}`);
    }

    return improvements;
  }

  // ============================================================================
  // Private Helper Methods - Spiritual Analysis
  // ============================================================================

  private assessScripturalAlignment(argument: string): number {
    let score = 0.3; // Base score

    // Check for biblical references
    const biblicalBooks = /genesis|exodus|leviticus|numbers|deuteronomy|joshua|judges|ruth|samuel|kings|chronicles|ezra|nehemiah|esther|job|psalm|proverbs|ecclesiastes|song of solomon|isaiah|jeremiah|lamentations|ezekiel|daniel|hosea|joel|amos|obadiah|jonah|micah|nahum|habakkuk|zephaniah|haggai|zechariah|malachi|matthew|mark|luke|john|acts|romans|corinthians|galatians|ephesians|philippians|colossians|thessalonians|timothy|titus|philemon|hebrews|james|peter|jude|revelation/i;
    
    if (biblicalBooks.test(argument)) score += 0.2;

    // Check for biblical concepts
    const biblicalConcepts = /kingdom|gospel|grace|faith|righteousness|holiness|redemption|salvation|covenant|mercy|justice|love|truth|wisdom|discernment/i;
    const conceptMatches = argument.match(biblicalConcepts);
    if (conceptMatches && conceptMatches.length >= 2) score += 0.2;

    // Check for scriptural principles
    const principles = /love your neighbor|seek first the kingdom|do unto others|faith without works|speaking truth in love|be transformed|renew your mind/i;
    if (principles.test(argument)) score += 0.3;

    return Math.min(score, 1.0);
  }

  private assessPropheticInsight(spiritualInsights: string[]): number {
    if (spiritualInsights.length === 0) return 0.3;

    let score = 0.4;

    // Check depth of insights
    const avgLength = spiritualInsights.reduce((sum, insight) => sum + insight.length, 0) / spiritualInsights.length;
    if (avgLength > 100) score += 0.2;

    // Check for prophetic language
    const propheticTerms = /revelation|discernment|holy spirit|god is saying|prophetic word|spiritual insight|divine wisdom/i;
    const insightsWithPropheticTerms = spiritualInsights.filter(insight => propheticTerms.test(insight));
    score += (insightsWithPropheticTerms.length / spiritualInsights.length) * 0.4;

    return Math.min(score, 1.0);
  }

  private assessKingdomFocus(argument: string): number {
    let score = 0.3;

    const kingdomKeywords = /kingdom|transform|disciple|ministry|mission|gospel|great commission|make disciples|advance the kingdom/i;
    const matches = argument.match(kingdomKeywords);
    
    if (matches) {
      score += Math.min(matches.length * 0.15, 0.5);
    }

    // Check for kingdom impact language
    if (/impact|change|transform|influence|affect|reach/i.test(argument)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private assessLoveAndTruthBalance(argument: string): number {
    const hasLove = /love|compassion|mercy|grace|kindness|gentleness|patience/i.test(argument);
    const hasTruth = /truth|accurate|correct|right|biblical|scriptural|doctrine/i.test(argument);
    
    // Check for harsh language that might indicate lack of love
    const hasHarshness = /stupid|idiot|fool|ignorant|worthless|pathetic/i.test(argument);
    
    // Check for relativism that might indicate lack of truth
    const hasRelativism = /no absolute truth|truth is relative|everyone's truth|my truth/i.test(argument);

    if (hasLove && hasTruth && !hasHarshness && !hasRelativism) return 0.9;
    if (hasLove && hasTruth) return 0.7;
    if (hasLove || hasTruth) return 0.5;
    if (hasHarshness || hasRelativism) return 0.3;
    
    return 0.4;
  }

  private assessSpiritualDepth(argument: string, spiritualInsights: string[]): number {
    let score = 0.4;

    // Check for theological depth
    const theologicalTerms = /theology|doctrine|hermeneutics|exegesis|eschatology|soteriology|pneumatology|christology/i;
    if (theologicalTerms.test(argument)) score += 0.2;

    // Check for spiritual maturity indicators
    const maturityIndicators = /discernment|wisdom|understanding|insight|revelation|spiritual growth|maturity/i;
    if (maturityIndicators.test(argument)) score += 0.2;

    // Check spiritual insights depth
    if (spiritualInsights.length > 0) {
      const avgInsightLength = spiritualInsights.reduce((sum, insight) => sum + insight.length, 0) / spiritualInsights.length;
      if (avgInsightLength > 150) score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private extractScripturalReferences(argument: string): string[] {
    const references: string[] = [];

    // Match book chapter:verse patterns
    const pattern = /(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+:\d+(-\d+)?/gi;
    
    const matches = argument.match(pattern);
    if (matches) {
      references.push(...matches);
    }

    return references;
  }

  private identifySpiritualStrengths(
    scripturalAlignment: number,
    propheticInsight: number,
    kingdomFocus: number,
    loveAndTruthBalance: number
  ): string[] {
    const strengths: string[] = [];

    if (scripturalAlignment > 0.7) {
      strengths.push('Strong scriptural foundation with biblical references');
    }

    if (propheticInsight > 0.7) {
      strengths.push('Deep prophetic insights and spiritual discernment');
    }

    if (kingdomFocus > 0.7) {
      strengths.push('Clear kingdom focus and transformational vision');
    }

    if (loveAndTruthBalance > 0.7) {
      strengths.push('Excellent balance of love and truth (Ephesians 4:15)');
    }

    return strengths;
  }

  private identifySpiritualGrowthAreas(
    scripturalAlignment: number,
    propheticInsight: number,
    kingdomFocus: number,
    loveAndTruthBalance: number,
    spiritualDepth: number
  ): string[] {
    const growthAreas: string[] = [];

    if (scripturalAlignment < 0.6) {
      growthAreas.push('Strengthen scriptural foundation - study and reference more Scripture');
    }

    if (propheticInsight < 0.6) {
      growthAreas.push('Deepen prophetic insight through prayer and seeking the Holy Spirit');
    }

    if (kingdomFocus < 0.6) {
      growthAreas.push('Increase kingdom focus - connect reasoning to kingdom advancement');
    }

    if (loveAndTruthBalance < 0.6) {
      growthAreas.push('Balance love and truth more effectively (Ephesians 4:15)');
    }

    if (spiritualDepth < 0.6) {
      growthAreas.push('Develop spiritual depth through study, prayer, and meditation');
    }

    return growthAreas;
  }

  // ============================================================================
  // Private Helper Methods - Evidence Analysis
  // ============================================================================

  private calculateCredibilityScore(evidence: Evidence[]): number {
    const avgCredibility = evidence.reduce((sum, e) => sum + e.credibility, 0) / evidence.length;
    return avgCredibility;
  }

  private calculateDiversityScore(evidence: Evidence[]): number {
    const uniqueSources = new Set(evidence.map(e => e.source)).size;
    const uniqueTypes = new Set(evidence.map(e => e.type)).size;
    
    const sourceDiversity = uniqueSources / evidence.length;
    const typeDiversity = uniqueTypes / Math.min(evidence.length, 5); // Max 5 types expected
    
    return (sourceDiversity * 0.6 + typeDiversity * 0.4);
  }

  private calculateRelevanceScore(evidence: Evidence[]): number {
    // Check if evidence content is substantial
    const substantialEvidence = evidence.filter(e => e.content.length > 50);
    return substantialEvidence.length / evidence.length;
  }

  private examineSpiritualRoots(evidence: Evidence[]): number {
    const evidenceWithSpiritualAlignment = evidence.filter(e => e.spiritualAlignment > 0.5);
    
    if (evidence.length === 0) return 0;
    
    const avgSpiritualAlignment = evidenceWithSpiritualAlignment.reduce(
      (sum, e) => sum + e.spiritualAlignment, 
      0
    ) / evidence.length;
    
    return avgSpiritualAlignment;
  }

  private identifyEvidenceStrengths(
    credibilityScore: number,
    diversityScore: number,
    relevanceScore: number,
    spiritualRootExamination: number
  ): string[] {
    const strengths: string[] = [];

    if (credibilityScore > 0.7) {
      strengths.push('High-quality, credible sources');
    }

    if (diversityScore > 0.7) {
      strengths.push('Diverse range of evidence types and sources');
    }

    if (relevanceScore > 0.7) {
      strengths.push('Relevant and substantial evidence');
    }

    if (spiritualRootExamination > 0.7) {
      strengths.push('Evidence examined for spiritual roots and alignment');
    }

    return strengths;
  }

  private identifyEvidenceWeaknesses(
    credibilityScore: number,
    diversityScore: number,
    relevanceScore: number,
    spiritualRootExamination: number
  ): string[] {
    const weaknesses: string[] = [];

    if (credibilityScore < 0.6) {
      weaknesses.push('Improve source credibility - use more authoritative sources');
    }

    if (diversityScore < 0.6) {
      weaknesses.push('Increase evidence diversity - use multiple types and sources');
    }

    if (relevanceScore < 0.6) {
      weaknesses.push('Provide more substantial and relevant evidence');
    }

    if (spiritualRootExamination < 0.6) {
      weaknesses.push('Examine spiritual roots of evidence more thoroughly');
    }

    return weaknesses;
  }

  private getRecommendedSources(): string[] {
    return [
      'Peer-reviewed academic journals',
      'Reputable theological resources',
      'Primary source documents',
      'Scripture and biblical commentaries',
      'Expert interviews and testimonies',
      'Empirical research and data'
    ];
  }

  // ============================================================================
  // Private Helper Methods - Narrative Challenge
  // ============================================================================

  private identifyNarrative(originalNarrative: string): string {
    // Extract main claim or narrative
    const sentences = originalNarrative.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences[0] || 'Narrative not clearly identified';
  }

  private uncoverAssumptions(originalNarrative: string, challenge: string): string[] {
    const assumptions: string[] = [];

    // Look for assumption-revealing language in challenge
    const assumptionPatterns = [
      /assumes? that/i,
      /presupposes?/i,
      /takes? for granted/i,
      /without evidence/i,
      /unproven claim/i
    ];

    assumptionPatterns.forEach(pattern => {
      if (pattern.test(challenge)) {
        const match = challenge.match(new RegExp(`${pattern.source}[^.!?]*`, 'i'));
        if (match) {
          assumptions.push(match[0]);
        }
      }
    });

    // If no explicit assumptions found, note that
    if (assumptions.length === 0) {
      assumptions.push('No explicit assumptions identified in challenge');
    }

    return assumptions;
  }

  private identifyCounterNarratives(challenge: string): string[] {
    const counterNarratives: string[] = [];

    // Look for alternative explanations
    const alternativePatterns = [
      /alternatively/i,
      /another view/i,
      /different perspective/i,
      /counter.*argument/i,
      /on the other hand/i
    ];

    alternativePatterns.forEach(pattern => {
      if (pattern.test(challenge)) {
        const match = challenge.match(new RegExp(`${pattern.source}[^.!?]*[.!?]`, 'i'));
        if (match) {
          counterNarratives.push(match[0]);
        }
      }
    });

    return counterNarratives;
  }

  private checkLoveAndTruthMaintained(challenge: string): boolean {
    // Check for harsh or unloving language
    const harshLanguage = /stupid|idiot|fool|ignorant|worthless|pathetic|ridiculous|absurd/i;
    const hasHarshness = harshLanguage.test(challenge);

    // Check for respectful language
    const respectfulLanguage = /respectfully|with respect|consider|suggest|propose|humbly/i;
    const hasRespect = respectfulLanguage.test(challenge);

    // Check for truth-seeking language
    const truthSeeking = /truth|accurate|evidence|fact|reality|examine|investigate/i;
    const seeksTruth = truthSeeking.test(challenge);

    return !hasHarshness && (hasRespect || seeksTruth);
  }

  private calculateChallengeQuality(
    assumptionsUncovered: string[],
    counterNarratives: string[],
    evidence: Evidence[],
    loveAndTruthMaintained: boolean
  ): number {
    let score = 0.3; // Base score

    // Score for uncovering assumptions
    if (assumptionsUncovered.length > 0 && !assumptionsUncovered[0].includes('No explicit')) {
      score += 0.2;
    }

    // Score for counter-narratives
    if (counterNarratives.length > 0) {
      score += 0.2;
    }

    // Score for evidence support
    if (evidence.length >= 2) {
      score += 0.2;
    }

    // Score for maintaining love and truth
    if (loveAndTruthMaintained) {
      score += 0.3;
    } else {
      score -= 0.2; // Penalty for not maintaining love and truth
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  private generateNarrativeChallengeFeedback(
    assumptionsUncovered: string[],
    counterNarratives: string[],
    loveAndTruthMaintained: boolean,
    challengeQuality: number
  ): string {
    const feedback: string[] = [];

    if (challengeQuality > 0.7) {
      feedback.push('Excellent narrative challenge!');
    }

    if (assumptionsUncovered.length > 0 && !assumptionsUncovered[0].includes('No explicit')) {
      feedback.push('Good work uncovering underlying assumptions.');
    } else {
      feedback.push('Try to identify and articulate the assumptions behind the narrative.');
    }

    if (counterNarratives.length > 0) {
      feedback.push('Strong presentation of alternative perspectives.');
    } else {
      feedback.push('Consider presenting alternative narratives or explanations.');
    }

    if (loveAndTruthMaintained) {
      feedback.push('Excellent balance of love and truth in your challenge (Ephesians 4:15).');
    } else {
      feedback.push('Remember to maintain love and truth when challenging narratives (Ephesians 4:15).');
    }

    return feedback.join(' ');
  }
}
