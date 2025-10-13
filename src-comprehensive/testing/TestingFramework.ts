/**
 * ScrollUniversity Comprehensive Testing Framework
 * Implements testing for AI responses, spiritual alignment, cultural sensitivity, and global scale
 */

import { AIResponseValidator } from './validators/AIResponseValidator';
import { SpiritualAlignmentTester } from './validators/SpiritualAlignmentTester';
import { CulturalSensitivityTester } from './validators/CulturalSensitivityTester';
import { LoadTestingFramework } from './load/LoadTestingFramework';
import { TestReporter } from './reporting/TestReporter';
import { TestConfiguration } from './config/TestConfiguration';

export interface TestSuite {
  name: string;
  category: TestCategory;
  tests: TestCase[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  execute: () => Promise<TestResult>;
  timeout?: number;
  retries?: number;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  duration: number;
  error?: Error;
  metadata?: Record<string, any>;
  spiritualAlignment?: SpiritualAlignmentScore;
  culturalSensitivity?: CulturalSensitivityScore;
}

export enum TestCategory {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  AI_RESPONSE = 'ai_response',
  SPIRITUAL_ALIGNMENT = 'spiritual_alignment',
  CULTURAL_SENSITIVITY = 'cultural_sensitivity',
  LOAD_TESTING = 'load_testing',
  SECURITY = 'security',
  PERFORMANCE = 'performance'
}

export interface SpiritualAlignmentScore {
  scriptureAlignment: number; // 0-100
  propheticAccuracy: number; // 0-100
  kingdomPerspective: number; // 0-100
  characterFormation: number; // 0-100
  overallScore: number; // 0-100
  concerns: string[];
}

export interface CulturalSensitivityScore {
  languageAccuracy: number; // 0-100
  culturalContext: number; // 0-100
  respectfulness: number; // 0-100
  inclusivity: number; // 0-100
  overallScore: number; // 0-100
  flaggedContent: string[];
}

export class ScrollUniversityTestingFramework {
  private testSuites: Map<string, TestSuite> = new Map();
  private aiValidator: AIResponseValidator;
  private spiritualTester: SpiritualAlignmentTester;
  private culturalTester: CulturalSensitivityTester;
  private loadTester: LoadTestingFramework;
  private reporter: TestReporter;
  private config: TestConfiguration;

  constructor(config: TestConfiguration) {
    this.config = config;
    this.aiValidator = new AIResponseValidator(config.ai);
    this.spiritualTester = new SpiritualAlignmentTester(config.spiritual);
    this.culturalTester = new CulturalSensitivityTester(config.cultural);
    this.loadTester = new LoadTestingFramework(config.load);
    this.reporter = new TestReporter(config.reporting);
  }

  /**
   * Register a test suite with the framework
   */
  registerTestSuite(suite: TestSuite): void {
    this.testSuites.set(suite.name, suite);
  }

  /**
   * Run all registered test suites
   */
  async runAllTests(): Promise<TestRunResult> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    const suiteResults: Map<string, TestSuiteResult> = new Map();

    for (const [suiteName, suite] of Array.from(this.testSuites.entries())) {
      const suiteResult = await this.runTestSuite(suite);
      suiteResults.set(suiteName, suiteResult);
      results.push(...suiteResult.testResults);
    }

    const endTime = Date.now();
    const runResult: TestRunResult = {
      totalTests: results.length,
      passedTests: results.filter(r => r.passed).length,
      failedTests: results.filter(r => !r.passed).length,
      duration: endTime - startTime,
      suiteResults,
      overallResults: results,
      spiritualAlignmentSummary: this.calculateSpiritualAlignmentSummary(results),
      culturalSensitivitySummary: this.calculateCulturalSensitivitySummary(results)
    };

    await this.reporter.generateReport(runResult);
    return runResult;
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suite: TestSuite): Promise<TestSuiteResult> {
    const startTime = Date.now();
    const testResults: TestResult[] = [];

    try {
      // Setup
      if (suite.setup) {
        await suite.setup();
      }

      // Run tests
      for (const testCase of suite.tests) {
        const result = await this.runTestCase(testCase, suite.category);
        testResults.push(result);
      }

      // Teardown
      if (suite.teardown) {
        await suite.teardown();
      }

    } catch (error) {
      console.error(`Error running test suite ${suite.name}:`, error);
    }

    const endTime = Date.now();
    return {
      suiteName: suite.name,
      category: suite.category,
      totalTests: testResults.length,
      passedTests: testResults.filter(r => r.passed).length,
      failedTests: testResults.filter(r => !r.passed).length,
      duration: endTime - startTime,
      testResults
    };
  }

  /**
   * Run a single test case with appropriate validators
   */
  private async runTestCase(testCase: TestCase, category: TestCategory): Promise<TestResult> {
    const startTime = Date.now();
    let result: TestResult;

    try {
      // Execute the test
      result = await this.executeWithTimeout(testCase);
      
      // Apply category-specific validation
      switch (category) {
        case TestCategory.AI_RESPONSE:
          result = await this.aiValidator.validateResponse(result);
          break;
        case TestCategory.SPIRITUAL_ALIGNMENT:
          result.spiritualAlignment = await this.spiritualTester.evaluateAlignment(result);
          break;
        case TestCategory.CULTURAL_SENSITIVITY:
          result.culturalSensitivity = await this.culturalTester.evaluateSensitivity(result);
          break;
      }

    } catch (error) {
      result = {
        testId: testCase.id,
        passed: false,
        duration: Date.now() - startTime,
        error: error as Error
      };
    }

    return result;
  }

  /**
   * Execute test case with timeout and retry logic
   */
  private async executeWithTimeout(testCase: TestCase): Promise<TestResult> {
    const timeout = testCase.timeout || this.config.defaultTimeout;
    const retries = testCase.retries || 0;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          testCase.execute(),
          new Promise<TestResult>((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), timeout)
          )
        ]);
        
        if (result.passed || attempt === retries) {
          return result;
        }
      } catch (error) {
        if (attempt === retries) {
          throw error;
        }
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    throw new Error('Test failed after all retries');
  }

  /**
   * Calculate overall spiritual alignment summary
   */
  private calculateSpiritualAlignmentSummary(results: TestResult[]): SpiritualAlignmentSummary {
    const alignmentResults = results
      .filter(r => r.spiritualAlignment)
      .map(r => r.spiritualAlignment!);

    if (alignmentResults.length === 0) {
      return {
        averageScore: 0,
        totalConcerns: 0,
        criticalIssues: [],
        recommendations: []
      };
    }

    const averageScore = alignmentResults.reduce((sum, a) => sum + a.overallScore, 0) / alignmentResults.length;
    const allConcerns = alignmentResults.flatMap(a => a.concerns);
    const criticalIssues = alignmentResults
      .filter(a => a.overallScore < 70)
      .map(a => ({ score: a.overallScore, concerns: a.concerns }));

    return {
      averageScore,
      totalConcerns: allConcerns.length,
      criticalIssues,
      recommendations: this.generateSpiritualRecommendations(alignmentResults)
    };
  }

  /**
   * Calculate overall cultural sensitivity summary
   */
  private calculateCulturalSensitivitySummary(results: TestResult[]): CulturalSensitivitySummary {
    const sensitivityResults = results
      .filter(r => r.culturalSensitivity)
      .map(r => r.culturalSensitivity!);

    if (sensitivityResults.length === 0) {
      return {
        averageScore: 0,
        totalFlags: 0,
        criticalIssues: [],
        recommendations: []
      };
    }

    const averageScore = sensitivityResults.reduce((sum, s) => sum + s.overallScore, 0) / sensitivityResults.length;
    const allFlags = sensitivityResults.flatMap(s => s.flaggedContent);
    const criticalIssues = sensitivityResults
      .filter(s => s.overallScore < 70)
      .map(s => ({ score: s.overallScore, flags: s.flaggedContent }));

    return {
      averageScore,
      totalFlags: allFlags.length,
      criticalIssues,
      recommendations: this.generateCulturalRecommendations(sensitivityResults)
    };
  }

  private generateSpiritualRecommendations(results: SpiritualAlignmentScore[]): string[] {
    const recommendations: string[] = [];
    
    const avgScripture = results.reduce((sum, r) => sum + r.scriptureAlignment, 0) / results.length;
    const avgProphetic = results.reduce((sum, r) => sum + r.propheticAccuracy, 0) / results.length;
    const avgKingdom = results.reduce((sum, r) => sum + r.kingdomPerspective, 0) / results.length;

    if (avgScripture < 80) {
      recommendations.push('Enhance scripture integration in AI responses');
    }
    if (avgProphetic < 75) {
      recommendations.push('Improve prophetic accuracy validation');
    }
    if (avgKingdom < 85) {
      recommendations.push('Strengthen kingdom perspective alignment');
    }

    return recommendations;
  }

  private generateCulturalRecommendations(results: CulturalSensitivityScore[]): string[] {
    const recommendations: string[] = [];
    
    const avgLanguage = results.reduce((sum, r) => sum + r.languageAccuracy, 0) / results.length;
    const avgCultural = results.reduce((sum, r) => sum + r.culturalContext, 0) / results.length;
    const avgRespect = results.reduce((sum, r) => sum + r.respectfulness, 0) / results.length;

    if (avgLanguage < 85) {
      recommendations.push('Improve multilingual accuracy');
    }
    if (avgCultural < 80) {
      recommendations.push('Enhance cultural context understanding');
    }
    if (avgRespect < 90) {
      recommendations.push('Strengthen respectfulness validation');
    }

    return recommendations;
  }
}

export interface TestRunResult {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  suiteResults: Map<string, TestSuiteResult>;
  overallResults: TestResult[];
  spiritualAlignmentSummary: SpiritualAlignmentSummary;
  culturalSensitivitySummary: CulturalSensitivitySummary;
}

export interface TestSuiteResult {
  suiteName: string;
  category: TestCategory;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
  testResults: TestResult[];
}

export interface SpiritualAlignmentSummary {
  averageScore: number;
  totalConcerns: number;
  criticalIssues: Array<{ score: number; concerns: string[] }>;
  recommendations: string[];
}

export interface CulturalSensitivitySummary {
  averageScore: number;
  totalFlags: number;
  criticalIssues: Array<{ score: number; flags: string[] }>;
  recommendations: string[];
}