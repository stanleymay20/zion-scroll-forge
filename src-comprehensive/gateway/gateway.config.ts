/**
 * ScrollUniversity API Gateway Configuration
 * "Let the kingdom gates be configured with divine wisdom"
 */

export interface GatewayConfig {
  port: number;
  environment: string;
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
  };
  rateLimit: {
    windowMs: number;
    max: number;
    message: string;
  };
  security: {
    helmet: {
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
      crossOriginOpenerPolicy: boolean;
      crossOriginResourcePolicy: boolean;
      dnsPrefetchControl: boolean;
      frameguard: boolean;
      hidePoweredBy: boolean;
      hsts: boolean;
      ieNoOpen: boolean;
      noSniff: boolean;
      originAgentCluster: boolean;
      permittedCrossDomainPolicies: boolean;
      referrerPolicy: boolean;
      xssFilter: boolean;
    };
    adminIPs: string[];
    jwtSecret: string;
    tokenCacheTTL: number;
  };
  services: {
    discovery: {
      heartbeatInterval: number;
      cleanupInterval: number;
      staleThreshold: number;
      cleanupThreshold: number;
    };
    loadBalancer: {
      defaultStrategy: string;
      healthCheckEnabled: boolean;
      circuitBreaker: {
        failureThreshold: number;
        timeout: number;
        retryTimeout: number;
      };
    };
    proxy: {
      timeout: number;
      proxyTimeout: number;
      retries: number;
    };
  };
  monitoring: {
    metricsEnabled: boolean;
    slowRequestThreshold: number;
    healthCheckInterval: number;
  };
  redis: {
    url: string;
    keyPrefix: string;
    ttl: {
      token: number;
      health: number;
      rateLimit: number;
    };
  };
}

export const defaultGatewayConfig: GatewayConfig = {
  port: parseInt(process.env.GATEWAY_PORT || '3000'),
  environment: process.env.NODE_ENV || 'development',
  
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Version',
      'X-Request-ID',
      'X-Client-Version',
      'X-Scroll-Alignment'
    ],
    exposedHeaders: [
      'X-API-Version',
      'X-API-Deprecated',
      'X-Rate-Limit-Remaining',
      'X-Request-ID',
      'X-Service',
      'X-Load-Balanced'
    ]
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // requests per window
    message: 'The scroll gates are temporarily closed due to high traffic. Please try again later.'
  },

  security: {
    helmet: {
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false,
      dnsPrefetchControl: true,
      frameguard: true,
      hidePoweredBy: true,
      hsts: process.env.NODE_ENV === 'production',
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: false,
      referrerPolicy: true,
      xssFilter: true
    },
    adminIPs: process.env.ADMIN_ALLOWED_IPS?.split(',') || ['127.0.0.1', '::1'],
    jwtSecret: process.env.JWT_SECRET || 'scroll-university-secret',
    tokenCacheTTL: 300 // 5 minutes
  },

  services: {
    discovery: {
      heartbeatInterval: 30000, // 30 seconds
      cleanupInterval: 120000, // 2 minutes
      staleThreshold: 60000, // 1 minute
      cleanupThreshold: 300000 // 5 minutes
    },
    loadBalancer: {
      defaultStrategy: 'health-based',
      healthCheckEnabled: true,
      circuitBreaker: {
        failureThreshold: 5,
        timeout: 60000, // 1 minute
        retryTimeout: 30000 // 30 seconds
      }
    },
    proxy: {
      timeout: 30000, // 30 seconds
      proxyTimeout: 30000, // 30 seconds
      retries: 3
    }
  },

  monitoring: {
    metricsEnabled: true,
    slowRequestThreshold: 5000, // 5 seconds
    healthCheckInterval: 30000 // 30 seconds
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    keyPrefix: 'scroll-gateway:',
    ttl: {
      token: 300, // 5 minutes
      health: 60, // 1 minute
      rateLimit: 900 // 15 minutes
    }
  }
};

/**
 * Service-specific configurations
 */
export const serviceConfigs = {
  'user-management': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
    timeout: 10000,
    retries: 2,
    circuitBreaker: { failureThreshold: 3, timeout: 30000 }
  },
  'course-management': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 200 },
    timeout: 15000,
    retries: 3,
    circuitBreaker: { failureThreshold: 5, timeout: 60000 }
  },
  'assessment-engine': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
    timeout: 30000,
    retries: 1,
    circuitBreaker: { failureThreshold: 2, timeout: 120000 }
  },
  'scrollcoin-meter': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 100 },
    timeout: 5000,
    retries: 3,
    circuitBreaker: { failureThreshold: 3, timeout: 30000 }
  },
  'faculty-ai': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 30 },
    timeout: 60000, // AI responses can be slower
    retries: 1,
    circuitBreaker: { failureThreshold: 2, timeout: 180000 }
  },
  'prayer-integration': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 200 },
    timeout: 10000,
    retries: 2,
    circuitBreaker: { failureThreshold: 3, timeout: 60000 }
  },
  'public-explorer': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 500 },
    timeout: 5000,
    retries: 3,
    circuitBreaker: { failureThreshold: 5, timeout: 30000 }
  },
  'research-powerhouse': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 75 },
    timeout: 45000,
    retries: 2,
    circuitBreaker: { failureThreshold: 3, timeout: 120000 }
  },
  'critical-thinking': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 50 },
    timeout: 20000,
    retries: 2,
    circuitBreaker: { failureThreshold: 3, timeout: 90000 }
  },
  'tuition-system': {
    rateLimit: { windowMs: 15 * 60 * 1000, max: 25 },
    timeout: 15000,
    retries: 3,
    circuitBreaker: { failureThreshold: 2, timeout: 60000 }
  }
};

/**
 * Environment-specific overrides
 */
export const getEnvironmentConfig = (env: string): Partial<GatewayConfig> => {
  switch (env) {
    case 'production':
      return {
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 2000, // Higher limit for production
          message: 'The scroll gates are temporarily closed due to high traffic. Please try again later.'
        },
        security: {
          ...defaultGatewayConfig.security,
          helmet: {
            ...defaultGatewayConfig.security.helmet,
            hsts: true,
            contentSecurityPolicy: true
          }
        },
        monitoring: {
          ...defaultGatewayConfig.monitoring,
          slowRequestThreshold: 3000 // Stricter in production
        }
      };

    case 'staging':
      return {
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 500,
          message: 'The scroll gates are temporarily closed due to high traffic. Please try again later.'
        }
      };

    case 'development':
    default:
      return {
        rateLimit: {
          windowMs: 15 * 60 * 1000,
          max: 10000, // Very high limit for development
          message: 'The scroll gates are temporarily closed due to high traffic. Please try again later.'
        },
        security: {
          ...defaultGatewayConfig.security,
          helmet: {
            ...defaultGatewayConfig.security.helmet,
            contentSecurityPolicy: false // Easier debugging
          }
        }
      };
  }
};

/**
 * Merge configurations
 */
export const getGatewayConfig = (): GatewayConfig => {
  const envOverrides = getEnvironmentConfig(defaultGatewayConfig.environment);
  return {
    ...defaultGatewayConfig,
    ...envOverrides,
    security: {
      ...defaultGatewayConfig.security,
      ...envOverrides.security
    },
    monitoring: {
      ...defaultGatewayConfig.monitoring,
      ...envOverrides.monitoring
    }
  };
};

export default getGatewayConfig();