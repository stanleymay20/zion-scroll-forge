/**
 * Event Bus Service
 * "In their hearts humans plan their course, but the LORD establishes their steps." - Proverbs 16:9
 * 
 * Task 26: Event Bus Service
 * Implementation for event logging, audit management, subscription mechanism, and publish events
 * Validates Requirements 3.5
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../utils/productionLogger';

// Event types for the academic year automation system
export type EventType =
  | 'student_enrolled'
  | 'course_completed'
  | 'grade_submitted'
  | 'workflow_started'
  | 'workflow_completed'
  | 'semester_started'
  | 'semester_ended'
  | 'academic_year_started'
  | 'graduation_eligible'
  | 'spiritual_milestone'
  | 'notification'
  | 'system_alert'
  | 'custom';

export type EventPriority = 'low' | 'normal' | 'high' | 'critical';

export type EventStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';

// Event payload interface
export interface EventPayload {
  [key: string]: any;
}

// System event interface
export interface SystemEvent {
  id: string;
  type: EventType;
  source: string;
  payload: EventPayload;
  priority: EventPriority;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Event subscription interface
export interface EventSubscription {
  id: string;
  subscriberId: string;
  eventTypes: EventType[];
  filterCriteria?: Record<string, any>;
  webhookUrl?: string;
  isActive: boolean;
  retryPolicy?: {
    maxAttempts: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
  createdAt: Date;
  lastTriggered?: Date;
}

// Event delivery interface
export interface EventDelivery {
  id: string;
  eventId: string;
  subscriptionId: string;
  status: EventStatus;
  attemptCount: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  errorMessage?: string;
  responseTime?: number;
  deliveredAt?: Date;
}

// Event filter interface
export interface EventFilter {
  eventTypes?: EventType[];
  source?: string;
  priority?: EventPriority;
  userId?: string;
  correlationId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Event analytics interface
export interface EventAnalytics {
  totalEvents: number;
  eventsByType: Record<EventType, number>;
  eventsBySource: Record<string, number>;
  eventsByPriority: Record<EventPriority, number>;
  averageProcessingTime: number;
  successRate: number;
  failureRate: number;
  retryRate: number;
}

// Publish event request
export interface EventPublishRequest {
  type: EventType;
  source: string;
  payload: EventPayload;
  priority?: EventPriority;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// Subscription request
export interface EventSubscriptionRequest {
  subscriberId: string;
  eventTypes: EventType[];
  filterCriteria?: Record<string, any>;
  webhookUrl?: string;
  retryPolicy?: {
    maxAttempts?: number;
    backoffMultiplier?: number;
    initialDelay?: number;
  };
}

/**
 * Event Bus Service
 * Manages event publishing, subscription, and delivery
 */
export class EventBusService {
  private supabase: SupabaseClient;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventQueue: SystemEvent[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize event processor
    this.startEventProcessor();

    // Load existing subscriptions
    this.loadSubscriptions();
  }

  /**
   * Publish an event to the event bus
   */
  async publishEvent(request: EventPublishRequest): Promise<string> {
    try {
      const event: SystemEvent = {
        id: crypto.randomUUID(),
        type: request.type,
        source: request.source,
        payload: request.payload,
        priority: request.priority || 'normal',
        timestamp: new Date(),
        correlationId: request.correlationId,
        userId: request.userId,
        metadata: request.metadata
      };

      // Store event in database
      const { data: storedEvent, error } = await this.supabase
        .from('system_events')
        .insert({
          id: event.id,
          event_type: event.type,
          source: event.source,
          payload: event.payload,
          priority: event.priority,
          timestamp: event.timestamp.toISOString(),
          correlation_id: event.correlationId,
          user_id: event.userId,
          metadata: event.metadata,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Add to processing queue
      this.eventQueue.push(event);

      // Process high priority events immediately
      if (event.priority === 'high' || event.priority === 'critical') {
        await this.processEvent(event);
      }

      logger.info('Event published', { eventId: event.id });

      return event.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error publishing event', { error: errorMessage, request });
      throw new Error(`Failed to publish event: ${errorMessage}`);
    }
  }

  /**
   * Subscribe to events
   */
  async subscribe(request: EventSubscriptionRequest): Promise<string> {
    try {
      const subscription: EventSubscription = {
        id: crypto.randomUUID(),
        subscriberId: request.subscriberId,
        eventTypes: request.eventTypes,
        filterCriteria: request.filterCriteria,
        webhookUrl: request.webhookUrl,
        isActive: true,
        retryPolicy: {
          maxAttempts: request.retryPolicy?.maxAttempts || 3,
          backoffMultiplier: request.retryPolicy?.backoffMultiplier || 2,
          initialDelay: request.retryPolicy?.initialDelay || 1000
        },
        createdAt: new Date()
      };

      // Store subscription in database
      const { error } = await this.supabase
        .from('event_subscriptions')
        .insert({
          id: subscription.id,
          subscriber_id: subscription.subscriberId,
          event_types: subscription.eventTypes,
          filter_criteria: subscription.filterCriteria,
          webhook_url: subscription.webhookUrl,
          is_active: subscription.isActive,
          retry_policy: subscription.retryPolicy,
          created_at: subscription.createdAt.toISOString()
        });

      if (error) {
        throw error;
      }

      // Add to in-memory subscriptions
      this.subscriptions.set(subscription.id, subscription);

      logger.info('Event subscription created', { subscriptionId: subscription.id });

      return subscription.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating subscription', { error: errorMessage, request });
      throw new Error(`Failed to create subscription: ${errorMessage}`);
    }
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    try {
      // Deactivate subscription in database
      const { error } = await this.supabase
        .from('event_subscriptions')
        .update({ is_active: false })
        .eq('id', subscriptionId);

      if (error) {
        throw error;
      }

      // Remove from in-memory subscriptions
      this.subscriptions.delete(subscriptionId);

      logger.info('Event subscription deactivated', { subscriptionId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error deactivating subscription', { error: errorMessage, subscriptionId });
      throw new Error(`Failed to deactivate subscription: ${errorMessage}`);
    }
  }

  /**
   * Get events with filtering
   */
  async getEvents(filter: EventFilter): Promise<SystemEvent[]> {
    try {
      let query = this.supabase
        .from('system_events')
        .select('*')
        .order('timestamp', { ascending: false });

      // Apply filters
      if (filter.eventTypes && filter.eventTypes.length > 0) {
        query = query.in('event_type', filter.eventTypes);
      }

      if (filter.source) {
        query = query.eq('source', filter.source);
      }

      if (filter.priority) {
        query = query.eq('priority', filter.priority);
      }

      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }

      if (filter.correlationId) {
        query = query.eq('correlation_id', filter.correlationId);
      }

      if (filter.startDate) {
        query = query.gte('timestamp', filter.startDate.toISOString());
      }

      if (filter.endDate) {
        query = query.lte('timestamp', filter.endDate.toISOString());
      }

      if (filter.limit) {
        query = query.limit(filter.limit);
      }

      if (filter.offset) {
        query = query.range(filter.offset, filter.offset + (filter.limit || 50) - 1);
      }

      const { data: events, error } = await query;

      if (error) {
        throw error;
      }

      return (events || []).map(event => ({
        id: event.id,
        type: event.event_type,
        source: event.source,
        payload: event.payload,
        priority: event.priority,
        timestamp: new Date(event.timestamp),
        correlationId: event.correlation_id,
        userId: event.user_id,
        metadata: event.metadata
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error fetching events', { error: errorMessage, filter });
      throw new Error(`Failed to fetch events: ${errorMessage}`);
    }
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(startDate: Date, endDate: Date): Promise<EventAnalytics> {
    try {
      const { data: events, error } = await this.supabase
        .from('system_events')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        throw error;
      }

      const totalEvents = events?.length || 0;

      // Calculate metrics
      const eventsByType: Record<string, number> = {};
      const eventsBySource: Record<string, number> = {};
      const eventsByPriority: Record<string, number> = {};
      let totalProcessingTime = 0;
      let successCount = 0;
      let failureCount = 0;
      let retryCount = 0;

      events?.forEach(event => {
        // Count by type
        eventsByType[event.event_type] = (eventsByType[event.event_type] || 0) + 1;

        // Count by source
        eventsBySource[event.source] = (eventsBySource[event.source] || 0) + 1;

        // Count by priority
        eventsByPriority[event.priority] = (eventsByPriority[event.priority] || 0) + 1;

        // Processing metrics
        if (event.processing_time) {
          totalProcessingTime += event.processing_time;
        }

        if (event.status === 'completed') {
          successCount++;
        } else if (event.status === 'failed') {
          failureCount++;
        } else if (event.status === 'retrying') {
          retryCount++;
        }
      });

      return {
        totalEvents,
        eventsByType: eventsByType as Record<EventType, number>,
        eventsBySource,
        eventsByPriority: eventsByPriority as Record<EventPriority, number>,
        averageProcessingTime: totalEvents > 0 ? totalProcessingTime / totalEvents : 0,
        successRate: totalEvents > 0 ? (successCount / totalEvents) * 100 : 0,
        failureRate: totalEvents > 0 ? (failureCount / totalEvents) * 100 : 0,
        retryRate: totalEvents > 0 ? (retryCount / totalEvents) * 100 : 0
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting analytics', { error: errorMessage });
      throw new Error(`Failed to get event analytics: ${errorMessage}`);
    }
  }

  /**
   * Process an event
   */
  private async processEvent(event: SystemEvent): Promise<void> {
    const startTime = Date.now();

    try {
      // Find matching subscriptions
      const matchingSubscriptions = Array.from(this.subscriptions.values())
        .filter(sub => this.eventMatchesSubscription(event, sub));

      // Deliver to each matching subscription
      for (const subscription of matchingSubscriptions) {
        await this.deliverEventToSubscription(event, subscription);
      }

      // Update event status
      const processingTime = Date.now() - startTime;

      await this.supabase
        .from('system_events')
        .update({
          status: 'completed',
          processing_time: processingTime,
          processed_at: new Date().toISOString()
        })
        .eq('id', event.id);

      logger.info('Event processed successfully', {
        eventId: event.id,
        subscriptions: matchingSubscriptions.length,
        processingTime
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Update event status to failed
      await this.supabase
        .from('system_events')
        .update({
          status: 'failed',
          error_message: errorMessage,
          processed_at: new Date().toISOString()
        })
        .eq('id', event.id);

      logger.error('Error processing event', { error: errorMessage, eventId: event.id });
    }
  }

  /**
   * Check if event matches subscription criteria
   */
  private eventMatchesSubscription(event: SystemEvent, subscription: EventSubscription): boolean {
    // Check if event type matches
    if (!subscription.eventTypes.includes(event.type)) {
      return false;
    }

    // Check filter criteria
    if (subscription.filterCriteria) {
      for (const [key, value] of Object.entries(subscription.filterCriteria)) {
        if (event.payload[key] !== value) {
          return false;
        }
      }
    }

    return subscription.isActive;
  }

  /**
   * Deliver event to a specific subscription
   */
  private async deliverEventToSubscription(
    event: SystemEvent,
    subscription: EventSubscription
  ): Promise<void> {
    try {
      // Create delivery record
      const delivery: EventDelivery = {
        id: crypto.randomUUID(),
        eventId: event.id,
        subscriptionId: subscription.id,
        status: 'processing',
        attemptCount: 1,
        lastAttemptAt: new Date()
      };

      // Store delivery record
      await this.supabase
        .from('event_deliveries')
        .insert({
          id: delivery.id,
          event_id: delivery.eventId,
          subscription_id: delivery.subscriptionId,
          status: delivery.status,
          attempt_count: delivery.attemptCount,
          last_attempt_at: delivery.lastAttemptAt?.toISOString() || null
        });

      // Attempt delivery
      const deliveryResult = await this.attemptEventDelivery(event, subscription);

      // Update delivery status
      await this.supabase
        .from('event_deliveries')
        .update({
          status: deliveryResult.success ? 'completed' : 'failed',
          delivered_at: deliveryResult.success ? new Date().toISOString() : null,
          error_message: deliveryResult.error || null,
          response_time: deliveryResult.responseTime || null
        })
        .eq('id', delivery.id);

      // Update last triggered on subscription
      if (deliveryResult.success) {
        await this.supabase
          .from('event_subscriptions')
          .update({
            last_triggered: new Date().toISOString()
          })
          .eq('id', subscription.id);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error delivering event to subscription', {
        error: errorMessage,
        eventId: event.id,
        subscriptionId: subscription.id
      });
    }
  }

  /**
   * Attempt event delivery (webhook, internal handler, etc.)
   */
  private async attemptEventDelivery(
    event: SystemEvent,
    subscription: EventSubscription
  ): Promise<{ success: boolean; error?: string; responseTime?: number }> {
    const startTime = Date.now();

    try {
      // Deliver via webhook
      if (subscription.webhookUrl) {
        const response = await fetch(subscription.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Event-Type': event.type,
            'X-Event-Id': event.id,
            'X-Correlation-Id': event.correlationId || ''
          },
          body: JSON.stringify({
            event,
            subscription: {
              id: subscription.id,
              subscriberId: subscription.subscriberId
            }
          })
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          return { success: true, responseTime };
        } else {
          return {
            success: false,
            error: `HTTP ${response.status}: ${response.statusText}`,
            responseTime
          };
        }
      } else {
        // Internal event delivery (could be extended for other delivery methods)
        logger.info('Internal event delivery', {
          eventId: event.id,
          subscriptionId: subscription.id
        });

        return { success: true, responseTime: Date.now() - startTime };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Start the event processor loop
   */
  private startEventProcessor(): void {
    this.processingInterval = setInterval(async () => {
      if (this.isProcessing || this.eventQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        // Process events in priority order
        const priorityOrder = { 'critical': 4, 'high': 3, 'normal': 2, 'low': 1 };
        this.eventQueue.sort((a, b) => {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        // Process up to 10 events per cycle
        const eventsToProcess = this.eventQueue.splice(0, 10);

        for (const event of eventsToProcess) {
          await this.processEvent(event);
        }
      } catch (error) {
        logger.error('Error in event processor', { error });
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Load existing subscriptions from database
   */
  private async loadSubscriptions(): Promise<void> {
    try {
      const { data: subscriptions, error } = await this.supabase
        .from('event_subscriptions')
        .select('*')
        .eq('is_active', true);

      if (error) {
        logger.error('Error loading subscriptions', { error });
        return;
      }

      subscriptions?.forEach(sub => {
        const subscription: EventSubscription = {
          id: sub.id,
          subscriberId: sub.subscriber_id,
          eventTypes: sub.event_types,
          filterCriteria: sub.filter_criteria,
          webhookUrl: sub.webhook_url,
          isActive: sub.is_active,
          retryPolicy: sub.retry_policy,
          createdAt: new Date(sub.created_at),
          lastTriggered: sub.last_triggered ? new Date(sub.last_triggered) : undefined
        };

        this.subscriptions.set(subscription.id, subscription);
      });

      logger.info('Subscriptions loaded', { count: this.subscriptions.size });
    } catch (error) {
      logger.error('Error loading subscriptions', { error });
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.subscriptions.clear();
    this.eventQueue = [];
    this.isProcessing = false;
  }
}

export default EventBusService;
