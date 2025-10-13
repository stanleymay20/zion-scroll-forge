/**
 * ScrollTheology Faculty Service Tests
 * Comprehensive tests for ScrollTheology & Bible Intelligence Faculty
 */

import { ScrollTheologyFacultyService } from '../ScrollTheologyFacultyService';
import { ScrollTheologyCourseContentService } from '../ScrollTheologyCourseContentService';
import { ScrollTheologyIntegrationService } from '../ScrollTheologyIntegrationService';
import { SupremeScrollFaculty, CourseLevel, DeliveryMode } from '../../types/curriculum-grid';

// Mock Prisma Client
const mockPrisma = {
  faculty: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn()
  },
  course: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn()
  }
} as any;

describe('ScrollTheologyFacultyService', () => {
  let facultyService: ScrollTheologyFacultyService;
  let courseContentService: ScrollTheologyCourseContentService;
  let integrationService: ScrollTheologyIntegrationService;

  beforeEach(() => {
    facultyService = new ScrollTheologyFacultyService(mockPrisma);
    courseContentService = new ScrollTheologyCourseContentService(mockPrisma);
    integrationService = new ScrollTheologyIntegrationService(mockPrisma);
    jest.clearAllMocks();
  });

  describe('Faculty Configuration', () => {
    test('should initialize ScrollTheology faculty configuration', () => {
      const config = facultyService.getFacultyConfiguration();
      
      expect(config).toBeDefined();
      expect(config.faculty).toBe(SupremeScrollFaculty.SCROLL_THEOLOGY_BIBLE);
      expect(config.targetCourseCount).toBe(1000);
      expect(config.departments).toHaveLength(6);
      expect(config.specializations).toHaveLength(4);
      expect(config.facultyMembers).toHaveLength(6);
    });

    test('should have correct department structure', () => {
      const config = facultyService.getFacultyConfiguration();
      const departmentNames = config.departments.map(d => d.name);
      
      expect(departmentNames).toContain('Scroll Hermeneutics & Biblical Interpretation');
      expect(departmentNames).toContain('Prophetic Timeline Construction');
      expect(departmentNames).toContain('Christology & Messianic Studies');
      expect(departmentNames).toContain('Biblical Translation & ScrollVersion Development');
      expect(departmentNames).toContain('Spiritual Warfare & ScrollWarfare Protocols');
      expect(departmentNames).toContain('XR Bible Experiences & Immersive Theology');
    });

    test('should have correct specialization tracks', () => {
      const config = facultyService.getFacultyConfiguration();
      const specializationNames = config.specializations.map(s => s.name);
      
      expect(specializationNames).toContain('Prophetic Timeline Construction');
      expect(specializationNames).toContain('Biblical Language Mastery');
      expect(specializationNames).toContain('ScrollWarfare & Spiritual Combat');
      expect(specializationNames).toContain('XR Biblical Experiences');
    });

    test('should have qualified faculty members', () => {
      const config = facultyService.getFacultyConfiguration();
      
      config.facultyMembers.forEach(member => {
        expect(member.id).toBeDefined();
        expect(member.name).toBeDefined();
        expect(member.title).toBeDefined();
        expect(member.specialization).toHaveLength.greaterThan(0);
        expect(member.courses).toHaveLength.greaterThan(0);
        expect(member.spiritualGifts).toHaveLength.greaterThan(0);
        expect(member.propheticInsight).toBe(true);
      });
    });
  });

  describe('Course Content Creation', () => {
    test('should create SBT101 Scroll Hermeneutics course', async () => {
      const course = await courseContentService.createSBT101ScrollHermeneutics();
      
      expect(course.courseCode).toBe('SBT101');
      expect(course.title).toBe('Scroll Hermeneutics & Divine Interpretation');
      expect(course.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(course.faculty).toBe('ScrollTheology & Bible Intelligence');
      expect(course.estimatedHours).toBe(45);
      expect(course.deliveryModes).toContain(DeliveryMode.ONLINE_PORTAL);
      expect(course.deliveryModes).toContain(DeliveryMode.XR_MODE);
      
      // Check learning objectives
      expect(course.learningObjectives).toHaveLength(2);
      expect(course.learningObjectives[0].description).toContain('hermeneutics');
      
      // Check spiritual objectives
      expect(course.spiritualObjectives).toHaveLength(1);
      expect(course.spiritualObjectives[0].description).toContain('Holy Spirit');
      
      // Check biblical foundations
      expect(course.biblicalFoundations).toHaveLength(1);
      expect(course.biblicalFoundations[0].reference).toBe('2 Timothy 3:16-17');
      
      // Check content framework
      expect(course.contentFramework.modules).toHaveLength(3);
      expect(course.contentFramework.xrExperiences).toHaveLength(1);
    });

    test('should create SBT201 Eden to Revelation Timelines course', async () => {
      const course = await courseContentService.createSBT201EdenToRevelationTimelines();
      
      expect(course.courseCode).toBe('SBT201');
      expect(course.title).toBe('Eden to Revelation Timelines: Comprehensive Biblical Chronology');
      expect(course.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(course.prerequisites).toContain('SBT101');
      expect(course.estimatedHours).toBe(60);
      
      // Check timeline integration
      expect(course.timelineIntegration).toBeDefined();
      expect(course.timelineIntegration.eraFocus).toBe('Complete Biblical History');
      expect(course.timelineIntegration.chronologicalMarkers).toHaveLength(2);
      
      // Check prophetic elements
      expect(course.propheticElements).toHaveLength(1);
      expect(course.propheticElements[0].type).toBe('timeline');
    });

    test('should create SBT305 Christology & Messianic Prophecy course', async () => {
      const course = await courseContentService.createSBT305ChristologyMessianicProphecy();
      
      expect(course.courseCode).toBe('SBT305');
      expect(course.title).toBe('Christology & Messianic Prophecy: The Divine Messiah');
      expect(course.level).toBe(CourseLevel.GRADUATE);
      expect(course.prerequisites).toContain('SBT101');
      expect(course.prerequisites).toContain('SBT201');
      expect(course.estimatedHours).toBe(75);
      
      // Check advanced certification
      expect(course.scrollCertification.certificationLevel).toBe('advanced');
      expect(course.scrollCertification.propheticValidation.propheticAccuracy).toBe(96);
      
      // Check biblical foundations
      expect(course.biblicalFoundations[0].reference).toBe('Isaiah 9:6');
      expect(course.biblicalFoundations[0].originalLanguage).toBe('hebrew');
    });

    test('should create SBT405 Hebrew/Greek Exegesis course', async () => {
      const course = await courseContentService.createSBT405HebrewGreekExegesis();
      
      expect(course.courseCode).toBe('SBT405');
      expect(course.title).toBe('Hebrew/Greek Exegesis & Translation Mastery');
      expect(course.level).toBe(CourseLevel.GRADUATE);
      expect(course.prerequisites).toContain('SBT150');
      expect(course.estimatedHours).toBe(90);
      
      // Check language components
      expect(course.languageComponents).toHaveLength(2);
      expect(course.languageComponents[0].language).toBe('hebrew');
      expect(course.languageComponents[1].language).toBe('greek');
      
      // Check expert certification
      expect(course.scrollCertification.certificationLevel).toBe('expert');
    });

    test('should create SBTCERT ScrollWarfare Protocols course', async () => {
      const course = await courseContentService.createSBTCERTScrollWarfareProtocols();
      
      expect(course.courseCode).toBe('SBTCERT');
      expect(course.title).toBe('ScrollWarfare Protocols & Spiritual Combat Certification');
      expect(course.level).toBe(CourseLevel.CERTIFICATE);
      expect(course.estimatedHours).toBe(120);
      
      // Check warfare protocols
      expect(course.warfareProtocols).toHaveLength(1);
      expect(course.warfareProtocols![0].name).toBe('Deliverance Session Protocol');
      expect(course.warfareProtocols![0].steps).toHaveLength(4);
      
      // Check spiritual warfare focus
      expect(course.propheticAlignment.propheticThemes).toContain('Spiritual Authority');
      expect(course.kingdomImpact.healingCapacity).toBe(98);
    });

    test('should create SBTPRAX XR Psalms & Tabernacle course', async () => {
      const course = await courseContentService.createSBTPRAXXRPsalmsTabernacle();
      
      expect(course.courseCode).toBe('SBTPRAX');
      expect(course.title).toBe('XR Psalms & Tabernacle: Immersive Biblical Worship');
      expect(course.level).toBe(CourseLevel.XR_SPECIALIZATION);
      expect(course.deliveryModes).toContain(DeliveryMode.XR_MODE);
      
      // Check XR experiences
      expect(course.xrExperiences).toHaveLength(1);
      expect(course.xrExperiences![0].title).toBe('Complete Tabernacle Experience');
      expect(course.xrExperiences![0].interactiveElements).toContain('Light the menorah');
      
      // Check resource requirements
      const vrHeadset = course.resourceRequirements.find(r => r.description.includes('VR Headset'));
      expect(vrHeadset).toBeDefined();
      expect(vrHeadset!.isRequired).toBe(true);
    });
  });

  describe('Integration Service', () => {
    test('should initialize complete ScrollTheology faculty', async () => {
      // Mock successful database operations
      mockPrisma.course.create.mockResolvedValue({ id: 'test-course' });
      mockPrisma.faculty.upsert.mockResolvedValue({ id: 'test-faculty' });
      
      const result = await integrationService.initializeScrollTheologyFaculty();
      
      expect(result.facultyInitialized).toBe(true);
      expect(result.coursesCreated).toBeGreaterThan(0);
      expect(result.departmentsEstablished).toBe(6);
      expect(result.specializations).toBe(4);
      expect(result.facultyMembers).toBe(6);
      expect(result.integrationStatus).toBe('success');
    });

    test('should initialize prophetic timeline system', async () => {
      const timeline = await integrationService.getPropheticTimeline();
      
      expect(timeline).toHaveLength.greaterThan(10);
      
      // Check key timeline events
      const creation = timeline.find(t => t.id === 'creation');
      expect(creation).toBeDefined();
      expect(creation!.event).toBe('Creation of Adam and Eve');
      expect(creation!.fulfillmentStatus).toBe('fulfilled');
      
      const secondComing = timeline.find(t => t.id === 'second-coming');
      expect(secondComing).toBeDefined();
      expect(secondComing!.fulfillmentStatus).toBe('future');
    });

    test('should validate integration successfully', async () => {
      // Mock courses exist
      mockPrisma.course.findMany.mockResolvedValue([
        { courseCode: 'SBT101' },
        { courseCode: 'SBT305' },
        { courseCode: 'SBTCERT' },
        { courseCode: 'SBTPRAX' }
      ]);
      
      const isValid = await integrationService.validateIntegration();
      expect(isValid).toBe(true);
    });
  });

  describe('Course Quality Standards', () => {
    test('all courses should have comprehensive content structure', async () => {
      const courses = [
        await courseContentService.createSBT101ScrollHermeneutics(),
        await courseContentService.createSBT201EdenToRevelationTimelines(),
        await courseContentService.createSBT305ChristologyMessianicProphecy(),
        await courseContentService.createSBT405HebrewGreekExegesis(),
        await courseContentService.createSBTCERTScrollWarfareProtocols(),
        await courseContentService.createSBTPRAXXRPsalmsTabernacle()
      ];

      courses.forEach(course => {
        // Check required course components
        expect(course.learningObjectives).toHaveLength.greaterThan(0);
        expect(course.spiritualObjectives).toHaveLength.greaterThan(0);
        expect(course.assessmentMethods).toHaveLength.greaterThan(0);
        expect(course.biblicalFoundations).toHaveLength.greaterThan(0);
        expect(course.propheticElements).toHaveLength.greaterThan(0);
        expect(course.resourceRequirements).toHaveLength.greaterThan(0);
        
        // Check scroll certification
        expect(course.scrollCertification.isScrollCertified).toBe(true);
        expect(course.scrollCertification.propheticValidation.isValidated).toBe(true);
        expect(course.scrollCertification.propheticValidation.biblicalAlignment).toBeGreaterThan(90);
        
        // Check kingdom impact
        expect(course.kingdomImpact.impactScore).toBeGreaterThan(80);
        expect(course.kingdomImpact.transformationAreas).toHaveLength.greaterThan(0);
        
        // Check prophetic alignment
        expect(course.propheticAlignment.alignmentScore).toBeGreaterThan(85);
        expect(course.propheticAlignment.propheticThemes).toHaveLength.greaterThan(0);
      });
    });

    test('courses should have proper prerequisite structure', async () => {
      const sbt101 = await courseContentService.createSBT101ScrollHermeneutics();
      const sbt201 = await courseContentService.createSBT201EdenToRevelationTimelines();
      const sbt305 = await courseContentService.createSBT305ChristologyMessianicProphecy();
      const sbt405 = await courseContentService.createSBT405HebrewGreekExegesis();
      
      // SBT101 should have no prerequisites (foundational)
      expect(sbt101.prerequisites).toHaveLength(0);
      
      // SBT201 should require SBT101
      expect(sbt201.prerequisites).toContain('SBT101');
      
      // SBT305 should require both SBT101 and SBT201
      expect(sbt305.prerequisites).toContain('SBT101');
      expect(sbt305.prerequisites).toContain('SBT201');
      
      // SBT405 should require multiple prerequisites including language courses
      expect(sbt405.prerequisites).toContain('SBT101');
      expect(sbt405.prerequisites).toContain('SBT150');
      expect(sbt405.prerequisites).toContain('SBT305');
    });

    test('courses should have appropriate XP rewards and ScrollCoin costs', async () => {
      const sbt101 = await courseContentService.createSBT101ScrollHermeneutics();
      const sbt305 = await courseContentService.createSBT305ChristologyMessianicProphecy();
      const sbtcert = await courseContentService.createSBTCERTScrollWarfareProtocols();
      
      // Foundational course should be free with moderate XP
      expect(sbt101.scrollCoinCost).toBe(0);
      expect(sbt101.xpReward).toBe(150);
      
      // Advanced course should cost more with higher XP
      expect(sbt305.scrollCoinCost).toBe(50);
      expect(sbt305.xpReward).toBe(300);
      
      // Certification course should cost most with highest XP
      expect(sbtcert.scrollCoinCost).toBe(100);
      expect(sbtcert.xpReward).toBe(500);
    });
  });
});