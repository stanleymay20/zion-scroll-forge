/**
 * Course Content Creation System Configuration
 * "Whatever you do, work at it with all your heart, as working for the Lord" - Colossians 3:23
 */

export interface VideoProcessingConfig {
  resolution: {
    minimum: string;
    standard: string;
    high: string;
  };
  bitrate: {
    audio: number;
    video: {
      low: number;
      medium: number;
      high: number;
    };
  };
  formats: string[];
  captioning: {
    enabled: boolean;
    languages: string[];
    autoGenerate: boolean;
  };
  streaming: {
    adaptiveBitrate: boolean;
    hlsEnabled: boolean;
    dashEnabled: boolean;
  };
}

export interface QualityChecklistConfig {
  criteria: {
    videoQuality: {
      minResolution: string;
      minAudioQuality: number;
      maxVideoLength: number;
      minVideoLength: number;
    };
    writtenMaterials: {
      minPageCount: number;
      maxPageCount: number;
      requiredSections: string[];
      citationRequired: boolean;
    };
    assessmentRigor: {
      minQuestionBankSize: number;
      requiredAssessmentTypes: string[];
      rubricRequired: boolean;
    };
    spiritualIntegration: {
      biblicalFoundationRequired: boolean;
      minReflectionQuestions: number;
      theologicalReviewRequired: boolean;
    };
  };
  thresholds: {
    overallPassingScore: number;
    videoQualityMinScore: number;
    contentQualityMinScore: number;
    assessmentRigorMinScore: number;
    spiritualAlignmentMinScore: number;
  };
  totalPoints: number;
}

export interface BudgetConfig {
  categories: {
    production: number;
    faculty: number;
    materials: number;
    equipment: number;
    software: number;
    marketing: number;
  };
  defaultAllocations: {
    production: number;
    faculty: number;
    materials: number;
    equipment: number;
    software: number;
    marketing: number;
  };
  limits: {
    maxCoursebudget: number;
    minCourseBudget: number;
    alertThreshold: number;
  };
}

export interface TimelineConfig {
  templates: {
    standard: {
      planning: number;
      contentDevelopment: number;
      production: number;
      qualityReview: number;
      pilotTesting: number;
      launch: number;
    };
    accelerated: {
      planning: number;
      contentDevelopment: number;
      production: number;
      qualityReview: number;
      pilotTesting: number;
      launch: number;
    };
    comprehensive: {
      planning: number;
      contentDevelopment: number;
      production: number;
      qualityReview: number;
      pilotTesting: number;
      launch: number;
    };
  };
  milestones: {
    planning: string[];
    contentDevelopment: string[];
    production: string[];
    qualityReview: string[];
    pilotTesting: string[];
    launch: string[];
  };
  reminders: {
    daysBeforeDeadline: number[];
    escalationDays: number;
  };
}

export interface AutomationConfig {
  rules: {
    captioning: {
      enabled: boolean;
      autoTrigger: boolean;
      languages: string[];
    };
    formatting: {
      enabled: boolean;
      pdfGeneration: boolean;
      styleTemplate: string;
    };
    fileConversion: {
      enabled: boolean;
      supportedFormats: string[];
      compressionEnabled: boolean;
    };
    notifications: {
      enabled: boolean;
      channels: string[];
      templates: Record<string, string>;
    };
  };
}

export interface CourseConstitutionConfig {
  structure: {
    modules: {
      min: number;
      max: number;
    };
    lessonsPerModule: {
      min: number;
      max: number;
    };
    requiredComponents: string[];
  };
  content: {
    placeholderDetection: {
      enabled: boolean;
      patterns: string[];
      strictMode: boolean;
    };
    productionReadiness: {
      requireCompleteNotes: boolean;
      requireVideoScripts: boolean;
      requireExamples: boolean;
      requireReferences: boolean;
    };
  };
  assessments: {
    microAssessmentsRequired: boolean;
    midCourseAssessmentRequired: boolean;
    finalCapstoneRequired: boolean;
    minAssessmentsPerModule: number;
  };
  integratedFormation: {
    knowledgeDimensionRequired: boolean;
    skillDimensionRequired: boolean;
    characterDimensionRequired: boolean;
    callingDimensionRequired: boolean;
    minScorePerDimension: number;
  };
}

export interface RigorLevelConfig {
  levels: {
    BEGINNER: {
      depthScore: number;
      vocabularyComplexity: string;
      assessmentDifficulty: string;
      theoreticalDepth: string;
    };
    INTERMEDIATE: {
      depthScore: number;
      vocabularyComplexity: string;
      assessmentDifficulty: string;
      theoreticalDepth: string;
    };
    ADVANCED: {
      depthScore: number;
      vocabularyComplexity: string;
      assessmentDifficulty: string;
      theoreticalDepth: string;
    };
    STRATEGIC: {
      depthScore: number;
      vocabularyComplexity: string;
      assessmentDifficulty: string;
      theoreticalDepth: string;
    };
  };
  benchmarks: {
    eliteInstitutions: string[];
    comparisonCriteria: string[];
    minBenchmarkScore: number;
  };
  thresholds: {
    minDepthScore: number;
    minTechnicalAccuracy: number;
    minSpiritualIntegration: number;
    rejectionThreshold: number;
  };
}

export interface SpiritualAlignmentConfig {
  strictnessProfiles: {
    STRICT_SPIRITUAL: {
      christCenteredRequired: boolean;
      scriptureRootedRequired: boolean;
      theologicalDriftTolerance: number;
      toneProblemTolerance: number;
    };
    BALANCED: {
      christCenteredRequired: boolean;
      scriptureRootedRequired: boolean;
      theologicalDriftTolerance: number;
      toneProblemTolerance: number;
    };
    LIGHT_CHECK: {
      christCenteredRequired: boolean;
      scriptureRootedRequired: boolean;
      theologicalDriftTolerance: number;
      toneProblemTolerance: number;
    };
  };
  integrationPoints: {
    courseGeneration: boolean;
    moduleGeneration: boolean;
    lessonFinalization: boolean;
    aiTutorScripts: boolean;
    systemMessages: boolean;
    spiritualContentBlocks: boolean;
  };
  errorHandling: {
    autoCorrectionEnabled: boolean;
    maxCorrectionAttempts: number;
    stopOnCriticalError: boolean;
    surfaceAllIssues: boolean;
  };
  validation: {
    theologicalDriftDetection: boolean;
    toneProblemDetection: boolean;
    spiritualizationOfLazinessDetection: boolean;
    babylonianFlatteningDetection: boolean;
  };
}

export interface ScrollPedagogyConfig {
  lessonFlow: {
    steps: string[];
    required: boolean;
    validationEnabled: boolean;
  };
  aiTutor: {
    dualExplanationRequired: boolean;
    toneRequirements: {
      warm: boolean;
      wise: boolean;
      propheticButGrounded: boolean;
    };
    adaptToCallingContext: boolean;
  };
  assessmentDistribution: {
    formativeRequired: boolean;
    summativeRequired: boolean;
    reflectiveRequired: boolean;
    minFormativeCount: number;
    minSummativeCount: number;
    minReflectiveCount: number;
  };
  progressionModel: {
    levels: string[];
    mappingRequired: boolean;
    levelAppropriateContent: boolean;
  };
  priorityHierarchy: string[];
}

export interface CourseContentConfig {
  videoProcessing: VideoProcessingConfig;
  qualityChecklist: QualityChecklistConfig;
  budget: BudgetConfig;
  timeline: TimelineConfig;
  automation: AutomationConfig;
  courseConstitution: CourseConstitutionConfig;
  rigorLevel: RigorLevelConfig;
  spiritualAlignment: SpiritualAlignmentConfig;
  scrollPedagogy: ScrollPedagogyConfig;
}

export const courseContentConfig: CourseContentConfig = {
  videoProcessing: {
    resolution: {
      minimum: process.env.VIDEO_MIN_RESOLUTION || '720p',
      standard: process.env.VIDEO_STANDARD_RESOLUTION || '1080p',
      high: process.env.VIDEO_HIGH_RESOLUTION || '4K'
    },
    bitrate: {
      audio: parseInt(process.env.VIDEO_AUDIO_BITRATE || '128000'),
      video: {
        low: parseInt(process.env.VIDEO_BITRATE_LOW || '1000000'),
        medium: parseInt(process.env.VIDEO_BITRATE_MEDIUM || '2500000'),
        high: parseInt(process.env.VIDEO_BITRATE_HIGH || '5000000')
      }
    },
    formats: (process.env.VIDEO_FORMATS || 'mp4,webm,hls').split(','),
    captioning: {
      enabled: process.env.VIDEO_CAPTIONING_ENABLED !== 'false',
      languages: (process.env.VIDEO_CAPTION_LANGUAGES || 'en,es,fr,pt,zh,ar,hi,sw,ru').split(','),
      autoGenerate: process.env.VIDEO_AUTO_CAPTION !== 'false'
    },
    streaming: {
      adaptiveBitrate: process.env.VIDEO_ADAPTIVE_BITRATE !== 'false',
      hlsEnabled: process.env.VIDEO_HLS_ENABLED !== 'false',
      dashEnabled: process.env.VIDEO_DASH_ENABLED === 'true'
    }
  },

  qualityChecklist: {
    criteria: {
      videoQuality: {
        minResolution: process.env.QC_MIN_RESOLUTION || '720p',
        minAudioQuality: parseInt(process.env.QC_MIN_AUDIO_QUALITY || '64000'),
        maxVideoLength: parseInt(process.env.QC_MAX_VIDEO_LENGTH || '2700'),
        minVideoLength: parseInt(process.env.QC_MIN_VIDEO_LENGTH || '900')
      },
      writtenMaterials: {
        minPageCount: parseInt(process.env.QC_MIN_PAGE_COUNT || '10'),
        maxPageCount: parseInt(process.env.QC_MAX_PAGE_COUNT || '20'),
        requiredSections: (process.env.QC_REQUIRED_SECTIONS || 'summary,key_concepts,examples,practice_problems,real_world_applications').split(','),
        citationRequired: process.env.QC_CITATION_REQUIRED !== 'false'
      },
      assessmentRigor: {
        minQuestionBankSize: parseInt(process.env.QC_MIN_QUESTION_BANK || '50'),
        requiredAssessmentTypes: (process.env.QC_REQUIRED_ASSESSMENT_TYPES || 'QUIZ,ESSAY,PROJECT,ORAL_DEFENSE').split(','),
        rubricRequired: process.env.QC_RUBRIC_REQUIRED !== 'false'
      },
      spiritualIntegration: {
        biblicalFoundationRequired: process.env.QC_BIBLICAL_FOUNDATION_REQUIRED !== 'false',
        minReflectionQuestions: parseInt(process.env.QC_MIN_REFLECTION_QUESTIONS || '3'),
        theologicalReviewRequired: process.env.QC_THEOLOGICAL_REVIEW_REQUIRED !== 'false'
      }
    },
    thresholds: {
      overallPassingScore: parseFloat(process.env.QC_OVERALL_PASSING_SCORE || '0.8'),
      videoQualityMinScore: parseFloat(process.env.QC_VIDEO_MIN_SCORE || '0.85'),
      contentQualityMinScore: parseFloat(process.env.QC_CONTENT_MIN_SCORE || '0.8'),
      assessmentRigorMinScore: parseFloat(process.env.QC_ASSESSMENT_MIN_SCORE || '0.8'),
      spiritualAlignmentMinScore: parseFloat(process.env.QC_SPIRITUAL_MIN_SCORE || '0.9')
    },
    totalPoints: parseInt(process.env.QC_TOTAL_POINTS || '50')
  },

  budget: {
    categories: {
      production: parseFloat(process.env.BUDGET_CATEGORY_PRODUCTION || '0.35'),
      faculty: parseFloat(process.env.BUDGET_CATEGORY_FACULTY || '0.30'),
      materials: parseFloat(process.env.BUDGET_CATEGORY_MATERIALS || '0.15'),
      equipment: parseFloat(process.env.BUDGET_CATEGORY_EQUIPMENT || '0.10'),
      software: parseFloat(process.env.BUDGET_CATEGORY_SOFTWARE || '0.05'),
      marketing: parseFloat(process.env.BUDGET_CATEGORY_MARKETING || '0.05')
    },
    defaultAllocations: {
      production: parseFloat(process.env.BUDGET_DEFAULT_PRODUCTION || '10000'),
      faculty: parseFloat(process.env.BUDGET_DEFAULT_FACULTY || '8000'),
      materials: parseFloat(process.env.BUDGET_DEFAULT_MATERIALS || '4000'),
      equipment: parseFloat(process.env.BUDGET_DEFAULT_EQUIPMENT || '3000'),
      software: parseFloat(process.env.BUDGET_DEFAULT_SOFTWARE || '2000'),
      marketing: parseFloat(process.env.BUDGET_DEFAULT_MARKETING || '1500')
    },
    limits: {
      maxCoursebudget: parseFloat(process.env.BUDGET_MAX_COURSE || '50000'),
      minCourseBudget: parseFloat(process.env.BUDGET_MIN_COURSE || '5000'),
      alertThreshold: parseFloat(process.env.BUDGET_ALERT_THRESHOLD || '0.85')
    }
  },

  timeline: {
    templates: {
      standard: {
        planning: parseInt(process.env.TIMELINE_STANDARD_PLANNING || '14'),
        contentDevelopment: parseInt(process.env.TIMELINE_STANDARD_CONTENT || '30'),
        production: parseInt(process.env.TIMELINE_STANDARD_PRODUCTION || '21'),
        qualityReview: parseInt(process.env.TIMELINE_STANDARD_QA || '7'),
        pilotTesting: parseInt(process.env.TIMELINE_STANDARD_PILOT || '14'),
        launch: parseInt(process.env.TIMELINE_STANDARD_LAUNCH || '7')
      },
      accelerated: {
        planning: parseInt(process.env.TIMELINE_ACCELERATED_PLANNING || '7'),
        contentDevelopment: parseInt(process.env.TIMELINE_ACCELERATED_CONTENT || '21'),
        production: parseInt(process.env.TIMELINE_ACCELERATED_PRODUCTION || '14'),
        qualityReview: parseInt(process.env.TIMELINE_ACCELERATED_QA || '5'),
        pilotTesting: parseInt(process.env.TIMELINE_ACCELERATED_PILOT || '10'),
        launch: parseInt(process.env.TIMELINE_ACCELERATED_LAUNCH || '5')
      },
      comprehensive: {
        planning: parseInt(process.env.TIMELINE_COMPREHENSIVE_PLANNING || '21'),
        contentDevelopment: parseInt(process.env.TIMELINE_COMPREHENSIVE_CONTENT || '45'),
        production: parseInt(process.env.TIMELINE_COMPREHENSIVE_PRODUCTION || '30'),
        qualityReview: parseInt(process.env.TIMELINE_COMPREHENSIVE_QA || '14'),
        pilotTesting: parseInt(process.env.TIMELINE_COMPREHENSIVE_PILOT || '21'),
        launch: parseInt(process.env.TIMELINE_COMPREHENSIVE_LAUNCH || '14')
      }
    },
    milestones: {
      planning: ['Course outline approved', 'Learning objectives defined', 'Resource requirements identified'],
      contentDevelopment: ['Module 1 complete', 'Module 2 complete', 'All modules drafted', 'Spiritual integration reviewed'],
      production: ['Videos recorded', 'Videos edited', 'Materials formatted', 'Assessments created'],
      qualityReview: ['Quality checklist completed', 'Peer review complete', 'Revisions implemented'],
      pilotTesting: ['Pilot cohort recruited', 'Pilot launched', 'Feedback collected', 'Improvements implemented'],
      launch: ['Final approval received', 'Platform deployment', 'Marketing materials ready', 'Course live']
    },
    reminders: {
      daysBeforeDeadline: [7, 3, 1],
      escalationDays: parseInt(process.env.TIMELINE_ESCALATION_DAYS || '2')
    }
  },

  automation: {
    rules: {
      captioning: {
        enabled: process.env.AUTOMATION_CAPTIONING_ENABLED !== 'false',
        autoTrigger: process.env.AUTOMATION_CAPTIONING_AUTO !== 'false',
        languages: (process.env.AUTOMATION_CAPTION_LANGUAGES || 'en,es,fr,pt,zh,ar,hi,sw,ru').split(',')
      },
      formatting: {
        enabled: process.env.AUTOMATION_FORMATTING_ENABLED !== 'false',
        pdfGeneration: process.env.AUTOMATION_PDF_GEN !== 'false',
        styleTemplate: process.env.AUTOMATION_STYLE_TEMPLATE || 'scroll-university-standard'
      },
      fileConversion: {
        enabled: process.env.AUTOMATION_CONVERSION_ENABLED !== 'false',
        supportedFormats: (process.env.AUTOMATION_FORMATS || 'pdf,docx,epub,html').split(','),
        compressionEnabled: process.env.AUTOMATION_COMPRESSION !== 'false'
      },
      notifications: {
        enabled: process.env.AUTOMATION_NOTIFICATIONS_ENABLED !== 'false',
        channels: (process.env.AUTOMATION_NOTIFICATION_CHANNELS || 'email,sms,push').split(','),
        templates: {
          phaseComplete: 'phase_complete_template',
          approvalRequired: 'approval_required_template',
          deadlineApproaching: 'deadline_approaching_template',
          qualityIssue: 'quality_issue_template'
        }
      }
    }
  },

  courseConstitution: {
    structure: {
      modules: {
        min: parseInt(process.env.CONSTITUTION_MIN_MODULES || '4'),
        max: parseInt(process.env.CONSTITUTION_MAX_MODULES || '12')
      },
      lessonsPerModule: {
        min: parseInt(process.env.CONSTITUTION_MIN_LESSONS || '3'),
        max: parseInt(process.env.CONSTITUTION_MAX_LESSONS || '10')
      },
      requiredComponents: (process.env.CONSTITUTION_REQUIRED_COMPONENTS || 'lecture_notes,video_script,examples,key_scriptures_or_frameworks,references').split(',')
    },
    content: {
      placeholderDetection: {
        enabled: process.env.CONSTITUTION_PLACEHOLDER_DETECTION !== 'false',
        patterns: (process.env.CONSTITUTION_PLACEHOLDER_PATTERNS || 'TODO,FIXME,PLACEHOLDER,TBD,XXX,EXAMPLE').split(','),
        strictMode: process.env.CONSTITUTION_STRICT_MODE !== 'false'
      },
      productionReadiness: {
        requireCompleteNotes: process.env.CONSTITUTION_REQUIRE_NOTES !== 'false',
        requireVideoScripts: process.env.CONSTITUTION_REQUIRE_SCRIPTS !== 'false',
        requireExamples: process.env.CONSTITUTION_REQUIRE_EXAMPLES !== 'false',
        requireReferences: process.env.CONSTITUTION_REQUIRE_REFERENCES !== 'false'
      }
    },
    assessments: {
      microAssessmentsRequired: process.env.CONSTITUTION_MICRO_ASSESSMENTS !== 'false',
      midCourseAssessmentRequired: process.env.CONSTITUTION_MID_ASSESSMENT !== 'false',
      finalCapstoneRequired: process.env.CONSTITUTION_FINAL_CAPSTONE !== 'false',
      minAssessmentsPerModule: parseInt(process.env.CONSTITUTION_MIN_ASSESSMENTS_PER_MODULE || '2')
    },
    integratedFormation: {
      knowledgeDimensionRequired: process.env.CONSTITUTION_KNOWLEDGE_DIM !== 'false',
      skillDimensionRequired: process.env.CONSTITUTION_SKILL_DIM !== 'false',
      characterDimensionRequired: process.env.CONSTITUTION_CHARACTER_DIM !== 'false',
      callingDimensionRequired: process.env.CONSTITUTION_CALLING_DIM !== 'false',
      minScorePerDimension: parseFloat(process.env.CONSTITUTION_MIN_DIM_SCORE || '0.7')
    }
  },

  rigorLevel: {
    levels: {
      BEGINNER: {
        depthScore: parseFloat(process.env.RIGOR_BEGINNER_DEPTH || '0.3'),
        vocabularyComplexity: process.env.RIGOR_BEGINNER_VOCAB || 'basic',
        assessmentDifficulty: process.env.RIGOR_BEGINNER_ASSESSMENT || 'introductory',
        theoreticalDepth: process.env.RIGOR_BEGINNER_THEORY || 'foundational'
      },
      INTERMEDIATE: {
        depthScore: parseFloat(process.env.RIGOR_INTERMEDIATE_DEPTH || '0.6'),
        vocabularyComplexity: process.env.RIGOR_INTERMEDIATE_VOCAB || 'technical',
        assessmentDifficulty: process.env.RIGOR_INTERMEDIATE_ASSESSMENT || 'applied',
        theoreticalDepth: process.env.RIGOR_INTERMEDIATE_THEORY || 'conceptual'
      },
      ADVANCED: {
        depthScore: parseFloat(process.env.RIGOR_ADVANCED_DEPTH || '0.85'),
        vocabularyComplexity: process.env.RIGOR_ADVANCED_VOCAB || 'specialized',
        assessmentDifficulty: process.env.RIGOR_ADVANCED_ASSESSMENT || 'analytical',
        theoreticalDepth: process.env.RIGOR_ADVANCED_THEORY || 'comprehensive'
      },
      STRATEGIC: {
        depthScore: parseFloat(process.env.RIGOR_STRATEGIC_DEPTH || '0.95'),
        vocabularyComplexity: process.env.RIGOR_STRATEGIC_VOCAB || 'expert',
        assessmentDifficulty: process.env.RIGOR_STRATEGIC_ASSESSMENT || 'governance',
        theoreticalDepth: process.env.RIGOR_STRATEGIC_THEORY || 'systems-level'
      }
    },
    benchmarks: {
      eliteInstitutions: (process.env.RIGOR_BENCHMARK_INSTITUTIONS || 'MIT,Stanford,Oxford,Cambridge,Harvard,Yale,Princeton,ETH Zurich').split(','),
      comparisonCriteria: (process.env.RIGOR_COMPARISON_CRITERIA || 'content_depth,assessment_rigor,theoretical_foundation,practical_application').split(','),
      minBenchmarkScore: parseFloat(process.env.RIGOR_MIN_BENCHMARK_SCORE || '0.8')
    },
    thresholds: {
      minDepthScore: parseFloat(process.env.RIGOR_MIN_DEPTH_SCORE || '0.7'),
      minTechnicalAccuracy: parseFloat(process.env.RIGOR_MIN_TECHNICAL_ACCURACY || '0.9'),
      minSpiritualIntegration: parseFloat(process.env.RIGOR_MIN_SPIRITUAL_INTEGRATION || '0.8'),
      rejectionThreshold: parseFloat(process.env.RIGOR_REJECTION_THRESHOLD || '0.6')
    }
  },

  spiritualAlignment: {
    strictnessProfiles: {
      STRICT_SPIRITUAL: {
        christCenteredRequired: true,
        scriptureRootedRequired: true,
        theologicalDriftTolerance: parseFloat(process.env.SPIRITUAL_STRICT_DRIFT_TOLERANCE || '0.0'),
        toneProblemTolerance: parseFloat(process.env.SPIRITUAL_STRICT_TONE_TOLERANCE || '0.0')
      },
      BALANCED: {
        christCenteredRequired: true,
        scriptureRootedRequired: true,
        theologicalDriftTolerance: parseFloat(process.env.SPIRITUAL_BALANCED_DRIFT_TOLERANCE || '0.1'),
        toneProblemTolerance: parseFloat(process.env.SPIRITUAL_BALANCED_TONE_TOLERANCE || '0.15')
      },
      LIGHT_CHECK: {
        christCenteredRequired: false,
        scriptureRootedRequired: false,
        theologicalDriftTolerance: parseFloat(process.env.SPIRITUAL_LIGHT_DRIFT_TOLERANCE || '0.2'),
        toneProblemTolerance: parseFloat(process.env.SPIRITUAL_LIGHT_TONE_TOLERANCE || '0.1')
      }
    },
    integrationPoints: {
      courseGeneration: process.env.SPIRITUAL_VALIDATE_COURSE_GEN !== 'false',
      moduleGeneration: process.env.SPIRITUAL_VALIDATE_MODULE_GEN !== 'false',
      lessonFinalization: process.env.SPIRITUAL_VALIDATE_LESSON !== 'false',
      aiTutorScripts: process.env.SPIRITUAL_VALIDATE_AI_TUTOR !== 'false',
      systemMessages: process.env.SPIRITUAL_VALIDATE_SYSTEM_MSG !== 'false',
      spiritualContentBlocks: process.env.SPIRITUAL_VALIDATE_SPIRITUAL_BLOCKS !== 'false'
    },
    errorHandling: {
      autoCorrectionEnabled: process.env.SPIRITUAL_AUTO_CORRECTION !== 'false',
      maxCorrectionAttempts: parseInt(process.env.SPIRITUAL_MAX_CORRECTION_ATTEMPTS || '3'),
      stopOnCriticalError: process.env.SPIRITUAL_STOP_ON_CRITICAL !== 'false',
      surfaceAllIssues: process.env.SPIRITUAL_SURFACE_ALL_ISSUES !== 'false'
    },
    validation: {
      theologicalDriftDetection: process.env.SPIRITUAL_DETECT_DRIFT !== 'false',
      toneProblemDetection: process.env.SPIRITUAL_DETECT_TONE !== 'false',
      spiritualizationOfLazinessDetection: process.env.SPIRITUAL_DETECT_LAZINESS !== 'false',
      babylonianFlatteningDetection: process.env.SPIRITUAL_DETECT_FLATTENING !== 'false'
    }
  },

  scrollPedagogy: {
    lessonFlow: {
      steps: ['Ignition', 'Download', 'Demonstration', 'Activation', 'Reflection', 'Commission'],
      required: process.env.PEDAGOGY_FLOW_REQUIRED !== 'false',
      validationEnabled: process.env.PEDAGOGY_FLOW_VALIDATION !== 'false'
    },
    aiTutor: {
      dualExplanationRequired: process.env.PEDAGOGY_DUAL_EXPLANATION !== 'false',
      toneRequirements: {
        warm: process.env.PEDAGOGY_TONE_WARM !== 'false',
        wise: process.env.PEDAGOGY_TONE_WISE !== 'false',
        propheticButGrounded: process.env.PEDAGOGY_TONE_PROPHETIC !== 'false'
      },
      adaptToCallingContext: process.env.PEDAGOGY_ADAPT_CALLING !== 'false'
    },
    assessmentDistribution: {
      formativeRequired: process.env.PEDAGOGY_FORMATIVE_REQUIRED !== 'false',
      summativeRequired: process.env.PEDAGOGY_SUMMATIVE_REQUIRED !== 'false',
      reflectiveRequired: process.env.PEDAGOGY_REFLECTIVE_REQUIRED !== 'false',
      minFormativeCount: parseInt(process.env.PEDAGOGY_MIN_FORMATIVE || '3'),
      minSummativeCount: parseInt(process.env.PEDAGOGY_MIN_SUMMATIVE || '2'),
      minReflectiveCount: parseInt(process.env.PEDAGOGY_MIN_REFLECTIVE || '2')
    },
    progressionModel: {
      levels: ['Awareness & Vocabulary', 'Understanding & Analysis', 'Application & Problem Solving', 'System Design & Governance', 'Multiplication & Teaching Others'],
      mappingRequired: process.env.PEDAGOGY_LEVEL_MAPPING !== 'false',
      levelAppropriateContent: process.env.PEDAGOGY_LEVEL_APPROPRIATE !== 'false'
    },
    priorityHierarchy: [
      'Spiritual alignment',
      'Pedagogical integrity',
      'Content depth',
      'Technical correctness',
      'Delivery speed'
    ]
  }
};

/**
 * Validates configuration and throws error if required values are missing
 */
export function validateCourseContentConfig(): void {
  const requiredEnvVars: string[] = [];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for course content system: ${missingVars.join(', ')}`);
  }

  // Validate budget category percentages sum to 1.0
  const budgetSum = Object.values(courseContentConfig.budget.categories).reduce((sum, val) => sum + val, 0);
  if (Math.abs(budgetSum - 1.0) > 0.01) {
    throw new Error(`Budget category percentages must sum to 1.0, got ${budgetSum}`);
  }

  // Validate quality thresholds are between 0 and 1
  const thresholds = courseContentConfig.qualityChecklist.thresholds;
  Object.entries(thresholds).forEach(([key, value]) => {
    if (value < 0 || value > 1) {
      throw new Error(`Quality threshold ${key} must be between 0 and 1, got ${value}`);
    }
  });

  // Validate module and lesson ranges
  const { modules, lessonsPerModule } = courseContentConfig.courseConstitution.structure;
  if (modules.min > modules.max) {
    throw new Error(`Minimum modules (${modules.min}) cannot exceed maximum modules (${modules.max})`);
  }
  if (lessonsPerModule.min > lessonsPerModule.max) {
    throw new Error(`Minimum lessons per module (${lessonsPerModule.min}) cannot exceed maximum (${lessonsPerModule.max})`);
  }
}

export default courseContentConfig;
