/**
 * AI Ethics and Augmentation Service
 * Implements GPT hallucination detection, ethical AI usage guidelines, and truth alignment testing
 * Implements Requirements: 1.3, 5.4, 8.4
 */

import { logger } from '../utils/logger';

export interface HallucinationDetectionResult {
  isHallucination: boolean;
  confidence: number;
  hallucinationTypes: string[];
  corrections: string[];
  verifiedFacts: string[];
  unverifiedClaims: string[];
  recommendations: string[];
}

export interface BiasDetectionResult {
  biasDetected: boolean;
  biasTypes: string[];
  biasScore: number;
  affectedSections: string[];
  recommendations: string[];
}

export interface TruthAlignmentResult {
  alignmentScore: number;
  scripturalAlignment: number;
  factualAccuracy: number;
  logicalConsistency: number;
  ethicalSoundness: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export interface EthicalAIGuideline {
  id: string;
  category: string;
  guideline: string;
  rationale: string;
  examples: string[];
  violations: string[];
}

export interface AIAugmentationReport {
  aiToolUsed: string;
  purpose: string;
  outputQuality: number;
  humanOversight: boolean;
  ethicalCompliance: boolean;
  augmentationValue: number;
  concerns: string[];
  recommendations: string[];
}

export default class AIEthicsAugmentationService {
  /**
   * Detect GPT hallucinations in AI-generated content
   */
  async detectHallucinations(
    aiOutput: string,
    context: string,
    verifiableFacts: string[]
  ): Promise<HallucinationDetectionResult> {
    try {
      logger.info('Detecting AI hallucinations');

      // Check for common hallucination patterns
      const hallucinationTypes = this.identifyHallucinationTypes(aiOutput);
      
      // Verify facts against known information
      const { verifiedFacts, unverifiedClaims } = this.verifyFacts(aiOutput, verifiableFacts);
      
      // Generate corrections for hallucinations
      const corrections = this.generateCorrections(hallucinationTypes, unverifiedClaims);
      
      // Calculate confidence in hallucination detection
      const confidence = this.calculateDetectionConfidence(
        hallucinationTypes,
        unverifiedClaims,
        verifiedFacts
      );
      
      // Determine if output contains hallucinations
      const isHallucination = hallucinationTypes.length > 0 || unverifiedClaims.length > 2;
      
      // Generate recommendations
      const recommendations = this.generateHallucinationRecommendations(
        isHallucination,
        hallucinationTypes,
        unverifiedClaims
      );

      return {
        isHallucination,
        confidence,
        hallucinationTypes,
        corrections,
        verifiedFacts,
        unverifiedClaims,
        recommendations
      };
    } catch (error) {
      logger.error('Error detecting hallucinations', { error });
      throw error;
    }
  }

  /**
   * Detect bias in AI outputs
   */
  async detectBias(aiOutput: string, context: string): Promise<BiasDetectionResult> {
    try {
      logger.info('Detecting AI bias');

      // Identify bias types
      const biasTypes = this.identifyBiasTypes(aiOutput);
      
      // Calculate bias score
      const biasScore = this.calculateBiasScore(biasTypes, aiOutput);
      
      // Identify affected sections
      const affectedSections = this.identifyAffectedSections(aiOutput, biasTypes);
      
      // Generate recommendations
      const recommendations = this.generateBiasRecommendations(biasTypes, biasScore);
      
      const biasDetected = biasTypes.length > 0 || biasScore > 0.3;

      return {
        biasDetected,
        biasTypes,
        biasScore,
        affectedSections,
        recommendations
      };
    } catch (error) {
      logger.error('Error detecting bias', { error });
      throw error;
    }
  }

  /**
   * Test AI output for truth alignment
   */
  async testTruthAlignment(
    aiOutput: string,
    scripturalContext?: string
  ): Promise<TruthAlignmentResult> {
    try {
      logger.info('Testing truth alignment');

      // Assess scriptural alignment
      const scripturalAlignment = scripturalContext 
        ? this.assessScripturalAlignment(aiOutput, scripturalContext)
        : 0.5;
      
      // Assess factual accuracy
      const factualAccuracy = this.assessFactualAccuracy(aiOutput);
      
      // Assess logical consistency
      const logicalConsistency = this.assessLogicalConsistency(aiOutput);
      
      // Assess ethical soundness
      const ethicalSoundness = this.assessEthicalSoundness(aiOutput);
      
      // Calculate overall alignment score
      const alignmentScore = (
        scripturalAlignment * 0.3 +
        factualAccuracy * 0.3 +
        logicalConsistency * 0.2 +
        ethicalSoundness * 0.2
      );
      
      // Identify strengths
      const strengths = this.identifyTruthStrengths(
        scripturalAlignment,
        factualAccuracy,
        logicalConsistency,
        ethicalSoundness
      );
      
      // Identify concerns
      const concerns = this.identifyTruthConcerns(
        scripturalAlignment,
        factualAccuracy,
        logicalConsistency,
        ethicalSoundness
      );
      
      // Generate recommendations
      const recommendations = this.generateTruthRecommendations(concerns);

      return {
        alignmentScore,
        scripturalAlignment,
        factualAccuracy,
        logicalConsistency,
        ethicalSoundness,
        strengths,
        concerns,
        recommendations
      };
    } catch (error) {
      logger.error('Error testing truth alignment', { error });
      throw error;
    }
  }

  /**
   * Get ethical AI usage guidelines
   */
  async getEthicalGuidelines(category?: string): Promise<EthicalAIGuideline[]> {
    try {
      logger.info('Fetching ethical AI guidelines', { category });

      const allGuidelines = this.getAllGuidelines();
      
      if (category) {
        return allGuidelines.filter(g => g.category === category);
      }
      
      return allGuidelines;
    } catch (error) {
      logger.error('Error fetching ethical guidelines', { error });
      throw error;
    }
  }

  /**
   * Evaluate AI augmentation effectiveness
   */
  async evaluateAIAugmentation(
    aiToolUsed: string,
    purpose: string,
    aiOutput: string,
    humanInput: string,
    finalOutput: string
  ): Promise<AIAugmentationReport> {
    try {
      logger.info('Evaluating AI augmentation', { aiToolUsed, purpose });

      // Assess output quality
      const outputQuality = this.assessOutputQuality(aiOutput, finalOutput);
      
      // Check for human oversight
      const humanOversight = this.checkHumanOversight(humanInput, aiOutput, finalOutput);
      
      // Check ethical compliance
      const ethicalCompliance = await this.checkEthicalCompliance(aiOutput, purpose);
      
      // Calculate augmentation value
      const augmentationValue = this.calculateAugmentationValue(
        outputQuality,
        humanOversight,
        ethicalCompliance
      );
      
      // Identify concerns
      const concerns = this.identifyAugmentationConcerns(
        outputQuality,
        humanOversight,
        ethicalCompliance
      );
      
      // Generate recommendations
      const recommendations = this.generateAugmentationRecommendations(concerns);

      return {
        aiToolUsed,
        purpose,
        outputQuality,
        humanOversight,
        ethicalCompliance,
        augmentationValue,
        concerns,
        recommendations
      };
    } catch (error) {
      logger.error('Error evaluating AI augmentation', { error });
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods - Hallucination Detection
  // ============================================================================

  private identifyHallucinationTypes(aiOutput: string): string[] {
    const types: string[] = [];

    // Fabricated citations
    if (/according to.*study|research shows|studies indicate/i.test(aiOutput) && 
        !/\d{4}|doi|journal|university/i.test(aiOutput)) {
      types.push('Fabricated citations or references');
    }

    // Overconfident statements without evidence
    if (/definitely|certainly|absolutely|without doubt|proven fact/i.test(aiOutput) &&
        !/evidence|data|research|study/i.test(aiOutput)) {
      types.push('Overconfident claims without evidence');
    }

    // Specific numbers or statistics without sources
    if (/\d+%|\d+ percent|\d+ out of \d+/i.test(aiOutput) &&
        !/source|according to|study|survey/i.test(aiOutput)) {
      types.push('Unsourced statistics or numbers');
    }

    // Fabricated quotes
    if (/"[^"]{20,}"/g.test(aiOutput) && !/said|stated|wrote|according to/i.test(aiOutput)) {
      types.push('Potentially fabricated quotes');
    }

    // Anachronistic information
    if (/in \d{4}.*invented|discovered|created/i.test(aiOutput)) {
      types.push('Potentially anachronistic information - verify dates');
    }

    return types;
  }

  private verifyFacts(
    aiOutput: string,
    verifiableFacts: string[]
  ): { verifiedFacts: string[]; unverifiedClaims: string[] } {
    const verified: string[] = [];
    const unverified: string[] = [];

    // Extract claims from AI output
    const sentences = aiOutput.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach(sentence => {
      const isVerified = verifiableFacts.some(fact => 
        sentence.toLowerCase().includes(fact.toLowerCase())
      );
      
      if (isVerified) {
        verified.push(sentence.trim());
      } else if (this.isFactualClaim(sentence)) {
        unverified.push(sentence.trim());
      }
    });

    return {
      verifiedFacts: verified,
      unverifiedClaims: unverified
    };
  }

  private isFactualClaim(sentence: string): boolean {
    // Check if sentence makes a factual claim
    const factualIndicators = [
      /is|are|was|were/i,
      /\d+/,
      /according to|research|study|data/i,
      /proven|demonstrated|shown/i
    ];

    return factualIndicators.some(pattern => pattern.test(sentence));
  }

  private generateCorrections(
    hallucinationTypes: string[],
    unverifiedClaims: string[]
  ): string[] {
    const corrections: string[] = [];

    if (hallucinationTypes.includes('Fabricated citations or references')) {
      corrections.push('Verify all citations and provide proper sources');
    }

    if (hallucinationTypes.includes('Overconfident claims without evidence')) {
      corrections.push('Qualify statements with appropriate uncertainty and provide evidence');
    }

    if (hallucinationTypes.includes('Unsourced statistics or numbers')) {
      corrections.push('Provide sources for all statistics and numerical claims');
    }

    if (unverifiedClaims.length > 0) {
      corrections.push(`Verify ${unverifiedClaims.length} unverified claims against reliable sources`);
    }

    return corrections;
  }

  private calculateDetectionConfidence(
    hallucinationTypes: string[],
    unverifiedClaims: string[],
    verifiedFacts: string[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on detected patterns
    confidence += hallucinationTypes.length * 0.1;
    
    // Increase confidence based on unverified claims ratio
    const totalClaims = unverifiedClaims.length + verifiedFacts.length;
    if (totalClaims > 0) {
      const unverifiedRatio = unverifiedClaims.length / totalClaims;
      confidence += unverifiedRatio * 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  private generateHallucinationRecommendations(
    isHallucination: boolean,
    hallucinationTypes: string[],
    unverifiedClaims: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (isHallucination) {
      recommendations.push('⚠️ AI output contains potential hallucinations - verify before using');
      recommendations.push('Cross-reference all factual claims with reliable sources');
      recommendations.push('Use AI as a starting point, not final authority');
    }

    if (hallucinationTypes.length > 0) {
      recommendations.push('Address specific hallucination types identified');
    }

    if (unverifiedClaims.length > 3) {
      recommendations.push('High number of unverified claims - conduct thorough fact-checking');
    }

    recommendations.push('Award +20 XP for successfully identifying and correcting AI hallucinations');

    return recommendations;
  }

  // ============================================================================
  // Private Helper Methods - Bias Detection
  // ============================================================================

  private identifyBiasTypes(aiOutput: string): string[] {
    const biases: string[] = [];

    // Political bias
    if (/liberal|conservative|left-wing|right-wing|democrat|republican/i.test(aiOutput)) {
      biases.push('Political bias detected');
    }

    // Cultural bias
    if (/western|eastern|developed|developing|third world|primitive/i.test(aiOutput)) {
      biases.push('Potential cultural bias');
    }

    // Gender bias
    if (/he said|his work|mankind|man-made/i.test(aiOutput) && !/she|her|they/i.test(aiOutput)) {
      biases.push('Potential gender bias - non-inclusive language');
    }

    // Confirmation bias
    const sentences = aiOutput.split(/[.!?]+/);
    const supportingStatements = sentences.filter(s => /support|confirm|prove|demonstrate/i.test(s));
    const challengingStatements = sentences.filter(s => /however|but|although|despite/i.test(s));
    
    if (supportingStatements.length > challengingStatements.length * 3) {
      biases.push('Confirmation bias - lacks balanced perspective');
    }

    // Recency bias
    if (/recent|latest|modern|current/i.test(aiOutput) && !/historical|traditional|past/i.test(aiOutput)) {
      biases.push('Recency bias - overemphasis on recent information');
    }

    return biases;
  }

  private calculateBiasScore(biasTypes: string[], aiOutput: string): number {
    let score = 0;

    // Base score from number of bias types
    score += biasTypes.length * 0.15;

    // Check for extreme language
    const extremeLanguage = /always|never|all|none|everyone|no one|completely|totally/gi;
    const extremeMatches = aiOutput.match(extremeLanguage);
    if (extremeMatches && extremeMatches.length > 3) {
      score += 0.2;
    }

    // Check for lack of nuance
    const nuanceIndicators = /however|although|while|despite|on the other hand|some argue/gi;
    const nuanceMatches = aiOutput.match(nuanceIndicators);
    if (!nuanceMatches || nuanceMatches.length < 2) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  private identifyAffectedSections(aiOutput: string, biasTypes: string[]): string[] {
    const sections: string[] = [];
    const sentences = aiOutput.split(/[.!?]+/).filter(s => s.trim().length > 20);

    sentences.forEach((sentence, index) => {
      biasTypes.forEach(biasType => {
        if (this.sentenceContainsBias(sentence, biasType)) {
          sections.push(`Sentence ${index + 1}: ${sentence.substring(0, 50)}...`);
        }
      });
    });

    return sections;
  }

  private sentenceContainsBias(sentence: string, biasType: string): boolean {
    if (biasType.includes('Political')) {
      return /liberal|conservative|left|right|democrat|republican/i.test(sentence);
    }
    if (biasType.includes('Cultural')) {
      return /western|eastern|developed|developing|primitive/i.test(sentence);
    }
    if (biasType.includes('Gender')) {
      return /he said|his work|mankind/i.test(sentence);
    }
    return false;
  }

  private generateBiasRecommendations(biasTypes: string[], biasScore: number): string[] {
    const recommendations: string[] = [];

    if (biasScore > 0.5) {
      recommendations.push('⚠️ Significant bias detected - review and revise content');
    }

    biasTypes.forEach(biasType => {
      if (biasType.includes('Political')) {
        recommendations.push('Present multiple political perspectives fairly');
      }
      if (biasType.includes('Cultural')) {
        recommendations.push('Use culturally sensitive and inclusive language');
      }
      if (biasType.includes('Gender')) {
        recommendations.push('Use gender-inclusive language (they/them, humanity instead of mankind)');
      }
      if (biasType.includes('Confirmation')) {
        recommendations.push('Include counterarguments and alternative perspectives');
      }
    });

    recommendations.push('Award +20 XP for identifying and correcting AI bias');

    return recommendations;
  }

  // ============================================================================
  // Private Helper Methods - Truth Alignment
  // ============================================================================

  private assessScripturalAlignment(aiOutput: string, scripturalContext: string): number {
    let score = 0.5;

    // Check if output aligns with scriptural context
    const contextKeywords = scripturalContext.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const outputLower = aiOutput.toLowerCase();
    
    const alignedKeywords = contextKeywords.filter(keyword => outputLower.includes(keyword));
    score += (alignedKeywords.length / contextKeywords.length) * 0.3;

    // Check for biblical principles
    if (/love|truth|grace|mercy|justice|righteousness/i.test(aiOutput)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private assessFactualAccuracy(aiOutput: string): number {
    let score = 0.6; // Neutral starting point

    // Check for hedging language (indicates uncertainty)
    const hedging = /might|may|could|possibly|perhaps|likely|probably/gi;
    const hedgingMatches = aiOutput.match(hedging);
    if (hedgingMatches && hedgingMatches.length > 2) {
      score += 0.1; // Appropriate uncertainty
    }

    // Check for absolute claims without evidence
    const absoluteClaims = /definitely|certainly|absolutely|proven fact|without doubt/gi;
    const absoluteMatches = aiOutput.match(absoluteClaims);
    if (absoluteMatches && absoluteMatches.length > 2) {
      score -= 0.2; // Overconfidence
    }

    // Check for citations or sources
    if (/according to|source|study|research|data from/i.test(aiOutput)) {
      score += 0.2;
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  private assessLogicalConsistency(aiOutput: string): number {
    let score = 0.6;

    // Check for logical connectors
    const logicalConnectors = /therefore|thus|because|since|consequently|as a result/gi;
    const connectorMatches = aiOutput.match(logicalConnectors);
    if (connectorMatches && connectorMatches.length >= 2) {
      score += 0.2;
    }

    // Check for contradictions
    const sentences = aiOutput.toLowerCase().split(/[.!?]+/);
    for (let i = 0; i < sentences.length - 1; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        if (this.areContradictory(sentences[i], sentences[j])) {
          score -= 0.3;
          break;
        }
      }
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  private areContradictory(sentence1: string, sentence2: string): boolean {
    // Simple contradiction detection
    const negationPairs = [
      ['is', 'is not'],
      ['can', 'cannot'],
      ['will', 'will not'],
      ['should', 'should not']
    ];

    return negationPairs.some(([positive, negative]) => {
      return (sentence1.includes(positive) && sentence2.includes(negative)) ||
             (sentence1.includes(negative) && sentence2.includes(positive));
    });
  }

  private assessEthicalSoundness(aiOutput: string): number {
    let score = 0.7;

    // Check for ethical concerns
    const ethicalConcerns = /harm|danger|risk|unethical|immoral|wrong/i;
    if (ethicalConcerns.test(aiOutput)) {
      // Check if concerns are being addressed
      if (/prevent|avoid|mitigate|address|consider/i.test(aiOutput)) {
        score += 0.1; // Good - addressing concerns
      } else {
        score -= 0.2; // Bad - raising concerns without solutions
      }
    }

    // Check for ethical principles
    if (/integrity|honesty|fairness|justice|respect|dignity/i.test(aiOutput)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private identifyTruthStrengths(
    scripturalAlignment: number,
    factualAccuracy: number,
    logicalConsistency: number,
    ethicalSoundness: number
  ): string[] {
    const strengths: string[] = [];

    if (scripturalAlignment > 0.7) {
      strengths.push('Strong scriptural alignment');
    }

    if (factualAccuracy > 0.7) {
      strengths.push('High factual accuracy with appropriate sourcing');
    }

    if (logicalConsistency > 0.7) {
      strengths.push('Logically consistent reasoning');
    }

    if (ethicalSoundness > 0.7) {
      strengths.push('Ethically sound content');
    }

    return strengths;
  }

  private identifyTruthConcerns(
    scripturalAlignment: number,
    factualAccuracy: number,
    logicalConsistency: number,
    ethicalSoundness: number
  ): string[] {
    const concerns: string[] = [];

    if (scripturalAlignment < 0.5) {
      concerns.push('Low scriptural alignment - verify against biblical principles');
    }

    if (factualAccuracy < 0.5) {
      concerns.push('Questionable factual accuracy - verify claims');
    }

    if (logicalConsistency < 0.5) {
      concerns.push('Logical inconsistencies detected');
    }

    if (ethicalSoundness < 0.5) {
      concerns.push('Ethical concerns identified');
    }

    return concerns;
  }

  private generateTruthRecommendations(concerns: string[]): string[] {
    const recommendations: string[] = [];

    if (concerns.length === 0) {
      recommendations.push('✓ AI output demonstrates good truth alignment');
      return recommendations;
    }

    recommendations.push('Review and address the following concerns:');
    recommendations.push(...concerns);
    recommendations.push('Verify all claims against Scripture and reliable sources');
    recommendations.push('Award +20 XP for thorough truth alignment testing');

    return recommendations;
  }

  // ============================================================================
  // Private Helper Methods - Ethical Guidelines
  // ============================================================================

  private getAllGuidelines(): EthicalAIGuideline[] {
    return [
      {
        id: 'eth-001',
        category: 'Human Oversight',
        guideline: 'AI should augment, not replace, human reasoning and discernment',
        rationale: 'Humans bear responsibility for decisions and must maintain critical thinking',
        examples: [
          'Use AI for research assistance, but verify findings',
          'Let AI draft content, but review and revise with human judgment',
          'Use AI for brainstorming, but make final decisions yourself'
        ],
        violations: [
          'Accepting AI output without review',
          'Delegating important decisions entirely to AI',
          'Bypassing human judgment in critical matters'
        ]
      },
      {
        id: 'eth-002',
        category: 'Truth and Accuracy',
        guideline: 'Always verify AI-generated facts and claims',
        rationale: 'AI can hallucinate or present false information confidently',
        examples: [
          'Cross-reference AI-provided statistics with original sources',
          'Verify historical claims against reliable sources',
          'Check biblical references for accuracy'
        ],
        violations: [
          'Citing AI-generated "facts" without verification',
          'Trusting AI-provided sources without checking',
          'Spreading unverified AI-generated information'
        ]
      },
      {
        id: 'eth-003',
        category: 'Spiritual Discernment',
        guideline: 'Test AI outputs for spiritual alignment and biblical truth',
        rationale: 'AI lacks spiritual discernment and may contradict Scripture',
        examples: [
          'Compare AI theological statements with Scripture',
          'Seek Holy Spirit guidance when using AI for spiritual matters',
          'Consult spiritual leaders about AI-generated spiritual content'
        ],
        violations: [
          'Accepting AI theological claims without biblical verification',
          'Using AI as spiritual authority',
          'Replacing prayer and discernment with AI consultation'
        ]
      },
      {
        id: 'eth-004',
        category: 'Transparency',
        guideline: 'Disclose when content is AI-generated or AI-assisted',
        rationale: 'Honesty and integrity require transparency about AI use',
        examples: [
          'Note "AI-assisted" on AI-helped content',
          'Cite AI tools used in research',
          'Be transparent about AI involvement in creative work'
        ],
        violations: [
          'Presenting AI-generated work as entirely human-created',
          'Hiding AI assistance in academic or professional work',
          'Misleading others about the source of content'
        ]
      },
      {
        id: 'eth-005',
        category: 'Bias Awareness',
        guideline: 'Recognize and correct AI biases',
        rationale: 'AI reflects biases in training data and can perpetuate harmful stereotypes',
        examples: [
          'Check AI outputs for cultural, gender, or political bias',
          'Seek diverse perspectives beyond AI suggestions',
          'Correct biased language in AI-generated content'
        ],
        violations: [
          'Accepting biased AI outputs without correction',
          'Using AI to reinforce existing biases',
          'Ignoring discriminatory patterns in AI suggestions'
        ]
      }
    ];
  }

  // ============================================================================
  // Private Helper Methods - AI Augmentation
  // ============================================================================

  private assessOutputQuality(aiOutput: string, finalOutput: string): number {
    // Compare AI output to final output
    const aiLength = aiOutput.length;
    const finalLength = finalOutput.length;
    
    // Check if human significantly modified AI output
    const modificationRatio = Math.abs(finalLength - aiLength) / aiLength;
    
    // More modification suggests AI output needed improvement
    if (modificationRatio > 0.5) return 0.5;
    if (modificationRatio > 0.3) return 0.7;
    return 0.8;
  }

  private checkHumanOversight(
    humanInput: string,
    aiOutput: string,
    finalOutput: string
  ): boolean {
    // Check if human provided input
    const hasHumanInput = humanInput.length > 50;
    
    // Check if final output differs from AI output
    const hasModification = finalOutput !== aiOutput;
    
    return hasHumanInput && hasModification;
  }

  private async checkEthicalCompliance(aiOutput: string, purpose: string): Promise<boolean> {
    // Check against ethical guidelines
    const guidelines = this.getAllGuidelines();
    
    // For now, simple check - in production would be more sophisticated
    const hasDisclosure = /ai-assisted|ai-generated|with ai help/i.test(aiOutput);
    const hasVerification = /verified|checked|confirmed/i.test(aiOutput);
    
    return hasDisclosure || hasVerification || purpose.includes('draft');
  }

  private calculateAugmentationValue(
    outputQuality: number,
    humanOversight: boolean,
    ethicalCompliance: boolean
  ): number {
    let value = outputQuality * 0.4;
    
    if (humanOversight) value += 0.3;
    if (ethicalCompliance) value += 0.3;
    
    return Math.min(value, 1.0);
  }

  private identifyAugmentationConcerns(
    outputQuality: number,
    humanOversight: boolean,
    ethicalCompliance: boolean
  ): string[] {
    const concerns: string[] = [];

    if (outputQuality < 0.6) {
      concerns.push('AI output quality is low - significant revision needed');
    }

    if (!humanOversight) {
      concerns.push('⚠️ Insufficient human oversight - AI should augment, not replace human judgment');
    }

    if (!ethicalCompliance) {
      concerns.push('Ethical compliance concerns - ensure transparency and verification');
    }

    return concerns;
  }

  private generateAugmentationRecommendations(concerns: string[]): string[] {
    const recommendations: string[] = [];

    if (concerns.length === 0) {
      recommendations.push('✓ Good AI augmentation practice - AI enhances human capability');
      recommendations.push('Continue maintaining human oversight and ethical standards');
      return recommendations;
    }

    recommendations.push('Address the following concerns:');
    recommendations.push(...concerns);
    recommendations.push('Remember: AI should augment, not replace, human reasoning');
    recommendations.push('Award +20 XP for ethical AI usage and proper augmentation');

    return recommendations;
  }
}
