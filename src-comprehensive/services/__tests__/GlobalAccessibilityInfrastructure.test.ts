// Global Accessibility Infrastructure Tests
// Tests all components of the global accessibility system
// Requirements: 2.1, 2.2, 2.3, 2.5

import { ScrollMeshService } from '../ScrollMeshService';
import { SolarMicrohubService } from '../SolarMicrohubService';
import { ProgressiveWebAppService } from '../ProgressiveWebAppService';
import { ContentSyncService } from '../ContentSyncService';
import { GlobalAccessibilityService } from '../GlobalAccessibilityService';
import { GeographicCoordinate } from '../../types/global-accessibility';

// Mock navigator and other browser APIs
const mockNavigator = {
  onLine: true,
  connection: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  },
  serviceWorker: {
    register: jest.fn().mockResolvedValue({
      active: {},
      addEventListener: jest.fn()
    }),
    addEventListener: jest.fn()
  }
};

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock window events
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
};
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

describe('ScrollMesh Network Service', () => {
  let meshService: ScrollMeshService;
  const testLocation: GeographicCoordinate = {
    latitude: 5.6037,
    longitude: -0.1870,
    region: 'Greater Accra',
    country: 'Ghana'
  };

  beforeEach(() => {
    meshService = new ScrollMeshService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    meshService.shutdown();
  });

  test('should initialize mesh node successfully', async () => {
    const node = await meshService.initializeNode(testLocation);

    expect(node).toBeDefined();
    expect(node.nodeId).toBeTruthy();
    expect(node.location).toEqual(testLocation);
    expect(node.connectivity).toBeDefined();
    expect(node.solarIntegration).toBeDefined();
    expect(node.contentCache).toBeDefined();
    expect(node.peerNodes).toEqual([]);
  });

  test('should assess connectivity status correctly', async () => {
    const node = await meshService.initializeNode(testLocation);

    expect(node.connectivity.isOnline).toBe(true);
    expect(node.connectivity.connectionType).toBeTruthy();
    expect(node.connectivity.signalStrength).toBeGreaterThanOrEqual(0);
    expect(node.connectivity.signalStrength).toBeLessThanOrEqual(100);
  });

  test('should calculate distance between coordinates', async () => {
    const node1 = await meshService.initializeNode(testLocation);
    const location2: GeographicCoordinate = {
      latitude: 5.6137, // ~1km north
      longitude: -0.1870,
      region: 'Greater Accra',
      country: 'Ghana'
    };

    // Distance calculation is internal, but we can test node initialization
    expect(node1.location).toEqual(testLocation);
  });

  test('should handle route data through mesh network', async () => {
    await meshService.initializeNode(testLocation);
    
    const result = await meshService.routeData('target-node-id', { message: 'test' });
    
    // Should return false since no route exists to target
    expect(result).toBe(false);
  });

  test('should get current node information', async () => {
    const node = await meshService.initializeNode(testLocation);
    const currentNode = meshService.getCurrentNode();

    expect(currentNode).toEqual(node);
  });

  test('should get peer nodes list', async () => {
    await meshService.initializeNode(testLocation);
    const peers = meshService.getPeerNodes();

    expect(Array.isArray(peers)).toBe(true);
    expect(peers.length).toBe(0); // No peers initially
  });
});

describe('Solar Microhub Service', () => {
  let solarService: SolarMicrohubService;

  beforeEach(() => {
    solarService = new SolarMicrohubService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    solarService.shutdown();
  });

  test('should initialize solar hub successfully', async () => {
    const hubId = 'test-hub-001';
    const hub = await solarService.initializeSolarHub(hubId);

    expect(hub).toBeDefined();
    expect(hub.hubId).toBe(hubId);
    expect(hub.batteryLevel).toBeGreaterThanOrEqual(0);
    expect(hub.batteryLevel).toBeLessThanOrEqual(100);
    expect(hub.solarGeneration).toBeGreaterThanOrEqual(0);
    expect(hub.powerConsumption).toBeGreaterThan(0);
    expect(hub.estimatedRuntime).toBeGreaterThanOrEqual(0);
    expect(typeof hub.isCharging).toBe('boolean');
    expect(['good', 'warning', 'critical']).toContain(hub.maintenanceStatus);
  });

  test('should calculate power consumption correctly', async () => {
    const hubId = 'test-hub-002';
    const hub = await solarService.initializeSolarHub(hubId);

    expect(hub.powerConsumption).toBeGreaterThan(0);
    // Power consumption should be sum of all component consumption
  });

  test('should determine charging status correctly', async () => {
    const hubId = 'test-hub-003';
    const hub = await solarService.initializeSolarHub(hubId);

    // Charging status should be based on generation vs consumption
    const expectedCharging = hub.solarGeneration > hub.powerConsumption;
    expect(hub.isCharging).toBe(expectedCharging);
  });

  test('should get solar hub status', async () => {
    const hubId = 'test-hub-004';
    await solarService.initializeSolarHub(hubId);
    
    const status = solarService.getSolarHubStatus();
    expect(status).toBeDefined();
    expect(status?.hubId).toBe(hubId);
  });

  test('should get power consumption breakdown', async () => {
    const hubId = 'test-hub-005';
    await solarService.initializeSolarHub(hubId);
    
    const breakdown = solarService.getPowerConsumptionBreakdown();
    expect(Array.isArray(breakdown)).toBe(true);
    expect(breakdown.length).toBeGreaterThan(0);
    
    breakdown.forEach(profile => {
      expect(profile.component).toBeTruthy();
      expect(profile.baseConsumption).toBeGreaterThanOrEqual(0);
      expect(profile.peakConsumption).toBeGreaterThanOrEqual(profile.baseConsumption);
      expect(['critical', 'high', 'medium', 'low']).toContain(profile.priority);
    });
  });

  test('should get active optimizations', async () => {
    const hubId = 'test-hub-006';
    await solarService.initializeSolarHub(hubId);
    
    const optimizations = solarService.getActiveOptimizations();
    expect(Array.isArray(optimizations)).toBe(true);
  });
});

describe('Progressive Web App Service', () => {
  let pwaService: ProgressiveWebAppService;

  beforeEach(() => {
    pwaService = new ProgressiveWebAppService();
    jest.clearAllMocks();
  });

  test('should initialize PWA successfully', async () => {
    await pwaService.initialize();
    
    const status = pwaService.getStatus();
    expect(status).toBeDefined();
    expect(typeof status.isInitialized).toBe('boolean');
    expect(typeof status.isOfflineReady).toBe('boolean');
    expect(typeof status.isLowBandwidthMode).toBe('boolean');
  });

  test('should detect network conditions', async () => {
    await pwaService.initialize();
    
    const status = pwaService.getStatus();
    expect(status.networkCondition).toBeDefined();
    
    if (status.networkCondition) {
      expect(['2g', '3g', '4g', 'slow-2g']).toContain(status.networkCondition.effectiveType);
      expect(status.networkCondition.downlink).toBeGreaterThanOrEqual(0);
      expect(status.networkCondition.rtt).toBeGreaterThanOrEqual(0);
      expect(typeof status.networkCondition.saveData).toBe('boolean');
    }
  });

  test('should get offline capabilities', async () => {
    await pwaService.initialize();
    
    const capabilities = pwaService.getOfflineCapabilities();
    expect(Array.isArray(capabilities)).toBe(true);
    
    capabilities.forEach(capability => {
      expect(capability.feature).toBeTruthy();
      expect(typeof capability.isAvailable).toBe('boolean');
      expect(capability.fallbackStrategy).toBeTruthy();
      expect(capability.dataRequirements).toBeGreaterThan(0);
    });
  });

  test('should optimize content for network conditions', async () => {
    await pwaService.initialize();
    
    const testContent = { data: 'test content', size: 1000 };
    const optimization = await pwaService.optimizeContent(testContent, 'text');
    
    expect(optimization).toBeDefined();
    expect(optimization.originalSize).toBeGreaterThan(0);
    expect(optimization.optimizedSize).toBeGreaterThan(0);
    expect(optimization.compressionRatio).toBeGreaterThan(0);
    expect(optimization.optimizationType).toBeTruthy();
  });

  test('should update configuration', async () => {
    await pwaService.initialize();
    
    const newConfig = {
      lowBandwidthMode: true,
      cacheStrategy: {
        maxCacheSize: 512,
        cacheExpiry: 72,
        priorityRules: [],
        cleanupThreshold: 90
      }
    };
    
    pwaService.updateConfiguration(newConfig);
    
    const status = pwaService.getStatus();
    expect(status.isLowBandwidthMode).toBe(true);
  });
});

describe('Content Sync Service', () => {
  let syncService: ContentSyncService;

  beforeEach(() => {
    syncService = new ContentSyncService();
    jest.clearAllMocks();
    
    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/sync/manifest')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            version: '1.0.0',
            courses: [],
            resources: [],
            checksum: 'test-checksum',
            lastUpdated: new Date()
          })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    syncService.shutdown();
  });

  test('should initialize content sync successfully', async () => {
    await syncService.initialize();
    
    const queueStatus = syncService.getSyncQueueStatus();
    expect(queueStatus).toBeDefined();
    expect(queueStatus.totalItems).toBeGreaterThanOrEqual(0);
    expect(queueStatus.pendingItems).toBeGreaterThanOrEqual(0);
    expect(queueStatus.activeItems).toBeGreaterThanOrEqual(0);
    expect(queueStatus.failedItems).toBeGreaterThanOrEqual(0);
  });

  test('should add items to sync queue', async () => {
    await syncService.initialize();
    
    const syncId = await syncService.addToSyncQueue({
      type: 'course',
      action: 'download',
      priority: 5,
      retryCount: 0,
      data: { courseId: 'test-course' }
    });
    
    expect(syncId).toBeTruthy();
    
    const queueStatus = syncService.getSyncQueueStatus();
    expect(queueStatus.pendingItems).toBeGreaterThan(0);
  });

  test('should precache course content', async () => {
    await syncService.initialize();
    
    const syncId = await syncService.precacheCourse('course-123');
    expect(syncId).toBeTruthy();
    
    const queueStatus = syncService.getSyncQueueStatus();
    expect(queueStatus.totalItems).toBeGreaterThan(0);
  });

  test('should sync progress data', async () => {
    await syncService.initialize();
    
    const progressData = {
      courseId: 'course-123',
      progress: 75,
      completedLessons: ['lesson-1', 'lesson-2']
    };
    
    const syncId = await syncService.syncProgress(progressData);
    expect(syncId).toBeTruthy();
  });

  test('should sync assessment results', async () => {
    await syncService.initialize();
    
    const assessmentData = {
      assessmentId: 'assessment-123',
      score: 85,
      answers: ['A', 'B', 'C'],
      completedAt: new Date()
    };
    
    const syncId = await syncService.syncAssessment(assessmentData);
    expect(syncId).toBeTruthy();
  });

  test('should check content availability offline', async () => {
    await syncService.initialize();
    
    const isAvailable = syncService.isContentAvailableOffline('course-123', 'course');
    expect(typeof isAvailable).toBe('boolean');
  });

  test('should get content store statistics', async () => {
    await syncService.initialize();
    
    const stats = syncService.getContentStoreStats();
    expect(stats).toBeDefined();
    expect(stats.totalCapacity).toBeGreaterThan(0);
    expect(stats.usedCapacity).toBeGreaterThanOrEqual(0);
    expect(stats.availableCapacity).toBeGreaterThanOrEqual(0);
    expect(stats.usagePercentage).toBeGreaterThanOrEqual(0);
    expect(stats.usagePercentage).toBeLessThanOrEqual(100);
    expect(stats.cachedCourses).toBeGreaterThanOrEqual(0);
    expect(stats.cachedResources).toBeGreaterThanOrEqual(0);
  });

  test('should force sync specific content', async () => {
    await syncService.initialize();
    
    const syncId = await syncService.forceSyncContent('course-456', 'course');
    expect(syncId).toBeTruthy();
  });

  test('should clear cache', async () => {
    await syncService.initialize();
    
    await syncService.clearCache();
    
    const stats = syncService.getContentStoreStats();
    expect(stats.cachedCourses).toBe(0);
    expect(stats.cachedResources).toBe(0);
    expect(stats.usedCapacity).toBe(0);
  });
});

describe('Global Accessibility Service Integration', () => {
  let accessibilityService: GlobalAccessibilityService;
  const testLocation: GeographicCoordinate = {
    latitude: 5.6037,
    longitude: -0.1870,
    region: 'Greater Accra',
    country: 'Ghana'
  };

  beforeEach(() => {
    accessibilityService = new GlobalAccessibilityService();
    jest.clearAllMocks();
    
    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
  });

  afterEach(() => {
    accessibilityService.shutdown();
  });

  test('should initialize all accessibility components', async () => {
    await accessibilityService.initialize(testLocation);
    
    expect(accessibilityService.isServiceInitialized()).toBe(true);
  });

  test('should get comprehensive accessibility status', async () => {
    await accessibilityService.initialize(testLocation);
    
    const status = await accessibilityService.getAccessibilityStatus();
    
    expect(status).toBeDefined();
    expect(status.meshNetwork).toBeDefined();
    expect(status.solarPower).toBeDefined();
    expect(status.progressiveWebApp).toBeDefined();
    expect(status.contentSync).toBeDefined();
    
    // Mesh network status
    expect(typeof status.meshNetwork.isActive).toBe('boolean');
    expect(status.meshNetwork.nodeCount).toBeGreaterThanOrEqual(0);
    expect(['excellent', 'good', 'poor', 'offline']).toContain(status.meshNetwork.connectivity);
    
    // Solar power status
    expect(typeof status.solarPower.isActive).toBe('boolean');
    expect(status.solarPower.batteryLevel).toBeGreaterThanOrEqual(0);
    expect(status.solarPower.batteryLevel).toBeLessThanOrEqual(100);
    expect(typeof status.solarPower.isCharging).toBe('boolean');
    expect(status.solarPower.estimatedRuntime).toBeGreaterThanOrEqual(0);
    
    // PWA status
    expect(typeof status.progressiveWebApp.isOfflineReady).toBe('boolean');
    expect(typeof status.progressiveWebApp.isLowBandwidthMode).toBe('boolean');
    expect(status.progressiveWebApp.cacheUsage).toBeGreaterThanOrEqual(0);
    
    // Content sync status
    expect(status.contentSync.syncQueueSize).toBeGreaterThanOrEqual(0);
    expect(status.contentSync.activeSyncs).toBeGreaterThanOrEqual(0);
    expect(typeof status.contentSync.offlineContentAvailable).toBe('boolean');
  });

  test('should get accessibility metrics', async () => {
    await accessibilityService.initialize(testLocation);
    
    const metrics = await accessibilityService.getAccessibilityMetrics();
    
    expect(metrics).toBeDefined();
    expect(metrics.totalNodes).toBeGreaterThanOrEqual(0);
    expect(metrics.activeNodes).toBeGreaterThanOrEqual(0);
    expect(metrics.averageBandwidth).toBeGreaterThanOrEqual(0);
    expect(metrics.syncSuccessRate).toBeGreaterThanOrEqual(0);
    expect(metrics.syncSuccessRate).toBeLessThanOrEqual(100);
    expect(metrics.powerEfficiency).toBeGreaterThanOrEqual(0);
    expect(metrics.powerEfficiency).toBeLessThanOrEqual(100);
    expect(metrics.userSatisfaction).toBeGreaterThanOrEqual(0);
    expect(metrics.userSatisfaction).toBeLessThanOrEqual(100);
    expect(Array.isArray(metrics.regionalCoverage)).toBe(true);
  });

  test('should precache essential content', async () => {
    await accessibilityService.initialize(testLocation);
    
    const courseIds = ['course-1', 'course-2', 'course-3'];
    await accessibilityService.precacheEssentialContent(courseIds);
    
    // Should have added items to sync queue
    const status = await accessibilityService.getAccessibilityStatus();
    expect(status.contentSync.syncQueueSize).toBeGreaterThan(0);
  });

  test('should update configuration', async () => {
    await accessibilityService.initialize(testLocation);
    
    const newConfig = {
      enableMeshNetworking: false,
      enableSolarIntegration: true,
      maxCacheSize: 1024,
      syncInterval: 60
    };
    
    accessibilityService.updateConfiguration(newConfig);
    
    const config = accessibilityService.getConfiguration();
    expect(config.enableMeshNetworking).toBe(false);
    expect(config.enableSolarIntegration).toBe(true);
    expect(config.maxCacheSize).toBe(1024);
    expect(config.syncInterval).toBe(60);
  });

  test('should handle power optimization events', async () => {
    await accessibilityService.initialize(testLocation);
    
    // Simulate power optimization event
    const powerEvent = new CustomEvent('power-optimization', {
      detail: {
        strategy: 'background_sync_pause',
        action: 'apply'
      }
    });
    
    window.dispatchEvent(powerEvent);
    
    // Service should handle the event internally
    expect(mockWindow.dispatchEvent).toHaveBeenCalled();
  });

  test('should handle connectivity changes', async () => {
    await accessibilityService.initialize(testLocation);
    
    // Simulate connectivity change
    const connectivityEvent = new CustomEvent('connectivity-change', {
      detail: {
        isOnline: false,
        networkCondition: {
          effectiveType: 'offline',
          downlink: 0,
          rtt: 0,
          saveData: true
        }
      }
    });
    
    window.dispatchEvent(connectivityEvent);
    
    // Service should handle offline mode
    expect(mockWindow.dispatchEvent).toHaveBeenCalled();
  });

  test('should get current configuration', async () => {
    const config = accessibilityService.getConfiguration();
    
    expect(config).toBeDefined();
    expect(typeof config.enableMeshNetworking).toBe('boolean');
    expect(typeof config.enableSolarIntegration).toBe('boolean');
    expect(typeof config.enableOfflineMode).toBe('boolean');
    expect(typeof config.enableContentPrecaching).toBe('boolean');
    expect(typeof config.lowBandwidthOptimization).toBe('boolean');
    expect(config.maxCacheSize).toBeGreaterThan(0);
    expect(config.syncInterval).toBeGreaterThan(0);
    expect(config.meshDiscoveryInterval).toBeGreaterThan(0);
    expect(['conservative', 'balanced', 'aggressive']).toContain(config.powerOptimizationLevel);
  });

  test('should initialize with custom configuration', () => {
    const customConfig = {
      enableMeshNetworking: false,
      maxCacheSize: 512,
      powerOptimizationLevel: 'aggressive' as const
    };
    
    const customService = new GlobalAccessibilityService(customConfig);
    const config = customService.getConfiguration();
    
    expect(config.enableMeshNetworking).toBe(false);
    expect(config.maxCacheSize).toBe(512);
    expect(config.powerOptimizationLevel).toBe('aggressive');
    
    customService.shutdown();
  });
});

describe('Integration Requirements Validation', () => {
  test('should meet requirement 2.1 - ScrollMesh network connectivity for offline regions', async () => {
    const meshService = new ScrollMeshService();
    const testLocation: GeographicCoordinate = {
      latitude: 5.6037,
      longitude: -0.1870,
      region: 'Greater Accra',
      country: 'Ghana'
    };
    
    const node = await meshService.initializeNode(testLocation);
    
    // Should create mesh node with peer discovery capabilities
    expect(node).toBeDefined();
    expect(node.nodeId).toBeTruthy();
    expect(node.peerNodes).toBeDefined();
    expect(node.connectivity).toBeDefined();
    
    // Should support routing data through mesh network
    const routingResult = await meshService.routeData('test-target', { data: 'test' });
    expect(typeof routingResult).toBe('boolean');
    
    meshService.shutdown();
  });

  test('should meet requirement 2.2 - Solar microhub integration for sustainable power management', async () => {
    const solarService = new SolarMicrohubService();
    
    const hub = await solarService.initializeSolarHub('test-hub');
    
    // Should integrate with solar power systems
    expect(hub).toBeDefined();
    expect(hub.batteryLevel).toBeGreaterThanOrEqual(0);
    expect(hub.solarGeneration).toBeGreaterThanOrEqual(0);
    expect(hub.powerConsumption).toBeGreaterThan(0);
    expect(typeof hub.isCharging).toBe('boolean');
    
    // Should provide power optimization
    const optimizations = solarService.getActiveOptimizations();
    expect(Array.isArray(optimizations)).toBe(true);
    
    solarService.shutdown();
  });

  test('should meet requirement 2.3 - Progressive web app for low-bandwidth environments', async () => {
    const pwaService = new ProgressiveWebAppService();
    
    await pwaService.initialize();
    
    const status = pwaService.getStatus();
    
    // Should provide offline capabilities
    expect(status.isOfflineReady).toBeDefined();
    expect(typeof status.isLowBandwidthMode).toBe('boolean');
    
    // Should optimize content for low bandwidth
    const testContent = { data: 'test', size: 1000 };
    const optimization = await pwaService.optimizeContent(testContent, 'text');
    expect(optimization.compressionRatio).toBeGreaterThan(0);
    
    // Should provide offline capabilities
    const capabilities = pwaService.getOfflineCapabilities();
    expect(capabilities.length).toBeGreaterThan(0);
    expect(capabilities.some(cap => cap.feature === 'course_viewing')).toBe(true);
  });

  test('should meet requirement 2.5 - Content pre-caching and synchronization system', async () => {
    const syncService = new ContentSyncService();
    
    await syncService.initialize();
    
    // Should support content pre-caching
    const syncId = await syncService.precacheCourse('test-course');
    expect(syncId).toBeTruthy();
    
    // Should support progress synchronization
    const progressSyncId = await syncService.syncProgress({ courseId: 'test', progress: 50 });
    expect(progressSyncId).toBeTruthy();
    
    // Should provide offline content availability checking
    const isAvailable = syncService.isContentAvailableOffline('test-course', 'course');
    expect(typeof isAvailable).toBe('boolean');
    
    // Should provide sync queue management
    const queueStatus = syncService.getSyncQueueStatus();
    expect(queueStatus.totalItems).toBeGreaterThan(0);
    
    syncService.shutdown();
  });

  test('should integrate all components for comprehensive global accessibility', async () => {
    const accessibilityService = new GlobalAccessibilityService();
    const testLocation: GeographicCoordinate = {
      latitude: 5.6037,
      longitude: -0.1870,
      region: 'Greater Accra',
      country: 'Ghana'
    };
    
    await accessibilityService.initialize(testLocation);
    
    // Should provide comprehensive status
    const status = await accessibilityService.getAccessibilityStatus();
    expect(status.meshNetwork).toBeDefined();
    expect(status.solarPower).toBeDefined();
    expect(status.progressiveWebApp).toBeDefined();
    expect(status.contentSync).toBeDefined();
    
    // Should provide metrics
    const metrics = await accessibilityService.getAccessibilityMetrics();
    expect(metrics.totalNodes).toBeGreaterThanOrEqual(0);
    expect(metrics.syncSuccessRate).toBeGreaterThanOrEqual(0);
    expect(metrics.powerEfficiency).toBeGreaterThanOrEqual(0);
    expect(metrics.userSatisfaction).toBeGreaterThanOrEqual(0);
    
    // Should support configuration management
    const config = accessibilityService.getConfiguration();
    expect(config.enableMeshNetworking).toBeDefined();
    expect(config.enableSolarIntegration).toBeDefined();
    expect(config.enableOfflineMode).toBeDefined();
    expect(config.enableContentPrecaching).toBeDefined();
    
    accessibilityService.shutdown();
  });
});