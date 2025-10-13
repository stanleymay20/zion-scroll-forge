import { AssessmentEvaluationService } from '../AssessmentEvaluationService';
import { AIGradingService } from '../AIGradingService';
import { PeerEvaluationService } from '../PeerEvaluationService';
import { CompetencyAssessmentService } from '../CompetencyAssessmentService';
import {
  AssessmentType,
  AssessmentFramework,
  AcademicAssessment,
  SpiritualAssessment,
  CompetencyAssessment,
  PeerEvaluation,
  AssessmentResult,
  AIGradingConfiguration,
  CompetencyType,
  PeerEvaluationType
} from '../../types/assessment';

describe('Assessment and Evaluation System', () => {
  let assessmentService: AssessmentEvaluationService;
  let aiGradingService: AIGradingService;
  let peerEvaluationService: PeerEvaluationService;
  let competencyService: CompetencyAssessmentService;

  beforeEach(() => {
    assessmentService = new AssessmentEvaluationService();
    aiGradingService = new AIGradingService();
    peerEvaluationService = new PeerEvaluationService();
    competencyService = new CompetencyAssessmentService();
  });

  describe('AssessmentEvaluationService', () => {
    it('should create a comprehensive assessment framework', async () => {
      const frameworkData = {
        name: 'Test Assessment Framework',
        type: AssessmentType.COMPREHENSIVE,
        aiGradingEnabled: true,
        propheticAlignment: true,
        kingdomRelevance: true
      };

      const framework = await assessmentService.createAssessmentFramework('course-1', frameworkData);

      expect(framework).toBeDefined();
      expect(framework.name).toBe('Test Assessment Framework');
      expect(framework.type).toBe(AssessmentType.COMPREHENSIVE);
      expect(framework.aiGradingEnabled).toBe(true);
      expect(framework.propheticAlignment).toBe(true);
      expect(framework.kingdomRelevance).toBe(true);
      expect(framework.academicComponents).toEqual([]);
      expect(framework.spiritualComponents).toEqual([]);
      expect(framework.competencyComponents).toEqual([]);
      expect(framework.peerEvaluationComponents).toEqual([]);
    });

    it('should create academic assessment with AI assistance', async () => {
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Test Framework',
        type: AssessmentType.ACADEMIC
      });

      const assessmentData = {
        title: 'Biblical Theology Assessment',
        description: 'Comprehensive assessment of biblical theology knowledge',
        type: 'essay' as const,
        maxScore: 100,
        passingScore: 70,
        scrollCoinReward: 75
      };

      const assessment = await assessmentService.createAcademicAssessment(framework.id, assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.title).toBe('Biblical Theology Assessment');
      expect(assessment.type).toBe('essay');
      expect(assessment.maxScore).toBe(100);
      expect(assessment.passingScore).toBe(70);
      expect(assessment.scrollCoinReward).toBe(75);
      expect(assessment.aiGradingConfig).toBeDefined();
      expect(assessment.rubric).toBeDefined();
    });

    it('should create spiritual assessment for character development', async () => {
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Test Framework',
        type: AssessmentType.SPIRITUAL
      });

      const assessmentData = {
        title: 'Character Formation Assessment',
        description: 'Assessment of spiritual growth and character development',
        type: 'character_formation' as const
      };

      const assessment = await assessmentService.createSpiritualAssessment(framework.id, assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.title).toBe('Character Formation Assessment');
      expect(assessment.type).toBe('character_formation');
      expect(assessment.biblicalAlignment).toBeDefined();
      expect(assessment.characterDevelopment).toBeDefined();
      expect(assessment.kingdomImpact).toBeDefined();
      expect(assessment.callingClarity).toBeDefined();
    });

    it('should create competency assessment for practical skills', async () => {
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Test Framework',
        type: AssessmentType.COMPETENCY
      });

      const assessmentData = {
        title: 'Technical Skills Assessment',
        description: 'Assessment of technical competencies',
        competencyType: CompetencyType.TECHNICAL_SKILLS
      };

      const assessment = await assessmentService.createCompetencyAssessment(framework.id, assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.title).toBe('Technical Skills Assessment');
      expect(assessment.competencyType).toBe(CompetencyType.TECHNICAL_SKILLS);
      expect(assessment.practicalDemonstration).toBeDefined();
      expect(assessment.kingdomApplication).toBeDefined();
      expect(assessment.kingdomApplication.eternal_impact).toBe(true);
      expect(assessment.kingdomApplication.community_blessing).toBe(true);
    });

    it('should create peer evaluation for collaborative learning', async () => {
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Test Framework',
        type: AssessmentType.PEER_EVALUATION
      });

      const evaluationData = {
        title: 'Project Collaboration Evaluation',
        description: 'Peer evaluation of collaboration skills',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION,
        groupSize: 4,
        anonymousMode: false,
        reciprocalEvaluation: true
      };

      const evaluation = await assessmentService.createPeerEvaluation(framework.id, evaluationData);

      expect(evaluation).toBeDefined();
      expect(evaluation.title).toBe('Project Collaboration Evaluation');
      expect(evaluation.evaluationType).toBe(PeerEvaluationType.PROJECT_COLLABORATION);
      expect(evaluation.groupSize).toBe(4);
      expect(evaluation.anonymousMode).toBe(false);
      expect(evaluation.reciprocalEvaluation).toBe(true);
      expect(evaluation.feedbackGuidelines).toBeDefined();
      expect(evaluation.feedbackGuidelines.length).toBeGreaterThan(0);
    });

    it('should grade assessment with AI assistance', async () => {
      const responses = [
        { questionId: '1', answer: 'Biblical foundation is essential for Christian education' },
        { questionId: '2', answer: 'Kingdom perspective transforms learning outcomes' }
      ];

      const aiConfig: AIGradingConfiguration = {
        enabled: true,
        model: 'gpt-4o',
        confidence_threshold: 0.8,
        human_review_required: false,
        spiritual_alignment_check: true,
        cultural_sensitivity_check: true,
        prophetic_intelligence_integration: true,
        bias_detection: true,
        feedback_generation: true
      };

      const result = await assessmentService.gradeAssessment('assessment-1', 'student-1', responses, aiConfig);

      expect(result).toBeDefined();
      expect(result.student_id).toBe('student-1');
      expect(result.assessment_id).toBe('assessment-1');
      expect(result.academic_score).toBeGreaterThanOrEqual(70);
      expect(result.academic_score).toBeLessThanOrEqual(100);
      expect(result.spiritual_score).toBeGreaterThanOrEqual(70);
      expect(result.spiritual_score).toBeLessThanOrEqual(100);
      expect(result.ai_feedback).toBeDefined();
      expect(result.ai_feedback.strengths).toBeDefined();
      expect(result.ai_feedback.areas_for_improvement).toBeDefined();
      expect(result.prophetic_insights).toBeDefined();
      expect(result.scroll_coin_earned).toBeGreaterThan(0);
      expect(result.kingdom_impact_potential).toBeGreaterThan(0);
    });

    it('should generate comprehensive assessment report', async () => {
      const timeframe = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };

      const report = await assessmentService.generateAssessmentReport('student-1', 'course-1', timeframe);

      expect(report).toBeDefined();
      expect(report.student_id).toBe('student-1');
      expect(report.course_id).toBe('course-1');
      expect(report.timeframe).toEqual(timeframe);
      expect(report.academic_performance).toBeDefined();
      expect(report.spiritual_growth).toBeDefined();
      expect(report.competency_development).toBeDefined();
      expect(report.peer_collaboration).toBeDefined();
      expect(report.overall_progress).toBeDefined();
      expect(report.prophetic_insights_summary).toBeDefined();
      expect(report.kingdom_impact_trajectory).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('AIGradingService', () => {
    it('should grade assessment with spiritual alignment check', async () => {
      const questions = [
        {
          id: 'q1',
          type: 'essay' as const,
          question: 'Explain the role of faith in education',
          points: 25,
          difficulty: 'intermediate' as const,
          bloomsTaxonomy: 'understand' as const,
          spiritualAlignment: true,
          culturalSensitivity: 'medium' as const,
          aiGradable: true
        }
      ];

      const responses = [
        { questionId: 'q1', answer: 'Faith provides the foundation for all true learning and wisdom' }
      ];

      const rubric = {
        id: 'rubric-1',
        name: 'Test Rubric',
        criteria: [],
        totalPoints: 100,
        passingThreshold: 70,
        spiritualFormationWeight: 0.4,
        academicWeight: 0.4,
        practicalApplicationWeight: 0.2
      };

      const config: AIGradingConfiguration = {
        enabled: true,
        model: 'gpt-4o',
        confidence_threshold: 0.8,
        human_review_required: false,
        spiritual_alignment_check: true,
        cultural_sensitivity_check: true,
        prophetic_intelligence_integration: true,
        bias_detection: true,
        feedback_generation: true
      };

      const result = await aiGradingService.gradeAssessment(questions, responses, rubric, config);

      expect(result).toBeDefined();
      expect(result.scores).toBeDefined();
      expect(result.scores['q1']).toBeGreaterThanOrEqual(0);
      expect(result.feedback).toBeDefined();
      expect(result.feedback.strengths).toBeDefined();
      expect(result.feedback.areas_for_improvement).toBeDefined();
      expect(result.spiritualAlignment).toBeDefined();
      expect(result.culturalSensitivity).toBeDefined();
      expect(result.propheticInsights).toBeDefined();
      expect(result.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(result.confidenceLevel).toBeLessThanOrEqual(1);
    });

    it('should detect bias in grading', async () => {
      const gradingResults = [
        { studentId: 'student-1', scores: { q1: 85, q2: 90 } },
        { studentId: 'student-2', scores: { q1: 75, q2: 80 } }
      ];

      const studentDemographics = [
        { studentId: 'student-1', gender: 'male', ethnicity: 'caucasian' },
        { studentId: 'student-2', gender: 'female', ethnicity: 'african' }
      ];

      const biasReport = await aiGradingService.detectBias(gradingResults, studentDemographics);

      expect(biasReport).toBeDefined();
      expect(biasReport.biasDetected).toBeDefined();
      expect(biasReport.biasType).toBeDefined();
      expect(biasReport.recommendations).toBeDefined();
      expect(biasReport.confidenceLevel).toBeGreaterThanOrEqual(0);
      expect(biasReport.confidenceLevel).toBeLessThanOrEqual(1);
    });

    it('should generate grading analytics', async () => {
      const gradingResults = [
        {
          scores: { q1: 85, q2: 90 },
          feedback: { strengths: ['Good analysis'], areas_for_improvement: ['More examples'] }
        },
        {
          scores: { q1: 75, q2: 80 },
          feedback: { strengths: ['Clear writing'], areas_for_improvement: ['Deeper analysis'] }
        }
      ];

      const analytics = await aiGradingService.generateGradingAnalytics('assessment-1', gradingResults);

      expect(analytics).toBeDefined();
      expect(analytics.averageScore).toBeGreaterThan(0);
      expect(analytics.scoreDistribution).toBeDefined();
      expect(analytics.commonStrengths).toBeDefined();
      expect(analytics.commonWeaknesses).toBeDefined();
      expect(analytics.spiritualGrowthIndicators).toBeDefined();
      expect(analytics.recommendedInterventions).toBeDefined();
    });
  });

  describe('PeerEvaluationService', () => {
    it('should create peer evaluation with biblical feedback guidelines', async () => {
      const evaluationData = {
        title: 'Team Project Evaluation',
        description: 'Evaluate team collaboration and spiritual unity',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION,
        groupSize: 4
      };

      const evaluation = await peerEvaluationService.createPeerEvaluation(evaluationData);

      expect(evaluation).toBeDefined();
      expect(evaluation.title).toBe('Team Project Evaluation');
      expect(evaluation.evaluationType).toBe(PeerEvaluationType.PROJECT_COLLABORATION);
      expect(evaluation.feedbackGuidelines).toBeDefined();
      expect(evaluation.feedbackGuidelines.length).toBeGreaterThan(0);
      
      const speakTruthGuideline = evaluation.feedbackGuidelines.find(
        g => g.principle === 'Speak Truth in Love'
      );
      expect(speakTruthGuideline).toBeDefined();
      expect(speakTruthGuideline?.biblical_foundation).toContain('Ephesians 4:15');
    });

    it('should form balanced evaluation groups', async () => {
      const evaluation = await peerEvaluationService.createPeerEvaluation({
        title: 'Test Evaluation',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION,
        groupSize: 3
      });

      const studentIds = ['student-1', 'student-2', 'student-3', 'student-4', 'student-5', 'student-6'];
      const studentProfiles = studentIds.map(id => ({ id, spiritualMaturity: 0.8, academicLevel: 'intermediate' }));

      const groups = await peerEvaluationService.formEvaluationGroups(
        evaluation.id,
        studentIds,
        studentProfiles
      );

      expect(groups).toBeDefined();
      expect(groups.length).toBeGreaterThan(0);
      expect(groups.every(group => group.members.length <= 3)).toBe(true);
      expect(groups.every(group => group.spiritualAccountability)).toBe(true);
      expect(groups.every(group => group.groupLeader)).toBeDefined();
    });

    it('should submit and validate peer feedback', async () => {
      const evaluation = await peerEvaluationService.createPeerEvaluation({
        title: 'Test Evaluation',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION
      });

      const feedbackData = {
        scores: { 'Collaboration': 4, 'Communication': 5, 'Character': 4 },
        qualitativeFeedback: 'Excellent team player who demonstrates Christ-like character in all interactions',
        spiritualEncouragement: 'Your servant heart is evident in how you support team members',
        areasOfStrength: ['Leadership', 'Encouragement', 'Technical skills'],
        areasForGrowth: ['Public speaking', 'Time management'],
        prayerRequests: ['Wisdom in decision making'],
        kingdomImpactObservations: ['Mentors younger students effectively']
      };

      const feedback = await peerEvaluationService.submitPeerFeedback(
        evaluation.id,
        'evaluator-1',
        'student-1',
        feedbackData
      );

      expect(feedback).toBeDefined();
      expect(feedback.evaluationId).toBe(evaluation.id);
      expect(feedback.evaluatorId).toBe('evaluator-1');
      expect(feedback.evaluatedId).toBe('student-1');
      expect(feedback.scores).toEqual(feedbackData.scores);
      expect(feedback.qualitativeFeedback).toBe(feedbackData.qualitativeFeedback);
      expect(feedback.spiritualEncouragement).toBe(feedbackData.spiritualEncouragement);
      expect(feedback.submissionDate).toBeDefined();
    });

    it('should process and aggregate peer evaluation results', async () => {
      const evaluation = await peerEvaluationService.createPeerEvaluation({
        title: 'Test Evaluation',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION
      });

      // Submit multiple peer evaluations
      const feedbackData1 = {
        scores: { 'Collaboration': 4, 'Communication': 4, 'Character': 5 },
        qualitativeFeedback: 'Great team player',
        spiritualEncouragement: 'Shows Christ-like love',
        areasOfStrength: ['Leadership', 'Encouragement'],
        areasForGrowth: ['Time management']
      };

      const feedbackData2 = {
        scores: { 'Collaboration': 5, 'Communication': 3, 'Character': 4 },
        qualitativeFeedback: 'Strong collaborator',
        spiritualEncouragement: 'Growing in wisdom',
        areasOfStrength: ['Leadership', 'Technical skills'],
        areasForGrowth: ['Communication', 'Time management']
      };

      await peerEvaluationService.submitPeerFeedback(evaluation.id, 'evaluator-1', 'student-1', feedbackData1);
      await peerEvaluationService.submitPeerFeedback(evaluation.id, 'evaluator-2', 'student-1', feedbackData2);

      const results = await peerEvaluationService.processPeerEvaluationResults(evaluation.id, 'student-1');

      expect(results).toBeDefined();
      expect(results.aggregatedScores).toBeDefined();
      expect(results.aggregatedScores['Collaboration']).toBe(4.5);
      expect(results.aggregatedScores['Communication']).toBe(3.5);
      expect(results.aggregatedScores['Character']).toBe(4.5);
      expect(results.strengthsConsensus).toContain('leadership');
      expect(results.growthAreasConsensus).toContain('time management');
      expect(results.overallPeerRating).toBeGreaterThan(0);
      expect(results.collaborationEffectiveness).toBe(4.5);
      expect(results.spiritualMaturityObserved).toBe(4.5);
    });

    it('should generate peer evaluation analytics', async () => {
      const evaluation = await peerEvaluationService.createPeerEvaluation({
        title: 'Test Evaluation',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION
      });

      const analytics = await peerEvaluationService.generatePeerEvaluationAnalytics(evaluation.id);

      expect(analytics).toBeDefined();
      expect(analytics.participationRate).toBeGreaterThanOrEqual(0);
      expect(analytics.participationRate).toBeLessThanOrEqual(1);
      expect(analytics.averageScores).toBeDefined();
      expect(analytics.feedbackQuality).toBeGreaterThanOrEqual(0);
      expect(analytics.spiritualGrowthIndicators).toBeDefined();
      expect(analytics.collaborationTrends).toBeDefined();
      expect(analytics.recommendedInterventions).toBeDefined();
      expect(analytics.groupEffectiveness).toBeDefined();
    });
  });

  describe('CompetencyAssessmentService', () => {
    it('should create competency assessment with kingdom application', async () => {
      const assessmentData = {
        title: 'Leadership Competency Assessment',
        description: 'Assessment of leadership skills with kingdom perspective',
        competencyType: CompetencyType.LEADERSHIP
      };

      const assessment = await competencyService.createCompetencyAssessment(assessmentData);

      expect(assessment).toBeDefined();
      expect(assessment.title).toBe('Leadership Competency Assessment');
      expect(assessment.competencyType).toBe(CompetencyType.LEADERSHIP);
      expect(assessment.skillAreas).toBeDefined();
      expect(assessment.practicalDemonstration).toBeDefined();
      expect(assessment.practicalDemonstration.kingdom_context).toBe(true);
      expect(assessment.kingdomApplication).toBeDefined();
      expect(assessment.kingdomApplication.eternal_impact).toBe(true);
      expect(assessment.kingdomApplication.community_blessing).toBe(true);
      expect(assessment.kingdomApplication.discipleship_multiplication).toBe(true);
    });

    it('should assess student competency across multiple dimensions', async () => {
      const evidenceItems = [
        {
          id: 'evidence-1',
          type: 'project' as const,
          title: 'Leadership Project',
          description: 'Led team project with kingdom focus',
          artifact: '/path/to/project',
          submissionDate: new Date(),
          validated: true,
          spiritualReflection: 'This project taught me servant leadership principles',
          kingdomImpact: 'Helped team members grow in their gifts and calling'
        }
      ];

      const competencyRecord = await competencyService.assessStudentCompetency(
        'student-1',
        CompetencyType.LEADERSHIP,
        evidenceItems
      );

      expect(competencyRecord).toBeDefined();
      expect(competencyRecord.competencyType).toBe(CompetencyType.LEADERSHIP);
      expect(competencyRecord.currentLevel).toBeDefined();
      expect(competencyRecord.skillAreas).toBeDefined();
      expect(competencyRecord.evidencePortfolio).toEqual(evidenceItems);
      expect(competencyRecord.growthTrajectory).toBeDefined();
      expect(competencyRecord.kingdomApplication).toBeDefined();
      expect(competencyRecord.kingdomApplication.applicationArea).toBe(CompetencyType.LEADERSHIP);
    });

    it('should conduct practical demonstration assessment', async () => {
      const assessment = await competencyService.createCompetencyAssessment({
        title: 'Technical Skills Assessment',
        competencyType: CompetencyType.TECHNICAL_SKILLS
      });

      const submissionData = {
        artifacts: ['/path/to/code', '/path/to/documentation'],
        documentation: 'Comprehensive project documentation',
        reflectionEssay: 'This project deepened my understanding of using technology for kingdom purposes',
        kingdomApplicationPlan: 'Plan to use these skills to build tools for local church ministry'
      };

      const record = await competencyService.conductPracticalDemonstration(
        assessment.id,
        'student-1',
        submissionData
      );

      expect(record).toBeDefined();
      expect(record.demonstrationId).toBe(assessment.id);
      expect(record.studentId).toBe('student-1');
      expect(record.score).toBeGreaterThanOrEqual(70);
      expect(record.score).toBeLessThanOrEqual(100);
      expect(record.kingdomContextApplication).toBe(true);
      expect(record.skillsValidated).toBeDefined();
      expect(record.areasForImprovement).toBeDefined();
      expect(record.nextLevelRecommendations).toBeDefined();
    });

    it('should validate portfolio against requirements', async () => {
      const portfolioItems = [
        {
          id: 'item-1',
          type: 'project' as const,
          title: 'Web Application',
          description: 'Full-stack web application',
          artifact: '/path/to/app',
          submissionDate: new Date(),
          validated: true,
          spiritualReflection: 'Learned to code with excellence as unto the Lord',
          kingdomImpact: 'Created tool to help local church manage volunteers'
        }
      ];

      const requirements = [
        {
          artifact_type: 'Project Portfolio',
          description: 'Collection of technical projects',
          required: true,
          evaluation_criteria: [],
          spiritual_reflection_required: true
        }
      ];

      const validation = await competencyService.validatePortfolio('student-1', portfolioItems, requirements);

      expect(validation).toBeDefined();
      expect(validation.completeness).toBeGreaterThan(0);
      expect(validation.validatedRequirements).toContain('Project Portfolio');
      expect(validation.spiritualReflectionQuality).toBeGreaterThan(0);
      expect(validation.kingdomImpactDemonstration).toBeGreaterThan(0);
      expect(validation.recommendations).toBeDefined();
    });

    it('should generate comprehensive competency report', async () => {
      const report = await competencyService.generateCompetencyReport('student-1');

      expect(report).toBeDefined();
      expect(report.overallCompetencyLevel).toBeDefined();
      expect(report.competencyBreakdown).toBeDefined();
      expect(report.strengthAreas).toBeDefined();
      expect(report.growthAreas).toBeDefined();
      expect(report.kingdomReadiness).toBeGreaterThanOrEqual(0);
      expect(report.kingdomReadiness).toBeLessThanOrEqual(1);
      expect(report.industryAlignment).toBeGreaterThanOrEqual(0);
      expect(report.industryAlignment).toBeLessThanOrEqual(1);
      expect(report.careerRecommendations).toBeDefined();
      expect(report.ministryOpportunities).toBeDefined();
      expect(report.nextSteps).toBeDefined();
      expect(report.mentorshipNeeds).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all assessment components for comprehensive evaluation', async () => {
      // Create comprehensive assessment framework
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Comprehensive Course Assessment',
        type: AssessmentType.COMPREHENSIVE,
        aiGradingEnabled: true,
        propheticAlignment: true,
        kingdomRelevance: true
      });

      // Add academic component
      const academicAssessment = await assessmentService.createAcademicAssessment(framework.id, {
        title: 'Biblical Worldview Assessment',
        description: 'Assessment of biblical worldview integration',
        type: 'essay',
        maxScore: 100,
        passingScore: 70
      });

      // Add spiritual component
      const spiritualAssessment = await assessmentService.createSpiritualAssessment(framework.id, {
        title: 'Character Formation Assessment',
        description: 'Assessment of spiritual growth',
        type: 'character_formation'
      });

      // Add competency component
      const competencyAssessment = await assessmentService.createCompetencyAssessment(framework.id, {
        title: 'Leadership Competency',
        description: 'Leadership skills assessment',
        competencyType: CompetencyType.LEADERSHIP
      });

      // Add peer evaluation component
      const peerEvaluation = await assessmentService.createPeerEvaluation(framework.id, {
        title: 'Collaborative Learning Evaluation',
        description: 'Peer assessment of collaboration',
        evaluationType: PeerEvaluationType.PROJECT_COLLABORATION
      });

      expect(framework.academicComponents).toHaveLength(1);
      expect(framework.spiritualComponents).toHaveLength(1);
      expect(framework.competencyComponents).toHaveLength(1);
      expect(framework.peerEvaluationComponents).toHaveLength(1);

      // Test comprehensive grading
      const responses = [
        { questionId: '1', answer: 'Biblical worldview transforms all aspects of learning and life' }
      ];

      const aiConfig: AIGradingConfiguration = {
        enabled: true,
        model: 'gpt-4o',
        confidence_threshold: 0.8,
        human_review_required: false,
        spiritual_alignment_check: true,
        cultural_sensitivity_check: true,
        prophetic_intelligence_integration: true,
        bias_detection: true,
        feedback_generation: true
      };

      const result = await assessmentService.gradeAssessment('assessment-1', 'student-1', responses, aiConfig);

      expect(result).toBeDefined();
      expect(result.academic_score).toBeGreaterThan(0);
      expect(result.spiritual_score).toBeGreaterThan(0);
      expect(result.ai_feedback).toBeDefined();
      expect(result.prophetic_insights).toBeDefined();
      expect(result.kingdom_impact_potential).toBeGreaterThan(0);

      // Generate comprehensive report
      const report = await assessmentService.generateAssessmentReport(
        'student-1',
        'course-1',
        { start: new Date('2024-01-01'), end: new Date('2024-12-31') }
      );

      expect(report).toBeDefined();
      expect(report.academic_performance).toBeDefined();
      expect(report.spiritual_growth).toBeDefined();
      expect(report.competency_development).toBeDefined();
      expect(report.peer_collaboration).toBeDefined();
      expect(report.prophetic_insights_summary).toBeDefined();
      expect(report.kingdom_impact_trajectory).toBeDefined();
    });

    it('should maintain spiritual alignment throughout assessment process', async () => {
      const framework = await assessmentService.createAssessmentFramework('course-1', {
        name: 'Spiritually Aligned Assessment',
        type: AssessmentType.COMPREHENSIVE,
        propheticAlignment: true,
        kingdomRelevance: true
      });

      const academicAssessment = await assessmentService.createAcademicAssessment(framework.id, {
        title: 'Kingdom-Focused Assessment',
        description: 'Assessment with kingdom perspective',
        type: 'essay'
      });

      const spiritualAssessment = await assessmentService.createSpiritualAssessment(framework.id, {
        title: 'Prophetic Discernment Assessment',
        description: 'Assessment of prophetic sensitivity',
        type: 'prophetic_discernment'
      });

      expect(framework.propheticAlignment).toBe(true);
      expect(framework.kingdomRelevance).toBe(true);
      expect(academicAssessment.aiGradingConfig.spiritual_alignment_check).toBe(true);
      expect(academicAssessment.aiGradingConfig.prophetic_intelligence_integration).toBe(true);
      expect(spiritualAssessment.biblicalAlignment.scriptureAlignment).toBe(true);
      expect(spiritualAssessment.biblicalAlignment.kingdomValues).toBe(true);
    });
  });
});