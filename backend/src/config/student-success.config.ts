/**
 * Student Success and Retention System Configuration
 * 
 * Configuration settings for the student success system including
 * Redis caching, alert thresholds, and integration endpoints.
 */

export const studentSuccessConfig = {
  // Redis Cache Configuration
  cache: {
    enabled: process.env.REDIS_ENABLED === 'true' || true,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_STUDENT_SUCCESS_DB || '2', 10),
    keyPrefix: 'student-success:',
    ttl: {
      profile: 3600, // 1 hour
      riskAssessment: 1800, // 30 minutes
      dashboard: 300, // 5 minutes
      metrics: 600, // 10 minutes
      alerts: 120, // 2 minutes
    },
  },

  // Risk Assessment Thresholds
  riskThresholds: {
    gpa: {
      critical: 2.0,
      high: 2.5,
      moderate: 3.0,
    },
    attendance: {
      critical: 60,
      high: 70,
      moderate: 80,
    },
    engagement: {
      critical: 40,
      high: 60,
      moderate: 75,
    },
    financialBalance: {
      critical: 5000,
      high: 3000,
      moderate: 1000,
    },
  },

  // Alert Configuration
  alerts: {
    enabled: true,
    channels: ['email', 'sms', 'in_app'],
    responseTimeThreshold: 48, // hours
    escalationThreshold: 72, // hours
    batchingWindow: 300, // 5 minutes
    maxAlertsPerDay: 10,
  },

  // Predictive Model Configuration
  predictiveModel: {
    enabled: true,
    version: process.env.PREDICTION_MODEL_VERSION || 'v1.0',
    accuracyThreshold: 0.85,
    confidenceThreshold: 0.70,
    retrainingInterval: 30, // days
    features: [
      'gpa',
      'attendance_rate',
      'engagement_score',
      'financial_health',
      'spiritual_formation',
      'social_connections',
    ],
  },

  // Integration Endpoints
  integrations: {
    sis: {
      enabled: true,
      baseUrl: process.env.SIS_API_URL || 'http://localhost:3000/api/sis',
      apiKey: process.env.SIS_API_KEY,
      timeout: 5000,
    },
    lms: {
      enabled: true,
      baseUrl: process.env.LMS_API_URL || 'http://localhost:3000/api/courses',
      apiKey: process.env.LMS_API_KEY,
      timeout: 5000,
    },
    spiritualFormation: {
      enabled: true,
      baseUrl: process.env.SPIRITUAL_API_URL || 'http://localhost:3000/api/spiritual-formation',
      apiKey: process.env.SPIRITUAL_API_KEY,
      timeout: 5000,
    },
    financialAid: {
      enabled: true,
      baseUrl: process.env.FINANCIAL_AID_API_URL || 'http://localhost:3000/api/scholarships',
      apiKey: process.env.FINANCIAL_AID_API_KEY,
      timeout: 5000,
    },
  },

  // Dashboard Configuration
  dashboard: {
    refreshInterval: 60000, // 1 minute
    maxStudentsPerPage: 50,
    defaultTimeRange: 30, // days
    metricsToDisplay: [
      'retention_rate',
      'graduation_rate',
      'at_risk_count',
      'intervention_success_rate',
      'average_gpa',
      'engagement_score',
    ],
  },

  // Intervention Configuration
  intervention: {
    autoCreateCases: true,
    assignmentAlgorithm: 'load_balanced', // 'load_balanced' | 'expertise_based' | 'random'
    maxCasesPerAdvisor: 25,
    checkpointFrequency: 7, // days
    successThreshold: 0.70,
    templates: {
      academic: ['tutoring', 'study_skills', 'time_management'],
      financial: ['emergency_aid', 'work_study', 'budget_counseling'],
      spiritual: ['mentorship', 'prayer_support', 'calling_discernment'],
      social: ['peer_groups', 'community_events', 'counseling'],
    },
  },

  // Privacy and Compliance
  privacy: {
    ferpaCompliant: true,
    gdprCompliant: true,
    dataRetentionYears: 7,
    anonymizationEnabled: true,
    familyAccessRequiresConsent: true,
    auditLogging: true,
  },

  // Performance Optimization
  performance: {
    batchSize: 100,
    parallelProcessing: true,
    maxConcurrentRequests: 10,
    queryTimeout: 30000, // 30 seconds
    cacheWarming: true,
  },

  // Notification Preferences
  notifications: {
    defaultChannels: ['email', 'in_app'],
    quietHours: {
      start: 22, // 10 PM
      end: 7, // 7 AM
    },
    digestFrequency: 'daily', // 'immediate' | 'hourly' | 'daily' | 'weekly'
    priorityOverride: true, // Critical alerts bypass quiet hours
  },

  // Analytics Configuration
  analytics: {
    cohortDefinitions: {
      freshman: { creditHours: { min: 0, max: 30 } },
      sophomore: { creditHours: { min: 31, max: 60 } },
      junior: { creditHours: { min: 61, max: 90 } },
      senior: { creditHours: { min: 91, max: 999 } },
    },
    benchmarkSources: [
      'national_average',
      'christian_education_average',
      'peer_institutions',
    ],
    reportingPeriods: ['semester', 'academic_year', 'calendar_year'],
  },

  // Feature Flags
  features: {
    predictiveAnalytics: true,
    familyPortal: true,
    peerMentoring: true,
    aiRecommendations: true,
    mobileAlerts: true,
    videoConferencing: false,
    gamification: true,
  },
};

export default studentSuccessConfig;
