/**
 * Educational Philosophy Comparison Test Suite
 * Tests the educational philosophy comparison framework
 */

import { ScrollUniversityPhilosophyDocumentationService } from '../ScrollUniversityPhilosophyDocumentationService';
import { LearnTubePhilosophyAnalysisService } from '../LearnTubePhilosophyAnalysisService';
import { PhilosophyComparisonReportingService } from '../PhilosophyComparisonReportingService';

describe('Educational Philosophy Comparison Framework', () => {
  let scrollPhilosophyService: ScrollUniversityPhilosophyDocumentationService;
  let learnTubePhilosophyService: LearnTubePhilosophyAnalysisService;
  let comparisonReportingService: PhilosophyComparisonReportingService;

  beforeEach(() => {
    scrollPhilosophyService = new ScrollUniversityPhilosophyDocumentationService();
    learnTubePhilosophyService = new LearnTubePhilosophyAnalysisService();
    comparisonReportingService = new PhilosophyComparisonReportingService();
  });

  describe('ScrollUniversity Philosophy Documentation', () => {
    it('should document Christ-centered holistic approach', async () => {
      const philosophy = await scrollPhilosophyService.getScrollUniversityPhilosophy();
      
      expect(philosophy.platformName).toBe('ScrollUniversity');
      expect(philosophy.coreApproach.type).toBe('christ_centered_holistic');
      expect(philosophy.coreApproach.worldviewAlignment).toBe('biblical');
      expect(philosophy.spiritualIntegration).toBeDefined();
      expect(philosophy.kingdomPurpose).toBeDefined();
      expect(philosophy.characterDevelopment).toBeDefined();
    });

    it('should map kingdom purpose and prophetic validation systems', async () => {
      const kingdomMapping = await scrollPhilosophyService.getKingdomPurposeMapping();
      
      expect(kingdomMapping.kingdomPurpose.globalTransformationFocus).toBe(true);
      expect(kingdomMapping.kingdomPurpose.scrollSonTraining).toBe(true);
      expect(kingdomMapping.propheticValidation.process).toContain('Regular prophetic check-ins with spiritual mentors');
      expect(kingdomMapping.propheticValidation.integration).toContain('Integrated into all learning assessments');
    });

    it('should create spiritual formation tracking components', async () => {
      const tracking = await scrollPhilosophyService.getSpiritualFormationTracking();
      
      expect(tracking.spiritualGrowthIndicators).toContain('Biblical knowledge assessment scores');
      expect(tracking.characterDevelopmentMarkers).toContain('Integrity in academic and personal conduct');
      expect(tracking.kingdomImpactMeasures).toContain('Kingdom project outcomes and transformation');
    });
  });

  describe('LearnTube.ai Philosophy Analysis', () => {
    it('should analyze secular skill-focused approach', async () => {
      const philosophy = await learnTubePhilosophyService.getLearnTubePhilosophy();
      
      expect(philosophy.platformName).toBe('LearnTube.ai');
      expect(philosophy.coreApproach.type).toBe('secular_skill_focused');
      expect(philosophy.coreApproach.worldviewAlignment).toBe('secular');
      expect(philosophy.spiritualIntegration).toBeUndefined();
      expect(philosophy.kingdomPurpose).toBeUndefined();
      expect(philosophy.characterDevelopment).toBeUndefined();
    });

    it('should research learning methodologies and identify limitations', async () => {
      const research = await learnTubePhilosophyService.researchLearningMethodologies();
      
      expect(research.limitations).toContain('Lack of spiritual or character development components');
      expect(research.limitations).toContain('Secular worldview without kingdom perspective');
      expect(research.competitiveGaps).toContain('No spiritual formation or character development');
    });

    it('should analyze assessment systems and identify gaps', async () => {
      const assessment = await learnTubePhilosophyService.analyzeAssessmentSystems();
      
      expect(assessment.assessmentApproach).toContain('skill-focused assessment without holistic evaluation');
      expect(assessment.limitations).toContain('No spiritual growth or character assessment');
      expect(assessment.limitations).toContain('Missing kingdom impact and transformation metrics');
    });
  });

  describe('Philosophy Comparison Reporting', () => {
    it('should generate comprehensive comparison report', async () => {
      const report = await comparisonReportingService.generateComparisonReport();
      
      expect(report.platforms.scrollUniversity).toBeDefined();
      expect(report.platforms.competitor).toBeDefined();
      expect(report.comparisonMatrix.overallAdvantage).toBe('scrolluniversity');
      expect(report.advantageAnalysis.spiritualAdvantages.length).toBeGreaterThan(0);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should generate holistic vs skill-focused comparison', async () => {
      const comparison = await comparisonReportingService.generateHolisticVsSkillFocusedReport();
      
      expect(comparison.holisticApproach.description).toContain('comprehensive approach developing the whole person');
      expect(comparison.skillFocusedApproach.description).toContain('narrow approach focusing solely on technical skill');
      expect(comparison.comparison.keyDifferences).toContain('Holistic development vs. skill-only training');
    });

    it('should create kingdom purpose vs career advancement analysis', async () => {
      const analysis = await comparisonReportingService.generateKingdomVsCareerAnalysis();
      
      expect(analysis.kingdomPurpose.vision).toContain('Training scroll sons to govern nations righteously');
      expect(analysis.careerAdvancement.vision).toContain('Individual skill development for personal career success');
      expect(analysis.transformationalDifference).toContain('Kingdom purpose transforms societies; career advancement benefits individuals');
    });

    it('should implement spiritual formation vs secular education metrics', async () => {
      const metrics = await comparisonReportingService.generateSpiritualVsSecularMetrics();
      
      expect(metrics.spiritualFormationMetrics.length).toBeGreaterThan(0);
      expect(metrics.secularEducationMetrics.length).toBeGreaterThan(0);
      expect(metrics.comparativeAnalysis.spiritualAdvantages).toContain('Develops whole person (spirit, soul, body) vs. skills only');
      expect(metrics.comparativeAnalysis.secularLimitations).toContain('Develops skills without character or wisdom');
    });
  });

  describe('Integration and Requirements Validation', () => {
    it('should satisfy requirement 2.1 - educational philosophy comparison', async () => {
      const scrollPhilosophy = await scrollPhilosophyService.getScrollUniversityPhilosophy();
      const learnTubePhilosophy = await learnTubePhilosophyService.getLearnTubePhilosophy();
      
      // Verify Christ-centered vs secular comparison
      expect(scrollPhilosophy.coreApproach.type).toBe('christ_centered_holistic');
      expect(learnTubePhilosophy.coreApproach.type).toBe('secular_skill_focused');
      
      // Verify holistic vs skill-focused methodology
      expect(scrollPhilosophy.spiritualIntegration).toBeDefined();
      expect(learnTubePhilosophy.spiritualIntegration).toBeUndefined();
    });

    it('should satisfy requirement 2.2 - assessment system analysis', async () => {
      const scrollPhilosophy = await scrollPhilosophyService.getScrollUniversityPhilosophy();
      const learnTubePhilosophy = await learnTubePhilosophyService.getLearnTubePhilosophy();
      
      // Verify multi-dimensional vs academic-only assessment
      expect(scrollPhilosophy.assessmentSystem.holisticEvaluation).toBe(true);
      expect(learnTubePhilosophy.assessmentSystem.holisticEvaluation).toBe(false);
      
      // Verify spiritual assessment component
      expect(scrollPhilosophy.assessmentSystem.spiritualAssessment).toBeDefined();
      expect(learnTubePhilosophy.assessmentSystem.spiritualAssessment).toBeUndefined();
    });

    it('should satisfy requirement 2.3 - personalization evaluation', async () => {
      const scrollPhilosophy = await scrollPhilosophyService.getScrollUniversityPhilosophy();
      const learnTubePhilosophy = await learnTubePhilosophyService.getLearnTubePhilosophy();
      
      // Verify prophetic AI vs standard AI
      expect(scrollPhilosophy.personalizationApproach.propheticGuidance).toBe(true);
      expect(learnTubePhilosophy.personalizationApproach.propheticGuidance).toBe(false);
      
      // Verify calling alignment vs basic personalization
      expect(scrollPhilosophy.personalizationApproach.individualCallingAlignment).toBe(true);
      expect(learnTubePhilosophy.personalizationApproach.individualCallingAlignment).toBe(false);
    });

    it('should satisfy requirement 2.4 - outcomes comparison', async () => {
      const comparison = await comparisonReportingService.generateKingdomVsCareerAnalysis();
      
      // Verify character formation vs academic achievement focus
      expect(comparison.kingdomPurpose.outcomes).toContain('Nations transformed through righteous leadership');
      expect(comparison.careerAdvancement.outcomes).toContain('Better jobs and higher salaries for individuals');
      
      // Verify transformation vs advancement difference
      expect(comparison.transformationalDifference).toContain('Kingdom purpose transforms societies; career advancement benefits individuals');
    });
  });
});