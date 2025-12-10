/**
 * Access Audit Logger Service
 * "Let all things be done decently and in order" (1 Corinthians 14:40)
 * 
 * Provides comprehensive audit logging for access control operations
 * to ensure compliance with financial regulations and kingdom accountability
 */

import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export enum AuditEventType {
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_REVOKED = 'ACCESS_REVOKED',
  ACCESS_EXTENDED = 'ACCESS_EXTENDED',
  ACCESS_CHECKED = 'ACCESS_CHECKED',
  SUBSCRIPTION_CREATED = 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED = 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELED = 'SUBSCRIPTION_CANCELED',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SCROLLGOLD_AWARDED = 'SCROLLGOLD_AWARDED',
  SCROLLGOLD_SPENT = 'SCROLLGOLD_SPENT',
  TIER_UPGRADED = 'TIER_UPGRADED',
  TIER_DOWNGRADED = 'TIER_DOWNGRADED',
  GRACE_PERIOD_STARTED = 'GRACE_PERIOD_STARTED',
  GRACE_PERIOD_ENDED = 'GRACE_PERIOD_ENDED'
}

export interface AuditLogEntry {
  eventType: AuditEventType;
  userId: string;
  entityType: string;
  entityId?: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export class AccessAuditLogger {
  /**
   * Log access grant event
   */
  async logAccessGranted(
    userId: string,
    resourceType: string,
    resourceId: string,
    subscriptionId: string,
    tier: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.ACCESS_GRANTED,
        userId,
        entityType: 'enrollment_access',
        entityId: resourceId,
        action: 'grant_access',
        details: {
          resourceType,
          resourceId,
          subscriptionId,
          tier,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Access grant logged', {
        userId,
        resourceType,
        resourceId,
        tier
      });
    } catch (error) {
      logger.error('Failed to log access grant', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resourceId
      });
      // Don't throw - logging failure shouldn't break main flow
    }
  }

  /**
   * Log access revocation event
   */
  async logAccessRevoked(
    userId: string,
    resourceType: string,
    resourceId: string,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.ACCESS_REVOKED,
        userId,
        entityType: 'enrollment_access',
        entityId: resourceId,
        action: 'revoke_access',
        details: {
          resourceType,
          resourceId,
          reason,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Access revocation logged', {
        userId,
        resourceType,
        resourceId,
        reason
      });
    } catch (error) {
      logger.error('Failed to log access revocation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        resourceId
      });
    }
  }

  /**
   * Log access extension event (period renewal)
   */
  async logAccessExtended(
    userId: string,
    subscriptionId: string,
    newExpiryDate: Date,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.ACCESS_EXTENDED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'extend_access',
        details: {
          subscriptionId,
          newExpiryDate: newExpiryDate.toISOString(),
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Access extension logged', {
        userId,
        subscriptionId,
        newExpiryDate
      });
    } catch (error) {
      logger.error('Failed to log access extension', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log subscription creation event
   */
  async logSubscriptionCreated(
    userId: string,
    subscriptionId: string,
    tier: string,
    amountCents: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.SUBSCRIPTION_CREATED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'create_subscription',
        details: {
          subscriptionId,
          tier,
          amountCents,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Subscription creation logged', {
        userId,
        subscriptionId,
        tier
      });
    } catch (error) {
      logger.error('Failed to log subscription creation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log subscription cancellation event
   */
  async logSubscriptionCanceled(
    userId: string,
    subscriptionId: string,
    reason?: string,
    immediate?: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.SUBSCRIPTION_CANCELED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'cancel_subscription',
        details: {
          subscriptionId,
          reason,
          immediate,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Subscription cancellation logged', {
        userId,
        subscriptionId,
        reason,
        immediate
      });
    } catch (error) {
      logger.error('Failed to log subscription cancellation', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log payment success event
   */
  async logPaymentSucceeded(
    userId: string,
    paymentId: string,
    amountCents: number,
    subscriptionId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.PAYMENT_SUCCEEDED,
        userId,
        entityType: 'payment',
        entityId: paymentId,
        action: 'payment_succeeded',
        details: {
          paymentId,
          amountCents,
          subscriptionId,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Payment success logged', {
        userId,
        paymentId,
        amountCents
      });
    } catch (error) {
      logger.error('Failed to log payment success', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        paymentId
      });
    }
  }

  /**
   * Log payment failure event
   */
  async logPaymentFailed(
    userId: string,
    subscriptionId: string,
    amountCents: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.PAYMENT_FAILED,
        userId,
        entityType: 'payment',
        entityId: subscriptionId,
        action: 'payment_failed',
        details: {
          subscriptionId,
          amountCents,
          reason,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Payment failure logged', {
        userId,
        subscriptionId,
        reason
      });
    } catch (error) {
      logger.error('Failed to log payment failure', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log grace period start event
   */
  async logGracePeriodStarted(
    userId: string,
    subscriptionId: string,
    gracePeriodEnd: Date,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.GRACE_PERIOD_STARTED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'grace_period_started',
        details: {
          subscriptionId,
          gracePeriodEnd: gracePeriodEnd.toISOString(),
          reason,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Grace period start logged', {
        userId,
        subscriptionId,
        gracePeriodEnd
      });
    } catch (error) {
      logger.error('Failed to log grace period start', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log tier upgrade event
   */
  async logTierUpgraded(
    userId: string,
    subscriptionId: string,
    fromTier: string,
    toTier: string,
    proratedAmount?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.TIER_UPGRADED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'tier_upgraded',
        details: {
          subscriptionId,
          fromTier,
          toTier,
          proratedAmount,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Tier upgrade logged', {
        userId,
        subscriptionId,
        fromTier,
        toTier
      });
    } catch (error) {
      logger.error('Failed to log tier upgrade', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Log tier downgrade event
   */
  async logTierDowngraded(
    userId: string,
    subscriptionId: string,
    fromTier: string,
    toTier: string,
    immediate: boolean,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.createAuditLog({
        eventType: AuditEventType.TIER_DOWNGRADED,
        userId,
        entityType: 'subscription',
        entityId: subscriptionId,
        action: 'tier_downgraded',
        details: {
          subscriptionId,
          fromTier,
          toTier,
          immediate,
          ...metadata
        },
        timestamp: new Date()
      });

      logger.info('Tier downgrade logged', {
        userId,
        subscriptionId,
        fromTier,
        toTier,
        immediate
      });
    } catch (error) {
      logger.error('Failed to log tier downgrade', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        subscriptionId
      });
    }
  }

  /**
   * Create audit log entry in database
   */
  private async createAuditLog(entry: AuditLogEntry): Promise<void> {
    const { error } = await supabase
      .from('access_audit_logs')
      .insert({
        event_type: entry.eventType,
        user_id: entry.userId,
        entity_type: entry.entityType,
        entity_id: entry.entityId,
        action: entry.action,
        details: entry.details,
        ip_address: entry.ipAddress,
        user_agent: entry.userAgent,
        timestamp: entry.timestamp.toISOString()
      });

    if (error) {
      throw new Error(`Failed to create audit log: ${error.message}`);
    }
  }

  /**
   * Query audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    options?: {
      eventTypes?: AuditEventType[];
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('access_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (options?.eventTypes && options.eventTypes.length > 0) {
        query = query.in('event_type', options.eventTypes);
      }

      if (options?.startDate) {
        query = query.gte('timestamp', options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte('timestamp', options.endDate.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to query audit logs: ${error.message}`);
      }

      return (data || []).map(row => ({
        eventType: row.event_type as AuditEventType,
        userId: row.user_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        details: row.details,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to query user audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });
      return [];
    }
  }

  /**
   * Query audit logs for a subscription
   */
  async getSubscriptionAuditLogs(
    subscriptionId: string,
    limit?: number
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('access_audit_logs')
        .select('*')
        .eq('entity_id', subscriptionId)
        .eq('entity_type', 'subscription')
        .order('timestamp', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to query subscription audit logs: ${error.message}`);
      }

      return (data || []).map(row => ({
        eventType: row.event_type as AuditEventType,
        userId: row.user_id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        action: row.action,
        details: row.details,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: new Date(row.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to query subscription audit logs', {
        error: error instanceof Error ? error.message : 'Unknown error',
        subscriptionId
      });
      return [];
    }
  }

  /**
   * Generate compliance report for a date range
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    accessGrants: number;
    accessRevocations: number;
    paymentSuccesses: number;
    paymentFailures: number;
    subscriptionCancellations: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('access_audit_logs')
        .select('event_type')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        throw new Error(`Failed to generate compliance report: ${error.message}`);
      }

      const events = data || [];
      const eventsByType: Record<string, number> = {};

      events.forEach(event => {
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;
      });

      return {
        totalEvents: events.length,
        eventsByType,
        accessGrants: eventsByType[AuditEventType.ACCESS_GRANTED] || 0,
        accessRevocations: eventsByType[AuditEventType.ACCESS_REVOKED] || 0,
        paymentSuccesses: eventsByType[AuditEventType.PAYMENT_SUCCEEDED] || 0,
        paymentFailures: eventsByType[AuditEventType.PAYMENT_FAILED] || 0,
        subscriptionCancellations: eventsByType[AuditEventType.SUBSCRIPTION_CANCELED] || 0
      };
    } catch (error) {
      logger.error('Failed to generate compliance report', {
        error: error instanceof Error ? error.message : 'Unknown error',
        startDate,
        endDate
      });
      throw error;
    }
  }
}

export default new AccessAuditLogger();
