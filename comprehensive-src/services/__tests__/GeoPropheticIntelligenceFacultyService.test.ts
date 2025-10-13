import { GeoPropheticIntelligenceFacultyService } from '../GeoPropheticIntelligenceFacultyService';
import { CourseLevel, DeliveryMode } from '../../types/curriculum-grid';

describe('GeoPropheticIntelligenceFacultyService', () => {
  let service: GeoPropheticIntelligenceFacultyService;

  beforeEach(() => {
    service = new GeoPropheticIntelligenceFacultyService();
  });

  describe('Faculty Structure', () => {
    it('should initialize with correct faculty information', async () => {
      const faculty = await service.getFacultyOverview();
      
      expect(faculty.id).toBe('geo-prophetic-intelligence');
      expect(faculty.name).toBe('GeoProphetic Intelligence & Earth Mapping');
      expect(faculty.courseCount).toBe(500);
      expect(faculty.description).toContain('satellite technology');
      expect(faculty.description).toContain('prophetic mapping');
      expect(faculty.description).toContain('end-time studies');
    });

    it('should have comprehensive specializations', async () => {
      const specializations = await service.getSpecializations();
      
      expect(specializations).toHaveLength(5);
      
      const specializationNames = specializations.map(s => s.name);
      expect(specializationNames).toContain('Prophetic Geography & Biblical Cartography');
      expect(specializationNames).toContain('Watchmen Science & Intelligence Gathering');
      expect(specializationNames).toContain('Territorial Mapping & Spiritual Warfare');
      expect(specializationNames).toContain('Satellite Technology & Prophetic Applications');
      expect(specializationNames).toContain('XR Geography & Immersive Biblical Experiences');
    });

    it('should have comprehensive departments', async () => {
      const departments = await service.getDepartments();
      
      expect(departments).toHaveLength(8);
      
      const departmentNames = departments.map(d => d.name);
      expect(departmentNames).toContain('Prophetic Geography & Biblical Cartography');
      expect(departmentNames).toContain('Peleg\'s Earth Division & Continental Separation');
      expect(departmentNames).toContain('Territorial Mapping & Babylonian Strongholds');
      expect(departmentNames).toContain('Watchmen Science & Intelligence Gathering');
      expect(departmentNames).toContain('End-Time Geography & Prophetic Events');
      expect(departmentNames).toContain('Satellite Technology & Prophetic Applications');
      expect(departmentNames).toContain('XR Geography & Immersive Biblical Experiences');
      expect(departmentNames).toContain('Intelligence Gathering & Strategic Analysis');
    });
  });

  describe('Course Structure', () => {
    it('should have foundational courses SGI100 and SGI210', async () => {
      const faculty = await service.getFacultyOverview();
      const courses = faculty.courses;
      
      const sgi100 = courses.find(c => c.courseCode === 'SGI100');
      const sgi210 = courses.find(c => c.courseCode === 'SGI210');
      
      expect(sgi100).toBeDefined();
      expect(sgi100?.title).toBe('Mapping the Scroll: Introduction to Prophetic Geography');
      expect(sgi100?.level).toBe(CourseLevel.UNDERGRADUATE);
      
      expect(sgi210).toBeDefined();
      expect(sgi210?.title).toBe('Peleg\'s Division: The Great Earth Separation');
      expect(sgi210?.level).toBe(CourseLevel.UNDERGRADUATE);
    });

    it('should have advanced courses SGI301 and SGI410', async () => {
      const faculty = await service.getFacultyOverview();
      const courses = faculty.courses;
      
      const sgi301 = courses.find(c => c.courseCode === 'SGI301');
      const sgi410 = courses.find(c => c.courseCode === 'SGI410');
      
      expect(sgi301).toBeDefined();
      expect(sgi301?.title).toBe('Watchmen Science: Prophetic Surveillance & Intelligence');
      expect(sgi301?.level).toBe(CourseLevel.GRADUATE);
      
      expect(sgi410).toBeDefined();
      expect(sgi410?.title).toBe('GeoProphetic Intelligence: Advanced Analysis & Strategy');
      expect(sgi410?.level).toBe(CourseLevel.GRADUATE);
    });

    it('should have XR experience course SGIXR01', async () => {
      const faculty = await service.getFacultyOverview();
      const courses = faculty.courses;
      
      const sgixr01 = courses.find(c => c.courseCode === 'SGIXR01');
      
      expect(sgixr01).toBeDefined();
      expect(sgixr01?.title).toBe('XR Geography: Ancient Israel Immersive Experience');
      expect(sgixr01?.level).toBe(CourseLevel.XR_SPECIALIZATION);
      expect(sgixr01?.deliveryModes).toContain(DeliveryMode.XR_MODE);
    });

    it('should have courses with comprehensive modules', async () => {
      const faculty = await service.getFacultyOverview();
      const sgi100 = faculty.courses.find(c => c.courseCode === 'SGI100');
      
      expect(sgi100?.modules).toBeDefined();
      expect(sgi100?.modules.length).toBeGreaterThan(0);
      
      const firstModule = sgi100?.modules[0];
      expect(firstModule?.title).toBe('Biblical Geography Foundations');
      expect(firstModule?.content.lectures).toBeDefined();
      expect(firstModule?.content.readings).toBeDefined();
      expect(firstModule?.content.videos).toBeDefined();
      expect(firstModule?.content.interactiveElements).toBeDefined();
      expect(firstModule?.content.xrComponents).toBeDefined();
      expect(firstModule?.assessments).toBeDefined();
    });
  });

  describe('Satellite Technology Integration', () => {
    it('should have satellite integration in departments', async () => {
      const departments = await service.getDepartments();
      
      departments.forEach(department => {
        expect(department.satelliteIntegration).toBeDefined();
        expect(department.satelliteIntegration.length).toBeGreaterThan(0);
        
        department.satelliteIntegration.forEach(satellite => {
          expect(satellite.id).toBeDefined();
          expect(satellite.name).toBeDefined();
          expect(satellite.purpose).toBeDefined();
          expect(satellite.propheticApplication).toBeDefined();
          expect(satellite.technicalSpecs).toBeDefined();
          expect(satellite.integrationMethods).toBeDefined();
        });
      });
    });
  });

  describe('Prophetic Mapping Tools', () => {
    it('should have prophetic mapping tools in departments', async () => {
      const departments = await service.getDepartments();
      
      departments.forEach(department => {
        expect(department.propheticMappingTools).toBeDefined();
        expect(department.propheticMappingTools.length).toBeGreaterThan(0);
        
        department.propheticMappingTools.forEach(tool => {
          expect(tool.id).toBeDefined();
          expect(tool.mapType).toBeDefined();
          expect(tool.biblicalBasis).toBeDefined();
          expect(tool.propheticSignificance).toBeDefined();
          expect(tool.geographicScope).toBeDefined();
          expect(tool.spiritualWarfareApplication).toBeDefined();
        });
      });
    });
  });

  describe('XR Experiences', () => {
    it('should have XR experiences in departments', async () => {
      const departments = await service.getDepartments();
      
      departments.forEach(department => {
        expect(department.xrExperiences).toBeDefined();
        expect(department.xrExperiences.length).toBeGreaterThan(0);
        
        department.xrExperiences.forEach(xr => {
          expect(xr.id).toBeDefined();
          expect(xr.name).toBeDefined();
          expect(xr.description).toBeDefined();
          expect(xr.biblicalPeriod).toBeDefined();
          expect(xr.interactiveElements).toBeDefined();
          expect(xr.spiritualFormationComponents).toBeDefined();
        });
      });
    });
  });

  describe('End-Time Studies', () => {
    it('should have end-time studies in departments', async () => {
      const departments = await service.getDepartments();
      
      departments.forEach(department => {
        expect(department.endTimeStudies).toBeDefined();
        expect(department.endTimeStudies.length).toBeGreaterThan(0);
        
        department.endTimeStudies.forEach(study => {
          expect(study.id).toBeDefined();
          expect(study.propheticEvent).toBeDefined();
          expect(study.geographicLocation).toBeDefined();
          expect(study.timelinePosition).toBeDefined();
          expect(study.biblicalReferences).toBeDefined();
          expect(study.currentIndicators).toBeDefined();
        });
      });
    });
  });

  describe('Course Content Generation', () => {
    it('should generate comprehensive course content', async () => {
      const faculty = await service.getFacultyOverview();
      const sgi100 = faculty.courses.find(c => c.courseCode === 'SGI100');
      
      if (sgi100) {
        const courseContent = await service.generateCourseContent(sgi100.id);
        
        expect(courseContent.course).toBeDefined();
        expect(courseContent.modules).toBeDefined();
        expect(courseContent.lectures).toBeDefined();
        expect(courseContent.notes).toBeDefined();
        expect(courseContent.videos).toBeDefined();
        expect(courseContent.assessments).toBeDefined();
        expect(courseContent.xrExperiences).toBeDefined();
        expect(courseContent.practicalAssignments).toBeDefined();
      }
    });

    it('should validate spiritual alignment', async () => {
      const faculty = await service.getFacultyOverview();
      const sgi100 = faculty.courses.find(c => c.courseCode === 'SGI100');
      
      if (sgi100) {
        const isAligned = await service.validateSpiritualAlignment(sgi100.id);
        expect(typeof isAligned).toBe('boolean');
      }
    });
  });

  describe('Course Filtering', () => {
    it('should filter courses by level', async () => {
      const undergraduateCourses = await service.getCoursesByLevel(CourseLevel.UNDERGRADUATE);
      const graduateCourses = await service.getCoursesByLevel(CourseLevel.GRADUATE);
      const xrCourses = await service.getCoursesByLevel(CourseLevel.XR_SPECIALIZATION);
      
      expect(undergraduateCourses.length).toBeGreaterThan(0);
      expect(graduateCourses.length).toBeGreaterThan(0);
      expect(xrCourses.length).toBeGreaterThan(0);
      
      undergraduateCourses.forEach(course => {
        expect(course.level).toBe(CourseLevel.UNDERGRADUATE);
      });
      
      graduateCourses.forEach(course => {
        expect(course.level).toBe(CourseLevel.GRADUATE);
      });
      
      xrCourses.forEach(course => {
        expect(course.level).toBe(CourseLevel.XR_SPECIALIZATION);
      });
    });
  });

  describe('Spiritual and Prophetic Alignment', () => {
    it('should have proper prophetic alignment for all courses', async () => {
      const faculty = await service.getFacultyOverview();
      
      faculty.courses.forEach(course => {
        expect(course.propheticAlignment).toBeDefined();
        expect(course.propheticAlignment.biblicalBasis).toBeDefined();
        expect(course.propheticAlignment.biblicalBasis.length).toBeGreaterThan(0);
        expect(course.propheticAlignment.propheticSignificance).toBeDefined();
        expect(course.propheticAlignment.kingdomPurpose).toBeDefined();
      });
    });

    it('should have kingdom impact defined for all courses', async () => {
      const faculty = await service.getFacultyOverview();
      
      faculty.courses.forEach(course => {
        expect(course.kingdomImpact).toBeDefined();
        expect(course.kingdomImpact.nationBuilding).toBeDefined();
        expect(course.kingdomImpact.healing).toBeDefined();
        expect(course.kingdomImpact.governance).toBeDefined();
      });
    });

    it('should have scroll certification for all courses', async () => {
      const faculty = await service.getFacultyOverview();
      
      faculty.courses.forEach(course => {
        expect(course.scrollCertification).toBeDefined();
        expect(course.scrollCertification.certificationLevel).toBeDefined();
        expect(course.scrollCertification.spiritualAlignment).toBe(true);
        expect(course.scrollCertification.propheticAccuracy).toBe(true);
      });
    });
  });

  describe('Multi-Modal Delivery', () => {
    it('should support multiple delivery modes for courses', async () => {
      const faculty = await service.getFacultyOverview();
      
      faculty.courses.forEach(course => {
        expect(course.deliveryModes).toBeDefined();
        expect(course.deliveryModes.length).toBeGreaterThan(0);
        
        // Check that courses have appropriate delivery modes
        if (course.level === CourseLevel.XR_SPECIALIZATION) {
          expect(course.deliveryModes).toContain(DeliveryMode.XR_MODE);
        }
        
        if (course.level === CourseLevel.DOCTORAL) {
          expect(course.deliveryModes).toContain(DeliveryMode.RESEARCH_TRACK);
        }
      });
    });
  });

  describe('Prerequisites and Course Progression', () => {
    it('should have proper prerequisite structure', async () => {
      const faculty = await service.getFacultyOverview();
      
      const sgi100 = faculty.courses.find(c => c.courseCode === 'SGI100');
      const sgi150 = faculty.courses.find(c => c.courseCode === 'SGI150');
      const sgi210 = faculty.courses.find(c => c.courseCode === 'SGI210');
      const sgi301 = faculty.courses.find(c => c.courseCode === 'SGI301');
      const sgi410 = faculty.courses.find(c => c.courseCode === 'SGI410');
      
      // Foundational courses should have no prerequisites
      expect(sgi100?.prerequisites).toEqual([]);
      
      // Intermediate courses should have foundational prerequisites
      expect(sgi150?.prerequisites).toContain('SGI100');
      expect(sgi210?.prerequisites).toContain('SGI100');
      
      // Advanced courses should have intermediate prerequisites
      expect(sgi301?.prerequisites).toContain('SGI100');
      expect(sgi301?.prerequisites).toContain('SGI150');
      
      // Master-level courses should have advanced prerequisites
      expect(sgi410?.prerequisites).toContain('SGI301');
    });
  });
});