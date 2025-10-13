import React, { useState, useEffect } from 'react';
import {
  AssessmentFramework,
  AssessmentResult,
  CompetencyScore,
  PeerEvaluationScore,
  PropheticInsight,
  AssessmentType
} from '../../types/assessment';
import { AssessmentEvaluationService } from '../../services/AssessmentEvaluationService';
import { AIGradingService } from '../../services/AIGradingService';
import { PeerEvaluationService } from '../../services/PeerEvaluationService';
import { CompetencyAssessmentService } from '../../services/CompetencyAssessmentService';

interface AssessmentDashboardProps {
  studentId: string;
  courseId: string;
}

export const AssessmentDashboard: React.FC<AssessmentDashboardProps> = ({
  studentId,
  courseId
}) => {
  const [assessmentFrameworks, setAssessmentFrameworks] = useState<AssessmentFramework[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResult[]>([]);
  const [competencyProfile, setCompetencyProfile] = useState<any>(null);
  const [peerEvaluations, setPeerEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'spiritual' | 'competency' | 'peer'>('overview');

  const assessmentService = new AssessmentEvaluationService();
  const aiGradingService = new AIGradingService();
  const peerEvaluationService = new PeerEvaluationService();
  const competencyService = new CompetencyAssessmentService();

  useEffect(() => {
    loadAssessmentData();
  }, [studentId, courseId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      
      // Load assessment frameworks
      const frameworks = await loadAssessmentFrameworks();
      setAssessmentFrameworks(frameworks);

      // Load assessment results
      const results = await loadAssessmentResults();
      setAssessmentResults(results);

      // Load competency profile
      const profile = await loadCompetencyProfile();
      setCompetencyProfile(profile);

      // Load peer evaluations
      const peerEvals = await loadPeerEvaluations();
      setPeerEvaluations(peerEvals);

    } catch (error) {
      console.error('Error loading assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssessmentFrameworks = async (): Promise<AssessmentFramework[]> => {
    // Mock data - in real implementation, this would fetch from API
    return [
      {
        id: '1',
        name: 'Comprehensive Course Assessment',
        type: AssessmentType.COMPREHENSIVE,
        academicComponents: [],
        spiritualComponents: [],
        competencyComponents: [],
        peerEvaluationComponents: [],
        aiGradingEnabled: true,
        propheticAlignment: true,
        kingdomRelevance: true
      }
    ];
  };

  const loadAssessmentResults = async (): Promise<AssessmentResult[]> => {
    // Mock data
    return [
      {
        id: '1',
        student_id: studentId,
        assessment_id: '1',
        academic_score: 85,
        spiritual_score: 90,
        competency_scores: [
          {
            competency: 'Technical Skills',
            score: 80,
            level_achieved: 'competent',
            evidence: ['Project completion', 'Peer validation'],
            growth_recommendations: ['Advanced programming', 'System design']
          }
        ],
        peer_evaluation_scores: [],
        ai_feedback: {
          strengths: ['Strong biblical foundation', 'Good analytical thinking'],
          areas_for_improvement: ['Cultural sensitivity', 'Public speaking'],
          personalized_recommendations: ['Join cross-cultural ministry', 'Practice presentations'],
          spiritual_insights: ['Growing in wisdom', 'Developing servant heart'],
          cultural_considerations: ['Consider global perspectives'],
          next_learning_steps: ['Advanced courses', 'Mentorship']
        },
        human_feedback: {
          instructor_id: 'instructor1',
          written_feedback: 'Excellent progress in spiritual and academic growth',
          spiritual_encouragement: 'God is developing your gifts for kingdom service',
          mentorship_recommendations: ['Seek prophetic mentorship'],
          prayer_requests: ['Wisdom in calling', 'Cultural sensitivity']
        },
        overall_grade: 'A-',
        scroll_coin_earned: 75,
        areas_for_growth: ['Cultural sensitivity', 'Leadership skills'],
        strengths_identified: ['Biblical knowledge', 'Technical aptitude'],
        next_steps: ['Advanced leadership course', 'Cross-cultural experience'],
        prophetic_insights: [
          {
            insight: 'God is preparing you for cross-cultural ministry',
            scripture_reference: 'Acts 1:8',
            application: 'Prepare for global kingdom impact',
            confirmation_level: 0.8,
            source: 'ai_prophetic_intelligence'
          }
        ],
        kingdom_impact_potential: 0.85
      }
    ];
  };

  const loadCompetencyProfile = async () => {
    // Mock competency profile
    return {
      overallCompetencyLevel: 'competent',
      competencyBreakdown: {
        'technical_skills': 'competent',
        'leadership': 'advanced_beginner',
        'communication': 'proficient'
      },
      strengthAreas: ['Technical Skills', 'Biblical Knowledge'],
      growthAreas: ['Leadership', 'Cultural Competency'],
      kingdomReadiness: 0.75,
      industryAlignment: 0.80,
      careerRecommendations: ['Software Developer', 'Tech Ministry Leader'],
      ministryOpportunities: ['Church IT Support', 'Digital Evangelism'],
      nextSteps: ['Leadership development', 'Cross-cultural training'],
      mentorshipNeeds: ['Leadership mentor', 'Cultural competency guide']
    };
  };

  const loadPeerEvaluations = async () => {
    // Mock peer evaluation data
    return [
      {
        evaluationId: '1',
        aggregatedScores: {
          'Collaboration': 4.2,
          'Communication': 3.8,
          'Character': 4.5,
          'Contribution': 4.0
        },
        feedbackSummary: 'Strong team player with excellent character',
        spiritualEncouragement: ['Demonstrates Christ-like love', 'Shows servant leadership'],
        strengthsConsensus: ['Reliable', 'Encouraging', 'Technically skilled'],
        growthAreasConsensus: ['Public speaking', 'Conflict resolution'],
        overallPeerRating: 4.1,
        collaborationEffectiveness: 0.85,
        spiritualMaturityObserved: 0.90
      }
    ];
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Performance Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Assessment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800">Academic Performance</h4>
            <p className="text-2xl font-bold text-blue-600">
              {assessmentResults.length > 0 ? assessmentResults[0].academic_score : 'N/A'}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800">Spiritual Growth</h4>
            <p className="text-2xl font-bold text-purple-600">
              {assessmentResults.length > 0 ? assessmentResults[0].spiritual_score : 'N/A'}%
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Kingdom Impact</h4>
            <p className="text-2xl font-bold text-green-600">
              {assessmentResults.length > 0 ? Math.round(assessmentResults[0].kingdom_impact_potential * 100) : 'N/A'}%
            </p>
          </div>
        </div>
      </div>

      {/* Recent Assessment Results */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Assessments</h3>
        <div className="space-y-4">
          {assessmentResults.map((result) => (
            <div key={result.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-800">Assessment #{result.id}</h4>
                  <p className="text-sm text-gray-600">Overall Grade: {result.overall_grade}</p>
                  <p className="text-sm text-gray-600">ScrollCoin Earned: {result.scroll_coin_earned}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Academic: {result.academic_score}%</p>
                  <p className="text-sm text-gray-500">Spiritual: {result.spiritual_score}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prophetic Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Prophetic Insights</h3>
        <div className="space-y-4">
          {assessmentResults.flatMap(result => result.prophetic_insights).map((insight, index) => (
            <div key={index} className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-medium text-yellow-800">{insight.insight}</p>
              <p className="text-sm text-yellow-700 mt-1">
                Scripture: {insight.scripture_reference}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Application: {insight.application}
              </p>
              <p className="text-xs text-yellow-500 mt-2">
                Confidence: {Math.round(insight.confirmation_level * 100)}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAcademicTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Academic Performance</h3>
        
        {assessmentResults.map((result) => (
          <div key={result.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Assessment Score</h4>
              <span className="text-2xl font-bold text-blue-600">{result.academic_score}%</span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">AI Feedback</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-green-700">Strengths</h6>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {result.ai_feedback.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h6 className="font-medium text-orange-700">Areas for Improvement</h6>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {result.ai_feedback.areas_for_improvement.map((area, index) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="font-medium text-blue-700">Personalized Recommendations</h6>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {result.ai_feedback.personalized_recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium text-blue-800 mb-2">Instructor Feedback</h5>
              <p className="text-gray-700">{result.human_feedback.written_feedback}</p>
              
              {result.human_feedback.mentorship_recommendations.length > 0 && (
                <div className="mt-3">
                  <h6 className="font-medium text-blue-700">Mentorship Recommendations</h6>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {result.human_feedback.mentorship_recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpiritualTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Spiritual Formation</h3>
        
        {assessmentResults.map((result) => (
          <div key={result.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-gray-800">Spiritual Growth Score</h4>
              <span className="text-2xl font-bold text-purple-600">{result.spiritual_score}%</span>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-medium text-purple-800 mb-2">Spiritual Insights</h5>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {result.ai_feedback.spiritual_insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Spiritual Encouragement</h5>
              <p className="text-gray-700">{result.human_feedback.spiritual_encouragement}</p>
              
              {result.human_feedback.prophetic_word && (
                <div className="mt-3 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
                  <h6 className="font-medium text-yellow-800">Prophetic Word</h6>
                  <p className="text-yellow-700">{result.human_feedback.prophetic_word}</p>
                </div>
              )}
            </div>

            {result.human_feedback.prayer_requests.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">Prayer Requests</h5>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {result.human_feedback.prayer_requests.map((request, index) => (
                    <li key={index}>{request}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompetencyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Competency Assessment</h3>
        
        {competencyProfile && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">Overall Level</h4>
                <p className="text-xl font-bold text-blue-600 capitalize">
                  {competencyProfile.overallCompetencyLevel}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800">Kingdom Readiness</h4>
                <p className="text-xl font-bold text-green-600">
                  {Math.round(competencyProfile.kingdomReadiness * 100)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Competency Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(competencyProfile.competencyBreakdown).map(([competency, level]) => (
                    <div key={competency} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium capitalize">{competency.replace('_', ' ')}</span>
                      <span className="text-sm text-gray-600 capitalize">{level as string}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Strength Areas</h4>
                <div className="space-y-1">
                  {competencyProfile.strengthAreas.map((area: string, index: number) => (
                    <div key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm inline-block mr-2 mb-1">
                      {area}
                    </div>
                  ))}
                </div>

                <h4 className="font-medium text-gray-800 mb-3 mt-4">Growth Areas</h4>
                <div className="space-y-1">
                  {competencyProfile.growthAreas.map((area: string, index: number) => (
                    <div key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm inline-block mr-2 mb-1">
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Career Recommendations</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {competencyProfile.careerRecommendations.map((rec: string, index: number) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Ministry Opportunities</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {competencyProfile.ministryOpportunities.map((opp: string, index: number) => (
                    <li key={index}>{opp}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">Next Steps</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {competencyProfile.nextSteps.map((step: string, index: number) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPeerTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Peer Evaluations</h3>
        
        {peerEvaluations.map((evaluation, index) => (
          <div key={index} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">Overall Rating</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {evaluation.overallPeerRating.toFixed(1)}/5.0
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800">Collaboration</h4>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(evaluation.collaborationEffectiveness * 100)}%
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800">Spiritual Maturity</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(evaluation.spiritualMaturityObserved * 100)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Detailed Scores</h4>
                <div className="space-y-2">
                  {Object.entries(evaluation.aggregatedScores).map(([criterion, score]) => (
                    <div key={criterion} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium">{criterion}</span>
                      <span className="text-sm text-gray-600">{(score as number).toFixed(1)}/5.0</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Peer Feedback Summary</h4>
                <p className="text-sm text-gray-700 mb-4">{evaluation.feedbackSummary}</p>
                
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-green-700">Strengths (Consensus)</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evaluation.strengthsConsensus.map((strength: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-orange-700">Growth Areas (Consensus)</h5>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {evaluation.growthAreasConsensus.map((area: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Spiritual Encouragement</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {evaluation.spiritualEncouragement.map((encouragement: string, idx: number) => (
                  <li key={idx}>{encouragement}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Assessment Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive view of academic, spiritual, and competency assessments
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'academic', label: 'Academic' },
            { key: 'spiritual', label: 'Spiritual' },
            { key: 'competency', label: 'Competency' },
            { key: 'peer', label: 'Peer Evaluation' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'academic' && renderAcademicTab()}
        {activeTab === 'spiritual' && renderSpiritualTab()}
        {activeTab === 'competency' && renderCompetencyTab()}
        {activeTab === 'peer' && renderPeerTab()}
      </div>
    </div>
  );
};