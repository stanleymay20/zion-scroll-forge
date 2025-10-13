import { z } from 'zod';

// XR Classroom Integration Types
export interface XRClassroom {
  classroom_id: string;
  course_id: string;
  session_name: string;
  description: string;
  instructor_id: string;
  scheduled_time: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  xr_environment: XREnvironment;
  recording_enabled: boolean;
  status: XRSessionStatus;
  access_requirements: XRAccessRequirements;
}

export type XRSessionStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface XREnvironment {
  environment_id: string;
  name: string;
  description: string;
  scene_type: XRSceneType;
  assets: XRAsset[];
  interactive_elements: InteractiveElement[];
  lighting_config: LightingConfig;
  audio_config: AudioConfig;
}

export type XRSceneType = 
  | 'prophetic_temple'
  | 'angelic_realm'
  | 'historical_site'
  | 'laboratory'
  | 'classroom'
  | 'nature_scene'
  | 'custom';

export interface XRAsset {
  asset_id: string;
  name: string;
  type: XRAssetType;
  url: string;
  file_size_mb: number;
  quality_levels: QualityLevel[];
  metadata: AssetMetadata;
}

export type XRAssetType = 
  | '3d_model'
  | 'texture'
  | 'audio'
  | 'animation'
  | 'particle_system'
  | 'shader'
  | 'environment_map';

export interface QualityLevel {
  level: 'low' | 'medium' | 'high' | 'ultra';
  url: string;
  file_size_mb: number;
  polygon_count?: number;
  texture_resolution?: string;
}

export interface AssetMetadata {
  creator: string;
  creation_date: string;
  tags: string[];
  educational_context: string[];
  spiritual_significance?: string;
}

export interface InteractiveElement {
  element_id: string;
  name: string;
  type: InteractiveElementType;
  position: Vector3D;
  rotation: Vector3D;
  scale: Vector3D;
  interaction_config: InteractionConfig;
}

export type InteractiveElementType = 
  | 'button'
  | 'lever'
  | 'portal'
  | 'information_panel'
  | 'quiz_station'
  | 'collaboration_space'
  | 'prayer_altar'
  | 'scripture_display';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface InteractionConfig {
  trigger_type: 'touch' | 'gaze' | 'voice' | 'gesture';
  action: InteractionAction;
  feedback: InteractionFeedback;
  permissions: string[];
}

export interface InteractionAction {
  type: 'navigate' | 'display_content' | 'start_quiz' | 'play_audio' | 'trigger_animation';
  parameters: Record<string, any>;
}

export interface InteractionFeedback {
  visual: boolean;
  audio: boolean;
  haptic: boolean;
  duration_ms: number;
}

export interface LightingConfig {
  ambient_light: LightSource;
  directional_lights: LightSource[];
  point_lights: LightSource[];
  spiritual_aura?: SpiritualLighting;
}

export interface LightSource {
  color: string; // hex color
  intensity: number;
  position?: Vector3D;
  direction?: Vector3D;
}

export interface SpiritualLighting {
  enabled: boolean;
  type: 'divine_glow' | 'angelic_radiance' | 'holy_fire' | 'peaceful_aura';
  intensity: number;
  color_scheme: string[];
}

export interface AudioConfig {
  background_music?: AudioTrack;
  ambient_sounds: AudioTrack[];
  spatial_audio: boolean;
  volume_levels: VolumeConfig;
}

export interface AudioTrack {
  track_id: string;
  name: string;
  url: string;
  loop: boolean;
  fade_in_ms: number;
  fade_out_ms: number;
}

export interface VolumeConfig {
  master: number;
  music: number;
  effects: number;
  voice: number;
}

// XR Session and Participation
export interface XRSessionData {
  session_id: string;
  classroom_id: string;
  participant_id: string;
  join_time: string;
  avatar: XRAvatar;
  permissions: XRPermissions;
  connection_quality: ConnectionQuality;
}

export interface XRAvatar {
  avatar_id: string;
  name: string;
  appearance: AvatarAppearance;
  animations: AvatarAnimation[];
  spiritual_attributes?: SpiritualAttributes;
}

export interface AvatarAppearance {
  model_url: string;
  textures: Record<string, string>;
  accessories: Accessory[];
  clothing: ClothingItem[];
}

export interface Accessory {
  accessory_id: string;
  name: string;
  type: 'hat' | 'glasses' | 'jewelry' | 'spiritual_item';
  model_url: string;
  position: Vector3D;
}

export interface ClothingItem {
  item_id: string;
  name: string;
  type: 'shirt' | 'pants' | 'dress' | 'robe' | 'shoes';
  model_url: string;
  color: string;
}

export interface AvatarAnimation {
  animation_id: string;
  name: string;
  type: 'idle' | 'walking' | 'gesturing' | 'praying' | 'teaching';
  duration_ms: number;
  loop: boolean;
}

export interface SpiritualAttributes {
  anointing_level: number;
  spiritual_gifts: string[];
  prayer_warrior: boolean;
  worship_leader: boolean;
}

export interface XRPermissions {
  can_speak: boolean;
  can_move: boolean;
  can_interact: boolean;
  can_share_screen: boolean;
  can_modify_environment: boolean;
  is_moderator: boolean;
}

export interface ConnectionQuality {
  latency_ms: number;
  bandwidth_mbps: number;
  frame_rate: number;
  quality_level: 'low' | 'medium' | 'high';
  connection_stable: boolean;
}

// XR Capabilities and Requirements
export interface XRCapabilities {
  device_type: XRDeviceType;
  supported_features: XRFeature[];
  performance_tier: PerformanceTier;
  tracking_capabilities: TrackingCapability[];
  display_specs: DisplaySpecs;
}

export type XRDeviceType = 
  | 'vr_headset'
  | 'ar_glasses'
  | 'mobile_ar'
  | 'desktop_vr'
  | 'web_xr'
  | 'mixed_reality';

export type XRFeature = 
  | 'hand_tracking'
  | 'eye_tracking'
  | 'voice_recognition'
  | 'spatial_mapping'
  | 'haptic_feedback'
  | 'gesture_recognition'
  | 'facial_tracking';

export type PerformanceTier = 'low' | 'medium' | 'high' | 'ultra';

export type TrackingCapability = 
  | '3dof' // 3 degrees of freedom
  | '6dof' // 6 degrees of freedom
  | 'inside_out'
  | 'outside_in'
  | 'markerless'
  | 'marker_based';

export interface DisplaySpecs {
  resolution: Resolution;
  refresh_rate: number;
  field_of_view: FieldOfView;
  interpupillary_distance_range: IPDRange;
}

export interface Resolution {
  width: number;
  height: number;
  per_eye: boolean;
}

export interface FieldOfView {
  horizontal: number;
  vertical: number;
  diagonal: number;
}

export interface IPDRange {
  min_mm: number;
  max_mm: number;
}

export interface XRAccessRequirements {
  minimum_device_tier: PerformanceTier;
  required_features: XRFeature[];
  bandwidth_requirement_mbps: number;
  fallback_2d_available: boolean;
  accessibility_options: AccessibilityOption[];
}

export interface AccessibilityOption {
  option_id: string;
  name: string;
  description: string;
  type: AccessibilityType;
  enabled: boolean;
}

export type AccessibilityType = 
  | 'visual_impairment'
  | 'hearing_impairment'
  | 'motor_impairment'
  | 'cognitive_assistance'
  | 'motion_sensitivity';

// Virtual Lab Types
export interface VirtualLab {
  lab_id: string;
  name: string;
  description: string;
  faculty_id: string;
  lab_type: VirtualLabType;
  equipment: VirtualEquipment[];
  experiments: LabExperiment[];
  safety_protocols: SafetyProtocol[];
  access_level: AccessLevel;
}

export type VirtualLabType = 
  | 'chemistry'
  | 'physics'
  | 'biology'
  | 'engineering'
  | 'computer_science'
  | 'spiritual_formation'
  | 'prophetic_training';

export interface VirtualEquipment {
  equipment_id: string;
  name: string;
  type: string;
  model_url: string;
  functionality: EquipmentFunction[];
  safety_requirements: string[];
}

export interface EquipmentFunction {
  function_name: string;
  description: string;
  parameters: Parameter[];
  output_type: string;
}

export interface Parameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'selection';
  required: boolean;
  default_value?: any;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface LabExperiment {
  experiment_id: string;
  name: string;
  description: string;
  objectives: string[];
  procedure: ExperimentStep[];
  expected_results: string[];
  assessment_criteria: string[];
}

export interface ExperimentStep {
  step_number: number;
  instruction: string;
  equipment_required: string[];
  safety_notes: string[];
  expected_outcome: string;
}

export interface SafetyProtocol {
  protocol_id: string;
  name: string;
  description: string;
  mandatory: boolean;
  steps: string[];
}

export type AccessLevel = 'public' | 'enrolled_students' | 'faculty_only' | 'admin_only';

export interface LabSession {
  session_id: string;
  lab_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  experiment_id?: string;
  progress: LabProgress;
  results: LabResult[];
}

export interface LabProgress {
  current_step: number;
  total_steps: number;
  completed_objectives: string[];
  time_spent_minutes: number;
}

export interface LabResult {
  result_id: string;
  experiment_step: number;
  data: Record<string, any>;
  observations: string;
  timestamp: string;
}

// Validation Schemas
export const XRClassroomSchema = z.object({
  classroom_id: z.string().uuid(),
  course_id: z.string().uuid(),
  session_name: z.string().min(1),
  description: z.string(),
  instructor_id: z.string().uuid(),
  scheduled_time: z.string().datetime(),
  duration_minutes: z.number().positive(),
  max_participants: z.number().positive(),
  current_participants: z.number().nonnegative(),
  recording_enabled: z.boolean(),
  status: z.enum(['scheduled', 'live', 'completed', 'cancelled'])
});

export const XREnvironmentSchema = z.object({
  environment_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  scene_type: z.enum(['prophetic_temple', 'angelic_realm', 'historical_site', 'laboratory', 'classroom', 'nature_scene', 'custom'])
});

export const Vector3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number()
});

export const XRCapabilitiesSchema = z.object({
  device_type: z.enum(['vr_headset', 'ar_glasses', 'mobile_ar', 'desktop_vr', 'web_xr', 'mixed_reality']),
  supported_features: z.array(z.enum(['hand_tracking', 'eye_tracking', 'voice_recognition', 'spatial_mapping', 'haptic_feedback', 'gesture_recognition', 'facial_tracking'])),
  performance_tier: z.enum(['low', 'medium', 'high', 'ultra']),
  tracking_capabilities: z.array(z.enum(['3dof', '6dof', 'inside_out', 'outside_in', 'markerless', 'marker_based']))
});