/**
 * Spirit Testing Framework
 * Implements 1 John 4:1 testing protocols for truth claims and teachings
 * Implements Requirements: 1.4, 5.1, 8.2
 * 
 * "Beloved, do not believe every spirit, but test the spirits to see whether they are from God,
 * for many false prophets have gone out into the world." - 1 John 4:1
 */

import { logger } from '../utils/logger';

export interface SpiritTestResult {
  passed: boolean;
  overallScore: number;
  testResults: IndividualTestResult[];
  warnings: string[];
  recommendations: string[];
  scripturalBasis: string[];
}

export interface IndividualTestResult {
  testName: string;
  passed: boolean;
  score: number;
  evidence: string[];
  concerns: string[];
  scripturalReference: string;
}

export interface PropheticInterrogationResult {
  sourceCredibility: number;
  motivationAssessment: string;
  fruitExamination: string[];
  consistencyWithScripture: number;
  consistencyWithCharacter: number;
  holySpiritWitness: string;
  overallTrustworthiness: number;
  redFlags: string[];
  greenFlags: string[];
}

export interface DiscernmentTrainingModule {
  id: string;
  title: string;
  level: string;
  scenario: string;
  truthClaims: string[];
  falseTeachings: string[];
  correctAnswers: string[];
  explanation: string;
  scripturalBasis: string[];
}

export interface TruthClaimAnalysis {
  claim: string;
  category: string;
  scripturalAlignment: number;
  logicalSoundness: number;
  historicalAccuracy: number;
  propheticConsistency: number;
  overallTruthScore: number;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  verdict: string;
}

export default class SpiritTestingFramework {
  /**
   * Test spirits according to 1 John 4:1-3
   * Primary test: Does it confess Jesus Christ has come in the flesh?
   */
  async testSpirit(
    teaching: string,
    source: string,
    context: string
  ): Promise<SpiritTestResult> {
    try {
      logger.info('Testing spirit according to 1 John 4:1');

      const testResults: IndividualTestResult[] = [];

      // Test 1: Confession of Jesus Christ (1 John 4:2-3)
      testResults.push(await this.testChristConfession(teaching));

      // Test 2: Alignment with Scripture (2 Timothy 3:16)
      testResults.push(await this.testScripturalAlignment(teaching));

      // Test 3: Fruit of the Spirit (Galatians 5:22-23)
      testResults.push(await this.testSpiritualFruit(teaching, source));

      // Test 4: Love for God and others (1 John 4:7-8)
      testResults.push(await this.testLove(teaching));

      // Test 5: Truth and righteousness (John 14:6, Ephesians 6:14)
      testResults.push(await this.testTruthAndRighteousness(teaching));

      // Test 6: Consistency with apostolic teaching (Acts 2:42)
      testResults.push(await this.testApostolicConsistency(teaching));

      // Calculate overall score
      const overallScore = testResults.reduce((sum, test) => sum + test.score, 0) / testResults.length;

      // Determine if passed (must pass all critical tests)
      const criticalTests = testResults.filter(t => 
        t.testName.includes('Christ Confession') || 
        t.testName.includes('Scriptural Alignment')
      );
      const passed = criticalTests.every(t => t.passed) && overallScore >= 0.6;

      // Collect warnings
      const warnings = this.collectWarnings(testResults, overallScore);

      // Generate recommendations
      const recommendations = this.generateRecommendations(testResults, passed);

      // Collect scriptural basis
      const scripturalBasis = testResults.map(t => t.scripturalReference);

      return {
        passed,
        overallScore,
        testResults,
        warnings,
        recommendations,
        scripturalBasis
      };
    } catch (error) {
      logger.error('Error testing spirit', { error });
      throw error;
    }
  }

  /**
   * Prophetic interrogation of information sources
   */
  async interrogateSource(
    source: string,
    content: string,
    history?: string[]
  ): Promise<PropheticInterrogationResult> {
    try {
      logger.info('Conducting prophetic interrogation of source', { source });

      // Assess source credibility
      const sourceCredibility = this.assessSourceCredibility(source, history);

      // Assess motivation
      const motivationAssessment = this.assessMotivation(content, source);

      // Examine fruit
      const fruitExamination = this.examineFruit(content, history);

      // Check consistency with Scripture
      const consistencyWithScripture = this.checkScripturalConsistency(content);

      // Check consistency with character of God
      const consistencyWithCharacter = this.checkCharacterConsistency(content);

      // Assess Holy Spirit witness
      const holySpiritWitness = this.assessHolySpiritWitness(content);

      // Calculate overall trustworthiness
      const overallTrustworthiness = (
        sourceCredibility * 0.2 +
        consistencyWithScripture * 0.3 +
        consistencyWithCharacter * 0.2 +
        (fruitExamination.length > 0 ? 0.3 : 0)
      );

      // Identify red flags
      const redFlags = this.identifyRedFlags(
        content,
        sourceCredibility,
        consistencyWithScripture,
        fruitExamination
      );

      // Identify green flags
      const greenFlags = this.identifyGreenFlags(
        content,
        sourceCredibility,
        consistencyWithScripture,
        fruitExamination
      );

      return {
        sourceCredibility,
        motivationAssessment,
        fruitExamination,
        consistencyWithScripture,
        consistencyWithCharacter,
        holySpiritWitness,
        overallTrustworthiness,
        redFlags,
        greenFlags
      };
    } catch (error) {
      logger.error('Error interrogating source', { error });
      throw error;
    }
  }

  /**
   * Analyze truth claims
   */
  async analyzeTruthClaim(claim: string, context: string): Promise<TruthClaimAnalysis> {
    try {
      logger.info('Analyzing truth claim');

      // Categorize claim
      const category = this.categorizeClaim(claim);

      // Assess scriptural alignment
      const scripturalAlignment = this.assessClaimScripturalAlignment(claim);

      // Assess logical soundness
      const logicalSoundness = this.assessLogicalSoundness(claim);

      // Assess historical accuracy
      const historicalAccuracy = this.assessHistoricalAccuracy(claim);

      // Assess prophetic consistency
      const propheticConsistency = this.assessPropheticConsistency(claim);

      // Calculate overall truth score
      const overallTruthScore = (
        scripturalAlignment * 0.4 +
        logicalSoundness * 0.2 +
        historicalAccuracy * 0.2 +
        propheticConsistency * 0.2
      );

      // Gather supporting evidence
      const supportingEvidence = this.gatherSupportingEvidence(claim, category);

      // Gather contradicting evidence
      const contradictingEvidence = this.gatherContradictingEvidence(claim, category);

      // Determine verdict
      const verdict = this.determineVerdict(overallTruthScore, supportingEvidence, contradictingEvidence);

      return {
        claim,
        category,
        scripturalAlignment,
        logicalSoundness,
        historicalAccuracy,
        propheticConsistency,
        overallTruthScore,
        supportingEvidence,
        contradictingEvidence,
        verdict
      };
    } catch (error) {
      logger.error('Error analyzing truth claim', { error });
      throw error;
    }
  }

  /**
   * Get discernment training modules
   */
  async getDiscernmentTraining(level: string): Promise<DiscernmentTrainingModule[]> {
    try {
      logger.info('Fetching discernment training modules', { level });

      const allModules = this.getAllTrainingModules();

      if (level) {
        return allModules.filter(m => m.level === level);
      }

      return allModules;
    } catch (error) {
      logger.error('Error fetching training modules', { error });
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods - Spirit Tests (1 John 4)
  // ============================================================================

  private async testChristConfession(teaching: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for confession of Jesus Christ
    const confessesJesus = /jesus.*christ|christ.*jesus|lord jesus|jesus.*son of god/i.test(teaching);
    const confessesIncarnation = /came in.*flesh|born of.*virgin|incarnation|god became man/i.test(teaching);
    const confessesDivinity = /son of god|divine|deity|god in flesh/i.test(teaching);

    if (confessesJesus) {
      score += 0.2;
      evidence.push('Acknowledges Jesus Christ');
    } else {
      concerns.push('Does not clearly acknowledge Jesus Christ');
    }

    if (confessesIncarnation) {
      score += 0.2;
      evidence.push('Confesses Christ came in the flesh');
    } else {
      concerns.push('Does not confess incarnation');
    }

    if (confessesDivinity) {
      score += 0.1;
      evidence.push('Acknowledges divinity of Christ');
    }

    // Check for denials or distortions
    const deniesChrist = /jesus.*not.*god|christ.*merely.*man|just a prophet|not divine/i.test(teaching);
    if (deniesChrist) {
      score = 0;
      concerns.push('⚠️ CRITICAL: Denies deity of Christ');
    }

    const passed = score >= 0.6 && !deniesChrist;

    return {
      testName: 'Christ Confession Test',
      passed,
      score: Math.min(score, 1.0),
      evidence,
      concerns,
      scripturalReference: '1 John 4:2-3'
    };
  }

  private async testScripturalAlignment(teaching: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for biblical references
    const hasBibleReferences = /genesis|exodus|matthew|john|romans|revelation|\d+:\d+/i.test(teaching);
    if (hasBibleReferences) {
      score += 0.2;
      evidence.push('Contains biblical references');
    }

    // Check for biblical principles
    const biblicalPrinciples = /love|grace|faith|righteousness|holiness|redemption|salvation/i;
    const principleMatches = teaching.match(biblicalPrinciples);
    if (principleMatches && principleMatches.length >= 2) {
      score += 0.2;
      evidence.push('Incorporates biblical principles');
    }

    // Check for contradictions with Scripture
    const contradictions = this.detectScripturalContradictions(teaching);
    if (contradictions.length > 0) {
      score -= 0.3;
      concerns.push(...contradictions);
    }

    const passed = score >= 0.6;

    return {
      testName: 'Scriptural Alignment Test',
      passed,
      score: Math.max(0, Math.min(score, 1.0)),
      evidence,
      concerns,
      scripturalReference: '2 Timothy 3:16-17'
    };
  }

  private async testSpiritualFruit(teaching: string, source: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for fruit of the Spirit (Galatians 5:22-23)
    const fruits = {
      love: /love|compassion|care/i,
      joy: /joy|rejoice|gladness/i,
      peace: /peace|reconciliation|harmony/i,
      patience: /patience|endurance|perseverance/i,
      kindness: /kindness|gentleness|tender/i,
      goodness: /goodness|virtue|righteousness/i,
      faithfulness: /faithful|loyal|steadfast/i,
      gentleness: /gentle|meek|humble/i,
      selfControl: /self-control|discipline|restraint/i
    };

    let fruitCount = 0;
    Object.entries(fruits).forEach(([fruit, pattern]) => {
      if (pattern.test(teaching)) {
        fruitCount++;
        evidence.push(`Demonstrates ${fruit}`);
      }
    });

    score += (fruitCount / 9) * 0.4;

    // Check for works of the flesh (Galatians 5:19-21)
    const fleshWorks = /hatred|discord|jealousy|rage|selfish ambition|dissension|envy|drunkenness/i;
    if (fleshWorks.test(teaching)) {
      score -= 0.3;
      concerns.push('Contains works of the flesh');
    }

    const passed = score >= 0.6;

    return {
      testName: 'Spiritual Fruit Test',
      passed,
      score: Math.max(0, Math.min(score, 1.0)),
      evidence,
      concerns,
      scripturalReference: 'Galatians 5:22-23'
    };
  }

  private async testLove(teaching: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for love
    const hasLove = /love|compassion|mercy|grace|kindness/i.test(teaching);
    if (hasLove) {
      score += 0.2;
      evidence.push('Demonstrates love');
    }

    // Check for love of God
    const lovesGod = /love.*god|love.*lord|devotion to god/i.test(teaching);
    if (lovesGod) {
      score += 0.15;
      evidence.push('Shows love for God');
    }

    // Check for love of others
    const lovesOthers = /love.*neighbor|love.*others|love.*one another/i.test(teaching);
    if (lovesOthers) {
      score += 0.15;
      evidence.push('Shows love for others');
    }

    // Check for hatred or division
    const hasHatred = /hate|despise|condemn|reject|exclude/i.test(teaching);
    if (hasHatred) {
      score -= 0.2;
      concerns.push('Contains language of hatred or division');
    }

    const passed = score >= 0.6;

    return {
      testName: 'Love Test',
      passed,
      score: Math.max(0, Math.min(score, 1.0)),
      evidence,
      concerns,
      scripturalReference: '1 John 4:7-8'
    };
  }

  private async testTruthAndRighteousness(teaching: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for truth
    const hasTruth = /truth|true|accurate|correct|right/i.test(teaching);
    if (hasTruth) {
      score += 0.2;
      evidence.push('Emphasizes truth');
    }

    // Check for righteousness
    const hasRighteousness = /righteousness|righteous|holy|holiness|sanctification/i.test(teaching);
    if (hasRighteousness) {
      score += 0.2;
      evidence.push('Emphasizes righteousness');
    }

    // Check for deception
    const hasDeception = /deceive|lie|false|mislead|trick/i.test(teaching);
    if (hasDeception && !/warning.*deceive|avoid.*lie|reject.*false/i.test(teaching)) {
      score -= 0.2;
      concerns.push('Contains potentially deceptive elements');
    }

    // Check for moral relativism
    const hasRelativism = /no absolute truth|truth is relative|your truth|my truth/i.test(teaching);
    if (hasRelativism) {
      score -= 0.3;
      concerns.push('Promotes moral relativism');
    }

    const passed = score >= 0.6;

    return {
      testName: 'Truth and Righteousness Test',
      passed,
      score: Math.max(0, Math.min(score, 1.0)),
      evidence,
      concerns,
      scripturalReference: 'John 14:6, Ephesians 6:14'
    };
  }

  private async testApostolicConsistency(teaching: string): Promise<IndividualTestResult> {
    let score = 0.5;
    const evidence: string[] = [];
    const concerns: string[] = [];

    // Check for apostolic doctrines
    const apostolicDoctrines = {
      gospel: /gospel|good news|salvation through christ/i,
      grace: /grace|unmerited favor|gift of god/i,
      faith: /faith|believe|trust in christ/i,
      repentance: /repent|turn from sin|change/i,
      resurrection: /resurrection|risen|raised from dead/i
    };

    let doctrineCount = 0;
    Object.entries(apostolicDoctrines).forEach(([doctrine, pattern]) => {
      if (pattern.test(teaching)) {
        doctrineCount++;
        evidence.push(`Consistent with apostolic teaching on ${doctrine}`);
      }
    });

    score += (doctrineCount / 5) * 0.4;

    // Check for heretical teachings
    const heresies = [
      { name: 'Gnosticism', pattern: /secret knowledge|hidden wisdom|special revelation/i },
      { name: 'Works salvation', pattern: /earn.*salvation|works.*save|merit.*heaven/i },
      { name: 'Prosperity gospel', pattern: /god wants you rich|faith for wealth|sow seed for money/i }
    ];

    heresies.forEach(heresy => {
      if (heresy.pattern.test(teaching)) {
        score -= 0.3;
        concerns.push(`⚠️ Contains elements of ${heresy.name}`);
      }
    });

    const passed = score >= 0.6;

    return {
      testName: 'Apostolic Consistency Test',
      passed,
      score: Math.max(0, Math.min(score, 1.0)),
      evidence,
      concerns,
      scripturalReference: 'Acts 2:42, Jude 1:3'
    };
  }

  private detectScripturalContradictions(teaching: string): string[] {
    const contradictions: string[] = [];

    // Check for common contradictions
    if (/many ways to god|all paths lead to god/i.test(teaching)) {
      contradictions.push('Contradicts John 14:6 - Jesus is the only way');
    }

    if (/no sin|sin doesn\'t matter|grace covers everything/i.test(teaching)) {
      contradictions.push('Contradicts Romans 6:1-2 - Grace is not license to sin');
    }

    if (/works.*save|earn.*salvation/i.test(teaching) && !/faith.*works/i.test(teaching)) {
      contradictions.push('Contradicts Ephesians 2:8-9 - Salvation by grace through faith');
    }

    return contradictions;
  }

  private collectWarnings(testResults: IndividualTestResult[], overallScore: number): string[] {
    const warnings: string[] = [];

    // Critical test failures
    const criticalFailures = testResults.filter(t => 
      !t.passed && (t.testName.includes('Christ') || t.testName.includes('Scriptural'))
    );

    if (criticalFailures.length > 0) {
      warnings.push('⚠️ CRITICAL: Failed essential spirit tests');
      criticalFailures.forEach(test => {
        warnings.push(`  - ${test.testName}: ${test.concerns.join(', ')}`);
      });
    }

    // Low overall score
    if (overallScore < 0.5) {
      warnings.push('⚠️ Low overall score - exercise extreme caution');
    }

    // Collect all concerns
    testResults.forEach(test => {
      test.concerns.forEach(concern => {
        if (concern.startsWith('⚠️') && !warnings.includes(concern)) {
          warnings.push(concern);
        }
      });
    });

    return warnings;
  }

  private generateRecommendations(testResults: IndividualTestResult[], passed: boolean): string[] {
    const recommendations: string[] = [];

    if (!passed) {
      recommendations.push('❌ DO NOT accept this teaching without further investigation');
      recommendations.push('Consult with spiritual leaders and mature believers');
      recommendations.push('Search the Scriptures to verify all claims (Acts 17:11)');
      recommendations.push('Pray for discernment and wisdom (James 1:5)');
    } else {
      recommendations.push('✓ Teaching passes basic spirit tests');
      recommendations.push('Continue to test and verify against Scripture');
      recommendations.push('Remain vigilant and discerning (1 Thessalonians 5:21)');
    }

    // Specific recommendations based on test results
    testResults.forEach(test => {
      if (!test.passed) {
        recommendations.push(`Address concerns in ${test.testName}`);
      }
    });

    recommendations.push('Award +15 XP for thorough spirit testing and discernment');

    return recommendations;
  }

  // ============================================================================
  // Private Helper Methods - Prophetic Interrogation
  // ============================================================================

  private assessSourceCredibility(source: string, history?: string[]): number {
    let score = 0.5;

    // Check if source is known and reputable
    const reputableSources = /bible|scripture|church father|theologian|pastor|elder/i;
    if (reputableSources.test(source)) {
      score += 0.3;
    }

    // Check history if available
    if (history && history.length > 0) {
      const consistentHistory = history.every(h => h.length > 0);
      if (consistentHistory) score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private assessMotivation(content: string, source: string): string {
    // Check for self-serving motivations
    if (/give.*money|donate|sow seed|financial blessing/i.test(content)) {
      return 'Possible financial motivation - exercise caution';
    }

    // Check for kingdom motivations
    if (/kingdom|gospel|salvation|disciple|transform/i.test(content)) {
      return 'Kingdom-focused motivation';
    }

    // Check for truth-seeking
    if (/truth|understand|learn|grow|discern/i.test(content)) {
      return 'Truth-seeking motivation';
    }

    return 'Motivation unclear - requires further investigation';
  }

  private examineFruit(content: string, history?: string[]): string[] {
    const fruit: string[] = [];

    // Check for good fruit
    if (/transform|changed|healed|delivered|saved/i.test(content)) {
      fruit.push('Positive transformation reported');
    }

    if (/love|unity|peace|reconciliation/i.test(content)) {
      fruit.push('Produces love and unity');
    }

    // Check for bad fruit
    if (/division|conflict|confusion|fear/i.test(content)) {
      fruit.push('⚠️ Produces division or confusion');
    }

    return fruit;
  }

  private checkScripturalConsistency(content: string): number {
    let score = 0.5;

    // Check for biblical alignment
    if (/scripture|bible|word of god/i.test(content)) {
      score += 0.2;
    }

    // Check for contradictions
    const contradictions = this.detectScripturalContradictions(content);
    score -= contradictions.length * 0.15;

    return Math.max(0, Math.min(score, 1.0));
  }

  private checkCharacterConsistency(content: string): number {
    let score = 0.5;

    // Check for attributes of God
    const godAttributes = /love|holy|just|merciful|gracious|faithful|true/i;
    const matches = content.match(godAttributes);
    if (matches) {
      score += Math.min(matches.length * 0.1, 0.4);
    }

    // Check for misrepresentation of God
    if (/god.*cruel|god.*unfair|god.*unjust/i.test(content)) {
      score -= 0.4;
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  private assessHolySpiritWitness(content: string): string {
    // This is subjective and requires human discernment
    return 'Requires personal prayer and Holy Spirit discernment';
  }

  private identifyRedFlags(
    content: string,
    sourceCredibility: number,
    consistencyWithScripture: number,
    fruitExamination: string[]
  ): string[] {
    const redFlags: string[] = [];

    if (sourceCredibility < 0.4) {
      redFlags.push('Low source credibility');
    }

    if (consistencyWithScripture < 0.4) {
      redFlags.push('Poor scriptural consistency');
    }

    const badFruit = fruitExamination.filter(f => f.startsWith('⚠️'));
    if (badFruit.length > 0) {
      redFlags.push(...badFruit);
    }

    // Check for manipulation tactics
    if (/must.*give|have to.*believe|only way|secret knowledge/i.test(content)) {
      redFlags.push('Uses manipulation or coercion');
    }

    return redFlags;
  }

  private identifyGreenFlags(
    content: string,
    sourceCredibility: number,
    consistencyWithScripture: number,
    fruitExamination: string[]
  ): string[] {
    const greenFlags: string[] = [];

    if (sourceCredibility > 0.7) {
      greenFlags.push('High source credibility');
    }

    if (consistencyWithScripture > 0.7) {
      greenFlags.push('Strong scriptural consistency');
    }

    const goodFruit = fruitExamination.filter(f => !f.startsWith('⚠️'));
    if (goodFruit.length > 0) {
      greenFlags.push(...goodFruit);
    }

    // Check for humility and grace
    if (/humbly|grace|mercy|love/i.test(content)) {
      greenFlags.push('Demonstrates humility and grace');
    }

    return greenFlags;
  }

  // ============================================================================
  // Private Helper Methods - Truth Claim Analysis
  // ============================================================================

  private categorizeClaim(claim: string): string {
    if (/god|jesus|christ|holy spirit|trinity/i.test(claim)) {
      return 'Theological';
    }
    if (/bible|scripture|word/i.test(claim)) {
      return 'Biblical';
    }
    if (/history|historical|ancient/i.test(claim)) {
      return 'Historical';
    }
    if (/prophecy|prophetic|future/i.test(claim)) {
      return 'Prophetic';
    }
    if (/moral|ethical|right|wrong/i.test(claim)) {
      return 'Ethical';
    }
    return 'General';
  }

  private assessClaimScripturalAlignment(claim: string): number {
    let score = 0.5;

    // Check for biblical support
    if (/according to.*bible|scripture says|word of god/i.test(claim)) {
      score += 0.3;
    }

    // Check for contradictions
    const contradictions = this.detectScripturalContradictions(claim);
    score -= contradictions.length * 0.2;

    return Math.max(0, Math.min(score, 1.0));
  }

  private assessLogicalSoundness(claim: string): number {
    let score = 0.6;

    // Check for logical structure
    if (/because|therefore|thus|since|if.*then/i.test(claim)) {
      score += 0.2;
    }

    // Check for logical fallacies
    if (/everyone knows|obviously|clearly|without doubt/i.test(claim)) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(score, 1.0));
  }

  private assessHistoricalAccuracy(claim: string): number {
    // Simplified - in production would check against historical records
    let score = 0.6;

    if (/historically|history shows|archaeological/i.test(claim)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  private assessPropheticConsistency(claim: string): number {
    let score = 0.6;

    // Check for prophetic alignment
    if (/prophecy|prophetic|foretold|predicted/i.test(claim)) {
      // Check if it aligns with biblical prophecy
      if (/isaiah|jeremiah|ezekiel|daniel|revelation/i.test(claim)) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }

  private gatherSupportingEvidence(claim: string, category: string): string[] {
    const evidence: string[] = [];

    // This would be more sophisticated in production
    if (category === 'Biblical' || category === 'Theological') {
      evidence.push('Requires scriptural verification');
    }

    if (category === 'Historical') {
      evidence.push('Requires historical source verification');
    }

    return evidence;
  }

  private gatherContradictingEvidence(claim: string, category: string): string[] {
    const contradictions = this.detectScripturalContradictions(claim);
    return contradictions;
  }

  private determineVerdict(
    overallTruthScore: number,
    supportingEvidence: string[],
    contradictingEvidence: string[]
  ): string {
    if (contradictingEvidence.length > 0) {
      return '❌ REJECT - Contradicts Scripture';
    }

    if (overallTruthScore > 0.7) {
      return '✓ ACCEPT - Aligns with truth';
    }

    if (overallTruthScore > 0.5) {
      return '⚠️ CAUTION - Requires further verification';
    }

    return '❌ REJECT - Insufficient truth alignment';
  }

  // ============================================================================
  // Private Helper Methods - Training Modules
  // ============================================================================

  private getAllTrainingModules(): DiscernmentTrainingModule[] {
    return [
      {
        id: 'disc-001',
        title: 'Testing False Prophets',
        level: 'foundation',
        scenario: 'A teacher claims to have a "new revelation" that contradicts Scripture.',
        truthClaims: [
          'Scripture is the final authority (2 Timothy 3:16)',
          'Test all things against God\'s Word (Acts 17:11)'
        ],
        falseTeachings: [
          'New revelations can supersede Scripture',
          'Special knowledge is needed beyond the Bible'
        ],
        correctAnswers: [
          'Reject teachings that contradict Scripture',
          'All revelation must align with biblical truth'
        ],
        explanation: 'God\'s Word is complete and sufficient. Any "new revelation" must align with Scripture or be rejected.',
        scripturalBasis: ['2 Timothy 3:16-17', 'Revelation 22:18-19', 'Jude 1:3']
      },
      {
        id: 'disc-002',
        title: 'Discerning Prosperity Gospel',
        level: 'intermediate',
        scenario: 'A preacher teaches that faith guarantees wealth and health.',
        truthClaims: [
          'God desires our ultimate good (Romans 8:28)',
          'Suffering can be part of God\'s plan (2 Corinthians 12:9-10)'
        ],
        falseTeachings: [
          'Faith always results in material prosperity',
          'Sickness indicates lack of faith'
        ],
        correctAnswers: [
          'God\'s blessings include but transcend material wealth',
          'Suffering can refine faith and glorify God'
        ],
        explanation: 'The prosperity gospel distorts biblical teaching. True prosperity includes spiritual blessings and may involve suffering.',
        scripturalBasis: ['Matthew 6:19-21', 'Philippians 4:11-13', 'James 1:2-4']
      },
      {
        id: 'disc-003',
        title: 'Identifying Gnosticism',
        level: 'advanced',
        scenario: 'A group teaches that special, secret knowledge is required for salvation.',
        truthClaims: [
          'Salvation is by grace through faith (Ephesians 2:8-9)',
          'The gospel is openly proclaimed (Mark 16:15)'
        ],
        falseTeachings: [
          'Secret knowledge is required for salvation',
          'Only the enlightened can be saved'
        ],
        correctAnswers: [
          'Salvation is available to all through faith in Christ',
          'The gospel is not secret but openly proclaimed'
        ],
        explanation: 'Gnosticism was an early heresy that taught salvation through secret knowledge. The gospel is simple and available to all.',
        scripturalBasis: ['1 Corinthians 1:18-25', 'Colossians 2:8', '1 John 2:20-27']
      }
    ];
  }
}
