/**
 * ScrollOS Academic Tools Integration - Core Type Definitions
 * 
 * This file defines the fundamental types and interfaces for the ScrollOS
 * academic tools integration system, providing type safety and consistency
 * across all tool integrations.
 */

// Academic Disciplines
export type AcademicDiscipline = 
  | 'computer-science'
  | 'artificial-intelligence'
  | 'cybersecurity'
  | 'mechanical-engineering'
  | 'electrical-engineering'
  | 'civil-engineering'
  | 'data-science'
  | 'statistics'
  | 'finance'
  | 'economics'
  | 'creative-design'
  | 'architecture'
  | 'product-design'
  | 'medicine'
  | 'health-sciences'
  | 'anatomy'
  | 'physiology'
  | 'theology'
  | 'biblical-studies'
  | 'ministry'
  | 'hermeneutics';

// Tool Integration Methods
export type ToolIntegrationMethod = 'iframe' | 'api' | 'rpc' | 'embed';

// AI Agent Types
export type AgentType = 'ScrollTutor' | 'ScrollResearcher' | 'ScrollBuilder' | 'ScrollProfessor';

// File Formats
export type SupportedFormat = 
  | 'json' | 'xml' | 'csv' | 'txt' | 'md' | 'pdf'
  | 'js' | 'ts' | 'py' | 'java' | 'cpp' | 'c' | 'html' | 'css'
  | 'dwg' | 'step' | 'stl' | 'obj' | 'fbx' | 'blend'
  | 'psd' | 'ai' | 'fig' | 'sketch' | 'svg' | 'png' | 'jpg'
  | 'dicom' | 'nii' | 'dcm'
  | 'docx' | 'xlsx' | 'pptx';

// Tool Permissions
export interface ToolPermission {
  action: 'read' | 'write' | 'execute' | 'share' | 'admin';
  resource: string;
  conditions?: Record<string, any>;
}

// Tool Manifest Definition
export interface ToolManifest {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  category: AcademicDiscipline;
  subcategories?: AcademicDiscipline[];
  integrationMethod: ToolIntegrationMethod;
  
  // Integration Configuration
  url?: string;
  apiEndpoint?: string;
  embedCode?: string;
  rpcInterface?: string;
  
  // Permissions and Security
  permissions: ToolPermission[];
  requiresAuth: boolean;
  ssoEnabled: boolean;
  
  // AI Integration
  aiAgents: AgentType[];
  contextAware: boolean;
  
  // Data Handling
  supportedFormats: SupportedFormat[];
  dataExportFormats: SupportedFormat[];
  crossToolCompatibility: string[];
  
  // UI Configuration
  icon: string;
  color: string;
  fullscreen: boolean;
  resizable: boolean;
  minWidth?: number;
  minHeight?: number;
  
  // Feature Flags
  collaborationEnabled: boolean;
  offlineCapable: boolean;
  cloudProcessing: boolean;
  
  // Metadata
  vendor: string;
  license: string;
  documentation: string;
  supportContact: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// User Context
export interface UserContext {
  userId: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'guest';
  enrolledCourses: string[];
  declaredMajor?: AcademicDiscipline;
  minors?: AcademicDiscipline[];
  permissions: ToolPermission[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  defaultTools: Record<AcademicDiscipline, string[]>;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
  collaborationSettings: CollaborationPreferences;
}

export interface CollaborationPreferences {
  shareByDefault: boolean;
  allowRealTimeEditing: boolean;
  notifyOnChanges: boolean;
  maxCollaborators: number;
}

// Tool Instance
export interface ToolInstance {
  id: string;
  manifestId: string;
  userId: string;
  projectId?: string;
  
  // Runtime State
  state: ToolState;
  isActive: boolean;
  lastAccessed: Date;
  
  // Configuration
  permissions: ToolPermission[];
  customSettings: Record<string, any>;
  
  // AI Integration
  aiAgents: ActiveAgent[];
  contextData: ToolContext;
  
  // Collaboration
  collaborators: string[];
  sharedWith: SharingPermission[];
}

export interface ToolState {
  windowState: WindowState;
  applicationState: Record<string, any>;
  fileStates: FileState[];
  sessionData: Record<string, any>;
}

export interface WindowState {
  width: number;
  height: number;
  x: number;
  y: number;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export interface FileState {
  fileId: string;
  fileName: string;
  isOpen: boolean;
  isDirty: boolean;
  cursorPosition?: number;
  selection?: { start: number; end: number };
  scrollPosition?: number;
}

// AI Agent Integration
export interface ActiveAgent {
  type: AgentType;
  isActive: boolean;
  contextLevel: 'tool' | 'project' | 'course' | 'global';
  lastInteraction: Date;
  conversationHistory: AgentMessage[];
}

export interface AgentMessage {
  id: string;
  agentType: AgentType;
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  context: ToolContext;
  spiritualAlignment: boolean;
}

export interface ToolContext {
  currentTool: string;
  currentProject?: string;
  currentCourse?: string;
  currentFile?: string;
  learningObjectives?: string[];
  recentActions: UserAction[];
}

export interface UserAction {
  action: string;
  tool: string;
  timestamp: Date;
  data?: Record<string, any>;
}

// Project Management
export interface Project {
  id: string;
  name: string;
  description: string;
  discipline: AcademicDiscipline;
  
  // Ownership and Collaboration
  ownerId: string;
  collaborators: ProjectMember[];
  
  // Content
  files: ProjectFile[];
  tools: ToolUsage[];
  
  // Organization
  tags: string[];
  courseId?: string;
  assignmentId?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastAccessed: Date;
  
  // Settings
  isPublic: boolean;
  allowCollaboration: boolean;
  academicIntegrityEnabled: boolean;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'collaborator' | 'viewer';
  permissions: ToolPermission[];
  joinedAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: FileType;
  format: SupportedFormat;
  size: number;
  
  // Origin and Compatibility
  toolOrigin: string;
  compatibleTools: string[];
  
  // Version Control
  versions: FileVersion[];
  currentVersion: string;
  
  // Sharing
  sharedWith: SharingPermission[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: string;
  
  // Content
  content?: string;
  binaryData?: ArrayBuffer;
  metadata: Record<string, any>;
}

export interface FileVersion {
  id: string;
  version: string;
  changes: string;
  author: string;
  timestamp: Date;
  size: number;
  checksum: string;
}

export interface SharingPermission {
  userId: string;
  permission: 'read' | 'write' | 'admin';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
}

export type FileType = 
  | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'audio'
  | 'code' | 'data' | 'model' | 'design' | 'medical' | 'theological';

export interface ToolUsage {
  toolId: string;
  toolName: string;
  firstUsed: Date;
  lastUsed: Date;
  totalTimeSpent: number; // in minutes
  filesCreated: number;
  collaborationSessions: number;
}

// Academic Workspace
export interface AcademicWorkspace {
  userId: string;
  
  // Academic Context
  disciplines: AcademicDiscipline[];
  currentSemester: string;
  enrolledCourses: CourseInfo[];
  
  // Tool Organization
  availableTools: ToolManifest[];
  favoriteTools: string[];
  recentTools: string[];
  customToolGroups: ToolGroup[];
  
  // Projects and Files
  projects: Project[];
  recentFiles: ProjectFile[];
  
  // AI Configuration
  aiAgentSettings: AgentConfiguration[];
  
  // Preferences
  preferences: WorkspacePreferences;
  
  // Metadata
  createdAt: Date;
  lastAccessed: Date;
}

export interface CourseInfo {
  courseId: string;
  courseName: string;
  courseCode: string;
  discipline: AcademicDiscipline;
  instructor: string;
  semester: string;
  requiredTools: string[];
  recommendedTools: string[];
}

export interface ToolGroup {
  id: string;
  name: string;
  description: string;
  tools: string[];
  color: string;
  icon: string;
  isCustom: boolean;
}

export interface AgentConfiguration {
  agentType: AgentType;
  isEnabled: boolean;
  assistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
  contextScope: 'tool' | 'project' | 'course' | 'global';
  spiritualGuidanceEnabled: boolean;
  customInstructions?: string;
}

export interface WorkspacePreferences {
  layout: 'grid' | 'list' | 'tiles';
  theme: 'light' | 'dark' | 'auto';
  showToolDescriptions: boolean;
  groupByDiscipline: boolean;
  autoLaunchTools: boolean;
  saveWindowStates: boolean;
  enableNotifications: boolean;
  collaborationDefaults: CollaborationPreferences;
}

// Tool Communication
export interface ToolMessage {
  id: string;
  type: 'command' | 'query' | 'data' | 'event';
  source: string;
  target: string;
  payload: any;
  timestamp: Date;
  requiresResponse: boolean;
}

export interface ToolResponse {
  id: string;
  messageId: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: Date;
}

// Events
export interface ToolEvent {
  type: 'tool-launched' | 'tool-closed' | 'file-saved' | 'file-shared' | 'collaboration-started' | 'ai-interaction';
  toolId: string;
  userId: string;
  projectId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

// Error Types
export class ToolIntegrationError extends Error {
  constructor(
    message: string,
    public toolId: string,
    public errorCode: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ToolIntegrationError';
  }
}

export class PermissionError extends Error {
  constructor(
    message: string,
    public userId: string,
    public resource: string,
    public requiredPermission: string
  ) {
    super(message);
    this.name = 'PermissionError';
  }
}

export class DataSyncError extends Error {
  constructor(
    message: string,
    public fileId: string,
    public syncDirection: 'upload' | 'download' | 'bidirectional',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'DataSyncError';
  }
}

// Configuration
export interface ScrollOSConfig {
  // Environment
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  storageBaseUrl: string;
  
  // Tool Integration
  toolManifestUrl: string;
  maxConcurrentTools: number;
  toolTimeoutMs: number;
  
  // AI Configuration
  aiServiceUrl: string;
  aiModels: Record<AgentType, string>;
  maxAIContextLength: number;
  
  // Storage
  maxFileSize: number;
  maxProjectSize: number;
  versionRetentionDays: number;
  
  // Security
  jwtSecret: string;
  encryptionKey: string;
  sessionTimeoutMs: number;
  
  // Performance
  cacheTimeoutMs: number;
  maxConcurrentUsers: number;
  autoScalingEnabled: boolean;
  
  // Features
  offlineEnabled: boolean;
  collaborationEnabled: boolean;
  academicIntegrityEnabled: boolean;
  spiritualAlignmentEnabled: boolean;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;