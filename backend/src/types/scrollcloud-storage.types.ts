/**
 * ScrollCloud Storage System - Type Definitions
 * 
 * Defines types for the unified storage system that supports all academic tools
 * with real-time synchronization, version control, and cross-tool compatibility.
 */

import { AcademicDiscipline, SupportedFormat, ToolPermission } from '../../../src/types/scrollos-tools';

// File System Types
export interface ScrollCloudFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  format: SupportedFormat;
  
  // Academic Context
  discipline?: AcademicDiscipline;
  toolOrigin: string;
  compatibleTools: string[];
  
  // Ownership and Permissions
  ownerId: string;
  projectId?: string;
  courseId?: string;
  assignmentId?: string;
  
  // Version Control
  currentVersion: string;
  versions: FileVersion[];
  
  // Collaboration
  sharedWith: FileSharing[];
  isPublic: boolean;
  
  // Synchronization
  syncStatus: SyncStatus;
  lastSyncAt?: Date;
  conflictResolution?: ConflictResolution;
  
  // Metadata
  metadata: FileMetadata;
  tags: string[];
  
  // Storage
  storageProvider: StorageProvider;
  storagePath: string;
  backupPaths: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  
  // Academic Integrity
  integrityHash: string;
  auditTrail: FileAuditEntry[];
}

export interface FileVersion {
  id: string;
  version: string;
  fileId: string;
  
  // Content
  size: number;
  checksum: string;
  storagePath: string;
  
  // Changes
  changeDescription: string;
  changedBy: string;
  parentVersion?: string;
  
  // Metadata
  createdAt: Date;
  isActive: boolean;
  
  // Branching (for collaborative work)
  branchName?: string;
  mergedFrom?: string[];
}

export interface FileMetadata {
  // Academic Properties
  discipline?: AcademicDiscipline;
  courseCode?: string;
  assignmentType?: string;
  learningObjectives?: string[];
  
  // Tool-Specific Data
  toolSpecificData: Record<string, any>;
  
  // Content Analysis
  wordCount?: number;
  pageCount?: number;
  duration?: number; // for media files
  
  // Collaboration
  contributors: string[];
  lastEditedBy: string;
  
  // Custom Properties
  customProperties: Record<string, any>;
}

export interface FileSharing {
  userId: string;
  permission: 'read' | 'write' | 'admin';
  sharedBy: string;
  sharedAt: Date;
  expiresAt?: Date;
  notifyOnChanges: boolean;
}

export interface FileAuditEntry {
  id: string;
  fileId: string;
  action: FileAction;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export type FileAction = 
  | 'created' | 'updated' | 'deleted' | 'renamed' | 'moved'
  | 'shared' | 'unshared' | 'downloaded' | 'viewed'
  | 'version_created' | 'version_restored' | 'merged'
  | 'conflict_resolved' | 'synchronized';

// Synchronization Types
export interface SyncStatus {
  status: 'synced' | 'syncing' | 'conflict' | 'error' | 'offline';
  lastSyncAttempt: Date;
  lastSuccessfulSync?: Date;
  errorMessage?: string;
  conflictCount: number;
  pendingChanges: number;
}

export interface SyncOperation {
  id: string;
  fileId: string;
  operation: 'upload' | 'download' | 'merge' | 'conflict_resolve';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  
  // Progress
  progress: number; // 0-100
  bytesTransferred: number;
  totalBytes: number;
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  estimatedCompletion?: Date;
  
  // Error Handling
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  
  // Context
  userId: string;
  deviceId: string;
  toolId?: string;
}

export interface ConflictResolution {
  conflictId: string;
  fileId: string;
  conflictType: 'content' | 'metadata' | 'permissions' | 'version';
  
  // Conflicting Versions
  localVersion: string;
  remoteVersion: string;
  baseVersion?: string;
  
  // Resolution Strategy
  strategy: 'manual' | 'auto_merge' | 'keep_local' | 'keep_remote' | 'create_branch';
  resolvedBy?: string;
  resolvedAt?: Date;
  
  // Resolution Data
  mergedContent?: string;
  resolutionNotes?: string;
  
  // Status
  status: 'pending' | 'resolved' | 'escalated';
}

// Project and Workspace Types
export interface ScrollCloudProject {
  id: string;
  name: string;
  description: string;
  
  // Academic Context
  discipline: AcademicDiscipline;
  courseId?: string;
  assignmentId?: string;
  
  // Ownership
  ownerId: string;
  collaborators: ProjectCollaborator[];
  
  // Content
  files: string[]; // File IDs
  folders: ProjectFolder[];
  
  // Tools
  associatedTools: string[];
  toolConfigurations: Record<string, any>;
  
  // Settings
  settings: ProjectSettings;
  
  // Synchronization
  syncSettings: ProjectSyncSettings;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  
  // Status
  isActive: boolean;
  isArchived: boolean;
}

export interface ProjectFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  projectId: string;
  
  // Content
  fileIds: string[];
  subfolders: string[];
  
  // Permissions
  permissions: ToolPermission[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectCollaborator {
  userId: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  permissions: ToolPermission[];
  
  // Collaboration Settings
  canInviteOthers: boolean;
  canManageFiles: boolean;
  canManageSettings: boolean;
  
  // Status
  joinedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  
  // Notifications
  notificationSettings: CollaboratorNotificationSettings;
}

export interface CollaboratorNotificationSettings {
  onFileChanges: boolean;
  onNewFiles: boolean;
  onComments: boolean;
  onMentions: boolean;
  onPermissionChanges: boolean;
  
  // Delivery Method
  email: boolean;
  inApp: boolean;
  push: boolean;
}

export interface ProjectSettings {
  // Visibility
  isPublic: boolean;
  allowDiscovery: boolean;
  
  // Collaboration
  allowCollaboration: boolean;
  maxCollaborators: number;
  requireApprovalForJoin: boolean;
  
  // Version Control
  enableVersionControl: boolean;
  maxVersionsPerFile: number;
  autoCreateVersions: boolean;
  
  // Synchronization
  enableRealTimeSync: boolean;
  conflictResolutionStrategy: 'manual' | 'auto' | 'last_writer_wins';
  
  // Academic Integrity
  enableIntegrityChecking: boolean;
  requireDigitalSignatures: boolean;
  
  // Backup
  enableAutoBackup: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  retentionPeriod: number; // days
}

export interface ProjectSyncSettings {
  // Real-time Sync
  enableRealTimeSync: boolean;
  syncInterval: number; // seconds
  
  // Offline Support
  enableOfflineMode: boolean;
  offlineStorageLimit: number; // MB
  
  // Conflict Resolution
  autoResolveConflicts: boolean;
  conflictResolutionStrategy: 'manual' | 'merge' | 'latest_wins' | 'create_branch';
  
  // Performance
  batchSyncOperations: boolean;
  maxConcurrentSyncs: number;
  compressionEnabled: boolean;
}

// Storage Provider Types
export type StorageProvider = 'supabase' | 'aws_s3' | 'google_cloud' | 'azure_blob' | 'local';

export interface StorageConfiguration {
  provider: StorageProvider;
  config: Record<string, any>;
  
  // Capabilities
  supportsVersioning: boolean;
  supportsRealTimeSync: boolean;
  supportsEncryption: boolean;
  
  // Limits
  maxFileSize: number;
  maxStorageQuota: number;
  
  // Performance
  uploadChunkSize: number;
  downloadChunkSize: number;
  concurrentOperations: number;
}

// API Request/Response Types
export interface FileUploadRequest {
  name: string;
  content: Buffer | string;
  mimeType: string;
  
  // Context
  projectId?: string;
  folderId?: string;
  toolId?: string;
  
  // Options
  createVersion: boolean;
  overwriteExisting: boolean;
  
  // Metadata
  metadata?: Partial<FileMetadata>;
  tags?: string[];
}

export interface FileUploadResponse {
  file: ScrollCloudFile;
  uploadUrl?: string; // for direct uploads
  syncOperation?: SyncOperation;
}

export interface FileDownloadRequest {
  fileId: string;
  version?: string;
  format?: SupportedFormat; // for format conversion
}

export interface FileDownloadResponse {
  file: ScrollCloudFile;
  downloadUrl: string;
  expiresAt: Date;
}

export interface FileSyncRequest {
  fileIds: string[];
  operation: 'sync' | 'force_upload' | 'force_download';
  resolveConflicts: boolean;
}

export interface FileSyncResponse {
  operations: SyncOperation[];
  conflicts: ConflictResolution[];
  summary: {
    totalFiles: number;
    syncedFiles: number;
    conflictFiles: number;
    errorFiles: number;
  };
}

// Version Control Types
export interface VersionControlOperation {
  type: 'create_version' | 'restore_version' | 'merge_versions' | 'create_branch';
  fileId: string;
  sourceVersion?: string;
  targetVersion?: string;
  branchName?: string;
  description?: string;
}

export interface MergeRequest {
  fileId: string;
  sourceVersion: string;
  targetVersion: string;
  strategy: 'auto' | 'manual' | 'three_way';
  conflictResolution?: Record<string, any>;
}

export interface MergeResult {
  success: boolean;
  newVersion?: string;
  conflicts?: ConflictResolution[];
  mergedContent?: string;
}

// Search and Discovery Types
export interface FileSearchRequest {
  query: string;
  filters: FileSearchFilters;
  pagination: {
    page: number;
    limit: number;
  };
  sortBy: 'relevance' | 'name' | 'modified' | 'created' | 'size';
  sortOrder: 'asc' | 'desc';
}

export interface FileSearchFilters {
  disciplines?: AcademicDiscipline[];
  formats?: SupportedFormat[];
  tools?: string[];
  projects?: string[];
  courses?: string[];
  
  // Date Ranges
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  
  // Size
  minSize?: number;
  maxSize?: number;
  
  // Ownership
  ownedBy?: string[];
  sharedWith?: string[];
  
  // Status
  syncStatus?: SyncStatus['status'][];
  hasConflicts?: boolean;
}

export interface FileSearchResult {
  files: ScrollCloudFile[];
  totalCount: number;
  facets: {
    disciplines: Record<AcademicDiscipline, number>;
    formats: Record<SupportedFormat, number>;
    tools: Record<string, number>;
  };
}

// Analytics and Reporting Types
export interface StorageAnalytics {
  // Usage Statistics
  totalFiles: number;
  totalSize: number;
  storageQuotaUsed: number;
  storageQuotaLimit: number;
  
  // Activity
  filesCreatedToday: number;
  filesModifiedToday: number;
  syncOperationsToday: number;
  
  // Performance
  averageSyncTime: number;
  syncSuccessRate: number;
  conflictRate: number;
  
  // Collaboration
  activeCollaborators: number;
  sharedFiles: number;
  
  // By Discipline
  usageByDiscipline: Record<AcademicDiscipline, {
    fileCount: number;
    totalSize: number;
  }>;
  
  // By Tool
  usageByTool: Record<string, {
    fileCount: number;
    totalSize: number;
    lastUsed: Date;
  }>;
}

// Error Types
export class ScrollCloudError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ScrollCloudError';
  }
}

export class SyncError extends ScrollCloudError {
  constructor(
    message: string,
    public fileId: string,
    public operation: string,
    details?: Record<string, any>
  ) {
    super(message, 'SYNC_ERROR', details);
    this.name = 'SyncError';
  }
}

export class ConflictError extends ScrollCloudError {
  constructor(
    message: string,
    public fileId: string,
    public conflictType: string,
    details?: Record<string, any>
  ) {
    super(message, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

export class StorageQuotaError extends ScrollCloudError {
  constructor(
    message: string,
    public userId: string,
    public quotaUsed: number,
    public quotaLimit: number
  ) {
    super(message, 'QUOTA_EXCEEDED', { quotaUsed, quotaLimit });
    this.name = 'StorageQuotaError';
  }
}

// Configuration Types
export interface ScrollCloudConfig {
  // Storage
  defaultProvider: StorageProvider;
  providers: Record<StorageProvider, StorageConfiguration>;
  
  // Synchronization
  syncInterval: number;
  maxConcurrentSyncs: number;
  enableRealTimeSync: boolean;
  
  // Version Control
  maxVersionsPerFile: number;
  versionRetentionDays: number;
  enableAutomaticVersioning: boolean;
  
  // Quotas
  defaultStorageQuota: number; // MB
  maxFileSize: number; // MB
  maxFilesPerProject: number;
  
  // Performance
  uploadChunkSize: number;
  downloadChunkSize: number;
  cacheTimeout: number;
  
  // Security
  encryptionEnabled: boolean;
  auditLoggingEnabled: boolean;
  integrityCheckingEnabled: boolean;
  
  // Features
  offlineModeEnabled: boolean;
  collaborationEnabled: boolean;
  searchIndexingEnabled: boolean;
}