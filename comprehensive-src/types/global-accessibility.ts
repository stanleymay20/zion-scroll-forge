// Global Accessibility Infrastructure Types
// Requirements: 2.1, 2.2, 2.3, 2.5

export interface ScrollMeshNode {
  nodeId: string;
  location: GeographicCoordinate;
  connectivity: ConnectivityStatus;
  solarIntegration: SolarMicrohub;
  contentCache: LocalContentStore;
  peerNodes: ScrollMeshNode[];
  lastSync: Date;
  bandwidth: BandwidthMetrics;
}

export interface GeographicCoordinate {
  latitude: number;
  longitude: number;
  altitude?: number;
  region: string;
  country: string;
}

export interface ConnectivityStatus {
  isOnline: boolean;
  connectionType: 'wifi' | 'cellular' | 'mesh' | 'satellite' | 'offline';
  signalStrength: number; // 0-100
  bandwidth: number; // kbps
  latency: number; // ms
  lastConnected: Date;
}

export interface SolarMicrohub {
  hubId: string;
  batteryLevel: number; // 0-100
  solarGeneration: number; // watts
  powerConsumption: number; // watts
  estimatedRuntime: number; // hours
  isCharging: boolean;
  maintenanceStatus: 'good' | 'warning' | 'critical';
}

export interface LocalContentStore {
  totalCapacity: number; // MB
  usedCapacity: number; // MB
  cachedCourses: CachedCourse[];
  cachedResources: CachedResource[];
  syncQueue: SyncItem[];
  lastCleanup: Date;
}

export interface CachedCourse {
  courseId: string;
  title: string;
  size: number; // MB
  priority: 'high' | 'medium' | 'low';
  lastAccessed: Date;
  expiryDate: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface CachedResource {
  resourceId: string;
  type: 'video' | 'audio' | 'text' | 'xr' | 'assessment';
  size: number; // MB
  compressionLevel: number;
  lastAccessed: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

export interface SyncItem {
  id: string;
  type: 'course' | 'progress' | 'assessment' | 'profile';
  action: 'upload' | 'download' | 'update' | 'delete';
  priority: number; // 1-10
  retryCount: number;
  lastAttempt: Date;
  data: any;
}

export interface BandwidthMetrics {
  download: number; // kbps
  upload: number; // kbps
  ping: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
}

export interface PWAConfiguration {
  offlineCapabilities: OfflineCapability[];
  cacheStrategy: CacheStrategy;
  compressionSettings: CompressionSettings;
  syncSettings: SyncSettings;
  lowBandwidthMode: boolean;
}

export interface OfflineCapability {
  feature: string;
  isAvailable: boolean;
  fallbackStrategy: string;
  dataRequirements: number; // MB
}

export interface CacheStrategy {
  maxCacheSize: number; // MB
  cacheExpiry: number; // hours
  priorityRules: CachePriorityRule[];
  cleanupThreshold: number; // percentage
}

export interface CachePriorityRule {
  contentType: string;
  priority: number;
  maxAge: number; // hours
  conditions: string[];
}

export interface CompressionSettings {
  videoQuality: 'low' | 'medium' | 'high' | 'adaptive';
  audioQuality: 'low' | 'medium' | 'high';
  imageCompression: number; // 0-100
  textCompression: boolean;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // minutes
  wifiOnlySync: boolean;
  backgroundSync: boolean;
  conflictResolution: 'server' | 'client' | 'merge';
}

export interface GlobalAccessibilityMetrics {
  totalNodes: number;
  activeNodes: number;
  averageBandwidth: number;
  syncSuccessRate: number;
  powerEfficiency: number;
  userSatisfaction: number;
  regionalCoverage: RegionalCoverage[];
}

export interface RegionalCoverage {
  region: string;
  nodeCount: number;
  populationCovered: number;
  averageConnectivity: number;
  solarHubCount: number;
}

export interface MeshNetworkProtocol {
  protocolVersion: string;
  encryptionLevel: string;
  routingAlgorithm: string;
  discoveryMethod: string;
  maxHops: number;
  timeToLive: number;
}

export interface ContentSyncManifest {
  version: string;
  courses: CourseManifest[];
  resources: ResourceManifest[];
  checksum: string;
  lastUpdated: Date;
}

export interface CourseManifest {
  courseId: string;
  version: string;
  size: number;
  dependencies: string[];
  priority: number;
  regions: string[];
}

export interface ResourceManifest {
  resourceId: string;
  type: string;
  size: number;
  compressionRatio: number;
  checksum: string;
}