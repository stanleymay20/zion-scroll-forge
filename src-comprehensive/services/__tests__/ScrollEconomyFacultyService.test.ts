/**
 * ScrollEconomy Faculty Service Test Suite
 * Comprehensive testing for ScrollEconomy & Financial Reformation Faculty
 */

import { ScrollEconomyFacultyService, ScrollEconomyCourse } from '../ScrollEconomyFacultyService';
import { ScrollEconomyCourseContentService } from '../ScrollEconomyCourseContentService';
import {
  SupremeScrollFaculty,
  CourseLevel,
  CourseStatus,
  DeliveryMode,
  AssessmentType
} from '../../types/curriculum-grid';

// Mock PrismaClient
const mockPrismaClient = {
  course: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn()
  },
  faculty: {
    upsert: jest.fn(),
    findUnique: jest.fn()
  }
};

describe('ScrollEconomyFacultyService', () => {
  let service: ScrollEconomyFacultyService;
  let contentService: ScrollEconomyCourseContentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ScrollEconomyFacultyService(mockPrismaClient as any);
    contentService = new ScrollEconomyCourseContentService();
  });

  describe('Faculty Configuration', () => {
    test('should initialize ScrollEconomy faculty configuration correctly', () => {
      const config = service.getFacultyConfiguration();
      
      expect(config.faculty).toBe(SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE);
      expect(config.description).toContain('Biblical economic principles');
      expect(config.targetCourseCount).toBe(800);
      expect(config.departments).toHaveLength(5);
      expect(config.specializations).toHaveLength(3);
    });

    test('should have correct department structure', () => {
      const config = service.getFacultyConfiguration();
      const departmentNames = config.departments.map(dept => dept.name);
      
      expect(departmentNames).toContain('Kingdom Economics Foundations');
      expect(departmentNames).toContain('ScrollCoin & Digital Currency');
      expect(departmentNames).toContain('Global Trade & Commerce');
      expect(departmentNames).toContain('AI Trading & Financial Technology');
      expect(departmentNames).toContain('Banking & Financial Infrastructure');
    });

    test('should have qualified faculty members', () => {
      const config = service.getFacultyConfiguration();
      
      config.departments.forEach(dept => {
        expect(dept.head).toBeDefined();
        expect(dept.head.name).toBeTruthy();
        expect(dept.head.specialization).toHaveLength.greaterThan(0);
        expect(dept.head.propheticInsight).toBe(true);
      });
    });
  });

  describe('Foundational Courses Creation', () => {
    test('should create SEC101 - ScrollEconomy Foundations', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        title: 'ScrollEconomy Foundations',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      expect(courses).toHaveLength(2);
      
      const sec101 = courses.find(c => c.courseCode === 'SEC101');
      expect(sec101).toBeDefined();
      expect(sec101!.title).toBe('ScrollEconomy Foundations');
      expect(sec101!.level).toBe(CourseLevel.UNDERGRADUATE);
      expect(sec101!.scrollCoinCost).toBe(0); // Free foundational course
      expect(sec101!.economicModel.modelType).toBe('covenant_economics');
      expect(sec101!.scrollCoinIntegration.hasScrollCoinComponent).toBe(true);
    });

    test('should create SEC205 - Digital Currencies vs ScrollCoin', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-2',
        title: 'Digital Currencies vs ScrollCoin',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      const sec205 = courses.find(c => c.courseCode === 'SEC205');
      expect(sec205).toBeDefined();
      expect(sec205!.title).toBe('Digital Currencies vs ScrollCoin');
      expect(sec205!.scrollCoinCost).toBe(50);
      expect(sec205!.scrollCoinIntegration.blockchainTechnology).toBe(true);
      expect(sec205!.scrollCoinIntegration.smartContractUsage).toBe(true);
    });

    test('should include comprehensive learning objectives', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.learningObjectives).toHaveLength.greaterThan(0);
        expect(course.spiritualObjectives).toHaveLength.greaterThan(0);
        
        course.learningObjectives.forEach(obj => {
          expect(obj.description).toBeTruthy();
          expect(obj.bloomsLevel).toBeDefined();
          expect(obj.kingdomApplication).toBeTruthy();
        });
      });
    });
  });

  describe('Advanced Courses Creation', () => {
    test('should create SEC310 - Kingdom Trade Systems', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-3',
        title: 'Kingdom Trade Systems',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createAdvancedCourses();
      
      const sec310 = courses.find(c => c.courseCode === 'SEC310');
      expect(sec310).toBeDefined();
      expect(sec310!.title).toBe('Kingdom Trade Systems');
      expect(sec310!.level).toBe(CourseLevel.GRADUATE);
      expect(sec310!.prerequisites).toContain('SEC101');
      expect(sec310!.prerequisites).toContain('SEC205');
      expect(sec310!.economicModel.modelType).toBe('kingdom_trade');
    });

    test('should create SEC402 - Financial Prophecy', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-4',
        title: 'Financial Prophecy',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createAdvancedCourses();
      
      const sec402 = courses.find(c => c.courseCode === 'SEC402');
      expect(sec402).toBeDefined();
      expect(sec402!.title).toBe('Financial Prophecy');
      expect(sec402!.level).toBe(CourseLevel.GRADUATE);
      expect(sec402!.economicModel.modelType).toBe('prophetic_economics');
      expect(sec402!.deliveryModes).toContain(DeliveryMode.MENTOR_SESSIONS);
    });

    test('should have appropriate prerequisites for advanced courses', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createAdvancedCourses();
      
      courses.forEach(course => {
        expect(course.prerequisites).toHaveLength.greaterThan(0);
        expect(course.xpReward).toBeGreaterThan(200); // Advanced courses have higher XP
        expect(course.scrollCoinCost).toBeGreaterThan(50); // Advanced courses cost more
      });
    });
  });

  describe('Practical Labs Creation', () => {
    test('should create SECLAB01 - Building ScrollBank', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-5',
        title: 'Building ScrollBank',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createPracticalLabs();
      
      const seclab01 = courses.find(c => c.courseCode === 'SECLAB01');
      expect(seclab01).toBeDefined();
      expect(seclab01!.title).toBe('Building ScrollBank');
      expect(seclab01!.level).toBe(CourseLevel.CERTIFICATE);
      expect(seclab01!.practicalLabs).toHaveLength.greaterThan(0);
      expect(seclab01!.deliveryModes).toContain(DeliveryMode.XR_MODE);
    });

    test('should create SECCERT - ScrollAccounting', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-6',
        title: 'ScrollAccounting',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createPracticalLabs();
      
      const seccert = courses.find(c => c.courseCode === 'SECCERT');
      expect(seccert).toBeDefined();
      expect(seccert!.title).toBe('ScrollAccounting');
      expect(seccert!.level).toBe(CourseLevel.CERTIFICATE);
      expect(seccert!.practicalLabs).toHaveLength.greaterThan(0);
    });

    test('should include practical lab components', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createPracticalLabs();
      
      courses.forEach(course => {
        expect(course.practicalLabs).toHaveLength.greaterThan(0);
        
        course.practicalLabs.forEach(lab => {
          expect(lab.labName).toBeTruthy();
          expect(lab.description).toBeTruthy();
          expect(lab.practicalSkills).toHaveLength.greaterThan(0);
          expect(lab.tools).toHaveLength.greaterThan(0);
          expect(lab.outcomes).toHaveLength.greaterThan(0);
          expect(lab.scrollCoinReward).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Course Content Integration', () => {
    test('should generate comprehensive course modules', () => {
      const modules = contentService.generateSEC101Content();
      
      expect(modules).toHaveLength(4);
      expect(modules[0].title).toBe('Biblical Foundations of Economics');
      expect(modules[1].title).toBe('Covenant vs Babylonian Economics');
      expect(modules[2].title).toBe('ScrollCoin Introduction and Divine Currency');
      expect(modules[3].title).toBe('Kingdom Wealth Creation and Stewardship');
    });

    test('should include lectures with comprehensive content', () => {
      const modules = contentService.generateSEC101Content();
      
      modules.forEach(module => {
        expect(module.content.lectures).toHaveLength.greaterThan(0);
        
        module.content.lectures.forEach(lecture => {
          expect(lecture.title).toBeTruthy();
          expect(lecture.description).toBeTruthy();
          expect(lecture.duration).toBeGreaterThan(0);
          expect(lecture.transcript).toBeTruthy();
          expect(lecture.notes).toBeTruthy();
        });
      });
    });

    test('should include various assessment types', () => {
      const modules = contentService.generateSEC101Content();
      
      modules.forEach(module => {
        expect(module.assessments).toHaveLength.greaterThan(0);
        
        module.assessments.forEach(assessment => {
          expect(assessment.type).toBeDefined();
          expect(assessment.title).toBeTruthy();
          expect(assessment.points).toBeGreaterThan(0);
          expect(assessment.rubric.totalPoints).toBeGreaterThan(0);
          expect(assessment.rubric.passingScore).toBeGreaterThan(0);
        });
      });
    });

    test('should include interactive elements', () => {
      const modules = contentService.generateSEC101Content();
      
      modules.forEach(module => {
        if (module.content.interactiveElements.length > 0) {
          module.content.interactiveElements.forEach(element => {
            expect(element.type).toBeDefined();
            expect(element.title).toBeTruthy();
            expect(element.description).toBeTruthy();
            expect(element.configuration).toBeDefined();
          });
        }
      });
    });
  });

  describe('ScrollCoin Integration', () => {
    test('should properly integrate ScrollCoin in all courses', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const foundational = await service.createFoundationalCourses();
      const advanced = await service.createAdvancedCourses();
      const labs = await service.createPracticalLabs();
      
      const allCourses = [...foundational, ...advanced, ...labs];
      
      allCourses.forEach(course => {
        expect(course.scrollCoinIntegration.hasScrollCoinComponent).toBe(true);
        expect(course.scrollCoinIntegration.scrollCoinApplications).toHaveLength.greaterThan(0);
        expect(course.scrollCoinIntegration.divineFinancePrinciples).toHaveLength.greaterThan(0);
        expect(course.xpReward).toBeGreaterThan(0);
      });
    });

    test('should have appropriate ScrollCoin costs', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const foundational = await service.createFoundationalCourses();
      const advanced = await service.createAdvancedCourses();
      const labs = await service.createPracticalLabs();
      
      // Foundational courses should be free or low cost
      foundational.forEach(course => {
        expect(course.scrollCoinCost).toBeLessThanOrEqual(50);
      });
      
      // Advanced courses should cost more
      advanced.forEach(course => {
        expect(course.scrollCoinCost).toBeGreaterThan(50);
      });
      
      // Labs should have moderate costs
      labs.forEach(course => {
        expect(course.scrollCoinCost).toBeGreaterThan(0);
      });
    });
  });

  describe('Kingdom Economics Principles', () => {
    test('should include kingdom economics principles in all courses', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.kingdomEconomicsPrinciples).toHaveLength.greaterThan(0);
        
        course.kingdomEconomicsPrinciples.forEach(principle => {
          expect(principle.principle).toBeTruthy();
          expect(principle.biblicalBasis).toHaveLength.greaterThan(0);
          expect(principle.modernApplication).toBeTruthy();
          expect(principle.transformationPotential).toBeTruthy();
        });
      });
    });

    test('should include financial reformation focus', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.financialReformationFocus).toHaveLength.greaterThan(0);
        
        course.financialReformationFocus.forEach(focus => {
          expect(focus.area).toBeDefined();
          expect(focus.currentProblems).toHaveLength.greaterThan(0);
          expect(focus.kingdomSolutions).toHaveLength.greaterThan(0);
          expect(focus.implementationStrategy).toBeTruthy();
        });
      });
    });
  });

  describe('Complete Faculty Initialization', () => {
    test('should initialize complete faculty with all components', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const result = await service.initializeCompleteFaculty();
      
      expect(result.facultyConfiguration).toBeDefined();
      expect(result.foundationalCourses).toHaveLength.greaterThan(0);
      expect(result.advancedCourses).toHaveLength.greaterThan(0);
      expect(result.practicalLabs).toHaveLength.greaterThan(0);
      expect(result.totalCourses).toBeGreaterThan(0);
      
      // Verify faculty configuration is updated
      expect(result.facultyConfiguration.currentCourseCount).toBe(result.totalCourses);
    });

    test('should meet target course requirements', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const result = await service.initializeCompleteFaculty();
      
      // Should be working toward 800+ course target
      expect(result.facultyConfiguration.targetCourseCount).toBe(800);
      expect(result.totalCourses).toBeGreaterThan(0);
      
      // Should have all required course types
      expect(result.foundationalCourses.some(c => c.courseCode === 'SEC101')).toBe(true);
      expect(result.foundationalCourses.some(c => c.courseCode === 'SEC205')).toBe(true);
      expect(result.advancedCourses.some(c => c.courseCode === 'SEC310')).toBe(true);
      expect(result.advancedCourses.some(c => c.courseCode === 'SEC402')).toBe(true);
      expect(result.practicalLabs.some(c => c.courseCode === 'SECLAB01')).toBe(true);
      expect(result.practicalLabs.some(c => c.courseCode === 'SECCERT')).toBe(true);
    });
  });

  describe('Quality Assurance', () => {
    test('should have proper scroll certification for all courses', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.scrollCertification.isScrollCertified).toBe(true);
        expect(course.scrollCertification.propheticValidation.isValidated).toBe(true);
        expect(course.scrollCertification.propheticValidation.biblicalAlignment).toBeGreaterThan(80);
        expect(course.scrollCertification.kingdomReadiness.readinessScore).toBeGreaterThan(70);
      });
    });

    test('should have high prophetic alignment scores', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.propheticAlignment.alignmentScore).toBeGreaterThan(85);
        expect(course.propheticAlignment.propheticThemes).toHaveLength.greaterThan(0);
        expect(course.propheticAlignment.biblicalFoundation).toHaveLength.greaterThan(0);
      });
    });

    test('should have significant kingdom impact potential', async () => {
      mockPrismaClient.faculty.upsert.mockResolvedValue({ id: 'faculty-1', name: 'ScrollEconomy' });
      mockPrismaClient.course.create.mockResolvedValue({
        id: 'course-1',
        faculty: { name: SupremeScrollFaculty.SCROLL_ECONOMY_FINANCE }
      });

      const courses = await service.createFoundationalCourses();
      
      courses.forEach(course => {
        expect(course.kingdomImpact.impactScore).toBeGreaterThan(80);
        expect(course.kingdomImpact.transformationAreas).toHaveLength.greaterThan(0);
        expect(course.kingdomImpact.nationBuildingPotential).toBeGreaterThan(70);
      });
    });
  });
});