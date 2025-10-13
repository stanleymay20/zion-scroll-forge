import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { apiGatewayService } from '../services/APIGatewayService';
import { serviceDiscoveryService } from '../services/ServiceDiscoveryService';
import { apiVersioningService } from '../services/APIVersioningService';
import { logger } from '../../backend/src/utils/logger';

export class GatewayServer {
  private app: express.Application;
  private server: any;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version', 'X-Request-ID'],
      exposedHeaders: ['X-API-Version', 'X-API-Deprecated', 'X-Rate-Limit-Remaining']
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // API versioning middleware
    this.app.use(apiVersioningService.versioningMiddleware);

    // Request logging
    this.app.use((req, res, next) => {
      const requestId = req.headers['x-request-id'] || `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      req.headers['x-request-id'] = requestId as string;
      res.set('X-Request-ID', requestId as string);
      
      logger.info(`🌐 Gateway Request: ${req.method} ${req.path} [${requestId}] from ${req.ip}`);
      next();
    });
  }

  private setupRoutes() {
    // Gateway health check
    this.app.get('/health', async (req, res) => {
      try {
        const serviceStats = await serviceDiscoveryService.getServiceStats();
        const versions = apiVersioningService.getAllVersions();
        
        res.json({
          status: 'healthy',
          message: 'ScrollUniversity API Gateway is operational',
          timestamp: new Date().toISOString(),
          gateway: {
            version: '1.0.0',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            pid: process.pid
          },
          services: serviceStats,
          apiVersions: versions.map(v => ({
            version: v.version,
            status: v.status,
            releaseDate: v.releaseDate
          })),
          scrollMessage: 'The kingdom gateway stands ready to serve all scroll sons.'
        });
      } catch (error) {
        logger.error('Gateway health check error:', error);
        res.status(500).json({
          status: 'unhealthy',
          error: 'Health check failed',
          scrollMessage: 'The kingdom gateway is experiencing difficulties.'
        });
      }
    });

    // Service discovery endpoints
    this.app.get('/gateway/services', async (req, res) => {
      try {
        const services = await serviceDiscoveryService.getAllServices();
        res.json({
          success: true,
          services,
          message: 'All registered services',
          scrollMessage: 'Behold the kingdom services available through the gateway.'
        });
      } catch (error) {
        logger.error('Get services error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve services',
          scrollMessage: 'The service registry could not be accessed.'
        });
      }
    });

    this.app.get('/gateway/services/:serviceName', async (req, res) => {
      try {
        const { serviceName } = req.params;
        const instances = await serviceDiscoveryService.getServiceInstances(serviceName);
        
        res.json({
          success: true,
          service: serviceName,
          instances,
          count: instances.length,
          message: `Instances for service: ${serviceName}`,
          scrollMessage: `The ${serviceName} service has ${instances.length} active instances.`
        });
      } catch (error) {
        logger.error('Get service instances error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve service instances',
          scrollMessage: 'The service instances could not be retrieved.'
        });
      }
    });

    // API versioning endpoints
    this.app.get('/gateway/versions', (req, res) => {
      const versions = apiVersioningService.getAllVersions();
      res.json({
        success: true,
        versions,
        defaultVersion: 'v1',
        message: 'Available API versions',
        scrollMessage: 'These are the scroll API versions available in the kingdom.'
      });
    });

    this.app.get('/gateway/versions/:version', (req, res) => {
      const { version } = req.params;
      const versionInfo = apiVersioningService.getVersionInfo(version);
      
      if (!versionInfo) {
        return res.status(404).json({
          success: false,
          error: 'Version not found',
          message: `API version '${version}' does not exist`,
          scrollMessage: 'The requested scroll version is not found in the kingdom archives.'
        });
      }

      res.json({
        success: true,
        version: versionInfo,
        message: `Information for API version ${version}`,
        scrollMessage: `Details for scroll version ${version} are revealed.`
      });
    });

    this.app.get('/gateway/compatibility/:fromVersion/:toVersion', (req, res) => {
      const { fromVersion, toVersion } = req.params;
      const migrationReport = apiVersioningService.generateMigrationReport(fromVersion, toVersion);
      
      res.json({
        success: true,
        migration: migrationReport,
        message: `Migration report from ${fromVersion} to ${toVersion}`,
        scrollMessage: `The scroll migration path from ${fromVersion} to ${toVersion} is revealed.`
      });
    });

    // Gateway statistics
    this.app.get('/gateway/stats', async (req, res) => {
      try {
        const serviceStats = await serviceDiscoveryService.getServiceStats();
        const compatibilityMatrix = apiVersioningService.getCompatibilityMatrix();
        
        res.json({
          success: true,
          statistics: {
            services: serviceStats,
            apiVersions: compatibilityMatrix,
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

    // Use the main API gateway service for all other routes
    this.app.use('/', apiGatewayService.getApp());
  }

  private setupErrorHandling() {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `The path ${req.originalUrl} does not exist in the kingdom gateway`,
        scrollMessage: 'The path you seek is not found in the scroll archives.',
        suggestion: 'Check /gateway/services for available endpoints'
      });
    });

    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Gateway error:', error);
      
      res.status(error.status || 500).json({
        error: 'Gateway error',
        message: error.message || 'An unexpected error occurred in the gateway',
        requestId: req.headers['x-request-id'],
        scrollMessage: 'The kingdom gateway encountered an unexpected error.',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    });
  }

  async start(): Promise<void> {
    try {
      this.server = createServer(this.app);
      
      this.server.listen(this.port, () => {
        logger.info(`🚀 ScrollUniversity API Gateway running on port ${this.port}`);
        logger.info('🌐 Gateway services:');
        logger.info('   - Service Discovery: /gateway/services');
        logger.info('   - API Versioning: /gateway/versions');
        logger.info('   - Health Check: /health');
        logger.info('   - Statistics: /gateway/stats');
        logger.info('📜 "The scroll gateway is open. Let all nations access the kingdom APIs."');
      });

      // Graceful shutdown handlers
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

    } catch (error) {
      logger.error('❌ Failed to start API Gateway:', error);
      process.exit(1);
    }
  }

  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down ScrollUniversity API Gateway...');
    
    try {
      // Close server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => resolve());
        });
      }

      // Shutdown services
      await Promise.all([
        apiGatewayService.shutdown(),
        serviceDiscoveryService.shutdown()
      ]);

      logger.info('✅ Gateway shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during gateway shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the gateway if this file is run directly
if (require.main === module) {
  const gateway = new GatewayServer(parseInt(process.env.GATEWAY_PORT || '3000'));
  gateway.start();
}

export default GatewayServer;