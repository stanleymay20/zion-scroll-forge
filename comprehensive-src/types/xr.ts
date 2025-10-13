/**
 * XR Content Integration System Types
 * Supports WebXR capabilities for immersive biblical and scientific experiences
 */

export interface XRScene {
  id: string;
  title: string;
  description: string;
  type: XRSceneType;
  category: XRCategory;
  content: XRContent;
  interactions: XRInteraction[];
  angelicTutor?: AngelicTutor;
  metadata: XRMetadata;
  accessibility: XRAccessibility;
}

export enum XRSceneType {
  BIBLICAL = 'biblical',
  SCIENTIFIC = 'scientific',
  CLASSROOM = 'classroom',
  LABORATORY = 'laboratory',
  HISTORICAL = 'historical'
}

export enum XRCategory {
  IMMERSIVE_EXPERIENCE = 'immersive_experience',
  VIRTUAL_LECTURE = 'virtual_lecture',
  INTERACTIVE_LESSON = 'interactive_lesson',
  SPIRITUAL_FORMATION = 'spiritual_formation',
  PRACTICAL_APPLICATION = 'practical_application'
}

export interface XRContent {
  assets: XRAsset[];
  environment: XREnvironment;
  characters: XRCharacter[];
  narrativeFlow: XRNarrativeStep[];
  learningObjectives: string[];
  spiritualObjectives: string[];
}

export interface XRAsset {
  id: string;
  type: XRAssetType;
  url: string;
  format: string;
  size: number;
  metadata: Record<string, any>;
}

export enum XRAssetType {
  MODEL_3D = '3d_model',
  TEXTURE = 'texture',
  AUDIO = 'audio',
  VIDEO = 'video',
  ANIMATION = 'animation',
  SHADER = 'shader'
}

export interface XREnvironment {
  skybox: string;
  lighting: XRLighting;
  physics: XRPhysics;
  boundaries: XRBoundary[];
  ambientSound?: string;
}

export interface XRLighting {
  type: 'directional' | 'point' | 'ambient';
  intensity: number;
  color: string;
  shadows: boolean;
}

export interface XRPhysics {
  enabled: boolean;
  gravity: number;
  collisionDetection: boolean;
}

export interface XRBoundary {
  type: 'wall' | 'floor' | 'ceiling' | 'invisible';
  position: XRVector3;
  dimensions: XRVector3;
}

export interface XRVector3 {
  x: number;
  y: number;
  z: number;
}

export interface XRCharacter {
  id: string;
  name: string;
  type: XRCharacterType;
  model: string;
  animations: XRAnimation[];
  voiceProfile: XRVoiceProfile;
  personality: XRPersonality;
  interactions: XRCharacterInteraction[];
}

export enum XRCharacterType {
  ANGELIC_TUTOR = 'angelic_tutor',
  BIBLICAL_FIGURE = 'biblical_figure',
  HISTORICAL_FIGURE = 'historical_figure',
  AI_PROFESSOR = 'ai_professor',
  STUDENT_AVATAR = 'student_avatar'
}

export interface XRAnimation {
  name: string;
  duration: number;
  loop: boolean;
  triggers: XRAnimationTrigger[];
}

export interface XRAnimationTrigger {
  event: string;
  condition?: string;
  delay?: number;
}

export interface XRVoiceProfile {
  language: string;
  accent: string;
  tone: 'gentle' | 'authoritative' | 'encouraging' | 'wise';
  speed: number;
  pitch: number;
}

export interface XRPersonality {
  traits: string[];
  teachingStyle: string;
  spiritualGifts: string[];
  culturalBackground: string;
  expertise: string[];
}

export interface XRCharacterInteraction {
  trigger: XRInteractionTrigger;
  response: XRInteractionResponse;
  conditions?: XRInteractionCondition[];
}

export interface XRInteraction {
  id: string;
  type: XRInteractionType;
  trigger: XRInteractionTrigger;
  response: XRInteractionResponse;
  requirements?: XRInteractionRequirement[];
}

export enum XRInteractionType {
  GAZE = 'gaze',
  GESTURE = 'gesture',
  VOICE = 'voice',
  TOUCH = 'touch',
  PROXIMITY = 'proximity',
  OBJECT_MANIPULATION = 'object_manipulation'
}

export interface XRInteractionTrigger {
  type: XRInteractionType;
  target?: string;
  gesture?: XRGesture;
  voiceCommand?: string;
  duration?: number;
}

export interface XRGesture {
  name: string;
  handedness: 'left' | 'right' | 'both';
  confidence: number;
}

export interface XRInteractionResponse {
  type: XRResponseType;
  content: string;
  animation?: string;
  audio?: string;
  visualEffect?: XRVisualEffect;
  navigationAction?: XRNavigationAction;
}

export enum XRResponseType {
  DIALOGUE = 'dialogue',
  ANIMATION = 'animation',
  SCENE_CHANGE = 'scene_change',
  OBJECT_SPAWN = 'object_spawn',
  EFFECT_TRIGGER = 'effect_trigger',
  ASSESSMENT = 'assessment'
}

export interface XRVisualEffect {
  type: 'particle' | 'light' | 'shader' | 'transformation';
  duration: number;
  intensity: number;
  color?: string;
}

export interface XRNavigationAction {
  type: 'teleport' | 'transition' | 'zoom' | 'rotate';
  target: XRVector3 | string;
  duration: number;
  easing: string;
}

export interface XRInteractionCondition {
  type: 'progress' | 'knowledge' | 'spiritual_level' | 'time';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface XRInteractionRequirement {
  type: 'device' | 'permission' | 'capability';
  value: string;
  optional: boolean;
}

export interface XRNarrativeStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: number;
  triggers: XRNarrativeTrigger[];
  actions: XRNarrativeAction[];
  assessments?: XRAssessment[];
}

export interface XRNarrativeTrigger {
  type: 'time' | 'interaction' | 'completion' | 'user_action';
  condition: string;
  delay?: number;
}

export interface XRNarrativeAction {
  type: 'dialogue' | 'animation' | 'scene_change' | 'spawn_object';
  target: string;
  parameters: Record<string, any>;
}

export interface XRAssessment {
  id: string;
  type: 'quiz' | 'interaction' | 'observation' | 'reflection';
  question: string;
  options?: string[];
  correctAnswer?: string;
  spiritualReflection?: string;
}

export interface XRMetadata {
  duration: number;
  difficulty: XRDifficulty;
  prerequisites: string[];
  tags: string[];
  spiritualThemes: string[];
  biblicalReferences: string[];
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export enum XRDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface XRAccessibility {
  subtitles: boolean;
  audioDescription: boolean;
  signLanguage: boolean;
  colorBlindSupport: boolean;
  motionSensitivity: XRMotionSensitivity;
  alternativeInputs: XRAlternativeInput[];
}

export enum XRMotionSensitivity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface XRAlternativeInput {
  type: 'keyboard' | 'mouse' | 'gamepad' | 'eye_tracking' | 'voice';
  enabled: boolean;
  configuration: Record<string, any>;
}

// Angelic Tutor Specific Types
export interface AngelicTutor {
  id: string;
  name: string;
  appearance: AngelicAppearance;
  personality: AngelicPersonality;
  capabilities: AngelicCapability[];
  spiritualGifts: SpiritualGift[];
  teachingDomains: TeachingDomain[];
  interactionStyle: InteractionStyle;
}

export interface AngelicAppearance {
  model: string;
  height: number;
  wingspan?: number;
  aura: AuraEffect;
  clothing: ClothingStyle;
  facialFeatures: FacialFeatures;
}

export interface AuraEffect {
  color: string;
  intensity: number;
  pattern: 'steady' | 'pulsing' | 'flowing';
  particles: boolean;
}

export interface ClothingStyle {
  type: 'robes' | 'armor' | 'simple' | 'radiant';
  color: string;
  material: string;
  accessories: string[];
}

export interface FacialFeatures {
  expression: 'gentle' | 'wise' | 'joyful' | 'serious';
  eyeColor: string;
  skinTone: string;
  age: 'youthful' | 'mature' | 'ancient';
}

export interface AngelicPersonality {
  primaryTrait: string;
  secondaryTraits: string[];
  communicationStyle: 'direct' | 'metaphorical' | 'questioning' | 'encouraging';
  patience: number; // 1-10 scale
  wisdom: number; // 1-10 scale
  compassion: number; // 1-10 scale
}

export interface AngelicCapability {
  name: string;
  description: string;
  type: 'teaching' | 'healing' | 'protection' | 'revelation' | 'encouragement';
  powerLevel: number; // 1-10 scale
}

export interface SpiritualGift {
  name: string;
  description: string;
  manifestation: string;
  purpose: string;
}

export interface TeachingDomain {
  subject: string;
  expertise: number; // 1-10 scale
  approach: string;
  specializations: string[];
}

export interface InteractionStyle {
  greeting: string;
  encouragement: string[];
  correction: string[];
  farewell: string;
  emergencyResponse: string;
}

// XR Session Management
export interface XRSession {
  id: string;
  userId: string;
  sceneId: string;
  startTime: Date;
  endTime?: Date;
  progress: XRProgress;
  interactions: XRSessionInteraction[];
  assessmentResults: XRAssessmentResult[];
  spiritualInsights: SpiritualInsight[];
}

export interface XRProgress {
  currentStep: number;
  totalSteps: number;
  completedObjectives: string[];
  timeSpent: number;
  engagementScore: number;
}

export interface XRSessionInteraction {
  timestamp: Date;
  type: XRInteractionType;
  target: string;
  response: string;
  effectiveness: number;
}

export interface XRAssessmentResult {
  assessmentId: string;
  response: string;
  correct: boolean;
  timeToComplete: number;
  attempts: number;
}

export interface SpiritualInsight {
  timestamp: Date;
  insight: string;
  biblicalReference?: string;
  personalApplication: string;
  prayerPoint?: string;
}

// XR Device and Platform Support
export interface XRDevice {
  type: XRDeviceType;
  capabilities: XRDeviceCapability[];
  supported: boolean;
  performance: XRPerformanceLevel;
}

export enum XRDeviceType {
  VR_HEADSET = 'vr_headset',
  AR_GLASSES = 'ar_glasses',
  MOBILE_AR = 'mobile_ar',
  DESKTOP_VR = 'desktop_vr',
  WEB_XR = 'web_xr'
}

export interface XRDeviceCapability {
  name: string;
  supported: boolean;
  quality: 'low' | 'medium' | 'high' | 'ultra';
}

export enum XRPerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra'
}

// XR Content Management
export interface XRContentLibrary {
  scenes: XRScene[];
  templates: XRSceneTemplate[];
  assets: XRAssetLibrary;
  angelicTutors: AngelicTutor[];
}

export interface XRSceneTemplate {
  id: string;
  name: string;
  description: string;
  category: XRCategory;
  baseScene: Partial<XRScene>;
  customizableElements: string[];
}

export interface XRAssetLibrary {
  models: XRAsset[];
  textures: XRAsset[];
  audio: XRAsset[];
  animations: XRAsset[];
  shaders: XRAsset[];
}

// API Response Types
export interface XRSceneResponse {
  scene: XRScene;
  deviceOptimization: XRDeviceOptimization;
  preloadAssets: string[];
}

export interface XRDeviceOptimization {
  lodLevel: number;
  textureQuality: string;
  effectsLevel: string;
  renderDistance: number;
}

export interface XRSessionResponse {
  sessionId: string;
  sceneData: XRScene;
  angelicTutor?: AngelicTutor;
  userProgress: XRProgress;
  recommendations: string[];
}