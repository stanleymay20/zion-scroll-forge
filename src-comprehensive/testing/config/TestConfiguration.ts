/**
 * Test Configuration
 * Configuration settings for ScrollUniversity comprehensive testing framework
 */

import { AIValidationConfig } from '../validators/AIResponseValidator';
import { SpiritualValidationConfig } from '../validators/SpiritualAlignmentTester';
import { CulturalValidationConfig } from '../validators/CulturalSensitivityTester';
import { LoadTestConfig } from '../load/LoadTestingFramework';
import { ReportingConfig } from '../reporting/TestReporter';

export interface TestConfiguration {
  defaultTimeout: number;
  maxRetries: number;
  parallelExecution: boolean;
  ai: AIValidationConfig;
  spiritual: SpiritualValidationConfig;
  cultural: CulturalValidationConfig;
  load: LoadTestConfig;
  reporting: ReportingConfig;
  environment: TestEnvironment;
  globalSettings: GlobalTestSettings;
}

export interface TestEnvironment {
  name: 'development' | 'staging' | 'production';
  baseUrl: string;
  apiKey: string;
  databaseUrl: string;
  redisUrl: string;
  enableMocking: boolean;
  mockDataPath: string;
}

export interface GlobalTestSettings {
  enableSpiritualValidation: boolean;
  enableCulturalValidation: boolean;
  enablePerformanceTesting: boolean;
  enableLoadTesting: boolean;
  supportedLanguages: string[];
  targetRegions: string[];
  complianceStandards: string[];
  securityLevel: 'basic' | 'enhanced' | 'maximum';
}

export class TestConfigurationBuilder {
  private config: Partial<TestConfiguration> = {};

  /**
   * Set default test timeout
   */
  withTimeout(timeout: number): TestConfigurationBuilder {
    this.config.defaultTimeout = timeout;
    return this;
  }

  /**
   * Set maximum retries for failed tests
   */
  withMaxRetries(retries: number): TestConfigurationBuilder {
    this.config.maxRetries = retries;
    return this;
  }

  /**
   * Enable or disable parallel test execution
   */
  withParallelExecution(enabled: boolean): TestConfigurationBuilder {
    this.config.parallelExecution = enabled;
    return this;
  }

  /**
   * Configure AI validation settings
   */
  withAIValidation(config: AIValidationConfig): TestConfigurationBuilder {
    this.config.ai = config;
    return this;
  }

  /**
   * Configure spiritual alignment validation
   */
  withSpiritualValidation(config: SpiritualValidationConfig): TestConfigurationBuilder {
    this.config.spiritual = config;
    return this;
  }

  /**
   * Configure cultural sensitivity validation
   */
  withCulturalValidation(config: CulturalValidationConfig): TestConfigurationBuilder {
    this.config.cultural = config;
    return this;
  }

  /**
   * Configure load testing settings
   */
  withLoadTesting(config: LoadTestConfig): TestConfigurationBuilder {
    this.config.load = config;
    return this;
  }

  /**
   * Configure reporting settings
   */
  withReporting(config: ReportingConfig): TestConfigurationBuilder {
    this.config.reporting = config;
    return this;
  }

  /**
   * Set test environment
   */
  withEnvironment(environment: TestEnvironment): TestConfigurationBuilder {
    this.config.environment = environment;
    return this;
  }

  /**
   * Set global test settings
   */
  withGlobalSettings(settings: GlobalTestSettings): TestConfigurationBuilder {
    this.config.globalSettings = settings;
    return this;
  }

  /**
   * Build the complete test configuration
   */
  build(): TestConfiguration {
    return {
      defaultTimeout: this.config.defaultTimeout || 30000,
      maxRetries: this.config.maxRetries || 2,
      parallelExecution: this.config.parallelExecution || true,
      ai: this.config.ai || this.getDefaultAIConfig(),
      spiritual: this.config.spiritual || this.getDefaultSpiritualConfig(),
      cultural: this.config.cultural || this.getDefaultCulturalConfig(),
      load: this.config.load || this.getDefaultLoadConfig(),
      reporting: this.config.reporting || this.getDefaultReportingConfig(),
      environment: this.config.environment || this.getDefaultEnvironment(),
      globalSettings: this.config.globalSettings || this.getDefaultGlobalSettings()
    };
  }

  private getDefaultAIConfig(): AIValidationConfig {
    return {
      coherenceThreshold: 80,
      accuracyThreshold: 85,
      responseTimeThreshold: 5000,
      enableHallucinationDetection: true,
      enableBiasDetection: true
    };
  }

  private getDefaultSpiritualConfig(): SpiritualValidationConfig {
    return {
      scriptureAlignmentThreshold: 85,
      propheticAccuracyThreshold: 80,
      kingdomPerspectiveThreshold: 85,
      characterFormationThreshold: 80,
      enablePropheticValidation: true,
      enableDoctrinalChecking: true
    };
  }

  private getDefaultCulturalConfig(): CulturalValidationConfig {
    return {
      supportedLanguages: ['english', 'spanish', 'french', 'twi', 'yoruba', 'arabic', 'hebrew', 'chinese'],
      culturalContexts: ['west-africa', 'middle-east', 'latin-america', 'asia', 'europe', 'north-america'],
      sensitivityThreshold: 80,
      respectfulnessThreshold: 90,
      inclusivityThreshold: 85,
      enableOffensiveContentDetection: true,
      enableCulturalBiasDetection: true
    };
  }

  private getDefaultLoadConfig(): LoadTestConfig {
    return {
      maxConcurrentUsers: 1000,
      testDuration: 300, // 5 minutes
      rampUpTime: 60, // 1 minute
      targetRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'af-south-1'],
      testScenarios: [],
      performanceThresholds: {
        averageResponseTime: 2000,
        maxResponseTime: 5000,
        errorRate: 1,
        throughput: 100,
        cpuUtilization: 80,
        memoryUtilization: 85
      }
    };
  }

  private getDefaultReportingConfig(): ReportingConfig {
    return {
      outputFormat: 'html',
      outputDirectory: './test-reports',
      includeDetailedResults: true,
      includeSpiritualAnalysis: true,
      includeCulturalAnalysis: true,
      includePerformanceMetrics: true,
      generateCharts: true
    };
  }

  private getDefaultEnvironment(): TestEnvironment {
    return {
      name: 'development',
      baseUrl: 'http://localhost:3000',
      apiKey: 'test-api-key',
      databaseUrl: 'postgresql://localhost:5432/scrolluniversity_test',
      redisUrl: 'redis://localhost:6379',
      enableMocking: true,
      mockDataPath: './test-data/mocks'
    };
  }

  private getDefaultGlobalSettings(): GlobalTestSettings {
    return {
      enableSpiritualValidation: true,
      enableCulturalValidation: true,
      enablePerformanceTesting: true,
      enableLoadTesting: false, // Disabled by default for regular test runs
      supportedLanguages: ['english', 'spanish', 'french', 'twi', 'yoruba', 'arabic', 'hebrew', 'chinese'],
      targetRegions: ['north-america', 'europe', 'africa', 'asia', 'middle-east', 'latin-america'],
      complianceStandards: ['GDPR', 'CCPA', 'SOC2', 'ISO27001'],
      securityLevel: 'enhanced'
    };
  }
}

/**
 * Predefined configurations for different environments
 */
export class TestConfigurations {
  /**
   * Development environment configuration
   */
  static development(): TestConfiguration {
    return new TestConfigurationBuilder()
      .withTimeout(10000)
      .withMaxRetries(1)
      .withParallelExecution(true)
      .withEnvironment({
        name: 'development',
        baseUrl: 'http://localhost:3000',
        apiKey: 'dev-api-key',
        databaseUrl: 'postgresql://localhost:5432/scrolluniversity_dev',
        redisUrl: 'redis://localhost:6379',
        enableMocking: true,
        mockDataPath: './test-data/dev-mocks'
      })
      .withGlobalSettings({
        enableSpiritualValidation: true,
        enableCulturalValidation: true,
        enablePerformanceTesting: false,
        enableLoadTesting: false,
        supportedLanguages: ['english', 'spanish'],
        targetRegions: ['north-america'],
        complianceStandards: [],
        securityLevel: 'basic'
      })
      .build();
  }

  /**
   * Staging environment configuration
   */
  static staging(): TestConfiguration {
    return new TestConfigurationBuilder()
      .withTimeout(20000)
      .withMaxRetries(2)
      .withParallelExecution(true)
      .withEnvironment({
        name: 'staging',
        baseUrl: 'https://staging.scrolluniversity.org',
        apiKey: 'staging-api-key',
        databaseUrl: 'postgresql://staging-db:5432/scrolluniversity',
        redisUrl: 'redis://staging-redis:6379',
        enableMocking: false,
        mockDataPath: ''
      })
      .withGlobalSettings({
        enableSpiritualValidation: true,
        enableCulturalValidation: true,
        enablePerformanceTesting: true,
        enableLoadTesting: true,
        supportedLanguages: ['english', 'spanish', 'french', 'twi', 'yoruba'],
        targetRegions: ['north-america', 'europe', 'africa'],
        complianceStandards: ['GDPR', 'CCPA'],
        securityLevel: 'enhanced'
      })
      .build();
  }

  /**
   * Production environment configuration
   */
  static production(): TestConfiguration {
    return new TestConfigurationBuilder()
      .withTimeout(30000)
      .withMaxRetries(3)
      .withParallelExecution(true)
      .withEnvironment({
        name: 'production',
        baseUrl: 'https://scrolluniversity.org',
        apiKey: process.env.PROD_API_KEY || '',
        databaseUrl: process.env.DATABASE_URL || '',
        redisUrl: process.env.REDIS_URL || '',
        enableMocking: false,
        mockDataPath: ''
      })
      .withGlobalSettings({
        enableSpiritualValidation: true,
        enableCulturalValidation: true,
        enablePerformanceTesting: true,
        enableLoadTesting: true,
        supportedLanguages: ['english', 'spanish', 'french', 'twi', 'yoruba', 'arabic', 'hebrew', 'chinese'],
        targetRegions: ['north-america', 'europe', 'africa', 'asia', 'middle-east', 'latin-america'],
        complianceStandards: ['GDPR', 'CCPA', 'SOC2', 'ISO27001'],
        securityLevel: 'maximum'
      })
      .withLoadTesting({
        maxConcurrentUsers: 10000,
        testDuration: 1800, // 30 minutes
        rampUpTime: 300, // 5 minutes
        targetRegions: ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1', 'ap-northeast-1', 'af-south-1'],
        testScenarios: [],
        performanceThresholds: {
          averageResponseTime: 1000,
          maxResponseTime: 3000,
          errorRate: 0.1,
          throughput: 1000,
          cpuUtilization: 70,
          memoryUtilization: 75
        }
      })
      .build();
  }

  /**
   * CI/CD pipeline configuration
   */
  static cicd(): TestConfiguration {
    return new TestConfigurationBuilder()
      .withTimeout(15000)
      .withMaxRetries(2)
      .withParallelExecution(true)
      .withEnvironment({
        name: 'staging',
        baseUrl: process.env.CI_BASE_URL || 'http://localhost:3000',
        apiKey: process.env.CI_API_KEY || 'ci-api-key',
        databaseUrl: process.env.CI_DATABASE_URL || 'postgresql://localhost:5432/scrolluniversity_ci',
        redisUrl: process.env.CI_REDIS_URL || 'redis://localhost:6379',
        enableMocking: true,
        mockDataPath: './test-data/ci-mocks'
      })
      .withGlobalSettings({
        enableSpiritualValidation: true,
        enableCulturalValidation: true,
        enablePerformanceTesting: true,
        enableLoadTesting: false, // Disabled in CI for speed
        supportedLanguages: ['english', 'spanish', 'french'],
        targetRegions: ['north-america'],
        complianceStandards: ['GDPR'],
        securityLevel: 'enhanced'
      })
      .withReporting({
        outputFormat: 'json',
        outputDirectory: './ci-reports',
        includeDetailedResults: false,
        includeSpiritualAnalysis: true,
        includeCulturalAnalysis: true,
        includePerformanceMetrics: true,
        generateCharts: false
      })
      .build();
  }

  /**
   * Load testing specific configuration
   */
  static loadTesting(): TestConfiguration {
    return new TestConfigurationBuilder()
      .withTimeout(60000)
      .withMaxRetries(0)
      .withParallelExecution(true)
      .withEnvironment({
        name: 'staging',
        baseUrl: 'https://staging.scrolluniversity.org',
        apiKey: 'load-test-api-key',
        databaseUrl: 'postgresql://staging-db:5432/scrolluniversity',
        redisUrl: 'redis://staging-redis:6379',
        enableMocking: false,
        mockDataPath: ''
      })
      .withGlobalSettings({
        enableSpiritualValidation: false,
        enableCulturalValidation: false,
        enablePerformanceTesting: true,
        enableLoadTesting: true,
        supportedLanguages: ['english'],
        targetRegions: ['north-america', 'europe', 'africa', 'asia'],
        complianceStandards: [],
        securityLevel: 'basic'
      })
      .withLoadTesting({
        maxConcurrentUsers: 5000,
        testDuration: 900, // 15 minutes
        rampUpTime: 180, // 3 minutes
        targetRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1', 'af-south-1'],
        testScenarios: [],
        performanceThresholds: {
          averageResponseTime: 1500,
          maxResponseTime: 4000,
          errorRate: 0.5,
          throughput: 500,
          cpuUtilization: 75,
          memoryUtilization: 80
        }
      })
      .build();
  }
}

/**
 * Configuration validator
 */
export class ConfigurationValidator {
  /**
   * Validate test configuration
   */
  static validate(config: TestConfiguration): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate timeouts
    if (config.defaultTimeout < 1000) {
      warnings.push('Default timeout is very low (< 1 second)');
    }
    if (config.defaultTimeout > 60000) {
      warnings.push('Default timeout is very high (> 1 minute)');
    }

    // Validate AI configuration
    if (config.ai.coherenceThreshold < 50 || config.ai.coherenceThreshold > 100) {
      errors.push('AI coherence threshold must be between 50 and 100');
    }
    if (config.ai.accuracyThreshold < 50 || config.ai.accuracyThreshold > 100) {
      errors.push('AI accuracy threshold must be between 50 and 100');
    }

    // Validate spiritual configuration
    if (config.spiritual.scriptureAlignmentThreshold < 50 || config.spiritual.scriptureAlignmentThreshold > 100) {
      errors.push('Scripture alignment threshold must be between 50 and 100');
    }

    // Validate cultural configuration
    if (config.cultural.supportedLanguages.length === 0) {
      errors.push('At least one supported language must be specified');
    }

    // Validate load testing configuration
    if (config.load.maxConcurrentUsers < 1) {
      errors.push('Max concurrent users must be at least 1');
    }
    if (config.load.testDuration < 10) {
      errors.push('Test duration must be at least 10 seconds');
    }

    // Validate environment configuration
    if (!config.environment.baseUrl) {
      errors.push('Base URL is required');
    }
    if (!config.environment.baseUrl.startsWith('http')) {
      errors.push('Base URL must start with http or https');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}