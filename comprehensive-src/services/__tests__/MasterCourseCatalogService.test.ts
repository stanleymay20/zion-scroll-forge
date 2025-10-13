/**
 * Master Course Catalog Service Tests
 * Comprehensive tests for the course catalog infrastructure
 */

import { MasterCourseCatalogService } from '../MasterCourseCatalogService';
import { CourseSearchEngine } from '../CourseSearchEngine';
import { CourseRecommendationEngine } from '../CourseRecommendationEngine';
import { SpiritualAlignmentValidator } from '../SpiritualAlignmentValidator';
import {
  ScrollCourse,
  SupremeScrollFaculty,
  CourseLevel,
  CourseStatus,
  DeliveryMode,
  StudentProfile,
  CourseSearchCriteria,
  CourseGenerationRequest,
  PropheticGuidance,
  CulturalContext,
  UrgencyLevel,
  PropheticSource,
  PropheticUrgency,
  DivineGuidanceLevel,
  TransformationArea,
  SpiritualDiscipline,
  BloomsLevel,
  AssessmentType
} from '../../types/curriculum-grid';

describe('MasterCourseCatalogService', () => {
  let catalogService: MasterCourseCatalogService;
  let searchEngine: CourseSearchEngine;
  let recommendationEngine: CourseRecommendationEngine;
  let spiritualValidator: SpiritualAlignmentValidator;

  beforeEach(() => {
    catalogService = new MasterCourseCatalogService();
    searchEngine = new CourseSearchEngine();
    recommendationEngine = new CourseRecommendationEngine();
    spiritualValidator = new SpiritualAlignmentValidator();
  });

  describe('Faculty Management', () => {
    test('should initialize all 12 Supreme Scroll Faculties', () => {
      const faculties = catalogService.getAllFaculties();
      expect(faculties).toHaveLength(12);
      
      const facultyNames = faculties.map(f => f.faculty);
      expect(facultyNames).toContain(SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE);
      expect(facultyNames).toContain(SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE);
      expect(facultyNames).toContain(SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE);
      expect(facultyNames).toContain(SupremeScrollFaculty.SCROLL_THEOLOGY_BIBLE);
      expect(facultyNames).toContain(SupremeScrollFaculty.EDENIC_SCIENCE_BIOTECH);
      expect(facultyNames).toContain(SupremeScrollFaculty.GEOPROPHETIC_INTELLIGENCE);
      expect(facultyNames).toContain(SupremeScrollFaculty.SACRED_LABOR_ENTREPRENEURSHIP);
      expect(facultyNames).toContain(SupremeScrollFaculty.GLOBAL_MISSIONS_EVANGELISM);
      expect(facultyNames).toContain(SupremeScrollFaculty.DIVINE_PSYCHOLOGY_RESTORATION);
      expect(facultyNames).toContain(SupremeScrollFaculty.SCROLL_ARTS_STORYTELLING);
      expect(facultyNames).toContain(SupremeScrollFaculty.SCROLL_MEDICINE_HEALING);
      expect(facultyNames).toContain(SupremeScrollFaculty.EDUCATION_CURRICULUM);
    });

    test('should have correct target course counts for faculties', () => {
      const aiFaculty = catalogService.getFacultyConfiguration(SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE);
      expect(aiFaculty?.targetCourseCount).toBe(1000);

      const economyFaculty = catalogService.getFacultyConfiguration(SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE);
      expect(economyFaculty?.targetCourseCount).toBe(800);

      const theologyFaculty = catalogService.getFacultyConfiguration(SupremeScrollFaculty.SCROLL_THEOLOGY_BIBLE);
      expect(theologyFaculty?.targetCourseCount).toBe(1000);
    });

    test('should have departments for each faculty', () => {
      const aiFaculty = catalogService.getFacultyConfiguration(SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE);
      expect(aiFaculty?.departments).toBeDefined();
      expect(aiFaculty?.departments.length).toBeGreaterThan(0);
      
      const departmentNames = aiFaculty?.departments.map(d => d.name);
      expect(departmentNames).toContain('Prophetic AI Foundations');
      expect(departmentNames).toContain('ScrollAgent Development');
    });
  });

  describe('Course Management', () => {
    let sampleCourse: ScrollCourse;

    beforeEach(() => {
      sampleCourse = createSampleCourse();
    });

    test('should add a course to the catalog', async () => {
      const addedCourse = await catalogService.addCourse(sampleCourse);
      
      expect(addedCourse).toBeDefined();
      expect(addedCourse.id).toBe(sampleCourse.id);
      expect(addedCourse.scrollCertification.propheticValidation).toBeDefined();
    });

    test('should retrieve course by ID', async () => {
      await catalogService.addCourse(sampleCourse);
      const retrievedCourse = await catalogService.getCourseById(sampleCourse.id);
      
      expect(retrievedCourse).toBeDefined();
      expect(retrievedCourse?.id).toBe(sampleCourse.id);
      expect(retrievedCourse?.title).toBe(sampleCourse.title);
    });

    test('should get courses by faculty', async () => {
      await catalogService.addCourse(sampleCourse);
      const facultyCourses = catalogService.getCoursesByFaculty(sampleCourse.faculty);
      
      expect(facultyCourses).toHaveLength(1);
      expect(facultyCourses[0].id).toBe(sampleCourse.id);
    });

    test('should update faculty course count when adding courses', async () => {
      const initialStats = catalogService.getCatalogStatistics();
      const initialCount = initialStats.facultyStats.find(
        f => f.faculty === sampleCourse.faculty
      )?.currentCount || 0;

      await catalogService.addCourse(sampleCourse);
      
      const updatedStats = catalogService.getCatalogStatistics();
      const updatedCount = updatedStats.facultyStats.find(
        f => f.faculty === sampleCourse.faculty
      )?.currentCount || 0;

      expect(updatedCount).toBe(initialCount + 1);
    });
  });

  describe('Course Search', () => {
    beforeEach(async () => {
      // Add sample courses for search testing
      const courses = [
        createSampleCourse('ai-course-1', 'Introduction to Prophetic AI', SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE),
        createSampleCourse('ai-course-2', 'Advanced ScrollAgent Development', SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE),
        createSampleCourse('econ-course-1', 'ScrollCoin Economics', SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE),
        createSampleCourse('theo-course-1', 'Biblical Hermeneutics', SupremeScrollFaculty.SCROLL_THEOLOGY_BIBLE)
      ];

      for (const course of courses) {
        await catalogService.addCourse(course);
        searchEngine.indexCourse(course);
      }
    });

    test('should search courses by query', async () => {
      const criteria: CourseSearchCriteria = {
        query: 'AI'
      };

      const results = await catalogService.searchCourses(criteria);
      
      expect(results.courses.length).toBeGreaterThan(0);
      expect(results.courses.some(c => c.title.includes('AI'))).toBe(true);
    });

    test('should filter courses by faculty', async () => {
      const criteria: CourseSearchCriteria = {
        faculty: [SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE]
      };

      const results = await catalogService.searchCourses(criteria);
      
      expect(results.courses.length).toBeGreaterThan(0);
      expect(results.courses.every(c => c.faculty === SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE)).toBe(true);
    });

    test('should filter courses by level', async () => {
      const criteria: CourseSearchCriteria = {
        level: [CourseLevel.UNDERGRADUATE]
      };

      const results = await catalogService.searchCourses(criteria);
      
      expect(results.courses.every(c => c.level === CourseLevel.UNDERGRADUATE)).toBe(true);
    });

    test('should generate search facets', async () => {
      const criteria: CourseSearchCriteria = {};
      const results = await catalogService.searchCourses(criteria);
      
      expect(results.facets).toBeDefined();
      expect(results.facets.faculties.length).toBeGreaterThan(0);
      expect(results.facets.levels.length).toBeGreaterThan(0);
    });
  });

  describe('Course Recommendations', () => {
    let studentProfile: StudentProfile;

    beforeEach(async () => {
      studentProfile = createSampleStudentProfile();
      
      // Add sample courses
      const courses = [
        createSampleCourse('ai-course-1', 'Introduction to Prophetic AI', SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE),
        createSampleCourse('econ-course-1', 'ScrollCoin Economics', SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE)
      ];

      for (const course of courses) {
        await catalogService.addCourse(course);
      }
    });

    test('should generate personalized recommendations', async () => {
      const criteria: CourseSearchCriteria = {};
      const results = await catalogService.searchCourses(criteria, studentProfile);
      
      expect(results.recommendations).toBeDefined();
      expect(results.recommendations.length).toBeGreaterThan(0);
      
      const recommendation = results.recommendations[0];
      expect(recommendation.relevanceScore).toBeGreaterThan(0);
      expect(recommendation.reasoningFactors).toBeDefined();
      expect(recommendation.callingAlignment).toBeGreaterThan(0);
    });

    test('should calculate calling alignment', async () => {
      const criteria: CourseSearchCriteria = {};
      const results = await catalogService.searchCourses(criteria, studentProfile);
      
      const aiRecommendation = results.recommendations.find(
        r => r.course.faculty === SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE
      );
      
      expect(aiRecommendation).toBeDefined();
      expect(aiRecommendation?.callingAlignment).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Course Generation', () => {
    test('should generate course from request', async () => {
      const request: CourseGenerationRequest = {
        topic: 'Quantum Computing for Kingdom Advancement',
        faculty: SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE,
        level: CourseLevel.GRADUATE,
        propheticGuidance: {
          hasGuidance: true,
          source: PropheticSource.PROPHETIC_WORD,
          guidance: 'Quantum technologies will be key for end-time ministry',
          biblicalReferences: ['Daniel 12:4'],
          urgencyLevel: PropheticUrgency.HIGH,
          globalImpact: 'Revolutionary impact on global missions'
        },
        targetAudience: {
          primaryAudience: 'Advanced AI students',
          secondaryAudiences: ['Quantum researchers', 'Ministry leaders'],
          prerequisites: ['Basic quantum mechanics', 'AI fundamentals'],
          recommendedBackground: ['Computer science', 'Physics']
        },
        learningOutcomes: [
          {
            outcome: 'Master quantum computing principles',
            measurementCriteria: ['Quantum algorithm implementation', 'Theoretical understanding'],
            kingdomApplication: 'Apply quantum computing to kingdom advancement'
          }
        ],
        deliveryPreferences: [DeliveryMode.ONLINE_PORTAL, DeliveryMode.XR_MODE],
        culturalContext: CulturalContext.WESTERN,
        urgencyLevel: UrgencyLevel.URGENT
      };

      const generatedCourse = await catalogService.generateCourse(request);
      
      expect(generatedCourse).toBeDefined();
      expect(generatedCourse.courseOutline).toBeDefined();
      expect(generatedCourse.learningObjectives.length).toBeGreaterThan(0);
      expect(generatedCourse.spiritualObjectives.length).toBeGreaterThan(0);
      expect(generatedCourse.propheticValidation.isValidated).toBe(true);
    });

    test('should include prophetic validation in generated course', async () => {
      const request: CourseGenerationRequest = {
        topic: 'Test Course',
        faculty: SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE,
        level: CourseLevel.UNDERGRADUATE,
        propheticGuidance: {
          hasGuidance: true,
          source: PropheticSource.DIVINE_REVELATION,
          guidance: 'This course is divinely inspired',
          biblicalReferences: ['Proverbs 2:6'],
          urgencyLevel: PropheticUrgency.CRITICAL,
          globalImpact: 'Global transformation'
        },
        targetAudience: {
          primaryAudience: 'Students',
          secondaryAudiences: [],
          prerequisites: [],
          recommendedBackground: []
        },
        learningOutcomes: [],
        deliveryPreferences: [DeliveryMode.ONLINE_PORTAL],
        culturalContext: CulturalContext.WESTERN,
        urgencyLevel: UrgencyLevel.ROUTINE
      };

      const generatedCourse = await catalogService.generateCourse(request);
      
      expect(generatedCourse.propheticValidation.isValidated).toBe(true);
      expect(generatedCourse.propheticValidation.propheticAccuracy).toBeGreaterThan(90);
      expect(generatedCourse.propheticValidation.divineConfirmation).toBe(true);
    });
  });

  describe('Catalog Statistics', () => {
    test('should provide catalog statistics', () => {
      const stats = catalogService.getCatalogStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.totalCourses).toBeDefined();
      expect(stats.targetTotal).toBe(10000);
      expect(stats.facultyStats).toBeDefined();
      expect(stats.facultyStats.length).toBe(12);
      expect(stats.statusDistribution).toBeDefined();
    });

    test('should calculate progress towards 10,000 courses', () => {
      const stats = catalogService.getCatalogStatistics();
      
      expect(stats.progress).toBeDefined();
      expect(stats.progress).toBeGreaterThanOrEqual(0);
      expect(stats.progress).toBeLessThanOrEqual(100);
    });
  });

  describe('Spiritual Alignment Validation', () => {
    test('should validate course spiritual alignment', async () => {
      const course = createSampleCourse();
      const validation = await spiritualValidator.validateCourse(course);
      
      expect(validation).toBeDefined();
      expect(validation.isValid).toBeDefined();
      expect(validation.overallScore).toBeGreaterThan(0);
      expect(validation.validationDetails).toBeDefined();
    });

    test('should perform scroll authentication', async () => {
      const course = createSampleCourse();
      const authentication = await spiritualValidator.performScrollAuthentication(course);
      
      expect(authentication).toBeDefined();
      expect(authentication.isAuthenticated).toBeDefined();
      expect(authentication.propheticValidation).toBeDefined();
      expect(authentication.kingdomPowerLevel).toBeGreaterThan(0);
    });

    test('should generate quality metrics', async () => {
      const course = createSampleCourse();
      const metrics = await spiritualValidator.generateQualityMetrics(course);
      
      expect(metrics).toBeDefined();
      expect(metrics.scrollAuthentication).toBeDefined();
      expect(metrics.spiritualAlignment).toBeGreaterThan(0);
      expect(metrics.academicRigor).toBeGreaterThan(0);
      expect(metrics.kingdomRelevance).toBeGreaterThan(0);
    });
  });

  // Helper functions
  function createSampleCourse(
    id: string = 'test-course-1',
    title: string = 'Introduction to Prophetic AI',
    faculty: SupremeScrollFaculty = SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE
  ): ScrollCourse {
    return {
      id,
      courseCode: 'SAI101',
      title,
      description: 'Foundational course integrating AI principles with prophetic wisdom',
      level: CourseLevel.UNDERGRADUATE,
      faculty,
      department: 'Prophetic AI Foundations',
      learningObjectives: [
        {
          id: 'lo1',
          description: 'Understand AI principles',
          bloomsLevel: BloomsLevel.UNDERSTAND,
          assessmentCriteria: ['Demonstrates understanding'],
          kingdomApplication: 'Apply AI for kingdom purposes'
        }
      ],
      spiritualObjectives: [
        {
          id: 'so1',
          description: 'Develop spiritual discernment in AI',
          spiritualDiscipline: SpiritualDiscipline.SCRIPTURE_STUDY,
          characterDevelopment: ['Wisdom', 'Discernment'],
          propheticActivation: 'Prophetic insight in AI applications'
        }
      ],
      prerequisites: [],
      estimatedHours: 40,
      xpReward: 100,
      scrollCoinCost: 50,
      deliveryModes: [DeliveryMode.ONLINE_PORTAL, DeliveryMode.AI_TUTOR],
      assessmentMethods: [
        {
          type: AssessmentType.QUIZ,
          weight: 0.3,
          description: 'Module quizzes',
          rubric: {
            criteria: [],
            totalPoints: 100,
            passingScore: 70
          },
          spiritualComponent: true
        }
      ],
      scrollCertification: {
        isScrollCertified: true,
        certificationLevel: 'intermediate' as any,
        propheticValidation: {
          isValidated: false,
          validatedBy: [],
          validationDate: new Date(),
          propheticAccuracy: 0,
          biblicalAlignment: 0,
          divineConfirmation: false
        },
        kingdomReadiness: {
          readinessScore: 80,
          readinessAreas: [],
          developmentNeeds: []
        }
      },
      propheticAlignment: {
        alignmentScore: 85,
        propheticThemes: ['AI Ethics', 'Divine Wisdom', 'Kingdom Technology'],
        biblicalFoundation: [
          {
            reference: 'Proverbs 2:6',
            text: 'For the Lord gives wisdom; from his mouth come knowledge and understanding.',
            application: 'AI development requires divine wisdom',
            propheticSignificance: 'God is the source of all true intelligence'
          }
        ],
        divineGuidanceLevel: DivineGuidanceLevel.INSPIRED
      },
      kingdomImpact: {
        impactScore: 80,
        transformationAreas: [TransformationArea.PERSONAL, TransformationArea.COMMUNITY],
        nationBuildingPotential: 70,
        healingCapacity: 60,
        governanceContribution: 75
      },
      contentFramework: {
        modules: [],
        practicalComponents: [],
        xrExperiences: [],
        researchIntegration: {
          hasResearchComponent: true,
          researchAreas: ['AI Ethics'],
          publicationOpportunities: [],
          collaborationPotential: []
        }
      },
      resourceRequirements: [],
      status: CourseStatus.PUBLISHED,
      tags: ['AI', 'Prophetic', 'Technology', 'Kingdom'],
      language: 'English',
      culturalContext: [CulturalContext.WESTERN],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-creator',
      lastModifiedBy: 'test-creator'
    };
  }

  function createSampleStudentProfile(): StudentProfile {
    return {
      id: 'student-1',
      callingAssessment: {
        primaryCalling: 'Technology Ministry',
        secondaryCallings: ['AI Development', 'Digital Evangelism'],
        spiritualGifts: ['Teaching', 'Wisdom', 'Discernment'],
        ministryAreas: ['Technology', 'Education'],
        kingdomVision: 'Use technology to advance the Kingdom of God',
        propheticWords: []
      },
      learningHistory: {
        completedCourses: [],
        averageGrade: 85,
        preferredLearningStyle: 'visual' as any,
        engagementPatterns: [],
        strugglingAreas: [],
        excellenceAreas: ['Technology', 'Problem Solving']
      },
      spiritualGifts: ['Teaching', 'Wisdom'],
      careerGoals: ['AI Developer', 'Technology Minister'],
      preferredDeliveryModes: [DeliveryMode.ONLINE_PORTAL, DeliveryMode.AI_TUTOR],
      culturalBackground: CulturalContext.WESTERN,
      languagePreferences: ['English'],
      currentLevel: 'scroll_degree' as any,
      completedCourses: [],
      inProgressCourses: [],
      skillGaps: [
        {
          skill: 'Machine Learning',
          currentLevel: 30,
          targetLevel: 80,
          priority: 'high' as any
        }
      ]
    };
  }
});

describe('CourseSearchEngine', () => {
  let searchEngine: CourseSearchEngine;

  beforeEach(() => {
    searchEngine = new CourseSearchEngine();
  });

  test('should index and search courses', () => {
    const course = createSampleCourse();
    searchEngine.indexCourse(course);

    const suggestions = searchEngine.getSuggestions('prophetic');
    expect(suggestions.length).toBeGreaterThan(0);
  });

  test('should get popular terms', () => {
    const course1 = createSampleCourse('course-1', 'AI Course');
    const course2 = createSampleCourse('course-2', 'AI Advanced Course');
    
    searchEngine.indexCourse(course1);
    searchEngine.indexCourse(course2);

    const popularTerms = searchEngine.getPopularTerms(10);
    expect(popularTerms.length).toBeGreaterThan(0);
    expect(popularTerms.some(term => term.term === 'ai')).toBe(true);
  });

  test('should find related courses', () => {
    const course1 = createSampleCourse('course-1', 'AI Fundamentals');
    const course2 = createSampleCourse('course-2', 'Advanced AI Applications');
    
    searchEngine.indexCourse(course1);
    searchEngine.indexCourse(course2);

    const relatedCourses = searchEngine.getRelatedCourses('course-1', 5);
    expect(relatedCourses.length).toBeGreaterThan(0);
  });

  // Helper function (reuse from above)
  function createSampleCourse(
    id: string = 'test-course-1',
    title: string = 'Introduction to Prophetic AI',
    faculty: SupremeScrollFaculty = SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE
  ): ScrollCourse {
    return {
      id,
      courseCode: 'SAI101',
      title,
      description: 'Foundational course integrating AI principles with prophetic wisdom',
      level: CourseLevel.UNDERGRADUATE,
      faculty,
      department: 'Prophetic AI Foundations',
      learningObjectives: [
        {
          id: 'lo1',
          description: 'Understand AI principles',
          bloomsLevel: BloomsLevel.UNDERSTAND,
          assessmentCriteria: ['Demonstrates understanding'],
          kingdomApplication: 'Apply AI for kingdom purposes'
        }
      ],
      spiritualObjectives: [
        {
          id: 'so1',
          description: 'Develop spiritual discernment in AI',
          spiritualDiscipline: SpiritualDiscipline.SCRIPTURE_STUDY,
          characterDevelopment: ['Wisdom', 'Discernment'],
          propheticActivation: 'Prophetic insight in AI applications'
        }
      ],
      prerequisites: [],
      estimatedHours: 40,
      xpReward: 100,
      scrollCoinCost: 50,
      deliveryModes: [DeliveryMode.ONLINE_PORTAL, DeliveryMode.AI_TUTOR],
      assessmentMethods: [
        {
          type: AssessmentType.QUIZ,
          weight: 0.3,
          description: 'Module quizzes',
          rubric: {
            criteria: [],
            totalPoints: 100,
            passingScore: 70
          },
          spiritualComponent: true
        }
      ],
      scrollCertification: {
        isScrollCertified: true,
        certificationLevel: 'intermediate' as any,
        propheticValidation: {
          isValidated: false,
          validatedBy: [],
          validationDate: new Date(),
          propheticAccuracy: 0,
          biblicalAlignment: 0,
          divineConfirmation: false
        },
        kingdomReadiness: {
          readinessScore: 80,
          readinessAreas: [],
          developmentNeeds: []
        }
      },
      propheticAlignment: {
        alignmentScore: 85,
        propheticThemes: ['AI Ethics', 'Divine Wisdom', 'Kingdom Technology'],
        biblicalFoundation: [
          {
            reference: 'Proverbs 2:6',
            text: 'For the Lord gives wisdom; from his mouth come knowledge and understanding.',
            application: 'AI development requires divine wisdom',
            propheticSignificance: 'God is the source of all true intelligence'
          }
        ],
        divineGuidanceLevel: DivineGuidanceLevel.INSPIRED
      },
      kingdomImpact: {
        impactScore: 80,
        transformationAreas: [TransformationArea.PERSONAL, TransformationArea.COMMUNITY],
        nationBuildingPotential: 70,
        healingCapacity: 60,
        governanceContribution: 75
      },
      contentFramework: {
        modules: [],
        practicalComponents: [],
        xrExperiences: [],
        researchIntegration: {
          hasResearchComponent: true,
          researchAreas: ['AI Ethics'],
          publicationOpportunities: [],
          collaborationPotential: []
        }
      },
      resourceRequirements: [],
      status: CourseStatus.PUBLISHED,
      tags: ['AI', 'Prophetic', 'Technology', 'Kingdom'],
      language: 'English',
      culturalContext: [CulturalContext.WESTERN],
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-creator',
      lastModifiedBy: 'test-creator'
    };
  }
});