/**
 * ScrollUniversity API Gateway Tests
 * "Let every gate be tested with kingdom precision"
 */

import request from 'supertest';
import { APIGatewayService } from '../services/APIGatewayService';
import { serviceDiscoveryService } from '../services/ServiceDiscoveryService';
import { apiVersioningService } from '../services/APIVersioningService';
import { loadBalancerService } from '../services/LoadBalancerService';
import { apiSecurityService } from '../services/APISecurityService';

describe('ScrollUniversity API Gateway', () => {
  let gatewayService: APIGatewayService;
  let app: any;

  beforeAll(async () => {
    // Initialize gateway service
    gatewayService = new APIGatewayService();
    app = gatewayService.getApp();
    
    // Wait for services to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    await gatewayService.shutdown();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        message: 'ScrollUniversity API Gateway is operational',
        scrollMessage: 'The kingdom gates are open and operational.'
      });

      expect(response.body.timestamp).toBeDefined();
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Service Discovery', () => {
    it('should list available services', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Available ScrollUniversity services',
        scrollMessage: 'Behold the kingdom services available to scroll sons.'
      });

      expect(Array.isArray(response.body.services)).toBe(true);
      expect(response.body.services.length).toBeGreaterThan(0);

      // Check service structure
      const service = response.body.services[0];
      expect(service).toHaveProperty('name');
      expect(service).toHaveProperty('path');
      expect(service).toHaveProperty('version');
      expect(service).toHaveProperty('auth');
    });

    it('should provide API documentation', async () => {
      const response = await request(app)
        .get('/api/docs')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        scrollMessage: 'The scroll documentation reveals the kingdom API pathways.'
      });

      expect(response.body.documentation).toHaveProperty('gateway');
      expect(response.body.documentation).toHaveProperty('version');
      expect(response.body.documentation).toHaveProperty('description');
    });
  });

  describe('Gateway Statistics', () => {
    it('should return comprehensive statistics', async () => {
      const response = await request(app)
        .get('/gateway/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Gateway statistics',
        scrollMessage: 'The kingdom gateway statistics are revealed.'
      });

      expect(response.body.statistics).toHaveProperty('services');
      expect(response.body.statistics).toHaveProperty('apiVersions');
      expect(response.body.statistics).toHaveProperty('loadBalancer');
      expect(response.body.statistics).toHaveProperty('security');
      expect(response.body.statistics).toHaveProperty('gateway');

      // Check gateway stats structure
      const gatewayStats = response.body.statistics.gateway;
      expect(gatewayStats).toHaveProperty('uptime');
      expect(gatewayStats).toHaveProperty('memory');
      expect(gatewayStats).toHaveProperty('pid');
      expect(gatewayStats).toHaveProperty('nodeVersion');
    });
  });

  describe('Load Balancer Management', () => {
    it('should list available load balancing strategies', async () => {
      const response = await request(app)
        .get('/gateway/load-balancer/strategies')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        scrollMessage: 'The kingdom load balancing strategies are revealed.'
      });

      expect(Array.isArray(response.body.strategies)).toBe(true);
      expect(response.body.strategies).toContain('round-robin');
      expect(response.body.strategies).toContain('random');
      expect(response.body.strategies).toContain('health-based');
      expect(response.body.statistics).toBeDefined();
    });

    it('should allow setting load balancing strategy', async () => {
      const response = await request(app)
        .post('/gateway/load-balancer/strategy')
        .send({ strategy: 'round-robin' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Load balancing strategy set to: round-robin',
        scrollMessage: 'The kingdom routing strategy has been updated.'
      });
    });

    it('should reject invalid load balancing strategy', async () => {
      const response = await request(app)
        .post('/gateway/load-balancer/strategy')
        .send({ strategy: 'invalid-strategy' })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid strategy',
        scrollMessage: 'The requested routing strategy is not available.'
      });

      expect(Array.isArray(response.body.availableStrategies)).toBe(true);
    });
  });

  describe('Security Management', () => {
    it('should return security threats', async () => {
      const response = await request(app)
        .get('/gateway/security/threats')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        scrollMessage: 'The kingdom security threats are revealed.'
      });

      expect(Array.isArray(response.body.threats)).toBe(true);
      expect(response.body.statistics).toBeDefined();
      expect(response.body.statistics).toHaveProperty('totalThreats');
      expect(response.body.statistics).toHaveProperty('threatsByType');
      expect(response.body.statistics).toHaveProperty('blockedRequests');
    });

    it('should return security rules', async () => {
      const response = await request(app)
        .get('/gateway/security/rules')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        scrollMessage: 'The kingdom security rules are revealed.'
      });

      expect(Array.isArray(response.body.rules)).toBe(true);
      
      if (response.body.rules.length > 0) {
        const rule = response.body.rules[0];
        expect(rule).toHaveProperty('id');
        expect(rule).toHaveProperty('name');
        expect(rule).toHaveProperty('description');
        expect(rule).toHaveProperty('enabled');
        expect(rule).toHaveProperty('priority');
        expect(rule).toHaveProperty('action');
      }
    });

    it('should allow IP blacklisting', async () => {
      const testIP = '192.168.1.100';
      
      const response = await request(app)
        .post('/gateway/security/blacklist')
        .send({ ip: testIP })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: `IP ${testIP} has been blacklisted`,
        scrollMessage: 'The IP has been banished from the kingdom.'
      });
    });

    it('should allow IP unblacklisting', async () => {
      const testIP = '192.168.1.100';
      
      const response = await request(app)
        .delete(`/gateway/security/blacklist/${testIP}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: `IP ${testIP} has been removed from blacklist`,
        scrollMessage: 'The IP has been granted access to the kingdom.'
      });
    });

    it('should require IP for blacklisting', async () => {
      const response = await request(app)
        .post('/gateway/security/blacklist')
        .send({})
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: 'IP address required',
        scrollMessage: 'Provide an IP address to blacklist.'
      });
    });
  });

  describe('API Versioning', () => {
    it('should handle version headers', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('X-API-Version', 'v1')
        .expect(200);

      expect(response.headers['x-api-version']).toBe('v1');
    });

    it('should default to v1 when no version specified', async () => {
      const response = await request(app)
        .get('/api/services')
        .expect(200);

      expect(response.headers['x-api-version']).toBe('v1');
    });

    it('should reject invalid API versions', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('X-API-Version', 'v999')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Invalid API version',
        scrollMessage: 'The scroll version you seek does not exist in the kingdom archives.'
      });

      expect(Array.isArray(response.body.supportedVersions)).toBe(true);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply global rate limiting', async () => {
      // This test would need to be adjusted based on actual rate limits
      // For now, just verify the endpoint responds
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Rate limit headers should be present
      expect(response.headers).toHaveProperty('x-ratelimit-limit');
      expect(response.headers).toHaveProperty('x-ratelimit-remaining');
    });
  });

  describe('Security Middleware', () => {
    it('should add security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });

    it('should detect SQL injection attempts', async () => {
      const response = await request(app)
        .get('/api/services?search=\' OR 1=1 --')
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Security violation',
        message: 'Request blocked by security policy',
        scrollMessage: 'The kingdom security has detected a threat in your request.'
      });
    });

    it('should detect XSS attempts', async () => {
      const response = await request(app)
        .get('/api/services?search=<script>alert("xss")</script>')
        .expect(403);

      expect(response.body).toMatchObject({
        error: 'Security violation',
        message: 'Request blocked by security policy',
        scrollMessage: 'The kingdom security has detected a threat in your request.'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes gracefully', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Route not found',
        scrollMessage: 'Seek and ye shall find the correct path in the scroll documentation.'
      });

      expect(Array.isArray(response.body.availableServices)).toBe(true);
    });

    it('should include request ID in responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('x-request-id');
      expect(response.headers['x-request-id']).toMatch(/^scroll-/);
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/services')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    it('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});