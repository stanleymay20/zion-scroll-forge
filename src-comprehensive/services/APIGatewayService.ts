import express, { Request, Response, NextFunction } from 'express';
import httpProxy from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';
import jwt from 'jsonwebtoken';
import { serviceDiscoveryService } from './ServiceDiscoveryService';
import { apiVersioningService } from './APIVersioningService';
import { loadBalancerService } from './LoadBalancerService';
import { apiSecurityService } from './APISecurityService';
import { logger } from '../../backend/src/utils/logger';

interface ServiceConfig {
  name: string;
  path: string;
  target: string;
  healthCheck: string;
  version: string;
  rateLimit?: {
    windowMs: number;
    max: number;
  };
  auth?: boolean;
  roles?: string[];
}

interface APIRoute {
  method: string;
  path: string;
  service: string;
  version: string;
  deprecated?: boolean;
  deprecationDate?: Date;
}

export class APIGatewayService {
  private app: express.Application;
  private redis: any;
  private services: Map<string, ServiceConfig> = new Map();
  private routes: APIRoute[] = [];
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.app = express();
    this.initializeRedis();
    this.setupMiddleware();
    this.registerServices();
    this.setupRoutes();
    this.startHealthChecks();
    this.setupSecurityMiddleware();
    this.setupMonitoring();
  }

  private async initializeRedis() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    try {
      await this.redis.connect();
      logger.info('✅ API Gateway Redis connected');
    } catch (error) {
      logger.error('❌ API Gateway Redis connection failed:', error);
    }
  }

  private setupMiddleware() {
    // CORS
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, X-API-Version');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`📡 API Gateway: ${req.method} ${req.path} from ${req.ip}`);
      next();
    });

    // Global rate limiting
    const globalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: {
        error: 'Too many requests',
        message: 'The scroll gates are temporarily closed due to high traffic. Please try again later.',
        scrollMessage: 'Patience is a kingdom virtue. The gates will reopen soon.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(globalLimiter);

    // API versioning middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const version = req.headers['x-api-version'] as string || 'v1';
      req.headers['x-api-version'] = version;
      next();
    });
  }

  private async registerServices() {
    const services: ServiceConfig[] = [
      {
        name: 'user-management',
        path: '/api/users',
        target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100
        }
      },
      {
        name: 'course-management',
        path: '/api/courses',
        target: process.env.COURSE_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 200
        }
      },
      {
        name: 'assessment-engine',
        path: '/api/assessments',
        target: process.env.ASSESSMENT_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 50
        }
      },
      {
        name: 'scrollcoin-meter',
        path: '/api/scrollcoin',
        target: process.env.SCROLLCOIN_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 100
        }
      },
      {
        name: 'faculty-ai',
        path: '/api/ai',
        target: process.env.AI_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 30
        }
      },
      {
        name: 'prayer-integration',
        path: '/api/prayer',
        target: process.env.PRAYER_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 200
        }
      },
      {
        name: 'public-explorer',
        path: '/api/public',
        target: process.env.PUBLIC_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: false,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 500
        }
      },
      {
        name: 'research-powerhouse',
        path: '/api/research',
        target: process.env.RESEARCH_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 75
        }
      },
      {
        name: 'critical-thinking',
        path: '/api/critical-thinking',
        target: process.env.CRITICAL_THINKING_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 50
        }
      },
      {
        name: 'tuition-system',
        path: '/api/tuition',
        target: process.env.TUITION_SERVICE_URL || 'http://localhost:3001',
        healthCheck: '/health',
        version: 'v1',
        auth: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 25
        }
      }
    ];

    // Register services with service discovery
    for (const service of services) {
      this.services.set(service.name, service);
      
      // Register with service discovery
      try {
        const url = new URL(service.target);
        await serviceDiscoveryService.registerService({
          name: service.name,
          version: service.version,
          host: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
          protocol: url.protocol.replace(':', '') as 'http' | 'https',
          healthCheckPath: service.healthCheck,
          metadata: {
            path: service.path,
            auth: service.auth,
            rateLimit: service.rateLimit
          }
        });
        
        logger.info(`🔗 Registered service: ${service.name} -> ${service.target}`);
      } catch (error) {
        logger.error(`Failed to register service ${service.name}:`, error);
      }
    }
  }

  private setupRoutes() {
    // Health check for the gateway itself
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        message: 'ScrollUniversity API Gateway is operational',
        timestamp: new Date().toISOString(),
        services: this.getServiceHealthStatus(),
        scrollMessage: 'The kingdom gates are open and operational.'
      });
    });

    // Service discovery endpoint
    this.app.get('/api/services', (req: Request, res: Response) => {
      const serviceList = Array.from(this.services.values()).map(service => ({
        name: service.name,
        path: service.path,
        version: service.version,
        auth: service.auth,
        rateLimit: service.rateLimit
      }));

      res.json({
        success: true,
        services: serviceList,
        message: 'Available ScrollUniversity services',
        scrollMessage: 'Behold the kingdom services available to scroll sons.'
      });
    });

    // API documentation endpoint
    this.app.get('/api/docs', (req: Request, res: Response) => {
      res.json({
        success: true,
        documentation: {
          gateway: 'ScrollUniversity API Gateway',
          version: '1.0.0',
          description: 'Unified API gateway for all ScrollUniversity services',
          endpoints: this.routes,
          authentication: 'Bearer token required for protected endpoints',
          rateLimit: 'Service-specific rate limits apply'
        },
        scrollMessage: 'The scroll documentation reveals the kingdom API pathways.'
      });
    });

    // Gateway statistics
    this.app.get('/gateway/stats', async (req, res) => {
      try {
        const serviceStats = await serviceDiscoveryService.getServiceStats();
        const compatibilityMatrix = apiVersioningService.getCompatibilityMatrix();
        const loadBalancerStats = loadBalancerService.getStatistics();
        const securityStats = apiSecurityService.getSecurityStats();
        
        res.json({
          success: true,
          statistics: {
            services: serviceStats,
            apiVersions: compatibilityMatrix,
            loadBalancer: loadBalancerStats,
            security: securityStats,
            gateway: {
              uptime: process.uptime(),
              memory: process.memoryUsage(),
              pid: process.pid,
              nodeVersion: process.version
            }
          },
          message: 'Gateway statistics',
          scrollMessage: 'The kingdom gateway statistics are revealed.'
        });
      } catch (error) {
        logger.error('Gateway stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve statistics',
          scrollMessage: 'The gateway statistics could not be gathered.'
        });
      }
    });

    // Load balancer management
    this.app.get('/gateway/load-balancer/strategies', (req, res) => {
      res.json({
        success: true,
        strategies: loadBalancerService.getAvailableStrategies(),
        statistics: loadBalancerService.getStatistics(),
        scrollMessage: 'The kingdom load balancing strategies are revealed.'
      });
    });

    this.app.post('/gateway/load-balancer/strategy', (req, res) => {
      const { strategy } = req.body;
      const success = loadBalancerService.setDefaultStrategy(strategy);
      
      if (success) {
        res.json({
          success: true,
          message: `Load balancing strategy set to: ${strategy}`,
          scrollMessage: 'The kingdom routing strategy has been updated.'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid strategy',
          availableStrategies: loadBalancerService.getAvailableStrategies(),
          scrollMessage: 'The requested routing strategy is not available.'
        });
      }
    });

    // Security management
    this.app.get('/gateway/security/threats', (req, res) => {
      const { limit = '50' } = req.query;
      const threats = apiSecurityService.getRecentThreats(parseInt(limit as string));
      
      res.json({
        success: true,
        threats,
        statistics: apiSecurityService.getSecurityStats(),
        scrollMessage: 'The kingdom security threats are revealed.'
      });
    });

    this.app.get('/gateway/security/rules', (req, res) => {
      res.json({
        success: true,
        rules: apiSecurityService.getSecurityRules(),
        scrollMessage: 'The kingdom security rules are revealed.'
      });
    });

    this.app.put('/gateway/security/rules/:ruleId', (req, res) => {
      const { ruleId } = req.params;
      const updates = req.body;
      
      const success = apiSecurityService.updateSecurityRule(ruleId, updates);
      
      if (success) {
        res.json({
          success: true,
          message: `Security rule ${ruleId} updated`,
          scrollMessage: 'The kingdom security rule has been updated.'
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Security rule not found',
          scrollMessage: 'The requested security rule does not exist.'
        });
      }
    });

    this.app.post('/gateway/security/blacklist', (req, res) => {
      const { ip } = req.body;
      
      if (!ip) {
        return res.status(400).json({
          success: false,
          error: 'IP address required',
          scrollMessage: 'Provide an IP address to blacklist.'
        });
      }
      
      apiSecurityService.blacklistIP(ip);
      
      res.json({
        success: true,
        message: `IP ${ip} has been blacklisted`,
        scrollMessage: 'The IP has been banished from the kingdom.'
      });
    });

    this.app.delete('/gateway/security/blacklist/:ip', (req, res) => {
      const { ip } = req.params;
      apiSecurityService.unblacklistIP(ip);
      
      res.json({
        success: true,
        message: `IP ${ip} has been removed from blacklist`,
        scrollMessage: 'The IP has been granted access to the kingdom.'
      });
    });

    // Setup service proxies
    this.services.forEach((service, serviceName) => {
      this.setupServiceProxy(service);
    });

    // Catch-all for undefined routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The path ${req.originalUrl} does not exist in the kingdom API`,
        scrollMessage: 'Seek and ye shall find the correct path in the scroll documentation.',
        availableServices: Array.from(this.services.keys())
      });
    });
  }

  private setupServiceProxy(service: ServiceConfig) {
    // Create service-specific rate limiter if configured
    let serviceLimiter;
    if (service.rateLimit) {
      serviceLimiter = rateLimit({
        windowMs: service.rateLimit.windowMs,
        max: service.rateLimit.max,
        message: {
          error: 'Service rate limit exceeded',
          message: `Too many requests to ${service.name}. Please try again later.`,
          scrollMessage: 'The kingdom service requires rest. Practice patience.'
        },
        keyGenerator: (req: Request) => {
          return `${req.ip}:${service.name}`;
        }
      });
    }

    // Create dynamic proxy middleware with load balancing
    const proxyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
      try {
        // Get all healthy service instances
        const allInstances = await serviceDiscoveryService.getServiceInstances(service.name);
        
        // Use load balancer to select instance
        const serviceInstance = loadBalancerService.selectInstance(allInstances, 'health-based');
        
        if (!serviceInstance) {
          return res.status(503).json({
            error: 'Service unavailable',
            message: `No healthy instances of ${service.name} are available`,
            scrollMessage: 'The kingdom service is currently unavailable. Please try again later.'
          });
        }

        const target = `${serviceInstance.protocol}://${serviceInstance.host}:${serviceInstance.port}`;
        
        // Create proxy for this specific instance
        const proxy = httpProxy.createProxyMiddleware({
          target,
          changeOrigin: true,
          pathRewrite: {
            [`^${service.path}`]: ''
          },
          timeout: 30000,
          proxyTimeout: 30000,
          onError: (err, req, res) => {
            logger.error(`❌ Proxy error for ${service.name} (${serviceInstance.id}):`, err);
            
            // Mark service as unhealthy
            serviceDiscoveryService.updateServiceHealth(service.name, serviceInstance.id, 'unhealthy');
            
            // Release connection for least-connections strategy
            loadBalancerService.releaseConnection(serviceInstance.id);
            
            (res as Response).status(503).json({
              error: 'Service unavailable',
              message: `The ${service.name} service encountered an error`,
              scrollMessage: 'The kingdom service is experiencing difficulties. Please try again later.',
              serviceId: serviceInstance.id
            });
          },
          onProxyReq: (proxyReq, req, res) => {
            // Add service identification headers
            proxyReq.setHeader('X-Gateway-Service', service.name);
            proxyReq.setHeader('X-Gateway-Version', service.version);
            proxyReq.setHeader('X-Request-ID', this.generateRequestId());
            proxyReq.setHeader('X-Service-Instance', serviceInstance.id);
            proxyReq.setHeader('X-Load-Balance-Strategy', 'health-based');
            
            // Forward user information if authenticated
            if ((req as any).user) {
              proxyReq.setHeader('X-User-ID', (req as any).user.id);
              proxyReq.setHeader('X-User-Role', (req as any).user.role);
            }
          },
          onProxyRes: (proxyRes, req, res) => {
            // Add gateway headers to response
            proxyRes.headers['X-Gateway'] = 'ScrollUniversity-API-Gateway';
            proxyRes.headers['X-Service'] = service.name;
            proxyRes.headers['X-Service-Instance'] = serviceInstance.id;
            proxyRes.headers['X-Load-Balanced'] = 'true';
            
            // Update service heartbeat on successful response
            if (proxyRes.statusCode && proxyRes.statusCode < 500) {
              serviceDiscoveryService.updateHeartbeat(service.name, serviceInstance.id);
            }
            
            // Release connection for least-connections strategy
            loadBalancerService.releaseConnection(serviceInstance.id);
          }
        });

        proxy(req, res, next);
      } catch (error) {
        logger.error(`Load balancing error for ${service.name}:`, error);
        res.status(503).json({
          error: 'Load balancing failed',
          message: `Failed to route request to ${service.name}`,
          scrollMessage: 'The kingdom routing system encountered an error.'
        });
      }
    };

    // Setup route with middleware chain
    const middlewares = [];
    
    // Add security middleware first
    middlewares.push(apiSecurityService.securityMiddleware);
    
    // Add API versioning middleware
    middlewares.push(apiVersioningService.versioningMiddleware);
    
    if (serviceLimiter) {
      middlewares.push(serviceLimiter);
    }

    if (service.auth) {
      middlewares.push(this.authenticationMiddleware);
    }

    // Add circuit breaker middleware
    middlewares.push(this.circuitBreakerMiddleware(service.name));

    middlewares.push(proxyMiddleware);

    this.app.use(service.path, ...middlewares);

    logger.info(`🚀 Proxy setup complete: ${service.path} -> ${service.target} (with load balancing)`);
  }

  private authenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Bearer token required for this kingdom service',
          scrollMessage: 'Present your scroll credentials to access this service.'
        });
      }

      const token = authHeader.substring(7);
      
      // Validate token and get user info
      const user = await this.validateToken(token);
      
      if (!user) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Your scroll credentials are invalid or expired',
          scrollMessage: 'Renew your covenant and try again.'
        });
      }

      // Add user to request object
      (req as any).user = user;

      next();
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred during authentication',
        scrollMessage: 'The kingdom authentication system encountered an error.'
      });
    }
  };

  private circuitBreakerMiddleware = (serviceName: string) => {
    const circuitState = {
      failures: 0,
      lastFailureTime: 0,
      state: 'CLOSED' as 'CLOSED' | 'OPEN' | 'HALF_OPEN'
    };

    const failureThreshold = 5;
    const timeout = 60000; // 1 minute
    const retryTimeout = 30000; // 30 seconds

    return async (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();

      // Check circuit state
      if (circuitState.state === 'OPEN') {
        if (now - circuitState.lastFailureTime > retryTimeout) {
          circuitState.state = 'HALF_OPEN';
          logger.info(`🔄 Circuit breaker for ${serviceName} moved to HALF_OPEN`);
        } else {
          return res.status(503).json({
            error: 'Circuit breaker open',
            message: `Service ${serviceName} is temporarily unavailable`,
            scrollMessage: 'The kingdom service is being restored. Please wait.',
            retryAfter: Math.ceil((retryTimeout - (now - circuitState.lastFailureTime)) / 1000)
          });
        }
      }

      // Wrap response to monitor for failures
      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode >= 500) {
          circuitState.failures++;
          circuitState.lastFailureTime = now;

          if (circuitState.failures >= failureThreshold) {
            circuitState.state = 'OPEN';
            logger.warn(`⚠️ Circuit breaker for ${serviceName} opened after ${circuitState.failures} failures`);
          }
        } else if (circuitState.state === 'HALF_OPEN') {
          // Success in half-open state, close the circuit
          circuitState.state = 'CLOSED';
          circuitState.failures = 0;
          logger.info(`✅ Circuit breaker for ${serviceName} closed - service recovered`);
        }

        return originalSend.call(this, data);
      };

      next();
    };
  };

  private async validateToken(token: string): Promise<any> {
    try {
      // Check token in Redis cache first
      const cachedUser = await this.redis.get(`token:${token}`);
      if (cachedUser) {
        return JSON.parse(cachedUser);
      }

      // Verify JWT token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      
      // Extract user information from token
      const user = {
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        scrollAlignment: decoded.scrollAlignment || 0
      };

      // Cache the user for 5 minutes
      await this.redis.setEx(`token:${token}`, 300, JSON.stringify(user));

      return user;
    } catch (error) {
      logger.error('Token validation error:', error);
      return null;
    }
  }

  private startHealthChecks() {
    this.healthCheckInterval = setInterval(async () => {
      for (const [serviceName, service] of this.services) {
        try {
          const response = await fetch(`${service.target}${service.healthCheck}`);
          const isHealthy = response.ok;
          
          await this.redis.setEx(`health:${serviceName}`, 60, isHealthy ? 'healthy' : 'unhealthy');
          
          if (!isHealthy) {
            logger.warn(`⚠️ Service ${serviceName} health check failed`);
          }
        } catch (error) {
          logger.error(`❌ Health check failed for ${serviceName}:`, error);
          await this.redis.setEx(`health:${serviceName}`, 60, 'unhealthy');
        }
      }
    }, 30000); // Check every 30 seconds
  }

  private async getServiceHealthStatus(): Promise<Record<string, string>> {
    const healthStatus: Record<string, string> = {};
    
    for (const serviceName of this.services.keys()) {
      try {
        const status = await this.redis.get(`health:${serviceName}`);
        healthStatus[serviceName] = status || 'unknown';
      } catch (error) {
        healthStatus[serviceName] = 'error';
      }
    }
    
    return healthStatus;
  }

  private generateRequestId(): string {
    return `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public getApp(): express.Application {
    return this.app;
  }

  private setupSecurityMiddleware() {
    // Security headers
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      next();
    });

    // Request size limiting
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // IP whitelisting for admin endpoints
    this.app.use('/gateway/admin', (req: Request, res: Response, next: NextFunction) => {
      const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',') || ['127.0.0.1', '::1'];
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!allowedIPs.includes(clientIP || '')) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Admin access restricted to authorized IPs',
          scrollMessage: 'Only kingdom administrators may access this sacred endpoint.'
        });
      }
      
      next();
    });
  }

  private setupMonitoring() {
    // Request metrics
    const requestMetrics = new Map<string, { count: number; totalTime: number; errors: number }>();

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const route = `${req.method} ${req.path}`;

      // Initialize metrics if not exists
      if (!requestMetrics.has(route)) {
        requestMetrics.set(route, { count: 0, totalTime: 0, errors: 0 });
      }

      const metrics = requestMetrics.get(route)!;
      metrics.count++;

      // Track response
      const originalSend = res.send;
      res.send = function(data) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        metrics.totalTime += duration;
        
        if (res.statusCode >= 400) {
          metrics.errors++;
        }

        // Log slow requests
        if (duration > 5000) {
          logger.warn(`🐌 Slow request: ${route} took ${duration}ms`);
        }

        return originalSend.call(this, data);
      };

      next();
    });

    // Metrics endpoint
    this.app.get('/gateway/metrics', (req: Request, res: Response) => {
      const metrics: any = {};
      
      for (const [route, data] of requestMetrics) {
        metrics[route] = {
          requests: data.count,
          averageTime: data.count > 0 ? Math.round(data.totalTime / data.count) : 0,
          errors: data.errors,
          errorRate: data.count > 0 ? Math.round((data.errors / data.count) * 100) : 0
        };
      }

      res.json({
        success: true,
        metrics,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        scrollMessage: 'The kingdom gateway metrics are revealed.'
      });
    });
  }

  public async shutdown() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Shutdown all services
    await Promise.all([
      this.redis?.disconnect(),
      serviceDiscoveryService.shutdown(),
      apiSecurityService.shutdown()
    ]);
    
    logger.info('🛑 API Gateway shutdown complete');
  }
}

export const apiGatewayService = new APIGatewayService();