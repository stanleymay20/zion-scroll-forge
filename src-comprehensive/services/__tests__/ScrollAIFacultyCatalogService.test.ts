/**
 * ScrollAI Faculty Catalog Service Tests
 * Comprehensive tests for the ScrollAI & Intelligence Faculty course catalog
 */

import { ScrollAIFacultyCatalogService } from '../ScrollAIFacultyCatalogService';
import { ScrollAICourseCatalogIntegration } from '../ScrollAICourseCatalogIntegration';
import {
  CourseLevel,
  DeliveryMode,
  SupremeScrollFaculty,
  CourseStatus,
  AssessmentType,
  CertificationLevel,
  DivineGuidanceLevel,
  TransformationArea
} from '../../types/curriculum-grid';

describe('ScrollAIFacultyCatalogService', () => {
  let service: ScrollAIFacultyCatalogService;
  let integration: ScrollAICourseCatalogIntegration;

  beforeEach(() => {
    service = new ScrollAIFacultyCatalogService();
    integration = new ScrollAICourseCatalogIntegration(service);
  });

  describe('Catalog Initialization', () => {
    test('should initialize with 1000+ total courses', () => {
      const catalog = service.getAICatalog();
      expect(catalog.totalCourses).toBeGreaterThanOrEqual(1000);
    });

    test('should have 6 main departments', () => {
      const catalog = service.getAICatalog();
      expect(catalog.departments).toHaveLength(6);
      
      const expectedDepartments = [
        'Prophetic AI Foundations',
        'ScrollAgent Development',
        'Neural Networks & Kingdom Ethics',
        'ScrollOS & AI Infrastructure',
        'Robotics & Physical AI',
        'Quantum Computing & Advanced AI'
      ];

      catalog.departments.forEach(dept => {
        expect(expectedDepartments).toContain(dept.name);
      });
    });

    test('should have correct course count distribution', () => {
      const catalog = service.getAICatalog();
      const expectedCounts = {
        'Prophetic AI Foundations': 200,
        'ScrollAgent Development': 180,
        'Neural Networks & Kingdom Ethics': 150,
        'ScrollOS & AI Infrastructure': 120,
        'Robotics & Physical AI': 180,
        'Quantum Computing & Advanced AI': 170
      };

      catalog.departments.forEach(dept => {
        expect(dept.courseCount).toBe(expectedCounts[dept.name as keyof typeof expectedCounts]);
      });
    });

    test('should have 3 specialization tracks', () => {
      const catalog = service.getAICatalog();
      expect(catalog.specializations).toHaveLength(3);
      
      const expectedSpecializations = [
        'ProphetGPT Development',
        'Kingdom Robotics',
        'Quantum Scroll Computing'
      ];

      catalog.specializations.forEach(spec => {
        expect(expectedSpecializations).toContain(spec.name);
      });
    });

    test('should have progression pathways', () => {
      const catalog = service.getAICatalog();
      expect(catalog.progressionPathways.length).toBeGreaterThan(0);
      
      const foundationPathway = catalog.progressionPathways.find(p => 
        p.id === 'ai-foundations-pathway'
      );
      expect(foundationPathway).toBeDefined();
      expect(foundationPathway?.levels).toHaveLength(3);
    });
  });

  describe('Specific Course Metadata', () => {
    test('should have SAI101 with correct metadata', () => {
      const course = service.getCourseByCode('SAI101');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Introduction to Prophetic Artificial Intelligence');
      expect(course?.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(course?.faculty).toBe(SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE);
      expect(course?.estimatedHours).toBe(45);
      expect(course?.xpReward).toBe(150);
      expect(course?.scrollCoinCost).toBe(0);
      expect(course?.prerequisites).toHaveLength(0);
      expect(course?.deliveryModes).toContain(DeliveryMode.ONLINE_PORTAL);
      expect(course?.deliveryModes).toContain(DeliveryMode.AI_TUTOR);
    });

    test('should have SAI202 with correct metadata', () => {
      const course = service.getCourseByCode('SAI202');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Building ScrollAgents with GPT & LangChain');
      expect(course?.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(course?.estimatedHours).toBe(60);
      expect(course?.xpReward).toBe(200);
      expect(course?.scrollCoinCost).toBe(75);
      expect(course?.prerequisites).toContain('SAI101');
      expect(course?.prerequisites).toContain('SAI201');
    });

    test('should have SAI301 with correct metadata', () => {
      const course = service.getCourseByCode('SAI301');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Neural Networks & Kingdom Ethics');
      expect(course?.level).toBe(CourseLevel.GRADUATE);
      expect(course?.estimatedHours).toBe(70);
      expect(course?.xpReward).toBe(280);
      expect(course?.scrollCoinCost).toBe(150);
      expect(course?.prerequisites).toContain('SAI201');
      expect(course?.prerequisites).toContain('SAI202');
    });

    test('should have SAI420 with correct metadata', () => {
      const course = service.getCourseByCode('SAI420');
      expect(course).toBeDefined();
      expect(course?.title).toBe('ScrollOS: Designing AI Operating Systems');
      expect(course?.level).toBe(CourseLevel.GRADUATE);
      expect(course?.estimatedHours).toBe(80);
      expect(course?.xpReward).toBe(320);
      expect(course?.scrollCoinCost).toBe(200);
      expect(course?.prerequisites).toContain('SAI301');
      expect(course?.prerequisites).toContain('SAI302');
      expect(course?.deliveryModes).toContain(DeliveryMode.XR_MODE);
      expect(course?.deliveryModes).toContain(DeliveryMode.RESEARCH_TRACK);
    });

    test('should have SAI450 with correct metadata', () => {
      const course = service.getCourseByCode('SAI450');
      expect(course).toBeDefined();
      expect(course?.title).toBe('Prophetic Prompt Engineering');
      expect(course?.level).toBe(CourseLevel.GRADUATE);
      expect(course?.estimatedHours).toBe(45);
      expect(course?.xpReward).toBe(180);
      expect(course?.scrollCoinCost).toBe(100);
      expect(course?.prerequisites).toContain('SAI302');
      expect(course?.prerequisites).toContain('SAI350');
      expect(course?.deliveryModes).toContain(DeliveryMode.MENTOR_SESSIONS);
    });

    test('should have SAIXR01 with correct metadata', () => {
      const xrCourses = service.getXRSpecializationCourses();
      const course = xrCourses.find(c => c.courseCode === 'SAIXR01');
      expect(course).toBeDefined();
      expect(course?.title).toBe('AI Bible Tutors in 3D');
      expect(course?.level).toBe(CourseLevel.XR_SPECIALIZATION);
      expect(course?.estimatedHours).toBe(60);
      expect(course?.xpReward).toBe(240);
      expect(course?.scrollCoinCost).toBe(150);
      expect(course?.prerequisites).toContain('SAI350');
      expect(course?.prerequisites).toContain('SBT201');
      expect(course?.deliveryModes).toContain(DeliveryMode.XR_MODE);
    });
  });

  describe('Course Organization and Structure', () => {
    test('should organize courses by department correctly', () => {
      const foundationsCourses = service.getCoursesByDepartment('prophetic-ai-foundations');
      expect(foundationsCourses.length).toBe(200);
      
      const agentCourses = service.getCoursesByDepartment('scrollagent-development');
      expect(agentCourses.length).toBe(180);
      
      const neuralCourses = service.getCoursesByDepartment('neural-networks-kingdom-ethics');
      expect(neuralCourses.length).toBe(150);
    });

    test('should filter courses by level', () => {
      const undergraduateCourses = service.getCoursesByLevel(CourseLevel.UNDERGRADUATE);
      const graduateCourses = service.getCoursesByLevel(CourseLevel.GRADUATE);
      const doctoralCourses = service.getCoursesByLevel(CourseLevel.DOCTORAL);

      expect(undergraduateCourses.length).toBeGreaterThan(0);
      expect(graduateCourses.length).toBeGreaterThan(0);
      expect(doctoralCourses.length).toBeGreaterThan(0);

      // Verify all courses have correct level
      undergraduateCourses.forEach(course => {
        expect(course.level).toBe(CourseLevel.UNDERGRADUATE);
      });
    });

    test('should filter courses by delivery mode', () => {
      const onlineCourses = service.getCoursesByDeliveryMode(DeliveryMode.ONLINE_PORTAL);
      const xrCourses = service.getCoursesByDeliveryMode(DeliveryMode.XR_MODE);
      const aiTutorCourses = service.getCoursesByDeliveryMode(DeliveryMode.AI_TUTOR);

      expect(onlineCourses.length).toBeGreaterThan(0);
      expect(xrCourses.length).toBeGreaterThan(0);
      expect(aiTutorCourses.length).toBeGreaterThan(0);

      // Verify courses contain the specified delivery mode
      onlineCourses.forEach(course => {
        expect(course.deliveryModes).toContain(DeliveryMode.ONLINE_PORTAL);
      });
    });
  });

  describe('Prerequisite System', () => {
    test('should have correct prerequisite mapping', () => {
      const prereqMapping = service.getAICatalog().prerequisiteMapping;
      
      // SAI101 should have no prerequisites
      expect(prereqMapping['SAI101'].required).toHaveLength(0);
      
      // SAI150 should require SAI101
      expect(prereqMapping['SAI150'].required).toContain('SAI101');
      
      // SAI201 should require SAI101 and SAI150
      expect(prereqMapping['SAI201'].required).toContain('SAI101');
      expect(prereqMapping['SAI201'].required).toContain('SAI150');
      
      // SAI302 should require SAI202 and SAI301
      expect(prereqMapping['SAI302'].required).toContain('SAI202');
      expect(prereqMapping['SAI302'].required).toContain('SAI301');
    });

    test('should validate prerequisites correctly', () => {
      // Test with no completed courses
      const validation1 = service.validatePrerequisites('SAI202', []);
      expect(validation1.canEnroll).toBe(false);
      expect(validation1.missingRequired).toContain('SAI101');
      expect(validation1.missingRequired).toContain('SAI201');

      // Test with some completed courses
      const validation2 = service.validatePrerequisites('SAI202', ['SAI101', 'SAI201']);
      expect(validation2.canEnroll).toBe(true);
      expect(validation2.missingRequired).toHaveLength(0);

      // Test advanced course
      const validation3 = service.validatePrerequisites('SAI420', ['SAI301', 'SAI302']);
      expect(validation3.canEnroll).toBe(true);
    });
  });

  describe('Specialization Tracks', () => {
    test('should have ProphetGPT Development specialization', () => {
      const specialization = service.getSpecialization('prophetgpt-development');
      expect(specialization).toBeDefined();
      expect(specialization?.name).toBe('ProphetGPT Development');
      expect(specialization?.requiredCourses).toContain('SAI202');
      expect(specialization?.requiredCourses).toContain('SAI302');
      expect(specialization?.requiredCourses).toContain('SAI350');
      expect(specialization?.requiredCourses).toContain('SAI450');
      expect(specialization?.careerPathways).toContain('Prophetic AI Developer');
    });

    test('should have Kingdom Robotics specialization', () => {
      const specialization = service.getSpecialization('kingdom-robotics');
      expect(specialization).toBeDefined();
      expect(specialization?.name).toBe('Kingdom Robotics');
      expect(specialization?.requiredCourses).toContain('SAI501');
      expect(specialization?.requiredCourses).toContain('SAI520');
      expect(specialization?.careerPathways).toContain('Humanitarian Robotics Engineer');
    });

    test('should have Quantum Scroll Computing specialization', () => {
      const specialization = service.getSpecialization('quantum-scroll-computing');
      expect(specialization).toBeDefined();
      expect(specialization?.name).toBe('Quantum Scroll Computing');
      expect(specialization?.requiredCourses).toContain('SAI601');
      expect(specialization?.requiredCourses).toContain('SAI650');
      expect(specialization?.careerPathways).toContain('Quantum Scroll Engineer');
    });

    test('should generate recommended sequence for specializations', () => {
      const sequence = service.getRecommendedSequence('prophetgpt-development');
      expect(sequence.length).toBeGreaterThan(0);
      
      // Should start with foundational courses
      const firstCourse = sequence[0];
      const firstCoursePrereqs = service.getCoursePrerequisites(firstCourse);
      expect(firstCoursePrereqs.required.length).toBe(0);
    });
  });

  describe('Search and Discovery', () => {
    test('should search courses by query', () => {
      const results = service.searchAICourses('prophetic');
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(course => {
        const matchesQuery = 
          course.title.toLowerCase().includes('prophetic') ||
          course.description.toLowerCase().includes('prophetic') ||
          course.courseCode.toLowerCase().includes('prophetic');
        expect(matchesQuery).toBe(true);
      });
    });

    test('should filter search results by level', () => {
      const results = service.searchAICourses('', {
        level: [CourseLevel.GRADUATE]
      });
      
      results.forEach(course => {
        expect(course.level).toBe(CourseLevel.GRADUATE);
      });
    });

    test('should filter search results by department', () => {
      const results = service.searchAICourses('', {
        department: ['Prophetic AI Foundations']
      });
      
      results.forEach(course => {
        expect(course.department).toBe('Prophetic AI Foundations');
      });
    });

    test('should filter search results by delivery mode', () => {
      const results = service.searchAICourses('', {
        deliveryMode: [DeliveryMode.XR_MODE]
      });
      
      results.forEach(course => {
        expect(course.deliveryModes).toContain(DeliveryMode.XR_MODE);
      });
    });
  });

  describe('Course Quality and Alignment', () => {
    test('should have proper spiritual alignment for all courses', () => {
      const allCourses = service.getAICatalog().departments.flatMap(dept => dept.courses);
      
      allCourses.forEach(course => {
        expect(course.propheticAlignment.alignmentScore).toBeGreaterThan(0);
        expect(course.propheticAlignment.alignmentScore).toBeLessThanOrEqual(100);
        expect(course.propheticAlignment.biblicalFoundation.length).toBeGreaterThan(0);
        expect(course.propheticAlignment.divineGuidanceLevel).toBeDefined();
      });
    });

    test('should have kingdom impact scores for all courses', () => {
      const allCourses = service.getAICatalog().departments.flatMap(dept => dept.courses);
      
      allCourses.forEach(course => {
        expect(course.kingdomImpact.impactScore).toBeGreaterThan(0);
        expect(course.kingdomImpact.impactScore).toBeLessThanOrEqual(100);
        expect(course.kingdomImpact.transformationAreas.length).toBeGreaterThan(0);
        expect(course.kingdomImpact.nationBuildingPotential).toBeGreaterThanOrEqual(0);
        expect(course.kingdomImpact.healingCapacity).toBeGreaterThanOrEqual(0);
        expect(course.kingdomImpact.governanceContribution).toBeGreaterThanOrEqual(0);
      });
    });

    test('should have scroll certification for all courses', () => {
      const allCourses = service.getAICatalog().departments.flatMap(dept => dept.courses);
      
      allCourses.forEach(course => {
        expect(course.scrollCertification.isScrollCertified).toBe(true);
        expect(course.scrollCertification.certificationLevel).toBeDefined();
        expect(course.scrollCertification.propheticValidation.isValidated).toBe(true);
        expect(course.scrollCertification.kingdomReadiness.readinessScore).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration Service', () => {
    test('should provide specific course metadata', () => {
      const metadata = integration.getSpecificCourseMetadata();
      
      expect(metadata['SAI101']).toBeDefined();
      expect(metadata['SAI202']).toBeDefined();
      expect(metadata['SAI301']).toBeDefined();
      expect(metadata['SAI420']).toBeDefined();
      expect(metadata['SAI450']).toBeDefined();
      expect(metadata['SAIXR01']).toBeDefined();
      
      // Verify metadata structure
      Object.values(metadata).forEach(courseMetadata => {
        expect(courseMetadata.courseCode).toBeDefined();
        expect(courseMetadata.title).toBeDefined();
        expect(courseMetadata.level).toBeDefined();
        expect(courseMetadata.description).toBeDefined();
        expect(courseMetadata.prerequisites).toBeDefined();
        expect(courseMetadata.deliveryModes).toBeDefined();
        expect(courseMetadata.estimatedHours).toBeGreaterThan(0);
        expect(courseMetadata.xpReward).toBeGreaterThan(0);
        expect(courseMetadata.propheticAlignment).toBeGreaterThan(0);
        expect(courseMetadata.kingdomImpact).toBeGreaterThan(0);
      });
    });

    test('should provide comprehensive faculty overview', () => {
      const overview = integration.getScrollAIFacultyOverview();
      
      expect(overview.faculty).toBe(SupremeScrollFaculty.SCROLL_AI_INTELLIGENCE);
      expect(overview.totalCourses).toBeGreaterThanOrEqual(1000);
      expect(overview.departments.length).toBe(6);
      expect(overview.specializations).toBe(3);
      expect(overview.progressionPathways).toBeGreaterThan(0);
      expect(overview.keyCoursesMetadata).toBeDefined();
      expect(overview.researchAreas.length).toBeGreaterThan(0);
      expect(overview.kingdomApplications.length).toBeGreaterThan(0);
      expect(overview.careerPathways.length).toBeGreaterThan(0);
    });

    test('should provide career pathway mapping', () => {
      const pathway1 = integration.getCoursePathwayForCareer('prophetic ai developer');
      expect(pathway1).toBeDefined();
      expect(pathway1?.specialization).toBe('ProphetGPT Development');
      expect(pathway1?.pathway.length).toBeGreaterThan(0);
      
      const pathway2 = integration.getCoursePathwayForCareer('humanitarian robotics engineer');
      expect(pathway2).toBeDefined();
      expect(pathway2?.specialization).toBe('Kingdom Robotics');
      
      const pathway3 = integration.getCoursePathwayForCareer('quantum scroll engineer');
      expect(pathway3).toBeDefined();
      expect(pathway3?.specialization).toBe('Quantum Scroll Computing');
    });
  });

  describe('Statistics and Analytics', () => {
    test('should provide accurate catalog statistics', () => {
      const stats = service.getCatalogStatistics();
      
      expect(stats.totalCourses).toBeGreaterThanOrEqual(1000);
      expect(stats.departmentCount).toBe(6);
      expect(stats.specializationCount).toBe(3);
      expect(stats.pathwayCount).toBeGreaterThan(0);
      expect(stats.departmentBreakdown.length).toBe(6);
      
      // Verify department breakdown
      stats.departmentBreakdown.forEach(dept => {
        expect(dept.name).toBeDefined();
        expect(dept.courseCount).toBeGreaterThan(0);
        expect(dept.focus).toBeDefined();
      });
    });

    test('should track all course codes', () => {
      const allCodes = service.getAllCourseCodes();
      expect(allCodes.length).toBeGreaterThanOrEqual(1000);
      
      // Verify key courses are included
      expect(allCodes).toContain('SAI101');
      expect(allCodes).toContain('SAI202');
      expect(allCodes).toContain('SAI301');
      expect(allCodes).toContain('SAI420');
      expect(allCodes).toContain('SAI450');
      
      // Verify no duplicates
      const uniqueCodes = new Set(allCodes);
      expect(uniqueCodes.size).toBe(allCodes.length);
    });
  });
});