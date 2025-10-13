/**
 * AI Avatar Lecturers Type Definitions
 * Comprehensive type system for ultra-realistic AI avatar instructors
 */

// Core Avatar Types
export interface AvatarLecturer {
  id: string;
  name: string;
  title: string;
  description: string;
  
  // Appearance Configuration
  appearance: AvatarAppearance;
  voiceProfile: VoiceProfile;
  personalityProfile: PersonalityProfile;
  
  // Teaching Configuration
  subjects: string[];
  teachingStyle: TeachingStyle;
  spiritualApproach: SpiritualApproach;
  culturalAdaptation: CulturalProfile;
  
  // Capabilities
  capabilities: AvatarCapability[];
  languages: SupportedLanguage[];
  interactionModes: InteractionMode[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isActive: boolean;
  version: string;
}

export interface AvatarAppearance {
  modelId: string;
  gender: 'male' | 'female' | 'non-binary';
  ethnicity: string;
  ageRange: 'young-adult' | 'middle-aged' | 'senior';
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  clothing: ClothingConfiguration;
  accessories: AccessoryConfiguration[];
}

export interface VoiceProfile {
  voiceId: string;
  provider: 'elevenlabs' | 'azure' | 'google' | 'custom';
  language: string;
  accent: string;
  pitch: number;
  speed: number;
  emotionalRange: EmotionalVoiceRange;
  customizations: VoiceCustomization[];
}

export interface PersonalityProfile {
  traits: PersonalityTrait[];
  communicationStyle: CommunicationStyle;
  humorLevel: number;
  formalityLevel: number;
  empathyLevel: number;
  enthusiasmLevel: number;
  patienceLevel: number;
  culturalSensitivity: number;
}

// Session Management Types
export interface LectureSession {
  id: string;
  avatarId: string;
  courseId: string;
  title: string;
  description: string;
  
  // Session Configuration
  config: SessionConfig;
  status: SessionStatus;
  startTime: Date;
  endTime?: Date;
  
  // Participants
  participants: SessionParticipant[];
  maxParticipants: number;
  
  // Content
  lectureContent: LectureContent;
  qaQueue: QAQuestion[];
  chatHistory: ChatMessage[];
  
  // Analytics
  engagement: EngagementMetrics;
  learningOutcomes: LearningOutcome[];
  
  // Spiritual Formation
  spiritualInsights: SpiritualInsight[];
  prayerRequests: PrayerRequest[];
}

export interface SessionConfig {
  mode: SessionMode;
  interactionLevel: InteractionLevel;
  qaEnabled: boolean;
  recordingEnabled: boolean;
  transcriptionEnabled: boolean;
  spiritualGuidanceEnabled: boolean;
  culturalAdaptationEnabled: boolean;
  accessibilityFeatures: AccessibilityFeature[];
}

export interface SessionParticipant {
  userId: string;
  displayName: string;
  role: ParticipantRole;
  joinTime: Date;
  leaveTime?: Date;
  engagement: ParticipantEngagement;
  permissions: ParticipantPermission[];
}

// Interaction Types
export interface AvatarResponse {
  id: string;
  sessionId: string;
  userId?: string;
  
  // Response Content
  textResponse: string;
  audioResponse?: AudioData;
  visualEffects?: VisualEffect[];
  
  // Animation Instructions
  animations: AnimationInstruction[];
  emotions: EmotionExpression[];
  gestures: GestureInstruction[];
  
  // Metadata
  responseTime: number;
  confidence: number;
  spiritualAlignment: number;
  
  // Follow-up
  suggestedActions: string[];
  relatedQuestions: string[];
  
  timestamp: Date;
}

export interface QAQuestion {
  id: string;
  sessionId: string;
  userId: string;
  question: string;
  category: QuestionCategory;
  priority: QuestionPriority;
  status: QuestionStatus;
  submittedAt: Date;
  answeredAt?: Date;
  response?: AvatarResponse;
  upvotes: number;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  message: string;
  messageType: MessageType;
  timestamp: Date;
  reactions: MessageReaction[];
  replyTo?: string;
}

// Animation and Rendering Types
export interface AnimationInstruction {
  type: AnimationType;
  duration: number;
  intensity: number;
  parameters: AnimationParameters;
  blendMode: BlendMode;
  priority: number;
}

export interface EmotionExpression {
  emotion: EmotionType;
  intensity: number;
  duration: number;
  facialExpression: FacialExpressionData;
  bodyLanguage: BodyLanguageData;
}

export interface GestureInstruction {
  gestureType: GestureType;
  timing: GestureTiming;
  intensity: number;
  handedness: 'left' | 'right' | 'both';
  synchronization: SynchronizationData;
}

// AI Processing Types
export interface ConversationContext {
  sessionId: string;
  userId: string;
  conversationHistory: ConversationTurn[];
  userProfile: UserProfile;
  courseContext: CourseContext;
  spiritualContext: SpiritualContext;
  culturalContext: CulturalContext;
  emotionalState: EmotionalState;
}

export interface ConversationTurn {
  speaker: 'user' | 'avatar';
  message: string;
  timestamp: Date;
  intent: MessageIntent;
  emotion: EmotionType;
  confidence: number;
}

export interface AIResponse {
  response: string;
  confidence: number;
  intent: ResponseIntent;
  emotion: EmotionType;
  spiritualAlignment: number;
  culturalSensitivity: number;
  followUpSuggestions: string[];
  animations: AnimationInstruction[];
  processingTime: number;
}

// Spiritual Integration Types
export interface SpiritualContext {
  userSpiritualMaturity: SpiritualMaturityLevel;
  currentSpiritualFocus: string[];
  prayerRequests: PrayerRequest[];
  testimonies: Testimony[];
  spiritualGifts: SpiritualGift[];
  ministryInvolvement: MinistryInvolvement[];
}

export interface SpiritualInsight {
  id: string;
  sessionId: string;
  userId: string;
  insight: string;
  scriptureReference?: string;
  category: SpiritualInsightCategory;
  relevance: number;
  timestamp: Date;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  request: string;
  category: PrayerCategory;
  urgency: PrayerUrgency;
  isPrivate: boolean;
  submittedAt: Date;
  prayedFor: PrayerResponse[];
}

// Analytics and Metrics Types
export interface EngagementMetrics {
  totalInteractions: number;
  averageResponseTime: number;
  questionsAsked: number;
  questionsAnswered: number;
  participationRate: number;
  attentionScore: number;
  comprehensionScore: number;
  spiritualEngagement: number;
}

export interface LearningOutcome {
  objectiveId: string;
  achievement: number;
  evidence: string[];
  timestamp: Date;
  assessmentMethod: AssessmentMethod;
}

// Enum Types
export enum SessionStatus {
  SCHEDULED = 'scheduled',
  STARTING = 'starting',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDING = 'ending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SessionMode {
  LECTURE = 'lecture',
  DISCUSSION = 'discussion',
  QA_SESSION = 'qa_session',
  TUTORIAL = 'tutorial',
  SPIRITUAL_GUIDANCE = 'spiritual_guidance',
  GROUP_STUDY = 'group_study'
}

export enum InteractionLevel {
  PASSIVE = 'passive',
  MODERATE = 'moderate',
  HIGHLY_INTERACTIVE = 'highly_interactive',
  IMMERSIVE = 'immersive'
}

export enum ParticipantRole {
  STUDENT = 'student',
  TEACHING_ASSISTANT = 'teaching_assistant',
  OBSERVER = 'observer',
  MODERATOR = 'moderator',
  ADMINISTRATOR = 'administrator'
}

export enum QuestionCategory {
  ACADEMIC = 'academic',
  SPIRITUAL = 'spiritual',
  TECHNICAL = 'technical',
  PERSONAL = 'personal',
  CLARIFICATION = 'clarification'
}

export enum QuestionPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum QuestionStatus {
  PENDING = 'pending',
  ACKNOWLEDGED = 'acknowledged',
  ANSWERED = 'answered',
  DEFERRED = 'deferred',
  INAPPROPRIATE = 'inappropriate'
}

export enum MessageType {
  TEXT = 'text',
  QUESTION = 'question',
  PRAYER_REQUEST = 'prayer_request',
  TESTIMONY = 'testimony',
  SYSTEM = 'system'
}

export enum AnimationType {
  IDLE = 'idle',
  SPEAKING = 'speaking',
  LISTENING = 'listening',
  THINKING = 'thinking',
  GESTURING = 'gesturing',
  EMOTIONAL = 'emotional',
  TRANSITION = 'transition'
}

export enum EmotionType {
  NEUTRAL = 'neutral',
  JOY = 'joy',
  PEACE = 'peace',
  COMPASSION = 'compassion',
  ENTHUSIASM = 'enthusiasm',
  CONCERN = 'concern',
  CONTEMPLATION = 'contemplation',
  ENCOURAGEMENT = 'encouragement',
  REVERENCE = 'reverence'
}

export enum GestureType {
  POINTING = 'pointing',
  OPEN_HANDS = 'open_hands',
  PRAYER_HANDS = 'prayer_hands',
  WELCOMING = 'welcoming',
  EXPLAINING = 'explaining',
  EMPHASIZING = 'emphasizing',
  BLESSING = 'blessing'
}

export enum SpiritualMaturityLevel {
  SEEKER = 'seeker',
  NEW_BELIEVER = 'new_believer',
  GROWING = 'growing',
  MATURE = 'mature',
  LEADER = 'leader',
  ELDER = 'elder'
}

export enum SpiritualInsightCategory {
  BIBLICAL_TRUTH = 'biblical_truth',
  PERSONAL_GROWTH = 'personal_growth',
  MINISTRY_CALLING = 'ministry_calling',
  PRAYER_GUIDANCE = 'prayer_guidance',
  WORSHIP_INSIGHT = 'worship_insight',
  PROPHETIC_WORD = 'prophetic_word'
}

// Configuration Types
export interface AvatarConfiguration {
  appearance: AvatarAppearance;
  personality: PersonalityProfile;
  voice: VoiceProfile;
  capabilities: AvatarCapability[];
  spiritualSettings: SpiritualSettings;
  culturalSettings: CulturalSettings;
}

export interface SpiritualSettings {
  denominationalAlignment: string;
  theologicalEmphasis: string[];
  prayerStyle: PrayerStyle;
  scriptureVersion: string;
  propheticSensitivity: number;
  evangelisticApproach: EvangelisticApproach;
}

export interface CulturalSettings {
  primaryCulture: string;
  culturalAdaptations: CulturalAdaptation[];
  languagePreferences: LanguagePreference[];
  communicationNorms: CommunicationNorm[];
}

// Additional Supporting Types
export interface AudioData {
  url: string;
  duration: number;
  format: string;
  quality: AudioQuality;
}

export interface VisualEffect {
  type: VisualEffectType;
  duration: number;
  parameters: Record<string, any>;
}

export interface UserProfile {
  id: string;
  learningStyle: LearningStyle;
  spiritualProfile: SpiritualProfile;
  culturalBackground: CulturalBackground;
  accessibilityNeeds: AccessibilityNeed[];
  preferences: UserPreference[];
}

export interface CourseContext {
  courseId: string;
  currentModule: string;
  learningObjectives: string[];
  prerequisites: string[];
  spiritualFocus: string[];
}

// Service Interface Types
export interface AvatarFilters {
  subjects?: string[];
  languages?: string[];
  spiritualApproach?: string[];
  isActive?: boolean;
  createdBy?: string;
}

export interface RenderConfig {
  quality: RenderQuality;
  platform: RenderPlatform;
  features: RenderFeature[];
  performance: PerformanceSettings;
}

export interface SessionSummary {
  sessionId: string;
  duration: number;
  participantCount: number;
  questionsAnswered: number;
  engagementScore: number;
  learningOutcomes: LearningOutcome[];
  spiritualInsights: SpiritualInsight[];
  nextSteps: string[];
}

// Additional Enums
export enum RenderQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

export enum RenderPlatform {
  WEB = 'web',
  MOBILE = 'mobile',
  VR = 'vr',
  AR = 'ar'
}

export enum AccessibilityFeature {
  CLOSED_CAPTIONS = 'closed_captions',
  SIGN_LANGUAGE = 'sign_language',
  AUDIO_DESCRIPTIONS = 'audio_descriptions',
  HIGH_CONTRAST = 'high_contrast',
  LARGE_TEXT = 'large_text',
  KEYBOARD_NAVIGATION = 'keyboard_navigation',
  SCREEN_READER = 'screen_reader'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
  MULTIMODAL = 'multimodal'
}

export enum PrayerStyle {
  LITURGICAL = 'liturgical',
  CONVERSATIONAL = 'conversational',
  CONTEMPLATIVE = 'contemplative',
  CHARISMATIC = 'charismatic',
  TRADITIONAL = 'traditional'
}

export enum EvangelisticApproach {
  RELATIONAL = 'relational',
  INTELLECTUAL = 'intellectual',
  TESTIMONIAL = 'testimonial',
  CONFRONTATIONAL = 'confrontational',
  INVITATIONAL = 'invitational'
}