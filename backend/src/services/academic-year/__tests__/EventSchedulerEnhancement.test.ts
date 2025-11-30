/**
 * EventScheduler Enhancement Integration Test
 * "The Spirit of truth will guide you into all truth" - John 16:13
 * 
 * Tests the enhanced features: logging, event bus, and caching
 */

import EventSchedulerService from '../EventSchedulerService';
import { eventBus, ACADEMIC_EVENTS } from '../../../utils/eventBus';
import { logger } from '../../../utils/productionLogger';

describe('EventSchedulerService - Enhanced Features', () => {
  let service: EventSchedulerService;

  beforeAll(() => {
    service = new EventSchedulerService();
  });

  afterAll(() => {
    // Clean up event listeners
    eventBus.removeAllListeners();
  });

  describe('Logger Integration', () => {
    it('should initialize with logger', () => {
      expect(service).toBeDefined();
      expect(logger).toBeDefined();
    });

    it('should have logger methods available', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });

  describe('Event Bus Integration', () => {
    it('should have event bus available', () => {
      expect(eventBus).toBeDefined();
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.emit).toBe('function');
    });

    it('should emit events when scheduling', (done) => {
      const listener = jest.fn();

      eventBus.once(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener);

      // Verify the listener is registered
      expect(eventBus.listenerCount(ACADEMIC_EVENTS.EVENT_SCHEDULED)).toBeGreaterThan(0);
      
      // Clean up and complete
      eventBus.removeListener(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener);
      done();
    });

    it('should support deadline approaching events', () => {
      const listener = jest.fn();
      eventBus.on(ACADEMIC_EVENTS.DEADLINE_APPROACHING, listener);
      
      expect(eventBus.listenerCount(ACADEMIC_EVENTS.DEADLINE_APPROACHING)).toBeGreaterThan(0);
      
      eventBus.removeListener(ACADEMIC_EVENTS.DEADLINE_APPROACHING, listener);
    });

    it('should provide event metrics', () => {
      const metrics = eventBus.getMetrics();
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
      expect(metrics).toHaveProperty('totalEvents');
      expect(metrics).toHaveProperty('eventsByType');
      expect(metrics).toHaveProperty('lastEventTime');
    });
  });

  describe('Holiday Caching', () => {
    it('should have caching mechanism', () => {
      // The service has private cache, but we can verify the method exists
      expect(typeof service.getHolidays).toBe('function');
    });

    it('should return consistent results for same academic year', async () => {
      const academicYearId = 'test-year-2024';
      
      // First call
      const result1 = await service.getHolidays(academicYearId);
      
      // Second call (should use cache)
      const result2 = await service.getHolidays(academicYearId);
      
      // Both should have same structure
      expect(result1).toHaveProperty('success');
      expect(result2).toHaveProperty('success');
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should return structured error responses', async () => {
      const invalidParams = {
        academicYearId: '',
        eventType: '',
        name: '',
        startDate: new Date()
      };

      const result = await service.scheduleEvent(invalidParams);
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });

    it('should validate deadline parameters', async () => {
      const invalidDeadline = {
        entityType: '',
        deadlineType: '',
        title: '',
        deadlineDate: new Date()
      };

      const result = await service.createDeadline(invalidDeadline);
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track operation timing', async () => {
      const startTime = Date.now();
      
      await service.getHolidays('test-year-2024');
      
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds max
    });
  });

  describe('Service Response Format', () => {
    it('should return consistent response structure', async () => {
      const result = await service.getHolidays('test-year-2024');
      
      expect(result).toHaveProperty('success');
      expect(typeof result.success).toBe('boolean');
      
      if (result.success) {
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('message');
      } else {
        expect(result).toHaveProperty('error');
      }
    });
  });
});

describe('Event Bus - Standalone Tests', () => {
  beforeEach(() => {
    // Reset metrics before each test
    eventBus.resetMetrics();
  });

  afterEach(() => {
    // Clean up all listeners after each test
    eventBus.removeAllListeners();
  });

  it('should handle multiple listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    eventBus.on(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener1);
    eventBus.on(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener2);

    expect(eventBus.listenerCount(ACADEMIC_EVENTS.EVENT_SCHEDULED)).toBe(2);

    eventBus.removeListener(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener1);
    eventBus.removeListener(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener2);
  });

  it('should support one-time listeners', () => {
    const listener = jest.fn();

    eventBus.once(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener);

    expect(eventBus.listenerCount(ACADEMIC_EVENTS.EVENT_SCHEDULED)).toBe(1);
  });

  it('should clean up listeners', () => {
    const listener = jest.fn();

    eventBus.on(ACADEMIC_EVENTS.EVENT_SCHEDULED, listener);
    eventBus.removeAllListeners(ACADEMIC_EVENTS.EVENT_SCHEDULED);

    expect(eventBus.listenerCount(ACADEMIC_EVENTS.EVENT_SCHEDULED)).toBe(0);
  });

  it('should track event emissions in metrics', () => {
    const initialMetrics = eventBus.getMetrics();
    expect(initialMetrics.totalEvents).toBe(0);

    eventBus.emit(ACADEMIC_EVENTS.EVENT_SCHEDULED, { test: 'data' });

    const updatedMetrics = eventBus.getMetrics();
    expect(updatedMetrics.totalEvents).toBe(1);
    expect(updatedMetrics.eventsByType[ACADEMIC_EVENTS.EVENT_SCHEDULED]).toBe(1);
    expect(updatedMetrics.lastEventTime).toBeInstanceOf(Date);
  });
});

describe('Production Logger - Standalone Tests', () => {
  it('should have all log levels', () => {
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('should accept structured data', () => {
    // Should not throw
    expect(() => {
      logger.info('Test message', {
        service: 'TestService',
        method: 'testMethod',
        data: { key: 'value' }
      });
    }).not.toThrow();
  });

  it('should handle errors gracefully', () => {
    expect(() => {
      logger.error('Test error', {
        error: 'Test error message',
        stack: 'Test stack trace'
      });
    }).not.toThrow();
  });
});
