import { ServiceInstance } from './ServiceDiscoveryService';
import { logger } from '../../backend/src/utils/logger';

export interface LoadBalancingStrategy {
  name: string;
  selectInstance(instances: ServiceInstance[]): ServiceInstance | null;
}

export class RoundRobinStrategy implements LoadBalancingStrategy {
  name = 'round-robin';
  private counters = new Map<string, number>();

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;

    const serviceName = instances[0].name;
    const currentIndex = this.counters.get(serviceName) || 0;
    const nextIndex = (currentIndex + 1) % instances.length;
    
    this.counters.set(serviceName, nextIndex);
    return instances[currentIndex];
  }
}

export class RandomStrategy implements LoadBalancingStrategy {
  name = 'random';

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;
    return instances[Math.floor(Math.random() * instances.length)];
  }
}

export class WeightedRoundRobinStrategy implements LoadBalancingStrategy {
  name = 'weighted-round-robin';
  private counters = new Map<string, number>();

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;

    // For now, treat all instances as equal weight
    // In the future, this could use instance metadata for weights
    const serviceName = instances[0].name;
    const currentIndex = this.counters.get(serviceName) || 0;
    const nextIndex = (currentIndex + 1) % instances.length;
    
    this.counters.set(serviceName, nextIndex);
    return instances[currentIndex];
  }
}

export class LeastConnectionsStrategy implements LoadBalancingStrategy {
  name = 'least-connections';
  private connections = new Map<string, number>();

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;

    // Find instance with least connections
    let selectedInstance = instances[0];
    let minConnections = this.connections.get(selectedInstance.id) || 0;

    for (const instance of instances) {
      const connections = this.connections.get(instance.id) || 0;
      if (connections < minConnections) {
        selectedInstance = instance;
        minConnections = connections;
      }
    }

    // Increment connection count
    this.connections.set(selectedInstance.id, minConnections + 1);

    return selectedInstance;
  }

  releaseConnection(instanceId: string): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current - 1));
  }
}

export class HealthBasedStrategy implements LoadBalancingStrategy {
  name = 'health-based';
  private baseStrategy: LoadBalancingStrategy;

  constructor(baseStrategy: LoadBalancingStrategy = new RoundRobinStrategy()) {
    this.baseStrategy = baseStrategy;
  }

  selectInstance(instances: ServiceInstance[]): ServiceInstance | null {
    // Filter to only healthy instances
    const healthyInstances = instances.filter(instance => instance.status === 'healthy');
    
    if (healthyInstances.length === 0) {
      logger.warn('No healthy instances available, falling back to all instances');
      return this.baseStrategy.selectInstance(instances);
    }

    return this.baseStrategy.selectInstance(healthyInstances);
  }
}

export class LoadBalancerService {
  private strategies = new Map<string, LoadBalancingStrategy>();
  private defaultStrategy = 'health-based';

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    const strategies = [
      new RoundRobinStrategy(),
      new RandomStrategy(),
      new WeightedRoundRobinStrategy(),
      new LeastConnectionsStrategy(),
      new HealthBasedStrategy(new RoundRobinStrategy())
    ];

    strategies.forEach(strategy => {
      this.strategies.set(strategy.name, strategy);
    });

    logger.info(`🔄 Initialized ${strategies.length} load balancing strategies`);
  }

  /**
   * Select a service instance using the specified strategy
   */
  selectInstance(
    instances: ServiceInstance[], 
    strategyName: string = this.defaultStrategy
  ): ServiceInstance | null {
    const strategy = this.strategies.get(strategyName);
    
    if (!strategy) {
      logger.warn(`Unknown load balancing strategy: ${strategyName}, using default`);
      return this.strategies.get(this.defaultStrategy)!.selectInstance(instances);
    }

    const selected = strategy.selectInstance(instances);
    
    if (selected) {
      logger.debug(`🎯 Load balancer selected instance: ${selected.id} using ${strategyName}`);
    }

    return selected;
  }

  /**
   * Release a connection (for least-connections strategy)
   */
  releaseConnection(instanceId: string): void {
    const leastConnectionsStrategy = this.strategies.get('least-connections') as LeastConnectionsStrategy;
    if (leastConnectionsStrategy) {
      leastConnectionsStrategy.releaseConnection(instanceId);
    }
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Set default strategy
   */
  setDefaultStrategy(strategyName: string): boolean {
    if (this.strategies.has(strategyName)) {
      this.defaultStrategy = strategyName;
      logger.info(`🔄 Default load balancing strategy set to: ${strategyName}`);
      return true;
    }
    return false;
  }

  /**
   * Get load balancing statistics
   */
  getStatistics(): {
    strategies: string[];
    defaultStrategy: string;
    activeConnections: Record<string, number>;
  } {
    const leastConnectionsStrategy = this.strategies.get('least-connections') as LeastConnectionsStrategy;
    const activeConnections: Record<string, number> = {};

    if (leastConnectionsStrategy) {
      // Access private connections map through reflection (for statistics only)
      const connections = (leastConnectionsStrategy as any).connections as Map<string, number>;
      for (const [instanceId, count] of connections) {
        activeConnections[instanceId] = count;
      }
    }

    return {
      strategies: this.getAvailableStrategies(),
      defaultStrategy: this.defaultStrategy,
      activeConnections
    };
  }
}

export const loadBalancerService = new LoadBalancerService();