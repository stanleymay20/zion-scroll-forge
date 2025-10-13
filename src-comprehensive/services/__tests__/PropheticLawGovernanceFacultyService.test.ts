/**
 * Prophetic Law & Global Governance Faculty Service Tests
 * Comprehensive testing of faculty setup and course creation
 */

import { PropheticLawGovernanceFacultyService } from '../PropheticLawGovernanceFacultyService';
import { PropheticLawCourseContentService } from '../PropheticLawCourseContentService';
import { SupremeScrollFaculty, CourseLevel, DeliveryMode } from '../../types/curriculum-grid';

// Mock Prisma Client
const mockPrisma = {
  faculty: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
  course: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('PropheticLawGovernanceFacultyService', () => {
  let service: PropheticLawGovernanceFacultyService;
  let contentService: PropheticLawCourseContentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PropheticLawGovernanceFacultyService(mockPrisma as any);
    contentService = new PropheticLawCourseContentService();
  });

  describe('Faculty Configuration', () => {
    test('should initialize faculty configuration correctly', () => {
      const config = service.getFacultyConfiguration();
      
      expect(config.faculty).toBe(SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE);
      expect(config.description).toContain('Divine law principles');
      expect(config.targetCourseCount).toBe(700);
      expect(config.departments).toHaveLength(4);
      expect(config.departments[0].name).toBe('Covenant Law Foundations');
      expect(config.departments[1].name).toBe('Constitutional Design & Nation Building');
      expect(config.departments[2].name).toBe('International Law & Global Governance');
      expect(config.departments[3].name).toBe('ScrollCourt Systems & Legal Practice');
    });

    test('should have proper spiritual oversight configuration', () => {
      const config = service.getFacultyConfiguration();
      
      expect(config.spiritualOversight.oversightLevel).toBe('prophetic');
      expect(config.spiritualOversight.propheticInput).toBe(true);
      expect(config.spiritualOversight.prayerCoverage).toBe(true);
      expect(config.spiritualOversight.spiritualMentors).toContain('Prophet Council of Governance');
    });

    test('should support multiple cultural adaptations', () => {
      const config = service.getFacultyConfiguration();
      
      expect(config.globalAdaptation.supportedLanguages).toContain('English');
      expect(config.globalAdaptation.supportedLanguages).toContain('Arabic');
      expect(config.globalAdaptation.supportedLanguages).toContain('Swahili');
      
      const africanAdaptation = config.globalAdaptation.culturalAdaptations.find(
        a => a.culture === 'african'
      );
      expect(africanAdaptation).toBeDefined();
      expect(africanAdaptation?.adaptations).toContain('Ubuntu governance principles');
    });
  });

  describe('Core Course Creation', () => {
    beforeEach(() => {
      mockPrisma.faculty.upsert.mockResolvedValue({
        id: 'faculty-1',
        name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE,
        description: 'Divine law principles',
        isActive: true
      });

      mockPrisma.course.create.mockResolvedValue({
        id: 'course-1',
        title: 'Test Course',
        description: 'Test Description',
        faculty: { name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE },
        enrollments: [],
        assignments: []
      });
    });

    test('should create SLG100 course with comprehensive content', async () => {
      const courses = await service.createCoreCourses();
      const slg100 = courses.find(c => c.courseCode === 'SLG100');
      
      expect(slg100).toBeDefined();
      expect(slg100?.title).toBe('Covenant Law vs Western Law');
      expect(slg100?.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(slg100?.faculty).toBe(SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE);
      expect(slg100?.department).toBe('Covenant Law Foundations');
      expect(slg100?.deliveryModes).toContain(DeliveryMode.ONLINE_PORTAL);
      expect(slg100?.deliveryModes).toContain(DeliveryMode.XR_MODE);
      expect(slg100?.legalPrinciples).toBeDefined();
      expect(slg100?.legalPrinciples.length).toBeGreaterThan(0);
    });

    test('should create SLG204 course with constitutional elements', async () => {
      const courses = await service.createCoreCourses();
      const slg204 = courses.find(c => c.courseCode === 'SLG204');
      
      expect(slg204).toBeDefined();
      expect(slg204?.title).toBe('Kingdom vs Babylonian Legal Systems');
      expect(slg204?.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(slg204?.constitutionalElements).toBeDefined();
      expect(slg204?.constitutionalElements.length).toBeGreaterThan(0);
      
      const divineAuthority = slg204?.constitutionalElements.find(
        e => e.element === 'Divine Authority Structure'
      );
      expect(divineAuthority).toBeDefined();
    });

    test('should create SLG300 course with international law integration', async () => {
      const courses = await service.createCoreCourses();
      const slg300 = courses.find(c => c.courseCode === 'SLG300');
      
      expect(slg300).toBeDefined();
      expect(slg300?.title).toBe('International Law & SDG Reform');
      expect(slg300?.level).toBe(CourseLevel.GRADUATE);
      expect(slg300?.internationalLawIntegration).toBeDefined();
      expect(slg300?.internationalLawIntegration.treaties.length).toBeGreaterThan(0);
      expect(slg300?.internationalLawIntegration.organizations).toContain('United Nations');
    });

    test('should create SLG410 course with ScrollCourt training', async () => {
      const courses = await service.createCoreCourses();
      const slg410 = courses.find(c => c.courseCode === 'SLG410');
      
      expect(slg410).toBeDefined();
      expect(slg410?.title).toBe('ScrollConstitutions & Divine Governance');
      expect(slg410?.level).toBe(CourseLevel.GRADUATE);
      expect(slg410?.scrollCourtTraining).toBeDefined();
      expect(slg410?.scrollCourtTraining.courtProcedures.length).toBeGreaterThan(0);
      expect(slg410?.scrollCourtTraining.xrSimulations).toContain('Ancient Israel Court Experience');
    });

    test('should create SLGLAB practical experience course', async () => {
      const courses = await service.createCoreCourses();
      const slglab = courses.find(c => c.courseCode === 'SLGLAB');
      
      expect(slglab).toBeDefined();
      expect(slglab?.title).toBe('UN Simulations & Diplomatic Training');
      expect(slglab?.level).toBe(CourseLevel.CERTIFICATE);
      expect(slglab?.nationBuildingComponent).toBeDefined();
      expect(slglab?.nationBuildingComponent.principles.length).toBeGreaterThan(0);
    });

    test('should create SLGXR virtual reality course', async () => {
      const courses = await service.createCoreCourses();
      const slgxr = courses.find(c => c.courseCode === 'SLGXR');
      
      expect(slgxr).toBeDefined();
      expect(slgxr?.title).toBe('ScrollCourt Training in Virtual Reality');
      expect(slgxr?.level).toBe(CourseLevel.XR_SPECIALIZATION);
      expect(slgxr?.deliveryModes).toContain(DeliveryMode.XR_MODE);
    });
  });

  describe('Course Content Creation', () => {
    test('should create comprehensive SLG100 content', () => {
      const content = contentService.createSLG100Content();
      
      expect(content.courseCode).toBe('SLG100');
      expect(content.modules).toHaveLength(1);
      
      const module = content.modules[0];
      expect(module.title).toBe('Foundations of Divine Law');
      expect(module.lectures).toHaveLength(1);
      expect(module.readings).toHaveLength(1);
      expect(module.videos).toHaveLength(1);
      expect(module.interactiveElements).toHaveLength(1);
      expect(module.xrComponents).toHaveLength(1);
      expect(module.assessments).toHaveLength(1);
      expect(module.discussionTopics).toHaveLength(1);
      expect(module.practicalExercises).toHaveLength(1);
    });

    test('should create detailed lecture content with comprehensive notes', () => {
      const content = contentService.createSLG100Content();
      const lecture = content.modules[0].lectures[0];
      
      expect(lecture.title).toBe('The Divine Origin of Law');
      expect(lecture.duration).toBe(90);
      expect(lecture.transcript).toContain('Divine Origin of Law');
      expect(lecture.lectureNotes.mainPoints).toHaveLength(2);
      expect(lecture.slides).toHaveLength(2);
      expect(lecture.keyPoints).toHaveLength(4);
      expect(lecture.scriptureReferences).toHaveLength(1);
      expect(lecture.propheticInsights).toHaveLength(1);
      expect(lecture.discussionQuestions).toHaveLength(3);
      expect(lecture.practicalApplications).toHaveLength(3);
    });

    test('should create comprehensive SLG204 content', () => {
      const content = contentService.createSLG204Content();
      
      expect(content.courseCode).toBe('SLG204');
      expect(content.modules).toHaveLength(1);
      expect(content.assessments).toHaveLength(1);
      expect(content.resources).toHaveLength(2);
      expect(content.xrExperiences).toHaveLength(1);
      expect(content.practicalComponents).toHaveLength(1);
      
      const finalAssessment = content.assessments[0];
      expect(finalAssessment.title).toBe('Nation Transformation Plan');
      expect(finalAssessment.weight).toBe(0.4);
    });
  });

  describe('Faculty Statistics', () => {
    beforeEach(() => {
      mockPrisma.course.count
        .mockResolvedValueOnce(25) // total courses
        .mockResolvedValueOnce(20); // published courses
    });

    test('should calculate faculty statistics correctly', async () => {
      const stats = await service.getFacultyStatistics();
      
      expect(stats.faculty).toBe(SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE);
      expect(stats.totalCourses).toBe(25);
      expect(stats.publishedCourses).toBe(20);
      expect(stats.targetCourses).toBe(700);
      expect(stats.progress).toBeCloseTo(3.57, 2);
      expect(stats.departments).toBe(4);
    });
  });

  describe('Database Integration', () => {
    test('should initialize faculty in database', async () => {
      mockPrisma.faculty.upsert.mockResolvedValue({
        id: 'faculty-1',
        name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE,
        description: 'Divine law principles',
        isActive: true
      });

      await service.initializeFaculty();
      
      expect(mockPrisma.faculty.upsert).toHaveBeenCalledWith({
        where: { name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE },
        update: {
          description: expect.stringContaining('Divine law principles'),
          isActive: true
        },
        create: {
          name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE,
          description: expect.stringContaining('Divine law principles'),
          isActive: true
        }
      });
    });

    test('should retrieve all courses for faculty', async () => {
      mockPrisma.course.findMany.mockResolvedValue([
        {
          id: 'course-1',
          title: 'Test Course',
          description: 'Test Description',
          difficulty: 'intermediate',
          duration: 40,
          scrollXPReward: 100,
          scrollCoinCost: 25,
          prerequisites: [],
          isActive: true,
          publishedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          faculty: { name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE },
          enrollments: [],
          assignments: []
        }
      ]);

      const courses = await service.getAllCourses();
      
      expect(courses).toHaveLength(1);
      expect(courses[0].title).toBe('Test Course');
      expect(courses[0].faculty).toBe(SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      mockPrisma.faculty.upsert.mockRejectedValue(new Error('Database connection failed'));
      
      await expect(service.initializeFaculty()).rejects.toThrow('Database connection failed');
    });

    test('should handle course creation errors', async () => {
      mockPrisma.faculty.upsert.mockResolvedValue({
        id: 'faculty-1',
        name: SupremeScrollFaculty.PROPHETIC_LAW_GOVERNANCE,
        description: 'Divine law principles',
        isActive: true
      });
      
      mockPrisma.course.create.mockRejectedValue(new Error('Course creation failed'));
      
      await expect(service.createCoreCourses()).rejects.toThrow('Course creation failed');
    });
  });
});

describe('PropheticLawCourseContentService', () => {
  let service: PropheticLawCourseContentService;

  beforeEach(() => {
    service = new PropheticLawCourseContentService();
  });

  describe('Content Structure Validation', () => {
    test('should create valid SLG100 content structure', () => {
      const content = service.createSLG100Content();
      
      // Validate required properties
      expect(content).toHaveProperty('courseCode');
      expect(content).toHaveProperty('modules');
      expect(content).toHaveProperty('assessments');
      expect(content).toHaveProperty('resources');
      expect(content).toHaveProperty('xrExperiences');
      expect(content).toHaveProperty('practicalComponents');
      
      // Validate module structure
      const module = content.modules[0];
      expect(module).toHaveProperty('lectures');
      expect(module).toHaveProperty('readings');
      expect(module).toHaveProperty('videos');
      expect(module).toHaveProperty('interactiveElements');
      expect(module).toHaveProperty('xrComponents');
      expect(module).toHaveProperty('assessments');
      expect(module).toHaveProperty('discussionTopics');
      expect(module).toHaveProperty('practicalExercises');
    });

    test('should create valid SLG204 content structure', () => {
      const content = service.createSLG204Content();
      
      expect(content.courseCode).toBe('SLG204');
      expect(content.modules).toHaveLength(1);
      expect(content.assessments).toHaveLength(1);
      expect(content.resources).toHaveLength(2);
      expect(content.xrExperiences).toHaveLength(1);
      expect(content.practicalComponents).toHaveLength(1);
    });
  });

  describe('Content Quality Validation', () => {
    test('should include comprehensive lecture content', () => {
      const content = service.createSLG100Content();
      const lecture = content.modules[0].lectures[0];
      
      expect(lecture.transcript.length).toBeGreaterThan(1000);
      expect(lecture.lectureNotes.mainPoints.length).toBeGreaterThan(0);
      expect(lecture.slides.length).toBeGreaterThan(0);
      expect(lecture.scriptureReferences.length).toBeGreaterThan(0);
      expect(lecture.propheticInsights.length).toBeGreaterThan(0);
    });

    test('should include practical learning components', () => {
      const content = service.createSLG100Content();
      const module = content.modules[0];
      
      expect(module.practicalExercises.length).toBeGreaterThan(0);
      expect(module.discussionTopics.length).toBeGreaterThan(0);
      expect(module.interactiveElements.length).toBeGreaterThan(0);
      
      const exercise = module.practicalExercises[0];
      expect(exercise.instructions.length).toBeGreaterThan(0);
      expect(exercise.deliverables.length).toBeGreaterThan(0);
      expect(exercise.assessmentCriteria.length).toBeGreaterThan(0);
    });

    test('should include comprehensive assessments', () => {
      const content = service.createSLG204Content();
      const assessment = content.assessments[0];
      
      expect(assessment.requirements.length).toBeGreaterThan(0);
      expect(assessment.deliverables.length).toBeGreaterThan(0);
      expect(assessment.assessmentCriteria.length).toBeGreaterThan(0);
      expect(assessment.timeAllocation).toBeGreaterThan(0);
      expect(assessment.weight).toBeGreaterThan(0);
    });
  });
});