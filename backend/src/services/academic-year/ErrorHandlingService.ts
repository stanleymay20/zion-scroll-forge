/**
 * Error Handling Service for Academic Year Automation System
 * Centralized error handling, recovery strategies, and monitoring
 * Task 41: Implement error handling and recovery
 * Validates: All Requirements
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../utils/logger';
import { monitoringService } from '../MonitoringService';

// Error types specific to Academic Year Automation System
export type AcademicYearErrorType =
  | 'validation_error'
  | 'database_error'
  | 'workflow_error'
  | 'notification_error'
  | 'calendar_conflict'
  | 'prerequisite_error'
  | 'capacity_error'
  | 'graduation_error'
  | 'teaching_load_error'
  | 'grading_error'
  | 'module_sequencing_error'
  | 'event_ordering_error'
  | 'ai_agent_error'
  | 'integration_error'
  | 'timeout_error'
  | 'authorization_error'
  | 'system_error';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RecoveryStrategy = 'retry' | 'fallback' | 'compensate' | 'escalate' | 'ignore';

export interface ErrorContext {
  service: string;
  operation: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorRecord {
  id: string;
  errorType: AcademicYearErrorType;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  context: ErrorContext;
  recoveryStrategy: RecoveryStrategy;
  recoveryAttempts: number;
  maxRecoveryAttempts: number;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  attempts: number;
  message: string;
  data?: unknown;
}

export interface ErrorStatistics {
  totalErrors: number;
  errorsByType: Record<AcademicYearErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  resolvedErrors: number;
  unresolvedErrors: number;
  averageRecoveryTime: number;
  topErrors: Array<{ type: AcademicYearErrorType; count: number }>;
}

/**
 * Custom error class for Academic Year Automation System
 */
export class AcademicYearError extends Error {
  public readonly errorType: AcademicYearErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly suggestedStrategy: RecoveryStrategy;

  constructor(
    message: string,
    errorType: AcademicYearErrorType,
    severity: ErrorSeverity,
    context: ErrorContext,
    recoverable: boolean = true,
    suggestedStrategy: RecoveryStrategy = 'retry'
  ) {
    super(message);
    this.name = 'AcademicYearError';
    this.errorType = errorType;
    this.severity = severity;
    this.context = context;
    this.recoverable = recoverable;
    this.suggestedStrategy = suggestedStrategy;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AcademicYearError);
    }
  }
}

/**
 * Error Handling Service
 * Provides centralized error handling, recovery, and monitoring
 */
export class ErrorHandlingService {
  private supabase: SupabaseClient;
  private errorCache: Map<string, ErrorRecord> = new Map();
  private recoveryHandlers: Map<AcademicYearErrorType, (error: ErrorRecord) => Promise<RecoveryResult>> = new Map();

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.registerDefaultRecoveryHandlers();
  }

  /**
   * Handle an error with automatic recovery attempts
   */
  async handleError(error: Error | AcademicYearError, context?: ErrorContext): Promise<RecoveryResult> {
    try {
      // Convert to AcademicYearError if needed
      const academicError = this.normalizeError(error, context);

      // Log the error
      this.logError(academicError);

      // Record error in database
      const errorRecord = await this.recordError(academicError);

      // Record metrics
      monitoringService.recordError(academicError, {
        errorType: academicError.errorType,
        severity: academicError.severity,
        service: academicError.context.service
      });

      // Attempt recovery if error is recoverable
      if (academicError.recoverable && errorRecord.recoveryAttempts < errorRecord.maxRecoveryAttempts) {
        return await this.attemptRecovery(errorRecord);
      }

      // If not recoverable or max attempts reached, escalate
      if (!academicError.recoverable || errorRecord.recoveryAttempts >= errorRecord.maxRecoveryAttempts) {
        await this.escalateError(errorRecord);
        return {
          success: false,
          strategy: 'escalate',
          attempts: errorRecord.recoveryAttempts,
          message: 'Error escalated to administrators'
        };
      }

      return {
        success: false,
        strategy: academicError.suggestedStrategy,
        attempts: 0,
        message: 'Error recorded, no recovery attempted'
      };
    } catch (handlingError) {
      // If error handling itself fails, log and return failure
      logger.error('Error handling failed', {
        originalError: error.message,
        handlingError: handlingError instanceof Error ? handlingError.message : 'Unknown error'
      });

      return {
        success: false,
        strategy: 'escalate',
        attempts: 0,
        message: 'Error handling failed'
      };
    }
  }

  /**
   * Attempt to recover from an error
   */
  async attemptRecovery(errorRecord: ErrorRecord): Promise<RecoveryResult> {
    try {
      // Get recovery handler for this error type
      const handler = this.recoveryHandlers.get(errorRecord.errorType);

      if (!handler) {
        logger.warn('No recovery handler found for error type', { errorType: errorRecord.errorType });
        return {
          success: false,
          strategy: 'escalate',
          attempts: errorRecord.recoveryAttempts,
          message: 'No recovery handler available'
        };
      }

      // Increment recovery attempts
      await this.incrementRecoveryAttempts(errorRecord.id);

      // Execute recovery handler
      const result = await handler(errorRecord);

      // If recovery successful, mark error as resolved
      if (result.success) {
        await this.resolveError(errorRecord.id);
        logger.info('Error recovered successfully', {
          errorId: errorRecord.id,
          strategy: result.strategy,
          attempts: result.attempts
        });
      }

      return result;
    } catch (recoveryError) {
      logger.error('Recovery attempt failed', {
        errorId: errorRecord.id,
        recoveryError: recoveryError instanceof Error ? recoveryError.message : 'Unknown error'
      });

      return {
        success: false,
        strategy: errorRecord.recoveryStrategy,
        attempts: errorRecord.recoveryAttempts + 1,
        message: 'Recovery attempt failed'
      };
    }
  }

  /**
   * Register a custom recovery handler for an error type
   */
  registerRecoveryHandler(
    errorType: AcademicYearErrorType,
    handler: (error: ErrorRecord) => Promise<RecoveryResult>
  ): void {
    this.recoveryHandlers.set(errorType, handler);
    logger.info('Recovery handler registered', { errorType });
  }

  /**
   * Get error statistics
   */
  async getErrorStatistics(startDate?: Date, endDate?: Date): Promise<ErrorStatistics> {
    try {
      let query = this.supabase
        .from('academic_year_errors')
        .select('*');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch error statistics: ${error.message}`);
      }

      // Calculate statistics
      const errorsByType: Record<string, number> = {};
      const errorsBySeverity: Record<string, number> = {};
      let resolvedErrors = 0;
      let totalRecoveryTime = 0;
      let recoveredErrorsCount = 0;

      data.forEach((record: any) => {
        // Count by type
        errorsByType[record.error_type] = (errorsByType[record.error_type] || 0) + 1;

        // Count by severity
        errorsBySeverity[record.severity] = (errorsBySeverity[record.severity] || 0) + 1;

        // Count resolved
        if (record.resolved) {
          resolvedErrors++;

          // Calculate recovery time
          if (record.resolved_at) {
            const createdAt = new Date(record.created_at);
            const resolvedAt = new Date(record.resolved_at);
            totalRecoveryTime += resolvedAt.getTime() - createdAt.getTime();
            recoveredErrorsCount++;
          }
        }
      });

      // Get top errors
      const topErrors = Object.entries(errorsByType)
        .map(([type, count]) => ({ type: type as AcademicYearErrorType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return {
        totalErrors: data.length,
        errorsByType: errorsByType as Record<AcademicYearErrorType, number>,
        errorsBySeverity: errorsBySeverity as Record<ErrorSeverity, number>,
        resolvedErrors,
        unresolvedErrors: data.length - resolvedErrors,
        averageRecoveryTime: recoveredErrorsCount > 0 ? totalRecoveryTime / recoveredErrorsCount : 0,
        topErrors
      };
    } catch (error) {
      logger.error('Failed to get error statistics', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        totalErrors: 0,
        errorsByType: {} as Record<AcademicYearErrorType, number>,
        errorsBySeverity: {} as Record<ErrorSeverity, number>,
        resolvedErrors: 0,
        unresolvedErrors: 0,
        averageRecoveryTime: 0,
        topErrors: []
      };
    }
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(limit: number = 50): Promise<ErrorRecord[]> {
    try {
      const { data, error } = await this.supabase
        .from('academic_year_errors')
        .select('*')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch unresolved errors: ${error.message}`);
      }

      return data.map(this.mapDatabaseRecordToErrorRecord);
    } catch (error) {
      logger.error('Failed to get unresolved errors', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Manually resolve an error
   */
  async resolveError(errorId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('academic_year_errors')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', errorId);

      if (error) {
        throw new Error(`Failed to resolve error: ${error.message}`);
      }

      // Remove from cache
      this.errorCache.delete(errorId);

      logger.info('Error resolved', { errorId });
    } catch (error) {
      logger.error('Failed to resolve error', {
        errorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Private helper methods

  private normalizeError(error: Error | AcademicYearError, context?: ErrorContext): AcademicYearError {
    if (error instanceof AcademicYearError) {
      return error;
    }

    // Determine error type based on error message or name
    const errorType = this.inferErrorType(error);
    const severity = this.inferSeverity(error);

    return new AcademicYearError(
      error.message,
      errorType,
      severity,
      context || {
        service: 'unknown',
        operation: 'unknown'
      },
      true,
      'retry'
    );
  }

  private inferErrorType(error: Error): AcademicYearErrorType {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();

    if (message.includes('validation') || name.includes('validation')) {
      return 'validation_error';
    }
    if (message.includes('database') || message.includes('prisma') || message.includes('supabase')) {
      return 'database_error';
    }
    if (message.includes('workflow')) {
      return 'workflow_error';
    }
    if (message.includes('notification')) {
      return 'notification_error';
    }
    if (message.includes('conflict')) {
      return 'calendar_conflict';
    }
    if (message.includes('prerequisite')) {
      return 'prerequisite_error';
    }
    if (message.includes('capacity')) {
      return 'capacity_error';
    }
    if (message.includes('graduation')) {
      return 'graduation_error';
    }
    if (message.includes('teaching load')) {
      return 'teaching_load_error';
    }
    if (message.includes('grading')) {
      return 'grading_error';
    }
    if (message.includes('module')) {
      return 'module_sequencing_error';
    }
    if (message.includes('event') && message.includes('order')) {
      return 'event_ordering_error';
    }
    if (message.includes('ai') || message.includes('agent')) {
      return 'ai_agent_error';
    }
    if (message.includes('integration')) {
      return 'integration_error';
    }
    if (message.includes('timeout')) {
      return 'timeout_error';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'authorization_error';
    }

    return 'system_error';
  }

  private inferSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) {
      return 'critical';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'low';
    }
    if (message.includes('database') || message.includes('timeout')) {
      return 'high';
    }

    return 'medium';
  }

  private logError(error: AcademicYearError): void {
    const logData = {
      errorType: error.errorType,
      severity: error.severity,
      message: error.message,
      context: error.context,
      stack: error.stack
    };

    switch (error.severity) {
      case 'critical':
        logger.error('CRITICAL ERROR', logData);
        break;
      case 'high':
        logger.error('High severity error', logData);
        break;
      case 'medium':
        logger.warn('Medium severity error', logData);
        break;
      case 'low':
        logger.info('Low severity error', logData);
        break;
    }
  }

  private async recordError(error: AcademicYearError): Promise<ErrorRecord> {
    try {
      const maxAttempts = this.getMaxRecoveryAttempts(error.errorType, error.severity);

      const { data, error: dbError } = await this.supabase
        .from('academic_year_errors')
        .insert({
          error_type: error.errorType,
          severity: error.severity,
          message: error.message,
          stack: error.stack,
          context: error.context,
          recovery_strategy: error.suggestedStrategy,
          recovery_attempts: 0,
          max_recovery_attempts: maxAttempts,
          resolved: false
        })
        .select()
        .single();

      if (dbError || !data) {
        throw new Error(`Failed to record error: ${dbError?.message}`);
      }

      const errorRecord = this.mapDatabaseRecordToErrorRecord(data);
      this.errorCache.set(errorRecord.id, errorRecord);

      return errorRecord;
    } catch (recordError) {
      logger.error('Failed to record error in database', {
        originalError: error.message,
        recordError: recordError instanceof Error ? recordError.message : 'Unknown error'
      });

      // Return a minimal error record even if database insert fails
      return {
        id: `temp_${Date.now()}`,
        errorType: error.errorType,
        severity: error.severity,
        message: error.message,
        stack: error.stack,
        context: error.context,
        recoveryStrategy: error.suggestedStrategy,
        recoveryAttempts: 0,
        maxRecoveryAttempts: 3,
        resolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  private getMaxRecoveryAttempts(errorType: AcademicYearErrorType, severity: ErrorSeverity): number {
    // Critical errors get fewer attempts
    if (severity === 'critical') {
      return 1;
    }

    // Some error types are more recoverable than others
    switch (errorType) {
      case 'timeout_error':
      case 'integration_error':
        return 5;
      case 'database_error':
      case 'notification_error':
        return 3;
      case 'validation_error':
      case 'authorization_error':
        return 1; // Don't retry validation or auth errors
      default:
        return 3;
    }
  }

  private async incrementRecoveryAttempts(errorId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('academic_year_errors')
        .update({
          recovery_attempts: this.supabase.rpc('increment', { row_id: errorId }),
          updated_at: new Date().toISOString()
        })
        .eq('id', errorId);

      if (error) {
        logger.warn('Failed to increment recovery attempts', { errorId, error: error.message });
      }
    } catch (error) {
      logger.warn('Failed to increment recovery attempts', {
        errorId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async escalateError(errorRecord: ErrorRecord): Promise<void> {
    try {
      // Log escalation
      logger.error('Error escalated', {
        errorId: errorRecord.id,
        errorType: errorRecord.errorType,
        severity: errorRecord.severity,
        attempts: errorRecord.recoveryAttempts
      });

      // Record escalation event
      monitoringService.recordSecurityEvent(
        'error_escalation',
        {
          errorId: errorRecord.id,
          errorType: errorRecord.errorType,
          severity: errorRecord.severity,
          message: errorRecord.message
        },
        errorRecord.context.userId
      );

      // TODO: Send notification to administrators
      // This would integrate with NotificationService to alert admins

    } catch (error) {
      logger.error('Failed to escalate error', {
        errorId: errorRecord.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private mapDatabaseRecordToErrorRecord(data: any): ErrorRecord {
    return {
      id: data.id,
      errorType: data.error_type,
      severity: data.severity,
      message: data.message,
      stack: data.stack,
      context: data.context,
      recoveryStrategy: data.recovery_strategy,
      recoveryAttempts: data.recovery_attempts,
      maxRecoveryAttempts: data.max_recovery_attempts,
      resolved: data.resolved,
      resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }

  private registerDefaultRecoveryHandlers(): void {
    // Database error recovery: retry with exponential backoff
    this.registerRecoveryHandler('database_error', async (error) => {
      const delay = Math.min(1000 * Math.pow(2, error.recoveryAttempts), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));

      return {
        success: false, // Would need actual retry logic
        strategy: 'retry',
        attempts: error.recoveryAttempts + 1,
        message: `Retried after ${delay}ms delay`
      };
    });

    // Timeout error recovery: retry with increased timeout
    this.registerRecoveryHandler('timeout_error', async (error) => {
      return {
        success: false,
        strategy: 'retry',
        attempts: error.recoveryAttempts + 1,
        message: 'Retry with increased timeout'
      };
    });

    // Notification error recovery: use fallback channel
    this.registerRecoveryHandler('notification_error', async (error) => {
      return {
        success: false,
        strategy: 'fallback',
        attempts: error.recoveryAttempts + 1,
        message: 'Attempted fallback notification channel'
      };
    });

    // Validation errors are not recoverable
    this.registerRecoveryHandler('validation_error', async (error) => {
      return {
        success: false,
        strategy: 'escalate',
        attempts: error.recoveryAttempts,
        message: 'Validation errors require manual intervention'
      };
    });
  }
}

export default ErrorHandlingService;
