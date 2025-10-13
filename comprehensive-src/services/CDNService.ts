import { EventEmitter } from 'events';

export interface CDNConfiguration {
  provider: 'cloudflare' | 'aws' | 'azure' | 'custom';
  regions: string[];
  cacheRules: CacheRule[];
  compressionEnabled: boolean;
  minificationEnabled: boolean;
  imageOptimization: boolean;
}

export interface CacheRule {
  pattern: string;
  ttl: number;
  headers: Record<string, string>;
  bypassConditions?: string[];
}

export interface CDNMetrics {
  hitRatio: number;
  bandwidth: number;
  requests: number;
  latency: number;
  errors: number;
  timestamp: Date;
}

export interface ContentDeliveryRequest {
  url: string;
  region: string;
  contentType: string;
  size: number;
  cacheStatus: 'hit' | 'miss' | 'stale';
}

export class CDNService extends EventEmitter {
  private config: CDNConfiguration;
  private metrics: Map<string, CDNMetrics[]> = new Map();
  private edgeServers: Map<string, EdgeServer> = new Map();

  constructor(config: CDNConfiguration) {
    super();
    this.config = config;
    this.initializeEdgeServers();
  }

  private initializeEdgeServers(): void {
    this.config.regions.forEach(region => {
      this.edgeServers.set(region, new EdgeServer(region, this.config));
    });
  }

  async optimizeContentDelivery(request: ContentDeliveryRequest): Promise<string> {
    const nearestEdge = this.findNearestEdgeServer(request.region);
    
    // Check cache first
    const cachedContent = await nearestEdge.getFromCache(request.url);
    if (cachedContent) {
      this.recordMetrics(request.region, { ...request, cacheStatus: 'hit' });
      return cachedContent;
    }

    // Fetch from origin and cache
    const content = await this.fetchFromOrigin(request.url);
    const optimizedContent = await this.optimizeContent(content, request.contentType);
    
    await nearestEdge.cacheContent(request.url, optimizedContent);
    this.recordMetrics(request.region, { ...request, cacheStatus: 'miss' });
    
    return optimizedContent;
  }

  private findNearestEdgeServer(region: string): EdgeServer {
    // Simple region matching - in production would use geolocation
    const server = this.edgeServers.get(region);
    if (server) return server;
    
    // Fallback to first available server
    return Array.from(this.edgeServers.values())[0];
  }

  private async fetchFromOrigin(url: string): Promise<string> {
    // Simulate origin fetch
    return `Content for ${url}`;
  }

  private async optimizeContent(content: string, contentType: string): Promise<string> {
    let optimized = content;

    if (this.config.compressionEnabled) {
      optimized = this.compressContent(optimized);
    }

    if (this.config.minificationEnabled && this.isMinifiable(contentType)) {
      optimized = this.minifyContent(optimized, contentType);
    }

    if (this.config.imageOptimization && this.isImage(contentType)) {
      optimized = await this.optimizeImage(optimized);
    }

    return optimized;
  }

  private compressContent(content: string): string {
    // Simulate compression (gzip/brotli)
    return content; // In production, use actual compression
  }

  private minifyContent(content: string, contentType: string): string {
    // Simulate minification for JS/CSS/HTML
    if (contentType.includes('javascript') || contentType.includes('css')) {
      return content.replace(/\s+/g, ' ').trim();
    }
    return content;
  }

  private async optimizeImage(content: string): Promise<string> {
    // Simulate image optimization (WebP conversion, compression)
    return content;
  }

  private isMinifiable(contentType: string): boolean {
    return ['javascript', 'css', 'html'].some(type => contentType.includes(type));
  }

  private isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  private recordMetrics(region: string, request: ContentDeliveryRequest): void {
    const regionMetrics = this.metrics.get(region) || [];
    const currentMetrics: CDNMetrics = {
      hitRatio: this.calculateHitRatio(region),
      bandwidth: request.size,
      requests: 1,
      latency: Math.random() * 100, // Simulate latency
      errors: 0,
      timestamp: new Date()
    };

    regionMetrics.push(currentMetrics);
    this.metrics.set(region, regionMetrics.slice(-100)); // Keep last 100 metrics

    this.emit('metrics', { region, metrics: currentMetrics });
  }

  private calculateHitRatio(region: string): number {
    const regionMetrics = this.metrics.get(region) || [];
    if (regionMetrics.length === 0) return 0;

    const recentMetrics = regionMetrics.slice(-10);
    const hits = recentMetrics.filter(m => m.hitRatio > 0).length;
    return hits / recentMetrics.length;
  }

  async purgeCache(pattern?: string): Promise<void> {
    for (const [region, server] of this.edgeServers) {
      await server.purgeCache(pattern);
      this.emit('cachePurged', { region, pattern });
    }
  }

  async preloadContent(urls: string[]): Promise<void> {
    const promises = urls.map(async url => {
      for (const [region, server] of this.edgeServers) {
        const content = await this.fetchFromOrigin(url);
        const optimized = await this.optimizeContent(content, 'text/html');
        await server.cacheContent(url, optimized);
      }
    });

    await Promise.all(promises);
    this.emit('contentPreloaded', { urls });
  }

  getMetrics(region?: string): CDNMetrics[] {
    if (region) {
      return this.metrics.get(region) || [];
    }

    // Aggregate metrics from all regions
    const allMetrics: CDNMetrics[] = [];
    for (const regionMetrics of this.metrics.values()) {
      allMetrics.push(...regionMetrics);
    }
    return allMetrics;
  }

  async updateConfiguration(newConfig: Partial<CDNConfiguration>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize edge servers if regions changed
    if (newConfig.regions) {
      this.edgeServers.clear();
      this.initializeEdgeServers();
    }

    this.emit('configurationUpdated', this.config);
  }
}

class EdgeServer {
  private cache: Map<string, { content: string; timestamp: Date; ttl: number }> = new Map();
  private region: string;
  private config: CDNConfiguration;

  constructor(region: string, config: CDNConfiguration) {
    this.region = region;
    this.config = config;
  }

  async getFromCache(url: string): Promise<string | null> {
    const cached = this.cache.get(url);
    if (!cached) return null;

    const now = new Date();
    const age = now.getTime() - cached.timestamp.getTime();
    
    if (age > cached.ttl * 1000) {
      this.cache.delete(url);
      return null;
    }

    return cached.content;
  }

  async cacheContent(url: string, content: string): Promise<void> {
    const rule = this.findCacheRule(url);
    const ttl = rule?.ttl || 3600; // Default 1 hour

    this.cache.set(url, {
      content,
      timestamp: new Date(),
      ttl
    });
  }

  private findCacheRule(url: string): CacheRule | undefined {
    return this.config.cacheRules.find(rule => 
      new RegExp(rule.pattern).test(url)
    );
  }

  async purgeCache(pattern?: string): Promise<void> {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = new RegExp(pattern);
    for (const [url] of this.cache) {
      if (regex.test(url)) {
        this.cache.delete(url);
      }
    }
  }
}

export default CDNService;