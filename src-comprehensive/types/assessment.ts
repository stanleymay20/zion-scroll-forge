export interface AssessmentFramework {
    id: string;
    name: string;
    type: AssessmentType;
    academicComponents: AcademicAssessment[];
    spiritualComponents: SpiritualAssessment[];
    competencyComponents: CompetencyAssessment[];
    peerEvaluationComponents: PeerEvaluation[];
    aiGradingEnabled: boolean;
    propheticAlignment: boolean;
    kingdomRelevance: boolean;
}

export enum AssessmentType {
    ACADEMIC = 'academic',
    SPIRITUAL = 'spiritual',
    COMPETENCY = 'competency',
    PEER_EVALUATION = 'peer_evaluation',
    COMPREHENSIVE = 'comprehensive',
    PROPHETIC_ALIGNMENT = 'prophetic_alignment'
}

export interface AcademicAssessment {
    id: string;
    title: string;
    description: string;
    type: AcademicAssessmentType;
    maxScore: number;
    passingScore: number;
    questions: AssessmentQuestion[];
    rubric: GradingRubric;
    aiGradingConfig: AIGradingConfiguration;
    timeLimit?: number;
    attempts: number;
    scrollCoinReward: number;
}

export enum AcademicAssessmentType {
    MULTIPLE_CHOICE = 'multiple_choice',
    ESSAY = 'essay',
    PROJECT = 'project',
    PRACTICAL_DEMONSTRATION = 'practical_demonstration',
    CASE_STUDY = 'case_study',
    RESEARCH_PAPER = 'research_paper',
    PRESENTATION = 'presentation'
}

export interface SpiritualAssessment {
    id: string;
    title: string;
    description: string;
    type: SpiritualAssessmentType;
    propheticElements: PropheticElement[];
    biblicalAlignment: BiblicalAlignmentCriteria;
    characterDevelopment: CharacterMetrics;
    kingdomImpact: KingdomImpactMeasurement;
    spiritualGifts: SpiritualGiftAssessment[];
    callingClarity: CallingAssessment;
}

export enum SpiritualAssessmentType {
    PROPHETIC_DISCERNMENT = 'prophetic_discernment',
    BIBLICAL_KNOWLEDGE = 'biblical_knowledge',
    CHARACTER_FORMATION = 'character_formation',
    SPIRITUAL_GIFTS = 'spiritual_gifts',
    CALLING_CLARITY = 'calling_clarity',
    KINGDOM_IMPACT = 'kingdom_impact',
    INTERCESSION_PRACTICE = 'intercession_practice'
}

export interface CompetencyAssessment {
    id: string;
    title: string;
    description: string;
    competencyType: CompetencyType;
    skillAreas: SkillArea[];
    practicalDemonstration: PracticalDemonstration;
    portfolioRequirements: PortfolioRequirement[];
    industryAlignment: IndustryStandard[];
    kingdomApplication: KingdomApplicationCriteria;
}

export enum CompetencyType {
    TECHNICAL_SKILLS = 'technical_skills',
    LEADERSHIP = 'leadership',
    COMMUNICATION = 'communication',
    PROBLEM_SOLVING = 'problem_solving',
    CREATIVITY = 'creativity',
    ENTREPRENEURSHIP = 'entrepreneurship',
    MINISTRY_SKILLS = 'ministry_skills',
    CULTURAL_COMPETENCY = 'cultural_competency'
}

export interface PeerEvaluation {
    id: string;
    title: string;
    description: string;
    evaluationType: PeerEvaluationType;
    criteria: EvaluationCriteria[];
    anonymousMode: boolean;
    reciprocalEvaluation: boolean;
    groupSize: number;
    collaborativeElements: CollaborativeElement[];
    feedbackGuidelines: FeedbackGuideline[];
}

export enum PeerEvaluationType {
    PROJECT_COLLABORATION = 'project_collaboration',
    PEER_TEACHING = 'peer_teaching',
    GROUP_DISCUSSION = 'group_discussion',
    MUTUAL_MENTORING = 'mutual_mentoring',
    COMMUNITY_SERVICE = 'community_service',
    SPIRITUAL_ACCOUNTABILITY = 'spiritual_accountability'
}

export interface AssessmentQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
    difficulty: DifficultyLevel;
    bloomsTaxonomy: BloomsTaxonomyLevel;
    spiritualAlignment: boolean;
    culturalSensitivity: CulturalSensitivityLevel;
    aiGradable: boolean;
}

export enum QuestionType {
    MULTIPLE_CHOICE = 'multiple_choice',
    TRUE_FALSE = 'true_false',
    SHORT_ANSWER = 'short_answer',
    ESSAY = 'essay',
    MATCHING = 'matching',
    FILL_IN_BLANK = 'fill_in_blank',
    PRACTICAL_DEMONSTRATION = 'practical_demonstration',
    PROPHETIC_DISCERNMENT = 'prophetic_discernment'
}

export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

export enum BloomsTaxonomyLevel {
    REMEMBER = 'remember',
    UNDERSTAND = 'understand',
    APPLY = 'apply',
    ANALYZE = 'analyze',
    EVALUATE = 'evaluate',
    CREATE = 'create'
}

export interface GradingRubric {
    id: string;
    name: string;
    criteria: RubricCriterion[];
    totalPoints: number;
    passingThreshold: number;
    spiritualFormationWeight: number;
    academicWeight: number;
    practicalApplicationWeight: number;
}

export interface RubricCriterion {
    id: string;
    name: string;
    description: string;
    weight: number;
    levels: PerformanceLevel[];
    spiritualAlignment: boolean;
    kingdomRelevance: boolean;
}

export interface PerformanceLevel {
    level: string;
    description: string;
    points: number;
    feedback: string;
}

export interface AIGradingConfiguration {
    enabled: boolean;
    model: string;
    confidence_threshold: number;
    human_review_required: boolean;
    spiritual_alignment_check: boolean;
    cultural_sensitivity_check: boolean;
    prophetic_intelligence_integration: boolean;
    bias_detection: boolean;
    feedback_generation: boolean;
}

export interface PropheticElement {
    id: string;
    type: PropheticElementType;
    description: string;
    scriptureReference: string;
    discernmentLevel: DiscernmentLevel;
    kingdomPerspective: boolean;
    culturalContext: string;
}

export enum PropheticElementType {
    SCRIPTURE_INTERPRETATION = 'scripture_interpretation',
    SPIRITUAL_DISCERNMENT = 'spiritual_discernment',
    PROPHETIC_WORD = 'prophetic_word',
    KINGDOM_PERSPECTIVE = 'kingdom_perspective',
    DIVINE_WISDOM = 'divine_wisdom',
    INTERCESSION = 'intercession'
}

export enum DiscernmentLevel {
    BASIC = 'basic',
    DEVELOPING = 'developing',
    MATURE = 'mature',
    ADVANCED = 'advanced'
}

export interface BiblicalAlignmentCriteria {
    scriptureAlignment: boolean;
    doctrinalSoundness: boolean;
    christlikeness: boolean;
    kingdomValues: boolean;
    holySpirit_guidance: boolean;
    propheticAccuracy: number;
}

export interface CharacterMetrics {
    integrity: number;
    humility: number;
    love: number;
    faithfulness: number;
    wisdom: number;
    courage: number;
    compassion: number;
    perseverance: number;
    overall_character_score: number;
}

export interface KingdomImpactMeasurement {
    souls_reached: number;
    lives_transformed: number;
    communities_blessed: number;
    disciples_made: number;
    kingdom_projects_launched: number;
    prophetic_accuracy: number;
    spiritual_fruit: SpiritualFruit;
}

export interface SpiritualFruit {
    love: number;
    joy: number;
    peace: number;
    patience: number;
    kindness: number;
    goodness: number;
    faithfulness: number;
    gentleness: number;
    self_control: number;
}

export interface SpiritualGiftAssessment {
    gift: SpiritualGift;
    manifestation_level: number;
    development_stage: DevelopmentStage;
    kingdom_application: string;
    mentorship_needed: boolean;
}

export enum SpiritualGift {
    PROPHECY = 'prophecy',
    TEACHING = 'teaching',
    EVANGELISM = 'evangelism',
    PASTORING = 'pastoring',
    APOSTOLIC = 'apostolic',
    HEALING = 'healing',
    MIRACLES = 'miracles',
    DISCERNMENT = 'discernment',
    TONGUES = 'tongues',
    INTERPRETATION = 'interpretation',
    WISDOM = 'wisdom',
    KNOWLEDGE = 'knowledge',
    FAITH = 'faith',
    HELPS = 'helps',
    ADMINISTRATION = 'administration'
}

export enum DevelopmentStage {
    DORMANT = 'dormant',
    EMERGING = 'emerging',
    DEVELOPING = 'developing',
    MATURE = 'mature',
    MASTERY = 'mastery'
}

export interface CallingAssessment {
    calling_clarity: number;
    divine_purpose_alignment: number;
    gifting_alignment: number;
    passion_alignment: number;
    opportunity_alignment: number;
    confirmation_level: number;
    obedience_level: number;
    fruit_evidence: number;
}

export interface SkillArea {
    name: string;
    description: string;
    competency_level: CompetencyLevel;
    assessment_methods: AssessmentMethod[];
    industry_standards: IndustryStandard[];
    kingdom_application: string;
}

export enum CompetencyLevel {
    NOVICE = 'novice',
    ADVANCED_BEGINNER = 'advanced_beginner',
    COMPETENT = 'competent',
    PROFICIENT = 'proficient',
    EXPERT = 'expert'
}

export interface AssessmentMethod {
    type: string;
    description: string;
    weight: number;
    ai_gradable: boolean;
}

export interface PracticalDemonstration {
    title: string;
    description: string;
    requirements: string[];
    evaluation_criteria: EvaluationCriterion[];
    time_limit: number;
    resources_provided: string[];
    kingdom_context: boolean;
}

export interface EvaluationCriterion {
    name: string;
    description: string;
    weight: number;
    rubric: GradingRubric;
}

export interface PortfolioRequirement {
    artifact_type: string;
    description: string;
    required: boolean;
    evaluation_criteria: EvaluationCriterion[];
    spiritual_reflection_required: boolean;
}

export interface IndustryStandard {
    organization: string;
    standard_name: string;
    certification_level: string;
    kingdom_alignment: boolean;
}

export interface KingdomApplicationCriteria {
    eternal_impact: boolean;
    community_blessing: boolean;
    discipleship_multiplication: boolean;
    prophetic_alignment: boolean;
    cultural_transformation: boolean;
}

export interface EvaluationCriteria {
    criterion: string;
    description: string;
    weight: number;
    spiritual_component: boolean;
}

export interface CollaborativeElement {
    type: CollaborationType;
    description: string;
    group_dynamics: GroupDynamics;
    spiritual_unity: boolean;
}

export enum CollaborationType {
    GROUP_PROJECT = 'group_project',
    PEER_TEACHING = 'peer_teaching',
    COMMUNITY_SERVICE = 'community_service',
    RESEARCH_COLLABORATION = 'research_collaboration',
    MINISTRY_TEAM = 'ministry_team'
}

export interface GroupDynamics {
    leadership_rotation: boolean;
    conflict_resolution: boolean;
    spiritual_accountability: boolean;
    mutual_encouragement: boolean;
}

export interface FeedbackGuideline {
    principle: string;
    description: string;
    biblical_foundation: string;
    practical_application: string;
}

export enum CulturalSensitivityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
}

// Assessment Results and Reporting
export interface AssessmentResult {
    id: string;
    student_id: string;
    assessment_id: string;
    academic_score: number;
    spiritual_score: number;
    competency_scores: CompetencyScore[];
    peer_evaluation_scores: PeerEvaluationScore[];
    ai_feedback: AIFeedback;
    human_feedback: HumanFeedback;
    overall_grade: string;
    scroll_coin_earned: number;
    badge_earned?: string;
    areas_for_growth: string[];
    strengths_identified: string[];
    next_steps: string[];
    prophetic_insights: PropheticInsight[];
    kingdom_impact_potential: number;
}

export interface CompetencyScore {
    competency: string;
    score: number;
    level_achieved: CompetencyLevel;
    evidence: string[];
    growth_recommendations: string[];
}

export interface PeerEvaluationScore {
    evaluator_id: string;
    scores: { [criterion: string]: number };
    qualitative_feedback: string;
    spiritual_encouragement: string;
}

export interface AIFeedback {
    strengths: string[];
    areas_for_improvement: string[];
    personalized_recommendations: string[];
    spiritual_insights: string[];
    cultural_considerations: string[];
    next_learning_steps: string[];
}

export interface HumanFeedback {
    instructor_id: string;
    written_feedback: string;
    spiritual_encouragement: string;
    prophetic_word?: string;
    mentorship_recommendations: string[];
    prayer_requests: string[];
}

export interface PropheticInsight {
    insight: string;
    scripture_reference: string;
    application: string;
    confirmation_level: number;
    source: PropheticSource;
}

export enum PropheticSource {
    AI_PROPHETIC_INTELLIGENCE = 'ai_prophetic_intelligence',
    HUMAN_PROPHET = 'human_prophet',
    SCRIPTURE_MEDITATION = 'scripture_meditation',
    PRAYER_REVELATION = 'prayer_revelation',
    COMMUNITY_CONFIRMATION = 'community_confirmation'
}