import { createClient } from 'redis';
import { logger } from '../../backend/src/utils/logger';

export interface ServiceInstance {
  id: string;
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: 'http' | 'https';
  healthCheckPath: string;
  metadata: Record<string, any>;
  registeredAt: Date;
  lastHeartbeat: Date;
  status: 'healthy' | 'unhealthy' | 'unknown';
}

export interface ServiceRegistration {
  name: string;
  version: string;
  host: string;
  port: number;
  protocol?: 'http' | 'https';
  healthCheckPath?: string;
  metadata?: Record<string, any>;
}

export class ServiceDiscoveryService {
  private redis: any;
  private services: Map<string, ServiceInstance[]> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeRedis();
    this.startHeartbeatMonitoring();
    this.startCleanupProcess();
  }

  private async initializeRedis() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    try {
      await this.redis.connect();
      logger.info('✅ Service Discovery Redis connected');
      await this.loadServicesFromRedis();
    } catch (error) {
      logger.error('❌ Service Discovery Redis connection failed:', error);
    }
  }

  /**
   * Register a service instance
   */
  async registerService(registration: ServiceRegistration): Promise<string> {
    const serviceId = this.generateServiceId(registration.name, registration.host, registration.port);
    
    const instance: ServiceInstance = {
      id: serviceId,
      name: registration.name,
      version: registration.version,
      host: registration.host,
      port: registration.port,
      protocol: registration.protocol || 'http',
      healthCheckPath: registration.healthCheckPath || '/health',
      metadata: registration.metadata || {},
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
      status: 'unknown'
    };

    // Add to local cache
    if (!this.services.has(registration.name)) {
      this.services.set(registration.name, []);
    }
    
    const serviceInstances = this.services.get(registration.name)!;
    const existingIndex = serviceInstances.findIndex(s => s.id === serviceId);
    
    if (existingIndex >= 0) {
      serviceInstances[existingIndex] = instance;
    } else {
      serviceInstances.push(instance);
    }

    // Store in Redis
    await this.redis.hSet(
      `service:${registration.name}`,
      serviceId,
      JSON.stringify(instance)
    );

    logger.info(`🔗 Service registered: ${registration.name}@${registration.version} (${serviceId})`);
    
    return serviceId;
  }

  /**
   * Unregister a service instance
   */
  async unregisterService(serviceName: string, serviceId: string): Promise<void> {
    // Remove from local cache
    const serviceInstances = this.services.get(serviceName);
    if (serviceInstances) {
      const filteredInstances = serviceInstances.filter(s => s.id !== serviceId);
      this.services.set(serviceName, filteredInstances);
    }

    // Remove from Redis
    await this.redis.hDel(`service:${serviceName}`, serviceId);

    logger.info(`🔌 Service unregistered: ${serviceName} (${serviceId})`);
  }

  /**
   * Get all instances of a service
   */
  async getServiceInstances(serviceName: string): Promise<ServiceInstance[]> {
    const instances = this.services.get(serviceName) || [];
    return instances.filter(instance => instance.status === 'healthy');
  }

  /**
   * Get a service instance using load balancing
   */
  async getServiceInstance(serviceName: string, strategy: 'round-robin' | 'random' | 'least-connections' = 'round-robin'): Promise<ServiceInstance | null> {
    const instances = await this.getServiceInstances(serviceName);
    
    if (instances.length === 0) {
      return null;
    }

    switch (strategy) {
      case 'random':
        return instances[Math.floor(Math.random() * instances.length)];
      
      case 'least-connections':
        // TODO: Implement least connections logic
        return instances[0];
      
      case 'round-robin':
      default:
        return this.getRoundRobinInstance(serviceName, instances);
    }
  }

  /**
   * Update service heartbeat
   */
  async updateHeartbeat(serviceName: string, serviceId: string): Promise<void> {
    const serviceInstances = this.services.get(serviceName);
    if (serviceInstances) {
      const instance = serviceInstances.find(s => s.id === serviceId);
      if (instance) {
        instance.lastHeartbeat = new Date();
        
        // Update in Redis
        await this.redis.hSet(
          `service:${serviceName}`,
          serviceId,
          JSON.stringify(instance)
        );
      }
    }
  }

  /**
   * Update service health status
   */
  async updateServiceHealth(serviceName: string, serviceId: string, status: 'healthy' | 'unhealthy'): Promise<void> {
    const serviceInstances = this.services.get(serviceName);
    if (serviceInstances) {
      const instance = serviceInstances.find(s => s.id === serviceId);
      if (instance) {
        instance.status = status;
        instance.lastHeartbeat = new Date();
        
        // Update in Redis
        await this.redis.hSet(
          `service:${serviceName}`,
          serviceId,
          JSON.stringify(instance)
        );

        logger.info(`💓 Service health updated: ${serviceName} (${serviceId}) -> ${status}`);
      }
    }
  }

  /**
   * Get all registered services
   */
  async getAllServices(): Promise<Record<string, ServiceInstance[]>> {
    const result: Record<string, ServiceInstance[]> = {};
    
    for (const [serviceName, instances] of this.services) {
      result[serviceName] = instances;
    }
    
    return result;
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<{
    totalServices: number;
    totalInstances: number;
    healthyInstances: number;
    unhealthyInstances: number;
    serviceBreakdown: Record<string, { total: number; healthy: number; unhealthy: number }>;
  }> {
    let totalInstances = 0;
    let healthyInstances = 0;
    let unhealthyInstances = 0;
    const serviceBreakdown: Record<string, { total: number; healthy: number; unhealthy: number }> = {};

    for (const [serviceName, instances] of this.services) {
      const healthy = instances.filter(i => i.status === 'healthy').length;
      const unhealthy = instances.filter(i => i.status === 'unhealthy').length;
      
      serviceBreakdown[serviceName] = {
        total: instances.length,
        healthy,
        unhealthy
      };

      totalInstances += instances.length;
      healthyInstances += healthy;
      unhealthyInstances += unhealthy;
    }

    return {
      totalServices: this.services.size,
      totalInstances,
      healthyInstances,
      unhealthyInstances,
      serviceBreakdown
    };
  }

  private async loadServicesFromRedis(): Promise<void> {
    try {
      const keys = await this.redis.keys('service:*');
      
      for (const key of keys) {
        const serviceName = key.replace('service:', '');
        const serviceData = await this.redis.hGetAll(key);
        
        const instances: ServiceInstance[] = [];
        for (const [serviceId, instanceData] of Object.entries(serviceData)) {
          try {
            const instance = JSON.parse(instanceData as string);
            instance.registeredAt = new Date(instance.registeredAt);
            instance.lastHeartbeat = new Date(instance.lastHeartbeat);
            instances.push(instance);
          } catch (error) {
            logger.error(`Failed to parse service instance data for ${serviceId}:`, error);
          }
        }
        
        this.services.set(serviceName, instances);
        logger.info(`📥 Loaded ${instances.length} instances for service: ${serviceName}`);
      }
    } catch (error) {
      logger.error('Failed to load services from Redis:', error);
    }
  }

  private getRoundRobinInstance(serviceName: string, instances: ServiceInstance[]): ServiceInstance {
    const key = `rr:${serviceName}`;
    const currentIndex = parseInt(process.env[key] || '0', 10);
    const nextIndex = (currentIndex + 1) % instances.length;
    
    process.env[key] = nextIndex.toString();
    
    return instances[currentIndex];
  }

  private generateServiceId(name: string, host: string, port: number): string {
    return `${name}-${host}-${port}-${Date.now()}`;
  }

  private startHeartbeatMonitoring(): void {
    this.heartbeatInterval = setInterval(async () => {
      const now = new Date();
      const staleThreshold = 60000; // 1 minute

      for (const [serviceName, instances] of this.services) {
        for (const instance of instances) {
          const timeSinceHeartbeat = now.getTime() - instance.lastHeartbeat.getTime();
          
          if (timeSinceHeartbeat > staleThreshold && instance.status !== 'unhealthy') {
            await this.updateServiceHealth(serviceName, instance.id, 'unhealthy');
            logger.warn(`💔 Service marked unhealthy due to stale heartbeat: ${serviceName} (${instance.id})`);
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      const now = new Date();
      const cleanupThreshold = 300000; // 5 minutes

      for (const [serviceName, instances] of this.services) {
        const activeInstances = instances.filter(instance => {
          const timeSinceHeartbeat = now.getTime() - instance.lastHeartbeat.getTime();
          return timeSinceHeartbeat <= cleanupThreshold;
        });

        if (activeInstances.length !== instances.length) {
          this.services.set(serviceName, activeInstances);
          
          // Update Redis
          await this.redis.del(`service:${serviceName}`);
          for (const instance of activeInstances) {
            await this.redis.hSet(
              `service:${serviceName}`,
              instance.id,
              JSON.stringify(instance)
            );
          }

          const removedCount = instances.length - activeInstances.length;
          logger.info(`🧹 Cleaned up ${removedCount} stale instances for service: ${serviceName}`);
        }
      }
    }, 120000); // Cleanup every 2 minutes
  }

  async shutdown(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.redis) {
      await this.redis.disconnect();
    }
    
    logger.info('🛑 Service Discovery shutdown complete');
  }
}

export const serviceDiscoveryService = new ServiceDiscoveryService();