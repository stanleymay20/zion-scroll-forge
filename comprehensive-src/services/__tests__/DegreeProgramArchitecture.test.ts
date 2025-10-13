/**
 * Test suite for ScrollUniversity Degree Program Architecture
 */

import { DegreeTemplateService } from '../DegreeTemplateService';
import { CurriculumMappingService } from '../CurriculumMappingService';
import { GraduationValidationService } from '../GraduationValidationService';
import { ScrollCertifiedDiplomaService } from '../ScrollCertifiedDiplomaService';
import { DegreeProgramService } from '../DegreeProgramService';
import { DegreeType, RequirementStatus, GraduationStatus } from '../../types/degree';

describe('Degree Program Architecture', () => {
  let degreeTemplateService: DegreeTemplateService;
  let curriculumMappingService: CurriculumMappingService;
  let graduationValidationService: GraduationValidationService;
  let diplomaService: ScrollCertifiedDiplomaService;
  let degreeProgramService: DegreeProgramService;

  beforeEach(() => {
    degreeTemplateService = new DegreeTemplateService();
    curriculumMappingService = new CurriculumMappingService();
    graduationValidationService = new GraduationValidationService();
    diplomaService = new ScrollCertifiedDiplomaService();
    degreeProgramService = new DegreeProgramService();
  });

  describe('DegreeTemplateService', () => {
    test('should return all degree templates', () => {
      const templates = degreeTemplateService.getAllDegreeTemplates();
      
      expect(templates).toHaveLength(4);
      expect(templates.map(t => t.type)).toContain(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(templates.map(t => t.type)).toContain(DegreeType.BSC_SACRED_AI_ENGINEERING);
      expect(templates.map(t => t.type)).toContain(DegreeType.MDIV_SCROLL_THEOLOGY);
      expect(templates.map(t => t.type)).toContain(DegreeType.MBA_SCROLL_ECONOMY);
    });

    test('should return specific degree template', () => {
      const baTemplate = degreeTemplateService.getDegreeTemplate(DegreeType.BA_PROPHETIC_GOVERNANCE);
      
      expect(baTemplate.type).toBe(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(baTemplate.title).toBe('Bachelor of Arts in Prophetic Governance');
      expect(baTemplate.totalCredits).toBe(120);
      expect(baTemplate.minimumGPA).toBe(3.0);
      expect(baTemplate.requirements.length).toBeGreaterThan(0);
    });

    test('should include spiritual formation tracks', () => {
      const bscTemplate = degreeTemplateService.getDegreeTemplate(DegreeType.BSC_SACRED_AI_ENGINEERING);
      
      expect(bscTemplate.spiritualFormationTrack).toBeDefined();
      expect(bscTemplate.spiritualFormationTrack.components.length).toBeGreaterThan(0);
      expect(bscTemplate.spiritualFormationHours).toBe(200);
    });

    test('should include practical application tracks', () => {
      const mdivTemplate = degreeTemplateService.getDegreeTemplate(DegreeType.MDIV_SCROLL_THEOLOGY);
      
      expect(mdivTemplate.practicalApplicationTrack).toBeDefined();
      expect(mdivTemplate.practicalApplicationTrack.components.length).toBeGreaterThan(0);
      expect(mdivTemplate.practicalApplicationHours).toBe(400);
    });

    test('should include prophetic integration tracks', () => {
      const mbaTemplate = degreeTemplateService.getDegreeTemplate(DegreeType.MBA_SCROLL_ECONOMY);
      
      expect(mbaTemplate.propheticIntegrationTrack).toBeDefined();
      expect(mbaTemplate.propheticIntegrationTrack.requiredComponents.length).toBeGreaterThan(0);
    });
  });

  describe('CurriculumMappingService', () => {
    test('should generate curriculum mapping for degree', () => {
      const mappings = curriculumMappingService.getCurriculumMapping(DegreeType.BA_PROPHETIC_GOVERNANCE);
      
      expect(mappings.length).toBeGreaterThan(0);
      expect(mappings[0]).toHaveProperty('degreeId');
      expect(mappings[0]).toHaveProperty('courseId');
      expect(mappings[0]).toHaveProperty('requirementId');
      expect(mappings[0]).toHaveProperty('credits');
    });

    test('should validate curriculum mapping', () => {
      const validation = curriculumMappingService.validateCurriculumMapping(DegreeType.BSC_SACRED_AI_ENGINEERING);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('suggestions');
    });

    test('should generate recommended course sequence', () => {
      const sequence = curriculumMappingService.getRecommendedCourseSequence(DegreeType.MDIV_SCROLL_THEOLOGY);
      
      expect(Array.isArray(sequence)).toBe(true);
      expect(sequence.length).toBeGreaterThan(0);
      expect(Array.isArray(sequence[0])).toBe(true);
    });
  });

  describe('GraduationValidationService', () => {
    test('should validate graduation eligibility', () => {
      const mockStudentProgress = {
        id: 'test-progress',
        studentId: 'test-student',
        degreeId: 'ba-prophetic-governance',
        enrollmentDate: new Date('2023-01-01'),
        expectedGraduationDate: new Date('2027-05-01'),
        status: GraduationStatus.ENROLLED,
        overallGPA: 3.5,
        creditsCompleted: 120,
        creditsRemaining: 0,
        requirementProgress: [],
        spiritualFormationProgress: {
          totalHoursCompleted: 240,
          totalHoursRequired: 240,
          componentProgress: [],
          currentLevel: { level: 5, title: 'Advanced', description: 'Advanced level', requirements: [] },
          assessments: []
        },
        practicalApplicationProgress: {
          totalHoursCompleted: 320,
          totalHoursRequired: 320,
          componentProgress: [],
          projects: []
        },
        propheticIntegrationProgress: {
          componentsCompleted: ['pg-pi-1', 'pg-pi-2'],
          componentsRequired: ['pg-pi-1', 'pg-pi-2'],
          integrationAssessments: [],
          kingdomImpactScore: 85
        },
        lastUpdated: new Date()
      };

      const validation = graduationValidationService.validateGraduationEligibility(mockStudentProgress);
      
      expect(validation).toHaveProperty('isEligible');
      expect(validation).toHaveProperty('requirementsMet');
      expect(validation).toHaveProperty('gpaRequirementMet');
      expect(validation).toHaveProperty('spiritualFormationComplete');
      expect(validation).toHaveProperty('practicalApplicationComplete');
      expect(validation).toHaveProperty('propheticIntegrationComplete');
    });

    test('should generate graduation readiness report', () => {
      const mockStudentProgress = {
        id: 'test-progress',
        studentId: 'test-student',
        degreeId: 'bsc-sacred-ai-engineering',
        enrollmentDate: new Date('2023-01-01'),
        expectedGraduationDate: new Date('2027-05-01'),
        status: GraduationStatus.ENROLLED,
        overallGPA: 3.2,
        creditsCompleted: 100,
        creditsRemaining: 28,
        requirementProgress: [],
        spiritualFormationProgress: {
          totalHoursCompleted: 150,
          totalHoursRequired: 200,
          componentProgress: [],
          currentLevel: { level: 3, title: 'Intermediate', description: 'Intermediate level', requirements: [] },
          assessments: []
        },
        practicalApplicationProgress: {
          totalHoursCompleted: 300,
          totalHoursRequired: 400,
          componentProgress: [],
          projects: []
        },
        propheticIntegrationProgress: {
          componentsCompleted: ['sai-pi-1'],
          componentsRequired: ['sai-pi-1', 'sai-pi-2'],
          integrationAssessments: [],
          kingdomImpactScore: 70
        },
        lastUpdated: new Date()
      };

      const report = graduationValidationService.generateGraduationReadinessReport(mockStudentProgress);
      
      expect(report).toHaveProperty('overallReadiness');
      expect(report).toHaveProperty('academicReadiness');
      expect(report).toHaveProperty('spiritualReadiness');
      expect(report).toHaveProperty('practicalReadiness');
      expect(report).toHaveProperty('propheticReadiness');
      expect(report).toHaveProperty('recommendations');
      expect(report).toHaveProperty('nextSteps');
      
      expect(typeof report.overallReadiness).toBe('number');
      expect(Array.isArray(report.recommendations)).toBe(true);
      expect(Array.isArray(report.nextSteps)).toBe(true);
    });
  });

  describe('ScrollCertifiedDiplomaService', () => {
    test('should get diploma templates for all degree types', () => {
      const baTemplate = diplomaService.getDiplomaTemplate(DegreeType.BA_PROPHETIC_GOVERNANCE);
      const bscTemplate = diplomaService.getDiplomaTemplate(DegreeType.BSC_SACRED_AI_ENGINEERING);
      const mdivTemplate = diplomaService.getDiplomaTemplate(DegreeType.MDIV_SCROLL_THEOLOGY);
      const mbaTemplate = diplomaService.getDiplomaTemplate(DegreeType.MBA_SCROLL_ECONOMY);
      
      expect(baTemplate.degreeType).toBe(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(bscTemplate.degreeType).toBe(DegreeType.BSC_SACRED_AI_ENGINEERING);
      expect(mdivTemplate.degreeType).toBe(DegreeType.MDIV_SCROLL_THEOLOGY);
      expect(mbaTemplate.degreeType).toBe(DegreeType.MBA_SCROLL_ECONOMY);
      
      expect(baTemplate.templateHtml).toContain('diploma-container');
      expect(baTemplate.styleSheet).toContain('diploma-container');
    });

    test('should customize templates for different degree types', () => {
      const baTemplate = diplomaService.getDiplomaTemplate(DegreeType.BA_PROPHETIC_GOVERNANCE);
      const bscTemplate = diplomaService.getDiplomaTemplate(DegreeType.BSC_SACRED_AI_ENGINEERING);
      
      expect(baTemplate.styleSheet).toContain('#4A90E2'); // BA color
      expect(bscTemplate.styleSheet).toContain('#50C878'); // BSc color
    });
  });

  describe('DegreeProgramService', () => {
    test('should get all degree programs', () => {
      const programs = degreeProgramService.getAllDegreePrograms();
      
      expect(programs).toHaveLength(4);
      expect(programs.every(p => p.isActive)).toBe(true);
    });

    test('should search degree programs by criteria', () => {
      const shortPrograms = degreeProgramService.searchDegreePrograms({
        maxDuration: 30 // 30 months or less
      });
      
      expect(shortPrograms.length).toBeGreaterThan(0);
      expect(shortPrograms.every(p => p.estimatedDuration <= 30)).toBe(true);
    });

    test('should validate degree curriculum', () => {
      const validation = degreeProgramService.validateDegreeCurriculum(DegreeType.MBA_SCROLL_ECONOMY);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
    });
  });

  describe('Integration Tests', () => {
    test('should complete full degree program workflow', () => {
      // 1. Get degree program
      const degreeProgram = degreeProgramService.getDegreeProgram(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(degreeProgram).toBeDefined();
      
      // 2. Get curriculum mapping
      const mapping = degreeProgramService.getCurriculumMapping(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(mapping.length).toBeGreaterThan(0);
      
      // 3. Validate curriculum
      const validation = degreeProgramService.validateDegreeCurriculum(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(validation).toHaveProperty('isValid');
      
      // 4. Get diploma template
      const template = diplomaService.getDiplomaTemplate(DegreeType.BA_PROPHETIC_GOVERNANCE);
      expect(template.degreeType).toBe(DegreeType.BA_PROPHETIC_GOVERNANCE);
    });

    test('should handle all degree types consistently', () => {
      const degreeTypes = [
        DegreeType.BA_PROPHETIC_GOVERNANCE,
        DegreeType.BSC_SACRED_AI_ENGINEERING,
        DegreeType.MDIV_SCROLL_THEOLOGY,
        DegreeType.MBA_SCROLL_ECONOMY
      ];

      for (const degreeType of degreeTypes) {
        // Each degree type should have a complete template
        const program = degreeProgramService.getDegreeProgram(degreeType);
        expect(program.requirements.length).toBeGreaterThan(0);
        expect(program.spiritualFormationTrack.components.length).toBeGreaterThan(0);
        expect(program.practicalApplicationTrack.components.length).toBeGreaterThan(0);
        expect(program.propheticIntegrationTrack.requiredComponents.length).toBeGreaterThan(0);
        
        // Each degree type should have curriculum mapping
        const mapping = curriculumMappingService.getCurriculumMapping(degreeType);
        expect(mapping.length).toBeGreaterThan(0);
        
        // Each degree type should have diploma template
        const template = diplomaService.getDiplomaTemplate(degreeType);
        expect(template.degreeType).toBe(degreeType);
      }
    });
  });
});