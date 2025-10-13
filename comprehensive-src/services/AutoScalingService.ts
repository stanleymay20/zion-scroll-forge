import { EventEmitter } from 'events';

export interface ScalingConfiguration {
  minInstances: number;
  maxInstances: number;
  targetCPUUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number; // seconds
  scaleDownCooldown: number; // seconds
  regions: string[];
  instanceTypes: InstanceType[];
}

export interface InstanceType {
  name: string;
  cpu: number;
  memory: number; // GB
  cost: number; // per hour
  capabilities: string[];
}

export interface ScalingMetrics {
  cpuUtilization: number;
  memoryUtilization: number;
  requestsPerSecond: number;
  responseTime: number;
  activeConnections: number;
  timestamp: Date;
}

export interface ScalingEvent {
  type: 'scale_up' | 'scale_down';
  reason: string;
  instancesAdded: number;
  instancesRemoved: number;
  totalInstances: number;
  timestamp: Date;
}

export interface ServiceInstance {
  id: string;
  region: string;
  type: InstanceType;
  status: 'starting' | 'running' | 'stopping' | 'stopped';
  startTime: Date;
  metrics: ScalingMetrics;
}

export class AutoScalingService extends EventEmitter {
  private config: ScalingConfiguration;
  private instances: Map<string, ServiceInstance> = new Map();
  private scalingHistory: ScalingEvent[] = [];
  private lastScaleUp: Date | null = null;
  private lastScaleDown: Date | null = null;
  private metricsBuffer: ScalingMetrics[] = [];

  constructor(config: ScalingConfiguration) {
    super();
    this.config = config;
    this.initializeMinimumInstances();
    this.startMetricsCollection();
  }

  private initializeMinimumInstances(): void {
    const instancesPerRegion = Math.ceil(this.config.minInstances / this.config.regions.length);
    
    this.config.regions.forEach(region => {
      for (let i = 0; i < instancesPerRegion; i++) {
        this.createInstance(region);
      }
    });
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
      this.evaluateScaling();
    }, 30000); // Check every 30 seconds
  }

  private async collectMetrics(): Promise<void> {
    const aggregatedMetrics = await this.aggregateInstanceMetrics();
    this.metricsBuffer.push(aggregatedMetrics);
    
    // Keep only last 10 minutes of metrics (20 data points)
    if (this.metricsBuffer.length > 20) {
      this.metricsBuffer = this.metricsBuffer.slice(-20);
    }

    this.emit('metricsCollected', aggregatedMetrics);
  }

  private async aggregateInstanceMetrics(): Promise<ScalingMetrics> {
    const runningInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'running');

    if (runningInstances.length === 0) {
      return {
        cpuUtilization: 0,
        memoryUtilization: 0,
        requestsPerSecond: 0,
        responseTime: 0,
        activeConnections: 0,
        timestamp: new Date()
      };
    }

    // Simulate metrics collection from actual instances
    const totalCpu = runningInstances.reduce((sum, instance) => 
      sum + (instance.metrics?.cpuUtilization || Math.random() * 100), 0);
    const totalMemory = runningInstances.reduce((sum, instance) => 
      sum + (instance.metrics?.memoryUtilization || Math.random() * 100), 0);
    const totalRequests = runningInstances.reduce((sum, instance) => 
      sum + (instance.metrics?.requestsPerSecond || Math.random() * 1000), 0);

    return {
      cpuUtilization: totalCpu / runningInstances.length,
      memoryUtilization: totalMemory / runningInstances.length,
      requestsPerSecond: totalRequests,
      responseTime: Math.random() * 500 + 100, // 100-600ms
      activeConnections: Math.floor(Math.random() * 10000),
      timestamp: new Date()
    };
  }

  private evaluateScaling(): void {
    if (this.metricsBuffer.length < 3) return; // Need at least 3 data points

    const recentMetrics = this.metricsBuffer.slice(-3);
    const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpuUtilization, 0) / recentMetrics.length;
    const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memoryUtilization, 0) / recentMetrics.length;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;

    const currentInstances = this.getRunningInstanceCount();

    // Scale up conditions
    if (this.shouldScaleUp(avgCpu, avgMemory, avgResponseTime, currentInstances)) {
      this.scaleUp();
    }
    // Scale down conditions
    else if (this.shouldScaleDown(avgCpu, avgMemory, avgResponseTime, currentInstances)) {
      this.scaleDown();
    }
  }

  private shouldScaleUp(avgCpu: number, avgMemory: number, avgResponseTime: number, currentInstances: number): boolean {
    if (currentInstances >= this.config.maxInstances) return false;
    if (this.lastScaleUp && this.isInCooldown(this.lastScaleUp, this.config.scaleUpCooldown)) return false;

    return (
      avgCpu > this.config.targetCPUUtilization ||
      avgMemory > this.config.targetMemoryUtilization ||
      avgResponseTime > 1000 // Response time threshold
    );
  }

  private shouldScaleDown(avgCpu: number, avgMemory: number, avgResponseTime: number, currentInstances: number): boolean {
    if (currentInstances <= this.config.minInstances) return false;
    if (this.lastScaleDown && this.isInCooldown(this.lastScaleDown, this.config.scaleDownCooldown)) return false;

    return (
      avgCpu < this.config.targetCPUUtilization * 0.5 &&
      avgMemory < this.config.targetMemoryUtilization * 0.5 &&
      avgResponseTime < 200
    );
  }

  private isInCooldown(lastAction: Date, cooldownSeconds: number): boolean {
    const now = new Date();
    const timeDiff = (now.getTime() - lastAction.getTime()) / 1000;
    return timeDiff < cooldownSeconds;
  }

  private async scaleUp(): Promise<void> {
    const currentInstances = this.getRunningInstanceCount();
    const instancesToAdd = Math.min(
      Math.ceil(currentInstances * 0.5), // Scale by 50%
      this.config.maxInstances - currentInstances
    );

    const regionsToScale = this.selectRegionsForScaling();
    const instancesPerRegion = Math.ceil(instancesToAdd / regionsToScale.length);

    let actualInstancesAdded = 0;
    for (const region of regionsToScale) {
      for (let i = 0; i < instancesPerRegion && actualInstancesAdded < instancesToAdd; i++) {
        await this.createInstance(region);
        actualInstancesAdded++;
      }
    }

    this.lastScaleUp = new Date();
    const event: ScalingEvent = {
      type: 'scale_up',
      reason: 'High resource utilization detected',
      instancesAdded: actualInstancesAdded,
      instancesRemoved: 0,
      totalInstances: this.getRunningInstanceCount(),
      timestamp: new Date()
    };

    this.scalingHistory.push(event);
    this.emit('scalingEvent', event);
  }

  private async scaleDown(): Promise<void> {
    const currentInstances = this.getRunningInstanceCount();
    const instancesToRemove = Math.min(
      Math.floor(currentInstances * 0.25), // Scale down by 25%
      currentInstances - this.config.minInstances
    );

    const instancesToTerminate = this.selectInstancesForTermination(instancesToRemove);
    
    let actualInstancesRemoved = 0;
    for (const instance of instancesToTerminate) {
      await this.terminateInstance(instance.id);
      actualInstancesRemoved++;
    }

    this.lastScaleDown = new Date();
    const event: ScalingEvent = {
      type: 'scale_down',
      reason: 'Low resource utilization detected',
      instancesAdded: 0,
      instancesRemoved: actualInstancesRemoved,
      totalInstances: this.getRunningInstanceCount(),
      timestamp: new Date()
    };

    this.scalingHistory.push(event);
    this.emit('scalingEvent', event);
  }

  private selectRegionsForScaling(): string[] {
    // Simple round-robin selection
    return this.config.regions;
  }

  private selectInstancesForTermination(count: number): ServiceInstance[] {
    const runningInstances = Array.from(this.instances.values())
      .filter(instance => instance.status === 'running')
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()); // Oldest first

    return runningInstances.slice(0, count);
  }

  private async createInstance(region: string): Promise<ServiceInstance> {
    const instanceType = this.selectOptimalInstanceType();
    const instance: ServiceInstance = {
      id: `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      region,
      type: instanceType,
      status: 'starting',
      startTime: new Date(),
      metrics: {
        cpuUtilization: 0,
        memoryUtilization: 0,
        requestsPerSecond: 0,
        responseTime: 0,
        activeConnections: 0,
        timestamp: new Date()
      }
    };

    this.instances.set(instance.id, instance);

    // Simulate instance startup time
    setTimeout(() => {
      instance.status = 'running';
      this.emit('instanceStarted', instance);
    }, 30000); // 30 seconds startup time

    return instance;
  }

  private selectOptimalInstanceType(): InstanceType {
    // Select based on current load and cost efficiency
    return this.config.instanceTypes[0]; // Simple selection for now
  }

  private async terminateInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) return;

    instance.status = 'stopping';
    
    // Simulate graceful shutdown
    setTimeout(() => {
      instance.status = 'stopped';
      this.instances.delete(instanceId);
      this.emit('instanceTerminated', instance);
    }, 10000); // 10 seconds shutdown time
  }

  private getRunningInstanceCount(): number {
    return Array.from(this.instances.values())
      .filter(instance => instance.status === 'running').length;
  }

  async forceScale(targetInstances: number): Promise<void> {
    const currentInstances = this.getRunningInstanceCount();
    
    if (targetInstances > currentInstances) {
      const instancesToAdd = Math.min(
        targetInstances - currentInstances,
        this.config.maxInstances - currentInstances
      );
      
      for (let i = 0; i < instancesToAdd; i++) {
        const region = this.config.regions[i % this.config.regions.length];
        await this.createInstance(region);
      }
    } else if (targetInstances < currentInstances) {
      const instancesToRemove = Math.max(
        currentInstances - targetInstances,
        currentInstances - this.config.minInstances
      );
      
      const instancesToTerminate = this.selectInstancesForTermination(instancesToRemove);
      for (const instance of instancesToTerminate) {
        await this.terminateInstance(instance.id);
      }
    }

    this.emit('forceScaleCompleted', { targetInstances, currentInstances: this.getRunningInstanceCount() });
  }

  getInstances(): ServiceInstance[] {
    return Array.from(this.instances.values());
  }

  getScalingHistory(): ScalingEvent[] {
    return this.scalingHistory.slice(-50); // Last 50 events
  }

  getCurrentMetrics(): ScalingMetrics | null {
    return this.metricsBuffer[this.metricsBuffer.length - 1] || null;
  }

  async updateConfiguration(newConfig: Partial<ScalingConfiguration>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    this.emit('configurationUpdated', this.config);
  }
}

export default AutoScalingService;