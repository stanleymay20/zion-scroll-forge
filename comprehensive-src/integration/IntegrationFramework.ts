import { EventEmitter } from 'events';
import { createClient } from 'redis';
import { logger } from '../../backend/src/utils/logger';
import { 
  SystemName, 
  SystemIntegrationConfig, 
  CrossSystemEvent, 
  IntegrationMetrics,
  SCROLL_UNIVERSITY_SYSTEM_INTERFACES 
} from './SystemInterfaces';
import { 
  ScrollUser, 
  HealthStatus, 
  IntegrationHealth, 
  APIResponse 
} from './SharedDataModels';

// Legacy interfaces maintained for backward compatibility
export interface SystemEvent extends CrossSystemEvent {}

export interface IntegrationConfig extends SystemIntegrationConfig {}

export interface SystemInterface {
  name: string;
  version: string;
  endpoints: {
    [key: string]: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      path: string;
      description: string;
      requestSchema?: any;
      responseSchema?: any;
    };
  };
  events: {
    publishes: string[];
    subscribes: string[];
  };
  dependencies: string[];
}

export class IntegrationFramework extends EventEmitter {
  private redis: any;
  private systems: Map<SystemName, SystemIntegrationConfig> = new Map();
  private systemInterfaces: Map<SystemName, SystemInterface> = new Map();
  private eventHandlers: Map<string, Function[]> = new Map();
  private healthChecks: Map<SystemName, IntegrationHealth> = new Map();
  private correlationMap: Map<string, string[]> = new Map();
  private metrics: Map<SystemName, IntegrationMetrics> = new Map();
  private eventQueue: CrossSystemEvent[] = [];
  private processingEvents = false;
  private alerts: Map<string, IntegrationAlert> = new Map();
  private alertHandlers: Function[] = [];

  constructor() {
    super();
    this.initializeRedis();
    this.setupSystemInterfaces();
    this.startHealthMonitoring();
  }

  private async initializeRedis() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    try {
      await this.redis.connect();
      
      // Subscribe to integration events
      const subscriber = this.redis.duplicate();
      await subscriber.connect();
      
      await subscriber.subscribe('scroll:integration:events', (message: string) => {
        try {
          const event: SystemEvent = JSON.parse(message);
          this.handleSystemEvent(event);
        } catch (error) {
          logger.error('Failed to parse integration event:', error);
        }
      });

      logger.info('✅ Integration Framework Redis connected');
    } catch (error) {
      logger.error('❌ Integration Framework Redis connection failed:', error);
    }
  }

  private setupSystemInterfaces() {
    // Define comprehensive system interfaces based on the 10+ ScrollUniversity specs
    const systemConfigs: Record<SystemName, SystemInterface> = {
      'scroll-university-platform': {
        name: 'scroll-university-platform',
        version: 'v1',
        endpoints: {
          health: { method: 'GET', path: '/health', description: 'Platform health check' },
          users: { method: 'GET', path: '/api/users', description: 'User management' },
          createUser: { method: 'POST', path: '/api/users', description: 'Create new user' },
          registerSystem: { method: 'POST', path: '/api/integration/register', description: 'Register system' }
        },
        events: {
          publishes: ['user.created', 'user.updated', 'user.deleted', 'system.started', 'system.shutdown', 'integration.registered'],
          subscribes: ['*.health.check', 'system.*.error', 'audit.*.required']
        },
        dependencies: []
      },
      'scroll-student-profile-spec': {
        name: 'scroll-student-profile-spec',
        version: 'v1',
        endpoints: {
          getProfile: { method: 'GET', path: '/api/profile/{userId}', description: 'Get student profile' },
          updateSpiritual: { method: 'PUT', path: '/api/profile/{userId}/spiritual', description: 'Update spiritual formation' },
          updateAcademic: { method: 'PUT', path: '/api/profile/{userId}/academic', description: 'Update academic progress' },
          getDivineScorecard: { method: 'GET', path: '/api/profile/{userId}/scorecard', description: 'Get divine scorecard' }
        },
        events: {
          publishes: ['profile.created', 'profile.updated', 'spiritual.milestone', 'academic.progress', 'calling.clarified', 'formation.advanced'],
          subscribes: ['user.created', 'course.completed', 'assessment.passed', 'project.completed', 'mentorship.milestone', 'prayer.answered']
        },
        dependencies: ['scroll-university-platform']
      },
      'scroll-course-spec': {
        name: 'scroll-course-spec',
        version: 'v1',
        endpoints: {
          getCourses: { method: 'GET', path: '/api/courses', description: 'Get course catalog' },
          getCourse: { method: 'GET', path: '/api/courses/{courseId}', description: 'Get course details' },
          enrollStudent: { method: 'POST', path: '/api/courses/{courseId}/enroll', description: 'Enroll student' },
          getProgress: { method: 'GET', path: '/api/courses/{courseId}/progress/{userId}', description: 'Get progress' }
        },
        events: {
          publishes: ['course.created', 'course.updated', 'course.enrolled', 'course.progress', 'course.completed', 'lesson.completed'],
          subscribes: ['user.created', 'payment.completed', 'scrollcoin.earned', 'assessment.passed', 'spiritual.milestone']
        },
        dependencies: ['scroll-university-platform', 'scroll-student-profile-spec']
      },
      'scroll-scrollcoin-meter': {
        name: 'scroll-scrollcoin-meter',
        version: 'v1',
        endpoints: {
          getBalance: { method: 'GET', path: '/api/scrollcoin/{userId}/balance', description: 'Get balance' },
          transfer: { method: 'POST', path: '/api/scrollcoin/transfer', description: 'Transfer coins' },
          earn: { method: 'POST', path: '/api/scrollcoin/earn', description: 'Award coins' },
          getTransactions: { method: 'GET', path: '/api/scrollcoin/{userId}/transactions', description: 'Get transactions' }
        },
        events: {
          publishes: ['scrollcoin.earned', 'scrollcoin.spent', 'scrollcoin.transferred', 'wallet.created', 'transaction.completed', 'fraud.detected'],
          subscribes: ['course.completed', 'assessment.passed', 'project.submitted', 'mentorship.milestone', 'prayer.answered', 'ministry.impact']
        },
        dependencies: ['scroll-university-platform', 'scroll-audit-trail-spec']
      },
      'scroll-faculty-ai': {
        name: 'scroll-faculty-ai',
        version: 'v1',
        endpoints: {
          chat: { method: 'POST', path: '/api/ai/chat', description: 'Chat with AI tutor' },
          getFeedback: { method: 'POST', path: '/api/ai/feedback', description: 'Get AI feedback' },
          getTutors: { method: 'GET', path: '/api/ai/tutors', description: 'Get available tutors' },
          validateResponse: { method: 'POST', path: '/api/ai/validate', description: 'Validate AI response' }
        },
        events: {
          publishes: ['ai.response', 'ai.feedback', 'ai.tutoring.session', 'ai.drift.detected', 'ai.validation.failed'],
          subscribes: ['course.progress', 'assessment.submitted', 'student.question', 'spiritual.guidance.needed', 'drift.alert']
        },
        dependencies: ['scroll-university-platform', 'scroll-drift-detection-spec', 'scroll-oath-enforcer']
      },
      'scroll-assessment-engine': {
        name: 'scroll-assessment-engine',
        version: 'v1',
        endpoints: {
          submitAssessment: { method: 'POST', path: '/api/assessments/submit', description: 'Submit assessment' },
          getResults: { method: 'GET', path: '/api/assessments/{submissionId}/results', description: 'Get results' },
          createAssessment: { method: 'POST', path: '/api/assessments', description: 'Create assessment' }
        },
        events: {
          publishes: ['assessment.created', 'assessment.submitted', 'assessment.graded', 'assessment.passed', 'assessment.failed'],
          subscribes: ['course.progress', 'ai.feedback', 'spiritual.validation', 'project.completed']
        },
        dependencies: ['scroll-course-spec', 'scroll-faculty-ai', 'scroll-gpt-verifier']
      },
      'scroll-projects-spec': {
        name: 'scroll-projects-spec',
        version: 'v1',
        endpoints: {
          createProject: { method: 'POST', path: '/api/projects', description: 'Create project' },
          getProject: { method: 'GET', path: '/api/projects/{projectId}', description: 'Get project' },
          updateProgress: { method: 'PUT', path: '/api/projects/{projectId}/progress', description: 'Update progress' },
          submitDeliverable: { method: 'POST', path: '/api/projects/{projectId}/deliverables', description: 'Submit deliverable' }
        },
        events: {
          publishes: ['project.created', 'project.updated', 'project.milestone', 'project.completed', 'deliverable.submitted'],
          subscribes: ['course.enrolled', 'mentor.assigned', 'assessment.passed', 'scrollcoin.earned']
        },
        dependencies: ['scroll-university-platform', 'scroll-student-profile-spec']
      },
      'scroll-prayer-integration-spec': {
        name: 'scroll-prayer-integration-spec',
        version: 'v1',
        endpoints: {
          submitRequest: { method: 'POST', path: '/api/prayer/request', description: 'Submit prayer request' },
          getIntercession: { method: 'GET', path: '/api/prayer/intercession/{userId}', description: 'Get prayer assignments' },
          updateRequest: { method: 'PUT', path: '/api/prayer/{requestId}', description: 'Update prayer request' },
          getPrayerCoverage: { method: 'GET', path: '/api/prayer/coverage/{userId}', description: 'Get prayer coverage' }
        },
        events: {
          publishes: ['prayer.requested', 'prayer.answered', 'intercession.assigned', 'spiritual.breakthrough', 'warfare.alert'],
          subscribes: ['user.created', 'spiritual.crisis', 'course.struggle', 'assessment.anxiety', 'project.challenge']
        },
        dependencies: ['scroll-university-platform', 'scroll-student-profile-spec']
      },
      'scroll-mentorship-network-spec': {
        name: 'scroll-mentorship-network-spec',
        version: 'v1',
        endpoints: {
          findMentor: { method: 'POST', path: '/api/mentorship/match', description: 'Find mentor match' },
          scheduleSession: { method: 'POST', path: '/api/mentorship/session', description: 'Schedule session' },
          getRelationships: { method: 'GET', path: '/api/mentorship/{userId}/relationships', description: 'Get relationships' }
        },
        events: {
          publishes: ['mentor.matched', 'mentorship.session', 'mentorship.milestone', 'discipleship.advanced', 'ministry.calling'],
          subscribes: ['user.created', 'spiritual.growth', 'course.completed', 'project.milestone', 'prayer.breakthrough']
        },
        dependencies: ['scroll-university-platform', 'scroll-student-profile-spec', 'scroll-prayer-integration-spec']
      },
      'scroll-seal-certification': {
        name: 'scroll-seal-certification',
        version: 'v1',
        endpoints: {
          issueCertificate: { method: 'POST', path: '/api/certification/issue', description: 'Issue certificate' },
          verifyCertificate: { method: 'GET', path: '/api/certification/verify/{certificateId}', description: 'Verify certificate' },
          getCertificates: { method: 'GET', path: '/api/certification/{userId}', description: 'Get certificates' }
        },
        events: {
          publishes: ['certificate.issued', 'certificate.verified', 'badge.earned', 'degree.conferred', 'credential.updated'],
          subscribes: ['course.completed', 'degree.requirements.met', 'project.completed', 'spiritual.milestone', 'assessment.passed']
        },
        dependencies: ['scroll-university-platform', 'scroll-student-profile-spec', 'scroll-degree-engine']
      },
      'scroll-content-creation-engine': {
        name: 'scroll-content-creation-engine',
        version: 'v1',
        endpoints: {
          generateContent: { method: 'POST', path: '/api/content/generate', description: 'Generate content' },
          validateContent: { method: 'POST', path: '/api/content/validate', description: 'Validate content' },
          publishContent: { method: 'POST', path: '/api/content/publish', description: 'Publish content' }
        },
        events: {
          publishes: ['content.generated', 'content.validated', 'content.published', 'content.rejected', 'localization.completed'],
          subscribes: ['course.created', 'curriculum.updated', 'spiritual.validation.required', 'translation.requested']
        },
        dependencies: ['scroll-university-platform', 'scroll-faculty-ai', 'scroll-oath-enforcer']
      }
    };

    // Register all system interfaces
    Object.entries(systemConfigs).forEach(([name, config]) => {
      this.systemInterfaces.set(name as SystemName, config);
      
      // Initialize health status
      this.healthChecks.set(name as SystemName, {
        systemName: name as SystemName,
        status: HealthStatus.UNKNOWN,
        lastCheck: new Date(),
        responseTime: 0,
        dependencies: [],
        metrics: {
          uptime: 0,
          errorRate: 0,
          throughput: 0,
          latency: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      });

      // Initialize metrics
      this.metrics.set(name as SystemName, {
        systemName: name as SystemName,
        eventsPublished: 0,
        eventsReceived: 0,
        averageResponseTime: 0,
        errorRate: 0,
        lastHealthCheck: new Date(),
        dependencyStatus: {} as Record<SystemName, 'healthy' | 'degraded' | 'unhealthy'>
      });

      logger.info(`🔗 Registered system interface: ${name}@${config.version}`);
    });
  }

  /**
   * Register a system with the integration framework
   */
  async registerSystem(config: SystemIntegrationConfig): Promise<void> {
    this.systems.set(config.name, config);
    
    // Subscribe to events this system is interested in
    for (const eventType of config.eventSubscriptions) {
      if (!this.eventHandlers.has(eventType)) {
        this.eventHandlers.set(eventType, []);
      }
    }

    // Update health status
    const currentHealth = this.healthChecks.get(config.name);
    if (currentHealth) {
      currentHealth.status = HealthStatus.HEALTHY;
      currentHealth.lastCheck = new Date();
    }

    logger.info(`📋 System registered: ${config.name}@${config.version}`);
    
    // Publish system registration event
    await this.publishEvent({
      id: this.generateEventId(),
      source: 'integration-framework',
      type: 'system.registered',
      data: { systemName: config.name, version: config.version },
      timestamp: new Date(),
      priority: 'medium',
      retryable: false
    });
  }

  /**
   * Publish an event to the integration bus
   */
  async publishEvent(event: CrossSystemEvent): Promise<void> {
    try {
      // Ensure event has required fields
      const enrichedEvent: CrossSystemEvent = {
        ...event,
        priority: event.priority || 'medium',
        retryable: event.retryable !== false,
        timestamp: event.timestamp || new Date()
      };

      // Add correlation tracking
      if (enrichedEvent.correlationId) {
        const relatedEvents = this.correlationMap.get(enrichedEvent.correlationId) || [];
        relatedEvents.push(enrichedEvent.id);
        this.correlationMap.set(enrichedEvent.correlationId, relatedEvents);
      }

      // Store event in Redis for persistence and replay
      await this.redis.hSet(
        `scroll:events:${enrichedEvent.source}`,
        enrichedEvent.id,
        JSON.stringify(enrichedEvent)
      );

      // Add to processing queue based on priority
      if (enrichedEvent.priority === 'critical') {
        this.eventQueue.unshift(enrichedEvent);
      } else {
        this.eventQueue.push(enrichedEvent);
      }

      // Start processing if not already running
      if (!this.processingEvents) {
        this.processEventQueue();
      }

      // Update metrics
      const sourceMetrics = this.metrics.get(enrichedEvent.source as SystemName);
      if (sourceMetrics) {
        sourceMetrics.eventsPublished++;
      }

      // Publish to Redis pub/sub for external systems
      await this.redis.publish('scroll:integration:events', JSON.stringify(enrichedEvent));

      // Emit locally for immediate handlers
      this.emit(enrichedEvent.type, enrichedEvent);

      logger.info(`📡 Event published: ${enrichedEvent.type} from ${enrichedEvent.source} (priority: ${enrichedEvent.priority})`);
    } catch (error) {
      logger.error('Failed to publish event:', error);
      throw error;
    }
  }

  /**
   * Subscribe to specific event types
   */
  subscribeToEvent(eventType: string, handler: (event: SystemEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    this.on(eventType, handler);
    
    logger.info(`👂 Subscribed to event: ${eventType}`);
  }

  /**
   * Process event queue with priority handling
   */
  private async processEventQueue(): Promise<void> {
    if (this.processingEvents || this.eventQueue.length === 0) {
      return;
    }

    this.processingEvents = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        
        // Check if event has expired
        if (event.expiresAt && event.expiresAt < new Date()) {
          logger.warn(`Event expired: ${event.type} from ${event.source}`);
          continue;
        }

        await this.handleSystemEvent(event);
      }
    } catch (error) {
      logger.error('Error processing event queue:', error);
    } finally {
      this.processingEvents = false;
    }
  }

  /**
   * Handle incoming system events
   */
  private async handleSystemEvent(event: CrossSystemEvent): Promise<void> {
    try {
      // Log event for monitoring
      logger.info(`📨 Processing event: ${event.type} from ${event.source} (priority: ${event.priority})`);

      // Update metrics
      const sourceMetrics = this.metrics.get(event.source as SystemName);
      if (sourceMetrics) {
        sourceMetrics.eventsReceived++;
      }

      // Execute registered handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      const wildcardHandlers = this.eventHandlers.get('*') || [];
      
      const allHandlers = [...handlers, ...wildcardHandlers];
      
      for (const handler of allHandlers) {
        try {
          const startTime = Date.now();
          await handler(event);
          const responseTime = Date.now() - startTime;
          
          // Update response time metrics
          if (sourceMetrics) {
            sourceMetrics.averageResponseTime = 
              (sourceMetrics.averageResponseTime + responseTime) / 2;
          }
        } catch (error) {
          logger.error(`Handler failed for event ${event.type}:`, error);
          
          // Update error rate metrics
          if (sourceMetrics) {
            sourceMetrics.errorRate++;
          }

          // Retry if event is retryable
          if (event.retryable && event.priority === 'critical') {
            setTimeout(() => {
              this.eventQueue.unshift(event);
              this.processEventQueue();
            }, 1000);
          }
        }
      }

      // Update system health based on events
      const systemName = event.source as SystemName;
      const healthStatus = this.healthChecks.get(systemName);
      
      if (healthStatus) {
        if (event.type.endsWith('.health.ok')) {
          healthStatus.status = HealthStatus.HEALTHY;
          healthStatus.lastCheck = new Date();
        } else if (event.type.endsWith('.health.failed')) {
          healthStatus.status = HealthStatus.UNHEALTHY;
          healthStatus.lastCheck = new Date();
        } else if (event.type.endsWith('.error')) {
          healthStatus.status = HealthStatus.DEGRADED;
          healthStatus.lastCheck = new Date();
        }
      }

    } catch (error) {
      logger.error('Failed to handle system event:', error);
    }
  }

  /**
   * Get comprehensive system health status
   */
  getSystemHealth(): Record<SystemName, IntegrationHealth> {
    const health: Record<SystemName, IntegrationHealth> = {} as Record<SystemName, IntegrationHealth>;
    for (const [system, status] of this.healthChecks) {
      health[system] = status;
    }
    return health;
  }

  /**
   * Get system dependencies
   */
  getSystemDependencies(systemName: SystemName): SystemName[] {
    const system = this.systems.get(systemName);
    return system?.dependencies || [];
  }

  /**
   * Check if all dependencies are healthy
   */
  areDependenciesHealthy(systemName: SystemName): boolean {
    const dependencies = this.getSystemDependencies(systemName);
    return dependencies.every(dep => {
      const health = this.healthChecks.get(dep);
      return health?.status === HealthStatus.HEALTHY;
    });
  }

  /**
   * Get detailed system metrics
   */
  getSystemMetrics(systemName?: SystemName): IntegrationMetrics | Record<SystemName, IntegrationMetrics> {
    if (systemName) {
      return this.metrics.get(systemName) || {} as IntegrationMetrics;
    }
    
    const allMetrics: Record<SystemName, IntegrationMetrics> = {} as Record<SystemName, IntegrationMetrics>;
    for (const [system, metrics] of this.metrics) {
      allMetrics[system] = metrics;
    }
    return allMetrics;
  }

  /**
   * Perform health check on specific system
   */
  async performHealthCheck(systemName: SystemName): Promise<IntegrationHealth> {
    const system = this.systems.get(systemName);
    const currentHealth = this.healthChecks.get(systemName);
    
    if (!system || !currentHealth) {
      throw new Error(`System ${systemName} not found`);
    }

    try {
      const startTime = Date.now();
      
      // This would typically make an HTTP request to the health endpoint
      // For now, we'll simulate the health check
      const isHealthy = Math.random() > 0.1; // 90% healthy simulation
      const responseTime = Date.now() - startTime;
      
      const updatedHealth: IntegrationHealth = {
        ...currentHealth,
        status: isHealthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        responseTime,
        dependencies: system.dependencies.map(dep => ({
          name: dep,
          status: this.healthChecks.get(dep)?.status || HealthStatus.UNKNOWN,
          lastCheck: new Date(),
          responseTime: 0
        }))
      };

      this.healthChecks.set(systemName, updatedHealth);
      
      // Publish health event
      await this.publishEvent({
        id: this.generateEventId(),
        source: systemName,
        type: isHealthy ? `${systemName}.health.ok` : `${systemName}.health.failed`,
        data: { healthy: isHealthy, responseTime, timestamp: new Date() },
        timestamp: new Date(),
        priority: isHealthy ? 'low' : 'high',
        retryable: false
      });

      return updatedHealth;
      
    } catch (error) {
      logger.error(`Health check failed for ${systemName}:`, error);
      
      const failedHealth: IntegrationHealth = {
        ...currentHealth,
        status: HealthStatus.UNHEALTHY,
        lastCheck: new Date(),
        responseTime: -1
      };
      
      this.healthChecks.set(systemName, failedHealth);
      return failedHealth;
    }
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats(): {
    registeredSystems: number;
    healthySystems: number;
    totalEvents: number;
    eventTypes: string[];
    systemInterfaces: number;
  } {
    const healthySystems = Array.from(this.healthChecks.values()).filter(h => h).length;
    const eventTypes = Array.from(this.eventHandlers.keys());
    
    return {
      registeredSystems: this.systems.size,
      healthySystems,
      totalEvents: this.listenerCount('*'),
      eventTypes,
      systemInterfaces: this.systemInterfaces.size
    };
  }

  /**
   * Get event correlation chain
   */
  getEventCorrelation(correlationId: string): string[] {
    return this.correlationMap.get(correlationId) || [];
  }

  /**
   * Create a new correlation ID for tracking related events
   */
  createCorrelationId(): string {
    return `scroll-corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Comprehensive integration testing framework
   */
  async runIntegrationTests(): Promise<{
    passed: number;
    failed: number;
    results: IntegrationTestResult[];
  }> {
    const results: IntegrationTestResult[] = [];
    let passed = 0;
    let failed = 0;

    logger.info('🧪 Starting comprehensive integration tests...');

    // Test 1: System Registration
    for (const systemName of Object.keys(SCROLL_UNIVERSITY_SYSTEM_INTERFACES) as SystemName[]) {
      const testResult = await this.testSystemRegistration(systemName);
      results.push(testResult);
      testResult.passed ? passed++ : failed++;
    }

    // Test 2: Event Flow Testing
    const eventFlowResult = await this.testEventFlow();
    results.push(eventFlowResult);
    eventFlowResult.passed ? passed++ : failed++;

    // Test 3: Dependency Chain Testing
    const dependencyResult = await this.testDependencyChains();
    results.push(dependencyResult);
    dependencyResult.passed ? passed++ : failed++;

    // Test 4: Cross-System Communication
    const communicationResult = await this.testCrossSystemCommunication();
    results.push(communicationResult);
    communicationResult.passed ? passed++ : failed++;

    // Test 5: Health Monitoring
    const healthResult = await this.testHealthMonitoring();
    results.push(healthResult);
    healthResult.passed ? passed++ : failed++;

    logger.info(`🧪 Integration tests completed: ${passed} passed, ${failed} failed`);

    return { passed, failed, results };
  }

  private async testSystemRegistration(systemName: SystemName): Promise<IntegrationTestResult> {
    try {
      const systemInterface = this.systemInterfaces.get(systemName);
      const systemConfig = this.systems.get(systemName);
      
      const issues: string[] = [];
      
      if (!systemInterface) {
        issues.push(`System interface not found for ${systemName}`);
      }
      
      if (!systemConfig) {
        issues.push(`System configuration not found for ${systemName}`);
      } else {
        // Validate event subscriptions have publishers
        for (const eventType of systemConfig.eventSubscriptions) {
          const hasPublisher = Array.from(this.systemInterfaces.values())
            .some(iface => iface.events.publishes.includes(eventType));
          
          if (!hasPublisher) {
            issues.push(`No publisher found for event: ${eventType}`);
          }
        }
      }

      return {
        testName: `System Registration: ${systemName}`,
        passed: issues.length === 0,
        issues,
        duration: 0,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: `System Registration: ${systemName}`,
        passed: false,
        issues: [`Test failed with error: ${error}`],
        duration: 0,
        timestamp: new Date()
      };
    }
  }

  private async testEventFlow(): Promise<IntegrationTestResult> {
    try {
      const testEvent: CrossSystemEvent = {
        id: this.generateEventId(),
        source: 'integration-test',
        type: 'test.event.flow',
        data: { test: true },
        timestamp: new Date(),
        priority: 'medium',
        retryable: false
      };

      let eventReceived = false;
      const handler = () => { eventReceived = true; };
      
      this.subscribeToEvent('test.event.flow', handler);
      await this.publishEvent(testEvent);
      
      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        testName: 'Event Flow Test',
        passed: eventReceived,
        issues: eventReceived ? [] : ['Test event was not received'],
        duration: 100,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        testName: 'Event Flow Test',
        passed: false,
        issues: [`Test failed with error: ${error}`],
        duration: 0,
        timestamp: new Date()
      };
    }
  }

  private async testDependencyChains(): Promise<IntegrationTestResult> {
    const issues: string[] = [];
    
    for (const [systemName, config] of this.systems) {
      for (const dependency of config.dependencies) {
        if (!this.systems.has(dependency)) {
          issues.push(`${systemName} depends on unregistered system: ${dependency}`);
        }
      }
    }

    // Check for circular dependencies
    const visited = new Set<SystemName>();
    const recursionStack = new Set<SystemName>();
    
    const hasCircularDependency = (system: SystemName): boolean => {
      if (recursionStack.has(system)) return true;
      if (visited.has(system)) return false;
      
      visited.add(system);
      recursionStack.add(system);
      
      const config = this.systems.get(system);
      if (config) {
        for (const dep of config.dependencies) {
          if (hasCircularDependency(dep)) return true;
        }
      }
      
      recursionStack.delete(system);
      return false;
    };

    for (const systemName of this.systems.keys()) {
      if (hasCircularDependency(systemName)) {
        issues.push(`Circular dependency detected involving: ${systemName}`);
      }
    }

    return {
      testName: 'Dependency Chain Test',
      passed: issues.length === 0,
      issues,
      duration: 0,
      timestamp: new Date()
    };
  }

  private async testCrossSystemCommunication(): Promise<IntegrationTestResult> {
    const issues: string[] = [];
    
    // Test critical communication paths
    const criticalPaths = [
      { from: 'scroll-university-platform', to: 'scroll-student-profile-spec', event: 'user.created' },
      { from: 'scroll-course-spec', to: 'scroll-scrollcoin-meter', event: 'course.completed' },
      { from: 'scroll-assessment-engine', to: 'scroll-seal-certification', event: 'assessment.passed' },
      { from: 'scroll-prayer-integration-spec', to: 'scroll-mentorship-network-spec', event: 'prayer.answered' }
    ];

    for (const path of criticalPaths) {
      const fromInterface = this.systemInterfaces.get(path.from as SystemName);
      const toInterface = this.systemInterfaces.get(path.to as SystemName);
      
      if (!fromInterface?.events.publishes.includes(path.event)) {
        issues.push(`${path.from} does not publish required event: ${path.event}`);
      }
      
      if (!toInterface?.events.subscribes.includes(path.event)) {
        issues.push(`${path.to} does not subscribe to required event: ${path.event}`);
      }
    }

    return {
      testName: 'Cross-System Communication Test',
      passed: issues.length === 0,
      issues,
      duration: 0,
      timestamp: new Date()
    };
  }

  private async testHealthMonitoring(): Promise<IntegrationTestResult> {
    const issues: string[] = [];
    
    // Test health check for each system
    for (const systemName of this.systems.keys()) {
      try {
        const health = await this.performHealthCheck(systemName);
        if (health.status === HealthStatus.UNKNOWN) {
          issues.push(`Health status unknown for: ${systemName}`);
        }
      } catch (error) {
        issues.push(`Health check failed for ${systemName}: ${error}`);
      }
    }

    return {
      testName: 'Health Monitoring Test',
      passed: issues.length === 0,
      issues,
      duration: 0,
      timestamp: new Date()
    };
  }

  /**
   * Validate system integration
   */
  async validateIntegration(systemName: SystemName): Promise<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const system = this.systems.get(systemName);
    const systemInterface = this.systemInterfaces.get(systemName);

    if (!system) {
      issues.push(`System ${systemName} is not registered`);
      return { valid: false, issues, recommendations };
    }

    if (!systemInterface) {
      issues.push(`System interface for ${systemName} is not defined`);
      recommendations.push('Define system interface with endpoints and events');
    }

    // Check dependencies
    for (const dependency of system.dependencies) {
      if (!this.systems.has(dependency)) {
        issues.push(`Dependency ${dependency} is not registered`);
        recommendations.push(`Register dependency: ${dependency}`);
      } else {
        const depHealth = this.healthChecks.get(dependency);
        if (depHealth?.status !== HealthStatus.HEALTHY) {
          issues.push(`Dependency ${dependency} is unhealthy`);
          recommendations.push(`Check health of dependency: ${dependency}`);
        }
      }
    }

    // Check event subscriptions
    for (const eventType of system.eventSubscriptions) {
      const publishers = Array.from(this.systemInterfaces.values())
        .filter(iface => iface.events.publishes.includes(eventType));
      
      if (publishers.length === 0) {
        issues.push(`No publishers found for subscribed event: ${eventType}`);
        recommendations.push(`Ensure a system publishes event: ${eventType}`);
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    };
  }

  private startHealthMonitoring(): void {
    setInterval(async () => {
      for (const [systemName, config] of this.systems) {
        try {
          await this.performHealthCheck(systemName);
        } catch (error) {
          logger.error(`Health check failed for ${systemName}:`, error);
        }
      }
      
      // Check for alerts after health checks
      await this.checkForAlerts();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Monitoring and alerting for cross-system dependencies
   */
  private async checkForAlerts(): Promise<void> {
    for (const [systemName, health] of this.healthChecks) {
      const metrics = this.metrics.get(systemName);
      
      // Check for system down
      if (health.status === HealthStatus.UNHEALTHY) {
        await this.createAlert({
          type: AlertType.SYSTEM_DOWN,
          severity: AlertSeverity.CRITICAL,
          systemName,
          message: `System ${systemName} is unhealthy`
        });
      }
      
      // Check for high error rate
      if (metrics && metrics.errorRate > 10) {
        await this.createAlert({
          type: AlertType.HIGH_ERROR_RATE,
          severity: AlertSeverity.HIGH,
          systemName,
          message: `High error rate detected for ${systemName}: ${metrics.errorRate} errors`
        });
      }
      
      // Check dependency failures
      for (const dep of this.getSystemDependencies(systemName)) {
        const depHealth = this.healthChecks.get(dep);
        if (depHealth?.status === HealthStatus.UNHEALTHY) {
          await this.createAlert({
            type: AlertType.DEPENDENCY_FAILURE,
            severity: AlertSeverity.HIGH,
            systemName,
            message: `Dependency ${dep} is unhealthy, affecting ${systemName}`
          });
        }
      }
    }
  }

  private async createAlert(alertData: Omit<IntegrationAlert, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const alert: IntegrationAlert = {
      ...alertData,
      id: this.generateEventId(),
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(alert.id, alert);
    
    // Notify alert handlers
    for (const handler of this.alertHandlers) {
      try {
        await handler(alert);
      } catch (error) {
        logger.error('Alert handler failed:', error);
      }
    }

    // Publish alert event
    await this.publishEvent({
      id: this.generateEventId(),
      source: 'integration-framework',
      type: 'integration.alert',
      data: alert,
      timestamp: new Date(),
      priority: alert.severity === AlertSeverity.CRITICAL ? 'critical' : 'high',
      retryable: false
    });

    logger.warn(`🚨 Alert created: ${alert.type} for ${alert.systemName} - ${alert.message}`);
  }

  /**
   * Subscribe to integration alerts
   */
  subscribeToAlerts(handler: (alert: IntegrationAlert) => void): void {
    this.alertHandlers.push(handler);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): IntegrationAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      
      await this.publishEvent({
        id: this.generateEventId(),
        source: 'integration-framework',
        type: 'integration.alert.resolved',
        data: alert,
        timestamp: new Date(),
        priority: 'medium',
        retryable: false
      });

      logger.info(`✅ Alert resolved: ${alertId}`);
    }
  }

  /**
   * Get comprehensive integration dashboard data
   */
  getIntegrationDashboard(): {
    systemHealth: Record<SystemName, IntegrationHealth>;
    metrics: Record<SystemName, IntegrationMetrics>;
    activeAlerts: IntegrationAlert[];
    eventQueueSize: number;
    totalSystems: number;
    healthySystems: number;
  } {
    const systemHealth = this.getSystemHealth();
    const metrics = this.getSystemMetrics() as Record<SystemName, IntegrationMetrics>;
    const activeAlerts = this.getActiveAlerts();
    const healthySystems = Object.values(systemHealth).filter(h => h.status === HealthStatus.HEALTHY).length;

    return {
      systemHealth,
      metrics,
      activeAlerts,
      eventQueueSize: this.eventQueue.length,
      totalSystems: this.systems.size,
      healthySystems
    };
  }

  private generateEventId(): string {
    return `scroll-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async shutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
    this.removeAllListeners();
    logger.info('🛑 Integration Framework shutdown complete');
  }
}

// Integration test result interface
export interface IntegrationTestResult {
  testName: string;
  passed: boolean;
  issues: string[];
  duration: number;
  timestamp: Date;
}

// Monitoring and alerting interfaces
export interface IntegrationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  systemName: SystemName;
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export enum AlertType {
  SYSTEM_DOWN = 'system_down',
  HIGH_ERROR_RATE = 'high_error_rate',
  DEPENDENCY_FAILURE = 'dependency_failure',
  EVENT_PROCESSING_DELAY = 'event_processing_delay',
  INTEGRATION_FAILURE = 'integration_failure'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export const integrationFramework = new IntegrationFramework();