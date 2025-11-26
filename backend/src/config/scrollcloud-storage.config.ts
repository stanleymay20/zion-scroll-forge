/**
 * ScrollCloud Storage Configuration
 * 
 * Configuration for the unified storage system supporting all academic tools
 * with real-time synchronization and version control capabilities.
 */

import { StorageProvider, ScrollCloudConfig } from '../types/scrollcloud-storage.types';

export const scrollCloudConfig: ScrollCloudConfig = {
  // Storage Providers
  defaultProvider: (process.env.SCROLLCLOUD_DEFAULT_PROVIDER as StorageProvider) || 'supabase',
  
  providers: {
    supabase: {
      provider: 'supabase',
      config: {
        url: process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        bucketName: process.env.SCROLLCLOUD_SUPABASE_BUCKET || 'scrollcloud-storage',
        region: process.env.SUPABASE_REGION || 'us-east-1'
      },
      supportsVersioning: true,
      supportsRealTimeSync: true,
      supportsEncryption: true,
      maxFileSize: parseInt(process.env.SCROLLCLOUD_MAX_FILE_SIZE || '100') * 1024 * 1024, // 100MB default
      maxStorageQuota: parseInt(process.env.SCROLLCLOUD_STORAGE_QUOTA || '10240') * 1024 * 1024, // 10GB default
      uploadChunkSize: 1024 * 1024, // 1MB chunks
      downloadChunkSize: 1024 * 1024, // 1MB chunks
      concurrentOperations: 5
    },
    
    aws_s3: {
      provider: 'aws_s3',
      config: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1',
        bucketName: process.env.SCROLLCLOUD_S3_BUCKET || 'scrollcloud-storage'
      },
      supportsVersioning: true,
      supportsRealTimeSync: false,
      supportsEncryption: true,
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      maxStorageQuota: 1024 * 1024 * 1024 * 1024, // 1TB
      uploadChunkSize: 5 * 1024 * 1024, // 5MB chunks
      downloadChunkSize: 5 * 1024 * 1024, // 5MB chunks
      concurrentOperations: 10
    },
    
    google_cloud: {
      provider: 'google_cloud',
      config: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
        keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || '',
        bucketName: process.env.SCROLLCLOUD_GCS_BUCKET || 'scrollcloud-storage'
      },
      supportsVersioning: true,
      supportsRealTimeSync: false,
      supportsEncryption: true,
      maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
      maxStorageQuota: 1024 * 1024 * 1024 * 1024, // 1TB
      uploadChunkSize: 8 * 1024 * 1024, // 8MB chunks
      downloadChunkSize: 8 * 1024 * 1024, // 8MB chunks
      concurrentOperations: 8
    },
    
    azure_blob: {
      provider: 'azure_blob',
      config: {
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
        containerName: process.env.SCROLLCLOUD_AZURE_CONTAINER || 'scrollcloud-storage'
      },
      supportsVersioning: true,
      supportsRealTimeSync: false,
      supportsEncryption: true,
      maxFileSize: 4.75 * 1024 * 1024 * 1024, // 4.75GB
      maxStorageQuota: 500 * 1024 * 1024 * 1024, // 500GB
      uploadChunkSize: 4 * 1024 * 1024, // 4MB chunks
      downloadChunkSize: 4 * 1024 * 1024, // 4MB chunks
      concurrentOperations: 6
    },
    
    local: {
      provider: 'local',
      config: {
        basePath: process.env.SCROLLCLOUD_LOCAL_PATH || './storage',
        enableBackup: process.env.SCROLLCLOUD_LOCAL_BACKUP === 'true'
      },
      supportsVersioning: true,
      supportsRealTimeSync: true,
      supportsEncryption: false,
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      maxStorageQuota: 100 * 1024 * 1024 * 1024, // 100GB
      uploadChunkSize: 512 * 1024, // 512KB chunks
      downloadChunkSize: 512 * 1024, // 512KB chunks
      concurrentOperations: 3
    }
  },
  
  // Synchronization Settings
  syncInterval: parseInt(process.env.SCROLLCLOUD_SYNC_INTERVAL || '30'), // 30 seconds
  maxConcurrentSyncs: parseInt(process.env.SCROLLCLOUD_MAX_CONCURRENT_SYNCS || '10'),
  enableRealTimeSync: process.env.SCROLLCLOUD_REALTIME_SYNC !== 'false',
  
  // Version Control Settings
  maxVersionsPerFile: parseInt(process.env.SCROLLCLOUD_MAX_VERSIONS || '50'),
  versionRetentionDays: parseInt(process.env.SCROLLCLOUD_VERSION_RETENTION_DAYS || '365'),
  enableAutomaticVersioning: process.env.SCROLLCLOUD_AUTO_VERSIONING !== 'false',
  
  // Quota Settings
  defaultStorageQuota: parseInt(process.env.SCROLLCLOUD_DEFAULT_QUOTA || '10240'), // 10GB in MB
  maxFileSize: parseInt(process.env.SCROLLCLOUD_MAX_FILE_SIZE || '100'), // 100MB
  maxFilesPerProject: parseInt(process.env.SCROLLCLOUD_MAX_FILES_PER_PROJECT || '10000'),
  
  // Performance Settings
  uploadChunkSize: parseInt(process.env.SCROLLCLOUD_UPLOAD_CHUNK_SIZE || '1048576'), // 1MB
  downloadChunkSize: parseInt(process.env.SCROLLCLOUD_DOWNLOAD_CHUNK_SIZE || '1048576'), // 1MB
  cacheTimeout: parseInt(process.env.SCROLLCLOUD_CACHE_TIMEOUT || '300'), // 5 minutes
  
  // Security Settings
  encryptionEnabled: process.env.SCROLLCLOUD_ENCRYPTION_ENABLED !== 'false',
  auditLoggingEnabled: process.env.SCROLLCLOUD_AUDIT_LOGGING !== 'false',
  integrityCheckingEnabled: process.env.SCROLLCLOUD_INTEGRITY_CHECKING !== 'false',
  
  // Feature Flags
  offlineModeEnabled: process.env.SCROLLCLOUD_OFFLINE_MODE !== 'false',
  collaborationEnabled: process.env.SCROLLCLOUD_COLLABORATION !== 'false',
  searchIndexingEnabled: process.env.SCROLLCLOUD_SEARCH_INDEXING !== 'false'
};

// Academic Discipline to Storage Path Mapping
export const disciplineStoragePaths: Record<string, string> = {
  'computer-science': 'cs',
  'artificial-intelligence': 'ai',
  'cybersecurity': 'cybersec',
  'mechanical-engineering': 'mech-eng',
  'electrical-engineering': 'elec-eng',
  'civil-engineering': 'civil-eng',
  'data-science': 'data-sci',
  'statistics': 'stats',
  'finance': 'finance',
  'economics': 'econ',
  'creative-design': 'design',
  'architecture': 'arch',
  'product-design': 'product',
  'medicine': 'med',
  'health-sciences': 'health',
  'anatomy': 'anatomy',
  'physiology': 'physio',
  'theology': 'theology',
  'biblical-studies': 'biblical',
  'ministry': 'ministry',
  'hermeneutics': 'hermeneutics'
};

// Tool-specific storage configurations
export const toolStorageConfigs = {
  // Development Tools
  'vscode-web': {
    supportedFormats: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json', 'md'],
    autoVersioning: true,
    realTimeSync: true,
    maxFileSize: 10 * 1024 * 1024 // 10MB
  },
  
  // CAD Tools
  'onshape': {
    supportedFormats: ['dwg', 'step', 'stl', 'obj'],
    autoVersioning: true,
    realTimeSync: false,
    maxFileSize: 500 * 1024 * 1024 // 500MB
  },
  
  // Design Tools
  'figma': {
    supportedFormats: ['fig', 'svg', 'png', 'jpg'],
    autoVersioning: true,
    realTimeSync: true,
    maxFileSize: 100 * 1024 * 1024 // 100MB
  },
  
  // Data Science Tools
  'jupyter': {
    supportedFormats: ['json', 'py', 'csv', 'xlsx'],
    autoVersioning: true,
    realTimeSync: true,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  
  // Medical Tools
  'biodigital': {
    supportedFormats: ['dicom', 'nii', 'dcm'],
    autoVersioning: false,
    realTimeSync: false,
    maxFileSize: 1024 * 1024 * 1024 // 1GB
  },
  
  // Document Tools
  'office-suite': {
    supportedFormats: ['docx', 'xlsx', 'pptx', 'pdf'],
    autoVersioning: true,
    realTimeSync: true,
    maxFileSize: 100 * 1024 * 1024 // 100MB
  }
};

// Default file metadata templates by discipline
export const disciplineMetadataTemplates = {
  'computer-science': {
    customProperties: {
      programmingLanguage: '',
      framework: '',
      dependencies: [],
      testCoverage: 0
    }
  },
  
  'mechanical-engineering': {
    customProperties: {
      materialType: '',
      dimensions: '',
      tolerances: '',
      manufacturingProcess: ''
    }
  },
  
  'data-science': {
    customProperties: {
      datasetSize: 0,
      algorithm: '',
      accuracy: 0,
      features: []
    }
  },
  
  'theology': {
    customProperties: {
      scriptureReferences: [],
      theologicalThemes: [],
      originalLanguages: [],
      commentaries: []
    }
  }
};

// Validation rules for different file types
export const fileValidationRules = {
  maxFilenameLength: 255,
  allowedCharacters: /^[a-zA-Z0-9._\-\s()[\]{}]+$/,
  reservedNames: ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'],
  
  // MIME type validation
  mimeTypeValidation: {
    'js': ['application/javascript', 'text/javascript'],
    'ts': ['application/typescript', 'text/typescript'],
    'py': ['text/x-python', 'application/x-python-code'],
    'java': ['text/x-java-source'],
    'cpp': ['text/x-c++src'],
    'c': ['text/x-csrc'],
    'html': ['text/html'],
    'css': ['text/css'],
    'json': ['application/json'],
    'md': ['text/markdown', 'text/x-markdown'],
    'pdf': ['application/pdf'],
    'docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    'pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    'png': ['image/png'],
    'jpg': ['image/jpeg'],
    'svg': ['image/svg+xml'],
    'dicom': ['application/dicom'],
    'dwg': ['application/acad', 'image/vnd.dwg'],
    'step': ['application/step'],
    'stl': ['application/sla', 'model/stl']
  }
};

export default scrollCloudConfig;