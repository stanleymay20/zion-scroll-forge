import { EdenicScienceScrollBiotechFacultyService } from '../EdenicScienceScrollBiotechFacultyService';
import { EdenicScienceCourseContentService } from '../EdenicScienceCourseContentService';
import { EdenicScienceIntegrationService } from '../EdenicScienceIntegrationService';
import { SpiritualAlignmentValidator } from '../SpiritualAlignmentValidator';

describe('EdenicScienceScrollBiotechFacultyService', () => {
  let facultyService: EdenicScienceScrollBiotechFacultyService;
  let contentService: EdenicScienceCourseContentService;
  let integrationService: EdenicScienceIntegrationService;
  let spiritualValidator: SpiritualAlignmentValidator;

  beforeEach(() => {
    facultyService = new EdenicScienceScrollBiotechFacultyService();
    contentService = new EdenicScienceCourseContentService();
    integrationService = new EdenicScienceIntegrationService();
    spiritualValidator = new SpiritualAlignmentValidator();
  });

  describe('Faculty Structure', () => {
    test('should initialize faculty with 500+ target courses', async () => {
      const faculty = await facultyService.getFacultyData();
      
      expect(faculty.faculty).toBe('Edenic Science & ScrollBiotech');
      expect(faculty.description).toBe('Revolutionary scientific education integrating pre-flood knowledge with divine healing models');
      expect(faculty.targetCourseCount).toBeGreaterThanOrEqual(500);
      expect(faculty.departments).toBeDefined();
      expect(faculty.specializations).toBeDefined();
    });

    test('should have required specializations', async () => {
      const faculty = await facultyService.getFacultyData();
      const specializationIds = faculty.specializations.map((s: any) => s.id);
      
      expect(specializationIds).toContain('dimensional-physics');
      expect(specializationIds).toContain('resurrection-science');
      expect(specializationIds).toContain('healing-light-energy');
      expect(specializationIds).toContain('eden-agronomy');
      expect(specializationIds).toContain('sacred-organs-biology');
    });

    test('should have revolutionary courses available', async () => {
      // Test individual course retrieval since courses are not stored in faculty config
      const esb101 = await facultyService.getCourse('ESB101');
      expect(esb101.courseCode).toBe('ESB101');
      expect(esb101.title).toBe('Introduction to Edenic Science Principles');
      
      // Test that the faculty has the right departments for these courses
      const faculty = await facultyService.getFacultyData();
      const departmentNames = faculty.departments.map((d: any) => d.name);
      expect(departmentNames).toContain('Dimensional Physics & Quantum Spirituality');
      expect(departmentNames).toContain('Resurrection Science & Life Restoration');
      expect(departmentNames).toContain('Healing Light & Energy Medicine');
    });
  });

  describe('Course Content', () => {
    test('should create comprehensive course content for ESB101', async () => {
      const course = await contentService.createComprehensiveCourse('ESB101');
      
      expect(course).toBeDefined();
      expect(course.contentFramework.modules).toBeDefined();
      expect(course.contentFramework.modules.length).toBeGreaterThan(0);
      
      const firstModule = course.contentFramework.modules[0];
      expect(firstModule.title).toBe('Foundations of Divine Creation Science');
      expect(firstModule.content.lectures).toBeDefined();
      expect(firstModule.content.lectures.length).toBeGreaterThan(0);
    });

    test('should include spiritual integration in course objectives', async () => {
      const course = await contentService.createComprehensiveCourse('ESB101');
      
      expect(course.spiritualObjectives).toBeDefined();
      expect(course.spiritualObjectives.length).toBeGreaterThan(0);
      
      const firstObjective = course.spiritualObjectives[0];
      expect(firstObjective.description).toContain('reverence');
      expect(firstObjective.spiritualDiscipline).toBeDefined();
      expect(firstObjective.propheticActivation).toBeDefined();
    });

    test('should include comprehensive assessment methods', async () => {
      const course = await contentService.createComprehensiveCourse('ESB101');
      
      expect(course.assessmentMethods).toBeDefined();
      expect(course.assessmentMethods.length).toBeGreaterThanOrEqual(3);
      
      // Should include quiz, project, and scroll defense
      const assessmentTypes = course.assessmentMethods.map((method: any) => method.type);
      expect(assessmentTypes).toContain('quiz');
      expect(assessmentTypes).toContain('project');
      expect(assessmentTypes).toContain('scroll_defense');
    });
  });

  describe('Research Integration', () => {
    test('should initialize quantum anointing research', async () => {
      await integrationService.initializeEdenicScienceFaculty();
      
      const researchOpportunities = await integrationService.getResearchOpportunities({
        interests: ['quantum physics'],
        spiritualGifts: ['prophecy']
      });
      
      expect(researchOpportunities).toBeDefined();
      expect(researchOpportunities.length).toBeGreaterThan(0);
      
      const quantumResearch = researchOpportunities.find(
        r => r.id === 'quantum-anointing-research'
      );
      expect(quantumResearch).toBeDefined();
      expect(quantumResearch.title).toBe('Quantum Anointing Flow Research');
    });

    test('should initialize genomic scroll mapping', async () => {
      await integrationService.initializeEdenicScienceFaculty();
      
      const researchOpportunities = await integrationService.getResearchOpportunities({
        interests: ['genetics'],
        calling: 'healing ministry'
      });
      
      const genomicResearch = researchOpportunities.find(
        r => r.id === 'genomic-scroll-mapping'
      );
      expect(genomicResearch).toBeDefined();
      expect(genomicResearch.title).toBe('Genomic ScrollMapping Project');
    });
  });

  describe('Spiritual Alignment', () => {
    test('should validate spiritual alignment for core course', async () => {
      const course = await facultyService.getCourse('ESB101');
      const validation = await integrationService.validateSpiritualAlignment(course.id);
      
      expect(validation.isValid).toBe(true);
      expect(course.scrollCertification.propheticValidation.propheticAccuracy).toBeGreaterThanOrEqual(95);
      expect(course.propheticAlignment.biblicalFoundation).toBeDefined();
      expect(course.propheticAlignment.biblicalFoundation.length).toBeGreaterThan(0);
    });

    test('should ensure kingdom impact for core course', async () => {
      const course = await facultyService.getCourse('ESB101');
      
      expect(course.kingdomImpact).toBeDefined();
      expect(course.kingdomImpact.nationBuildingPotential).toBeDefined();
      expect(course.kingdomImpact.healingCapacity).toBeDefined();
      expect(course.kingdomImpact.governanceContribution).toBeDefined();
    });
  });

  describe('Pre-Flood Science Integration', () => {
    test('should integrate pre-flood knowledge in course content', async () => {
      const course = await contentService.createComprehensiveCourse('ESB101');
      
      const preFloodLecture = course.contentFramework.modules[0].content.lectures.find((lecture: any) => 
        lecture.title.includes('Pre-Flood') || 
        lecture.description.includes('pre-flood')
      );
      
      expect(preFloodLecture).toBeDefined();
      if (preFloodLecture) {
        expect(preFloodLecture.notes).toContain('canopy');
      }
    });

    test('should include divine healing models in course objectives', async () => {
      const course = await facultyService.getCourse('ESB101');
      
      expect(course.spiritualObjectives).toBeDefined();
      expect(course.spiritualObjectives.some((obj: any) => 
        obj.description.includes('healing') || obj.description.includes('divine')
      )).toBe(true);
      
      // Check that healing-related departments exist
      const faculty = await facultyService.getFacultyData();
      const healingDept = faculty.departments.find((dept: any) => 
        dept.name.includes('Healing') || dept.focus.includes('healing')
      );
      expect(healingDept).toBeDefined();
    });
  });

  describe('Multi-Modal Delivery', () => {
    test('should support all delivery modes', async () => {
      const course = await facultyService.getCourse('ESB101');
      
      expect(course.deliveryModes).toBeDefined();
      expect(course.deliveryModes.length).toBeGreaterThan(0);
      
      // Should support at least online portal and XR mode for science courses
      expect(course.deliveryModes).toContain('online_portal');
      expect(course.deliveryModes).toContain('xr_mode');
    });

    test('should include XR experiences for immersive learning', async () => {
      const course = await contentService.createComprehensiveCourse('ESB101');
      
      expect(course.contentFramework.xrExperiences).toBeDefined();
      expect(course.contentFramework.xrExperiences.length).toBeGreaterThan(0);
      
      const xrExperience = course.contentFramework.xrExperiences[0];
      expect(xrExperience.title).toContain('Garden of Eden');
      expect(xrExperience.type).toBe('virtual_reality');
    });
  });

  describe('Assessment and Evaluation', () => {
    test('should include comprehensive assessment methods', async () => {
      const course = await facultyService.getCourse('ESB101');
      
      expect(course.assessmentMethods).toBeDefined();
      expect(course.assessmentMethods.length).toBeGreaterThan(0);
      
      // Should include both academic and spiritual assessments
      expect(course.assessmentMethods.some((method: any) => 
        method.type === 'prophetic_activation' || method.description.includes('Spiritual')
      )).toBe(true);
    });

    test('should validate scroll certification requirements', async () => {
      const course = await facultyService.getCourse('ESB101');
      
      expect(course.scrollCertification).toBeDefined();
      expect(course.scrollCertification.isScrollCertified).toBe(true);
      expect(course.scrollCertification.propheticValidation.propheticAccuracy).toBeGreaterThanOrEqual(95);
      expect(course.scrollCertification.kingdomReadiness).toBeDefined();
    });
  });
});