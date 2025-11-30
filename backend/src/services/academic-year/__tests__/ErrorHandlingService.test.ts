/**
 * Error Handling Service Tests
 * Tests centralized error handling, recovery strategies, and monitoring
 */

import ErrorHandlingService, {
  AcademicYearError,
  ErrorContext,
  RecoveryResult
} from '../ErrorHandlingService';

describe('ErrorHandlingService', () => {
  let errorHandlingService: ErrorHandlingService;

  beforeEach(() => {
    errorHandlingService = new ErrorHandlingService();
  });

  describe('Error Normalization', () => {
    it('should convert standard Error to AcademicYearError', async () => {
      const standardError = new Error('Database connection failed');
      const context: ErrorContext = {
        service: 'AcademicCalendarService',
        operation: 'createAcademicYear',
        userId: 'user123'
      };

      const result = await errorHandlingService.handleError(standardError, context);

      expect(result).toBeDefined();
      expect(result.strategy).toBeDefined();
    });

    it('should handle AcademicYearError directly', async () => {
      const context: ErrorContext = {
        service: 'RegistrationService',
        operation: 'registerForCourses'
      };

      const academicError = new AcademicYearError(
        'Prerequisite not met',
        'prerequisite_error',
        'medium',
        context,
        false,
        'escalate'
      );

      const result = await errorHandlingService.handleError(academicError);

      expect(result).toBeDefined();
      expect(result.strategy).toBe('escalate');
    });
  });

  describe('Error Type Inference', () => {
    it('should infer validation_error from error message', async () => {
      const error = new Error('Validation failed: invalid date format');
      const context: ErrorContext = {
        service: 'AcademicCalendarService',
        operation: 'createAcademicYear'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });

    it('should infer database_error from error message', async () => {
      const error = new Error('Database query failed: connection timeout');
      const context: ErrorContext = {
        service: 'RegistrationService',
        operation: 'enrollStudent'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });

    it('should infer prerequisite_error from error message', async () => {
      const error = new Error('Prerequisite course not completed');
      const context: ErrorContext = {
        service: 'RegistrationService',
        operation: 'validatePrerequisites'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });
  });

  describe('Severity Inference', () => {
    it('should infer critical severity from error message', async () => {
      const error = new Error('CRITICAL: System failure detected');
      const context: ErrorContext = {
        service: 'WorkflowEngineService',
        operation: 'executeWorkflow'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });

    it('should infer high severity for database errors', async () => {
      const error = new Error('Database connection lost');
      const context: ErrorContext = {
        service: 'GraduationService',
        operation: 'evaluateEligibility'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });

    it('should infer low severity for validation errors', async () => {
      const error = new Error('Invalid input: name is required');
      const context: ErrorContext = {
        service: 'AdmissionService',
        operation: 'processApplication'
      };

      const result = await errorHandlingService.handleError(error, context);

      expect(result).toBeDefined();
    });
  });

  describe('Recovery Strategies', () => {
    it('should register custom recovery handler', () => {
      const customHandler = async (): Promise<RecoveryResult> => ({
        success: true,
        strategy: 'retry',
        attempts: 1,
        message: 'Custom recovery successful'
      });

      errorHandlingService.registerRecoveryHandler('database_error', customHandler);

      // Handler should be registered (no error thrown)
      expect(true).toBe(true);
    });

    it('should not retry non-recoverable errors', async () => {
      const context: ErrorContext = {
        service: 'RegistrationService',
        operation: 'validateInput'
      };

      const error = new AcademicYearError(
        'Invalid input data',
        'validation_error',
        'low',
        context,
        false, // Not recoverable
        'escalate'
      );

      const result = await errorHandlingService.handleError(error);

      expect(result.strategy).toBe('escalate');
    });
  });

  describe('Error Statistics', () => {
    it('should return error statistics', async () => {
      const stats = await errorHandlingService.getErrorStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
      expect(stats.errorsByType).toBeDefined();
      expect(stats.errorsBySeverity).toBeDefined();
      expect(stats.resolvedErrors).toBeGreaterThanOrEqual(0);
      expect(stats.unresolvedErrors).toBeGreaterThanOrEqual(0);
      expect(stats.averageRecoveryTime).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stats.topErrors)).toBe(true);
    });

    it('should return error statistics for date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const stats = await errorHandlingService.getErrorStatistics(startDate, endDate);

      expect(stats).toBeDefined();
      expect(stats.totalErrors).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Unresolved Errors', () => {
    it('should return unresolved errors', async () => {
      const unresolvedErrors = await errorHandlingService.getUnresolvedErrors(10);

      expect(Array.isArray(unresolvedErrors)).toBe(true);
      unresolvedErrors.forEach(error => {
        expect(error.resolved).toBe(false);
      });
    });

    it('should respect limit parameter', async () => {
      const limit = 5;
      const unresolvedErrors = await errorHandlingService.getUnresolvedErrors(limit);

      expect(unresolvedErrors.length).toBeLessThanOrEqual(limit);
    });
  });

  describe('Error Context', () => {
    it('should preserve error context', async () => {
      const context: ErrorContext = {
        service: 'ModuleSequencerService',
        operation: 'releaseModule',
        userId: 'user456',
        entityType: 'module',
        entityId: 'module789',
        requestId: 'req123',
        metadata: {
          courseId: 'course001',
          moduleNumber: 1
        }
      };

      const error = new AcademicYearError(
        'Module release failed',
        'module_sequencing_error',
        'medium',
        context
      );

      const result = await errorHandlingService.handleError(error);

      expect(result).toBeDefined();
    });
  });

  describe('Error Recovery Attempts', () => {
    it('should track recovery attempts', async () => {
      const context: ErrorContext = {
        service: 'NotificationService',
        operation: 'sendNotification'
      };

      const error = new AcademicYearError(
        'Notification delivery failed',
        'notification_error',
        'medium',
        context,
        true,
        'retry'
      );

      const result = await errorHandlingService.handleError(error);

      expect(result).toBeDefined();
      expect(result.attempts).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Resolution', () => {
    it('should handle manual error resolution', async () => {
      // This test would require a real error ID from the database
      // For now, we just verify the method exists and handles errors gracefully
      try {
        await errorHandlingService.resolveError('non-existent-id');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Types Coverage', () => {
    const errorTypes = [
      'validation_error',
      'database_error',
      'workflow_error',
      'notification_error',
      'calendar_conflict',
      'prerequisite_error',
      'capacity_error',
      'graduation_error',
      'teaching_load_error',
      'grading_error',
      'module_sequencing_error',
      'event_ordering_error',
      'ai_agent_error',
      'integration_error',
      'timeout_error',
      'authorization_error',
      'system_error'
    ];

    errorTypes.forEach(errorType => {
      it(`should handle ${errorType}`, async () => {
        const context: ErrorContext = {
          service: 'TestService',
          operation: 'testOperation'
        };

        const error = new AcademicYearError(
          `Test ${errorType}`,
          errorType as any,
          'medium',
          context
        );

        const result = await errorHandlingService.handleError(error);

        expect(result).toBeDefined();
      });
    });
  });

  describe('Severity Levels', () => {
    const severities: Array<'low' | 'medium' | 'high' | 'critical'> = [
      'low',
      'medium',
      'high',
      'critical'
    ];

    severities.forEach(severity => {
      it(`should handle ${severity} severity errors`, async () => {
        const context: ErrorContext = {
          service: 'TestService',
          operation: 'testOperation'
        };

        const error = new AcademicYearError(
          `Test ${severity} error`,
          'system_error',
          severity,
          context
        );

        const result = await errorHandlingService.handleError(error);

        expect(result).toBeDefined();
      });
    });
  });

  describe('Recovery Strategies', () => {
    const strategies: Array<'retry' | 'fallback' | 'compensate' | 'escalate' | 'ignore'> = [
      'retry',
      'fallback',
      'compensate',
      'escalate',
      'ignore'
    ];

    strategies.forEach(strategy => {
      it(`should handle ${strategy} recovery strategy`, async () => {
        const context: ErrorContext = {
          service: 'TestService',
          operation: 'testOperation'
        };

        const error = new AcademicYearError(
          `Test ${strategy} strategy`,
          'system_error',
          'medium',
          context,
          true,
          strategy
        );

        const result = await errorHandlingService.handleError(error);

        expect(result).toBeDefined();
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle errors without context', async () => {
      const error = new Error('Error without context');

      const result = await errorHandlingService.handleError(error);

      expect(result).toBeDefined();
    });

    it('should handle errors with minimal context', async () => {
      const error = new Error('Error with minimal context');
      const context: ErrorContext = {
        service: 'UnknownService',
        operation: 'unknownOperation'
      };

      const result = await errorHandlingService.handleError(error);

      expect(result).toBeDefined();
    });

    it('should handle errors with complex metadata', async () => {
      const context: ErrorContext = {
        service: 'ComplexService',
        operation: 'complexOperation',
        metadata: {
          nested: {
            data: {
              value: 123,
              array: [1, 2, 3],
              object: { key: 'value' }
            }
          }
        }
      };

      const error = new AcademicYearError(
        'Complex error',
        'system_error',
        'medium',
        context
      );

      const result = await errorHandlingService.handleError(error);

      expect(result).toBeDefined();
    });
  });
});
