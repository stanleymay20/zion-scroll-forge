import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import crypto from 'crypto';
import { logger } from '../../backend/src/utils/logger';

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  condition: (req: Request) => boolean;
  action: 'allow' | 'deny' | 'rate_limit' | 'log';
  parameters?: Record<string, any>;
}

export interface ThreatDetection {
  id: string;
  type: 'sql_injection' | 'xss' | 'path_traversal' | 'suspicious_pattern' | 'rate_limit_exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  request: {
    ip: string;
    method: string;
    path: string;
    headers: Record<string, string>;
    body?: any;
  };
  timestamp: Date;
  blocked: boolean;
}

export class APISecurityService {
  private redis: any;
  private rules: Map<string, SecurityRule> = new Map();
  private threats: ThreatDetection[] = [];
  private ipWhitelist = new Set<string>();
  private ipBlacklist = new Set<string>();

  constructor() {
    this.initializeRedis();
    this.initializeSecurityRules();
    this.loadIPLists();
  }

  private async initializeRedis() {
    this.redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    try {
      await this.redis.connect();
      logger.info('✅ API Security Redis connected');
    } catch (error) {
      logger.error('❌ API Security Redis connection failed:', error);
    }
  }

  private initializeSecurityRules() {
    const defaultRules: SecurityRule[] = [
      {
        id: 'sql-injection-detection',
        name: 'SQL Injection Detection',
        description: 'Detect potential SQL injection attempts',
        enabled: true,
        priority: 1,
        condition: (req) => this.detectSQLInjection(req),
        action: 'deny'
      },
      {
        id: 'xss-detection',
        name: 'XSS Detection',
        description: 'Detect potential XSS attacks',
        enabled: true,
        priority: 2,
        condition: (req) => this.detectXSS(req),
        action: 'deny'
      },
      {
        id: 'path-traversal-detection',
        name: 'Path Traversal Detection',
        description: 'Detect path traversal attempts',
        enabled: true,
        priority: 3,
        condition: (req) => this.detectPathTraversal(req),
        action: 'deny'
      },
      {
        id: 'suspicious-user-agent',
        name: 'Suspicious User Agent',
        description: 'Detect suspicious user agents',
        enabled: true,
        priority: 4,
        condition: (req) => this.detectSuspiciousUserAgent(req),
        action: 'log'
      },
      {
        id: 'rate-limit-protection',
        name: 'Rate Limit Protection',
        description: 'Protect against rate limit abuse',
        enabled: true,
        priority: 5,
        condition: (req) => this.checkRateLimit(req),
        action: 'rate_limit'
      }
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    logger.info(`🛡️ Initialized ${defaultRules.length} security rules`);
  }

  private loadIPLists() {
    // Load from environment variables
    const whitelist = process.env.IP_WHITELIST?.split(',') || [];
    const blacklist = process.env.IP_BLACKLIST?.split(',') || [];

    whitelist.forEach(ip => this.ipWhitelist.add(ip.trim()));
    blacklist.forEach(ip => this.ipBlacklist.add(ip.trim()));

    logger.info(`🛡️ Loaded ${whitelist.length} whitelisted IPs and ${blacklist.length} blacklisted IPs`);
  }

  /**
   * Main security middleware
   */
  securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

      // Check IP blacklist
      if (this.ipBlacklist.has(clientIP)) {
        this.logThreat({
          id: this.generateThreatId(),
          type: 'suspicious_pattern',
          severity: 'high',
          description: 'Request from blacklisted IP',
          request: this.extractRequestInfo(req),
          timestamp: new Date(),
          blocked: true
        });

        return res.status(403).json({
          error: 'Access denied',
          message: 'Your IP address has been blocked',
          scrollMessage: 'The kingdom gates are closed to your location.'
        });
      }

      // Apply security rules
      const sortedRules = Array.from(this.rules.values())
        .filter(rule => rule.enabled)
        .sort((a, b) => a.priority - b.priority);

      for (const rule of sortedRules) {
        if (rule.condition(req)) {
          const threat: ThreatDetection = {
            id: this.generateThreatId(),
            type: this.mapRuleToThreatType(rule.id),
            severity: this.mapRuleToSeverity(rule.id),
            description: `Security rule triggered: ${rule.name}`,
            request: this.extractRequestInfo(req),
            timestamp: new Date(),
            blocked: rule.action === 'deny'
          };

          this.logThreat(threat);

          switch (rule.action) {
            case 'deny':
              return res.status(403).json({
                error: 'Security violation',
                message: 'Request blocked by security policy',
                scrollMessage: 'The kingdom security has detected a threat in your request.',
                ruleId: rule.id
              });

            case 'rate_limit':
              return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests detected',
                scrollMessage: 'The kingdom requires patience. Please slow your requests.'
              });

            case 'log':
              // Continue processing but log the event
              break;
          }
        }
      }

      // Add security headers
      res.setHeader('X-Security-Scan', 'passed');
      res.setHeader('X-Request-ID', this.generateRequestId());

      next();
    } catch (error) {
      logger.error('Security middleware error:', error);
      res.status(500).json({
        error: 'Security check failed',
        message: 'An error occurred during security validation',
        scrollMessage: 'The kingdom security system encountered an error.'
      });
    }
  };

  private detectSQLInjection(req: Request): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\'|\"|;|--|\*|\|)/,
      /(\bUNION\b.*\bSELECT\b)/i
    ];

    const checkString = (str: string): boolean => {
      return sqlPatterns.some(pattern => pattern.test(str));
    };

    // Check URL parameters
    for (const value of Object.values(req.query)) {
      if (typeof value === 'string' && checkString(value)) {
        return true;
      }
    }

    // Check request body
    if (req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body);
      if (checkString(bodyStr)) {
        return true;
      }
    }

    return false;
  }

  private detectXSS(req: Request): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    const checkString = (str: string): boolean => {
      return xssPatterns.some(pattern => pattern.test(str));
    };

    // Check URL parameters
    for (const value of Object.values(req.query)) {
      if (typeof value === 'string' && checkString(value)) {
        return true;
      }
    }

    // Check request body
    if (req.body && typeof req.body === 'object') {
      const bodyStr = JSON.stringify(req.body);
      if (checkString(bodyStr)) {
        return true;
      }
    }

    return false;
  }

  private detectPathTraversal(req: Request): boolean {
    const pathTraversalPatterns = [
      /\.\.\//,
      /\.\.\\/, 
      /%2e%2e%2f/i,
      /%2e%2e%5c/i,
      /\.\.%2f/i,
      /\.\.%5c/i
    ];

    const path = req.path;
    return pathTraversalPatterns.some(pattern => pattern.test(path));
  }

  private detectSuspiciousUserAgent(req: Request): boolean {
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /zap/i,
      /burp/i,
      /wget/i,
      /curl/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(userAgent));
  }

  private async checkRateLimit(req: Request): Promise<boolean> {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `rate_limit:${clientIP}`;
    
    try {
      const current = await this.redis.get(key);
      const limit = 100; // requests per minute
      const window = 60; // seconds

      if (current && parseInt(current) > limit) {
        return true;
      }

      // Increment counter
      if (current) {
        await this.redis.incr(key);
      } else {
        await this.redis.setEx(key, window, 1);
      }

      return false;
    } catch (error) {
      logger.error('Rate limit check error:', error);
      return false;
    }
  }

  private logThreat(threat: ThreatDetection) {
    this.threats.push(threat);
    
    // Keep only last 1000 threats
    if (this.threats.length > 1000) {
      this.threats = this.threats.slice(-1000);
    }

    logger.warn(`🚨 Security threat detected: ${threat.type} from ${threat.request.ip}`);

    // Store in Redis for persistence
    this.redis.lpush('security:threats', JSON.stringify(threat));
    this.redis.ltrim('security:threats', 0, 999); // Keep last 1000
  }

  private extractRequestInfo(req: Request) {
    return {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      method: req.method,
      path: req.path,
      headers: req.headers as Record<string, string>,
      body: req.body
    };
  }

  private generateThreatId(): string {
    return `threat_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  private mapRuleToThreatType(ruleId: string): ThreatDetection['type'] {
    const mapping: Record<string, ThreatDetection['type']> = {
      'sql-injection-detection': 'sql_injection',
      'xss-detection': 'xss',
      'path-traversal-detection': 'path_traversal',
      'suspicious-user-agent': 'suspicious_pattern',
      'rate-limit-protection': 'rate_limit_exceeded'
    };
    return mapping[ruleId] || 'suspicious_pattern';
  }

  private mapRuleToSeverity(ruleId: string): ThreatDetection['severity'] {
    const mapping: Record<string, ThreatDetection['severity']> = {
      'sql-injection-detection': 'critical',
      'xss-detection': 'high',
      'path-traversal-detection': 'high',
      'suspicious-user-agent': 'medium',
      'rate-limit-protection': 'medium'
    };
    return mapping[ruleId] || 'low';
  }

  /**
   * Get security statistics
   */
  getSecurityStats(): {
    totalThreats: number;
    threatsByType: Record<string, number>;
    threatsBySeverity: Record<string, number>;
    blockedRequests: number;
    activeRules: number;
  } {
    const threatsByType: Record<string, number> = {};
    const threatsBySeverity: Record<string, number> = {};
    let blockedRequests = 0;

    this.threats.forEach(threat => {
      threatsByType[threat.type] = (threatsByType[threat.type] || 0) + 1;
      threatsBySeverity[threat.severity] = (threatsBySeverity[threat.severity] || 0) + 1;
      if (threat.blocked) blockedRequests++;
    });

    return {
      totalThreats: this.threats.length,
      threatsByType,
      threatsBySeverity,
      blockedRequests,
      activeRules: Array.from(this.rules.values()).filter(r => r.enabled).length
    };
  }

  /**
   * Get recent threats
   */
  getRecentThreats(limit: number = 50): ThreatDetection[] {
    return this.threats.slice(-limit).reverse();
  }

  /**
   * Add IP to blacklist
   */
  blacklistIP(ip: string): void {
    this.ipBlacklist.add(ip);
    logger.info(`🚫 IP blacklisted: ${ip}`);
  }

  /**
   * Remove IP from blacklist
   */
  unblacklistIP(ip: string): void {
    this.ipBlacklist.delete(ip);
    logger.info(`✅ IP removed from blacklist: ${ip}`);
  }

  /**
   * Get security rules
   */
  getSecurityRules(): SecurityRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Update security rule
   */
  updateSecurityRule(ruleId: string, updates: Partial<SecurityRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    Object.assign(rule, updates);
    this.rules.set(ruleId, rule);
    
    logger.info(`🔧 Security rule updated: ${ruleId}`);
    return true;
  }

  async shutdown(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
    }
    logger.info('🛑 API Security Service shutdown complete');
  }
}

export const apiSecurityService = new APISecurityService();