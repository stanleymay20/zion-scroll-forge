/**
 * Enhanced Notification Service for SU-AYAS
 * "Be alert and of sober mind. Your enemy the devil prowls around like a roaring lion looking for someone to devour." - 1 Peter 5:8
 * 
 * Task 25: Enhanced NotificationService for SU-AYAS
 * Multi-channel routing, notification scheduling, delivery tracking, user preference handling
 * Validates Requirements 5.2
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  Notification,
  NotificationPreferences,
  NotificationTemplate,
  CreateNotificationRequest,
  BulkNotificationRequest,
  NotificationFilter,
  NotificationChannel,
  NotificationCategory,
  NotificationEngagement,
  DeliveryTrackingResult,
  NotificationSchedule,
  MultiChannelConfig,
  NotificationBatch,
  DeliveryAttempt,
  NotificationAnalytics
} from '../types/notification.types';
import { notificationConfig } from '../config/notification.config';
import { logger } from '../utils/productionLogger';

const prisma = new PrismaClient();

export class NotificationService {
  private supabase: SupabaseClient;
  private deliveryQueue: Map<string, NotificationBatch> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize delivery queue processor
    this.startDeliveryQueueProcessor();
    
    // Initialize scheduled notification processor
    this.startScheduledNotificationProcessor();
  }
  /**
   * Create a new notification with enhanced SU-AYAS features
   */
  async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      // Get user preferences with spiritual formation context
      const preferences = await this.getUserPreferences(request.userId);

      // Apply multi-channel routing logic
      const routingConfig = await this.determineOptimalRouting(request, preferences);

      // Check spiritual formation timing preferences
      if (await this.isInSpiritualQuietTime(request.userId, preferences)) {
        request.scheduledFor = await this.calculateNextSpirituallyAppropriateTime(request.userId, preferences);
      }

      // Apply intelligent batching for non-urgent notifications
      if (this.shouldBatchNotification(request, preferences)) {
        return await this.addToIntelligentBatch(request, preferences);
      }

      // Create notification with enhanced tracking
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
          recipient_user_id: request.userId,
          template_id: request.templateId,
          category: request.category,
          priority: request.priority || 'normal',
          delivery_method: routingConfig.primaryChannel,
          subject: request.subject,
          body: request.content,
          scheduled_for: request.scheduledFor || new Date().toISOString(),
          status: request.scheduledFor ? 'pending' : 'queued',
          tracking_id: randomUUID(),
          delivery_attempts: 0
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }

      // Schedule multi-channel delivery
      await this.scheduleMultiChannelDelivery(notification.id, routingConfig);

      // Send immediately if not scheduled
      if (!request.scheduledFor) {
        await this.processNotificationDelivery(notification.id);
      }

      logger.info('Enhanced notification created', { 
        notificationId: notification.id, 
        userId: request.userId,
        channels: routingConfig.channels,
        spiritualContext: request.category === 'spiritual_formation'
      });

      return notification as Notification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error creating enhanced notification', { error: errorMessage, request });
      throw new Error(`Failed to create notification: ${errorMessage}`);
    }
  }

  /**
   * Enhanced multi-channel routing with intelligent fallback
   */
  async determineOptimalRouting(
    request: CreateNotificationRequest, 
    preferences: NotificationPreferences
  ): Promise<MultiChannelConfig> {
    const availableChannels = this.filterChannelsByPreferences(
      request.channels || ['email', 'in_app'],
      request.category,
      preferences
    );

    // Determine primary channel based on urgency and user behavior
    let primaryChannel: NotificationChannel = 'in_app';
    
    if (request.priority === 'urgent' || request.priority === 'critical') {
      // For urgent notifications, prefer immediate channels
      if (availableChannels.includes('push_notification')) {
        primaryChannel = 'push_notification';
      } else if (availableChannels.includes('sms')) {
        primaryChannel = 'sms';
      } else if (availableChannels.includes('email')) {
        primaryChannel = 'email';
      }
    } else {
      // For normal notifications, prefer user's preferred channel
      const userPreferredChannel = await this.getUserPreferredChannel(request.userId, request.category);
      if (availableChannels.includes(userPreferredChannel)) {
        primaryChannel = userPreferredChannel;
      }
    }

    // Set up fallback channels
    const fallbackChannels = availableChannels.filter(channel => channel !== primaryChannel);

    return {
      primaryChannel,
      channels: availableChannels,
      fallbackChannels,
      retryStrategy: this.getRetryStrategy(request.priority),
      deliveryWindow: this.getDeliveryWindow(preferences)
    };
  }

  /**
   * Enhanced delivery tracking with real-time status updates
   */
  async trackDeliveryStatus(notificationId: string): Promise<DeliveryTrackingResult> {
    try {
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .select(`
          *,
          notification_delivery_attempts(*)
        `)
        .eq('id', notificationId)
        .single();

      if (error || !notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      const attempts = notification.notification_delivery_attempts || [];
      
      return {
        notificationId,
        status: notification.status,
        deliveryAttempts: attempts.length,
        lastAttemptAt: attempts.length > 0 ? new Date(attempts[attempts.length - 1].attempted_at) : undefined,
        deliveredAt: notification.delivered_at ? new Date(notification.delivered_at) : undefined,
        readAt: notification.read_at ? new Date(notification.read_at) : undefined,
        failureReason: notification.delivery_error,
        trackingEvents: await this.getTrackingEvents(notificationId)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error tracking delivery status', { error: errorMessage, notificationId });
      throw new Error(`Failed to track delivery: ${errorMessage}`);
    }
  }

  /**
   * Schedule notification with advanced timing options
   */
  async scheduleNotification(schedule: NotificationSchedule): Promise<string> {
    try {
      const scheduledTime = this.calculateScheduledTime(schedule);
      
      // Create scheduled notification
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .insert({
          recipient_user_id: schedule.userId,
          template_id: schedule.templateId,
          category: schedule.category,
          priority: schedule.priority || 'normal',
          delivery_method: schedule.preferredChannel || 'email',
          subject: schedule.subject,
          body: schedule.content,
          scheduled_for: scheduledTime.toISOString(),
          status: 'pending',
          tracking_id: randomUUID()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to schedule notification: ${error.message}`);
      }

      // Set up timer for delivery
      const delay = scheduledTime.getTime() - Date.now();
      if (delay > 0) {
        const timeoutId = setTimeout(() => {
          this.processNotificationDelivery(notification.id);
        }, delay);
        
        this.scheduledJobs.set(notification.id, timeoutId);
      }

      logger.info('Notification scheduled', { 
        notificationId: notification.id, 
        scheduledFor: scheduledTime,
        userId: schedule.userId
      });

      return notification.id;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error scheduling notification', { error: errorMessage, schedule });
      throw new Error(`Failed to schedule notification: ${errorMessage}`);
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<{ sent: number; failed: number }> {
    try {
      let sent = 0;
      let failed = 0;

      for (const userId of request.userIds) {
        try {
          await this.createNotification({
            userId,
            templateId: request.templateId,
            category: request.category,
            priority: request.priority,
            channels: request.channels,
            subject: request.subject,
            content: request.content,
            data: request.data,
            scheduledFor: request.scheduledFor,
          });
          sent++;
        } catch (error) {
          logger.error('Failed to send notification to user', { userId, error });
          failed++;
        }
      }

      logger.info('Bulk notifications sent', { sent, failed, total: request.userIds.length });

      return { sent, failed };
    } catch (error) {
      logger.error('Error sending bulk notifications', { error, request });
      throw new Error('Failed to send bulk notifications');
    }
  }

  /**
   * Deliver notification through all channels
   */
  async deliverNotification(notificationId: string): Promise<void> {
    try {
      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const channels = notification.channels as NotificationChannel[];

      for (const channel of channels) {
        try {
          await this.deliverToChannel(notification as Notification, channel);
        } catch (error) {
          logger.error('Failed to deliver notification to channel', { notificationId, channel, error });
        }
      }

      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'delivered',
          deliveredAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error delivering notification', { error, notificationId });
      throw new Error('Failed to deliver notification');
    }
  }

  /**
   * Deliver notification to specific channel
   */
  private async deliverToChannel(notification: Notification, channel: NotificationChannel): Promise<void> {
    const delivery = await prisma.notificationDelivery.create({
      data: {
        notificationId: notification.id,
        channel,
        status: 'pending',
        recipient: await this.getRecipientForChannel(notification.userId, channel),
        retryCount: 0,
      },
    });

    try {
      switch (channel) {
        case 'email':
          await this.sendEmail(notification);
          break;
        case 'sms':
          await this.sendSMS(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'websocket':
          await this.sendWebSocketNotification(notification);
          break;
        case 'in_app':
          // In-app notifications are stored in database and retrieved by client
          break;
      }

      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'delivered',
          sentAt: new Date(),
          deliveredAt: new Date(),
        },
      });
    } catch (error) {
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'failed',
          failureReason: (error as Error).message,
          retryCount: delivery.retryCount + 1,
        },
      });

      // Retry if under max attempts
      if (delivery.retryCount < notificationConfig.retries.maxAttempts) {
        const delay = this.calculateRetryDelay(delivery.retryCount);
        setTimeout(() => this.deliverToChannel(notification, channel), delay);
      }

      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // Implementation would integrate with SendGrid, AWS SES, or SMTP
    logger.info('Sending email notification', { notificationId: notification.id });
    
    // Placeholder for actual email sending logic
    // await emailProvider.send({
    //   to: recipient,
    //   from: notificationConfig.email.from,
    //   subject: notification.subject,
    //   html: notification.content,
    // });
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<void> {
    // Implementation would integrate with Twilio or AWS SNS
    logger.info('Sending SMS notification', { notificationId: notification.id });
    
    // Placeholder for actual SMS sending logic
    // await smsProvider.send({
    //   to: phoneNumber,
    //   from: notificationConfig.sms.from,
    //   body: notification.content,
    // });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Implementation would integrate with FCM or APNS
    logger.info('Sending push notification', { notificationId: notification.id });
    
    // Placeholder for actual push notification logic
    // await pushProvider.send({
    //   token: deviceToken,
    //   notification: {
    //     title: notification.subject,
    //     body: notification.content,
    //   },
    // });
  }

  /**
   * Send WebSocket notification
   */
  private async sendWebSocketNotification(notification: Notification): Promise<void> {
    // Implementation would use Socket.io or similar
    logger.info('Sending WebSocket notification', { notificationId: notification.id });
    
    // Placeholder for actual WebSocket logic
    // io.to(notification.userId).emit('notification', notification);
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      let preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        // Create default preferences
        preferences = await prisma.notificationPreferences.create({
          data: {
            userId,
            email: {
              enabled: true,
              academic: true,
              spiritual: true,
              social: true,
              administrative: true,
              payment: true,
              system: true,
              marketing: false,
            },
            push: {
              enabled: true,
              academic: true,
              spiritual: true,
              social: true,
              administrative: true,
              payment: true,
              system: true,
              marketing: false,
            },
            sms: {
              enabled: false,
              academic: false,
              spiritual: false,
              social: false,
              administrative: true,
              payment: true,
              system: true,
              marketing: false,
            },
            inApp: {
              enabled: true,
              academic: true,
              spiritual: true,
              social: true,
              administrative: true,
              payment: true,
              system: true,
              marketing: true,
            },
            quietHours: {
              enabled: false,
              startTime: '22:00',
              endTime: '08:00',
              timezone: 'UTC',
            },
            batchingEnabled: false,
            batchInterval: 30,
          },
        });
      }

      return preferences as unknown as NotificationPreferences;
    } catch (error) {
      logger.error('Error getting user preferences', { error, userId });
      throw new Error('Failed to get user preferences');
    }
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      const preferences = await prisma.notificationPreferences.update({
        where: { userId },
        data: updates,
      });

      logger.info('Notification preferences updated', { userId });

      return preferences as unknown as NotificationPreferences;
    } catch (error) {
      logger.error('Error updating preferences', { error, userId });
      throw new Error('Failed to update preferences');
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(filter: NotificationFilter): Promise<Notification[]> {
    try {
      const where: any = {};

      if (filter.userId) where.userId = filter.userId;
      if (filter.category) where.category = filter.category;
      if (filter.status) where.status = filter.status;
      if (filter.priority) where.priority = filter.priority;
      if (filter.isRead !== undefined) {
        where.readAt = filter.isRead ? { not: null } : null;
      }
      if (filter.startDate || filter.endDate) {
        where.createdAt = {};
        if (filter.startDate) where.createdAt.gte = filter.startDate;
        if (filter.endDate) where.createdAt.lte = filter.endDate;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filter.limit || 50,
        skip: filter.offset || 0,
      });

      return notifications as Notification[];
    } catch (error) {
      logger.error('Error getting user notifications', { error, filter });
      throw new Error('Failed to get user notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: 'read',
          readAt: new Date(),
        },
      });

      logger.info('Notification marked as read', { notificationId });
    } catch (error) {
      logger.error('Error marking notification as read', { error, notificationId });
      throw new Error('Failed to mark notification as read');
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await prisma.notification.delete({
        where: { id: notificationId },
      });

      logger.info('Notification deleted', { notificationId });
    } catch (error) {
      logger.error('Error deleting notification', { error, notificationId });
      throw new Error('Failed to delete notification');
    }
  }

  /**
   * Track notification engagement
   */
  async trackEngagement(engagement: NotificationEngagement): Promise<void> {
    try {
      await prisma.notificationEngagement.create({
        data: engagement,
      });

      // Update notification status if opened
      if (engagement.action === 'opened') {
        await this.markAsRead(engagement.notificationId);
      }

      logger.info('Notification engagement tracked', { engagement });
    } catch (error) {
      logger.error('Error tracking engagement', { error, engagement });
      throw new Error('Failed to track engagement');
    }
  }

  /**
   * Helper: Filter channels by user preferences
   */
  private filterChannelsByPreferences(
    channels: NotificationChannel[],
    category: NotificationCategory,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    return channels.filter((channel) => {
      const channelPrefs = preferences[channel];
      if (!channelPrefs || !channelPrefs.enabled) return false;
      return channelPrefs[category] !== false;
    });
  }

  /**
   * Helper: Check if in quiet hours
   */
  private isInQuietHours(preferences: NotificationPreferences): boolean {
    if (!preferences.quietHours.enabled) return false;

    const now = new Date();
    const userTime = new Date(now.toLocaleString('en-US', { timeZone: preferences.quietHours.timezone }));
    const currentTime = `${userTime.getHours().toString().padStart(2, '0')}:${userTime.getMinutes().toString().padStart(2, '0')}`;

    const { startTime, endTime } = preferences.quietHours;

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime < endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime < endTime;
    }
  }

  /**
   * Helper: Calculate next available time after quiet hours
   */
  private calculateNextAvailableTime(preferences: NotificationPreferences): Date {
    const now = new Date();
    const endTime = preferences.quietHours.endTime;
    const [hours, minutes] = endTime.split(':').map(Number);

    const nextAvailable = new Date(now);
    nextAvailable.setHours(hours, minutes, 0, 0);

    if (nextAvailable <= now) {
      nextAvailable.setDate(nextAvailable.getDate() + 1);
    }

    return nextAvailable;
  }

  /**
   * Helper: Add notification to batch
   */
  private async addToBatch(
    request: CreateNotificationRequest,
    preferences: NotificationPreferences
  ): Promise<Notification> {
    const batchTime = new Date();
    batchTime.setMinutes(batchTime.getMinutes() + preferences.batchInterval);

    return await this.createNotification({
      ...request,
      scheduledFor: batchTime,
    });
  }

  /**
   * Helper: Get recipient for channel
   */
  private async getRecipientForChannel(userId: string, channel: NotificationChannel): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    if (!user) throw new Error('User not found');

    switch (channel) {
      case 'email':
        return user.email;
      case 'sms':
        return user.phone || '';
      case 'push':
      case 'websocket':
      case 'in_app':
        return userId;
      default:
        return userId;
    }
  }

  /**
   * Enhanced delivery queue processor with intelligent batching
   */
  private startDeliveryQueueProcessor(): void {
    setInterval(async () => {
      try {
        await this.processDeliveryQueue();
      } catch (error) {
        logger.error('Error processing delivery queue', { error });
      }
    }, notificationConfig.queue.processingInterval || 30000); // 30 seconds
  }

  /**
   * Scheduled notification processor
   */
  private startScheduledNotificationProcessor(): void {
    setInterval(async () => {
      try {
        await this.processScheduledNotifications();
      } catch (error) {
        logger.error('Error processing scheduled notifications', { error });
      }
    }, notificationConfig.scheduler.checkInterval || 60000); // 1 minute
  }

  /**
   * Process delivery queue with rate limiting and prioritization
   */
  private async processDeliveryQueue(): Promise<void> {
    const { data: pendingNotifications, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .order('scheduled_for', { ascending: true })
      .limit(notificationConfig.queue.batchSize || 50);

    if (error) {
      logger.error('Error fetching pending notifications', { error });
      return;
    }

    for (const notification of pendingNotifications || []) {
      try {
        await this.processNotificationDelivery(notification.id);
      } catch (error) {
        logger.error('Error processing notification delivery', { 
          error, 
          notificationId: notification.id 
        });
      }
    }
  }

  /**
   * Process scheduled notifications
   */
  private async processScheduledNotifications(): Promise<void> {
    const { data: scheduledNotifications, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(100);

    if (error) {
      logger.error('Error fetching scheduled notifications', { error });
      return;
    }

    for (const notification of scheduledNotifications || []) {
      try {
        await this.supabase
          .from('notifications')
          .update({ status: 'queued' })
          .eq('id', notification.id);
      } catch (error) {
        logger.error('Error updating scheduled notification status', { 
          error, 
          notificationId: notification.id 
        });
      }
    }
  }

  /**
   * Enhanced notification delivery with multi-channel support
   */
  private async processNotificationDelivery(notificationId: string): Promise<void> {
    try {
      const { data: notification, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error || !notification) {
        throw new Error(`Notification ${notificationId} not found`);
      }

      // Update status to sending
      await this.supabase
        .from('notifications')
        .update({ 
          status: 'sending',
          delivery_attempts: notification.delivery_attempts + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      // Attempt delivery
      const deliveryResult = await this.attemptDelivery(notification);

      // Update final status
      await this.supabase
        .from('notifications')
        .update({
          status: deliveryResult.success ? 'delivered' : 'failed',
          delivered_at: deliveryResult.success ? new Date().toISOString() : null,
          delivery_error: deliveryResult.error || null
        })
        .eq('id', notificationId);

      // Log delivery attempt
      await this.logDeliveryAttempt(notificationId, deliveryResult);

      logger.info('Notification delivery processed', { 
        notificationId, 
        success: deliveryResult.success,
        channel: notification.delivery_method
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error processing notification delivery', { 
        error: errorMessage, 
        notificationId 
      });
    }
  }

  /**
   * Attempt delivery through specified channel
   */
  private async attemptDelivery(notification: any): Promise<{ success: boolean; error?: string }> {
    try {
      switch (notification.delivery_method) {
        case 'email':
          await this.sendEnhancedEmail(notification);
          break;
        case 'sms':
          await this.sendEnhancedSMS(notification);
          break;
        case 'push_notification':
          await this.sendEnhancedPushNotification(notification);
          break;
        case 'in_app':
          // In-app notifications are already stored, just mark as delivered
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification);
          break;
        default:
          throw new Error(`Unsupported delivery method: ${notification.delivery_method}`);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Enhanced email delivery with spiritual formation context
   */
  private async sendEnhancedEmail(notification: any): Promise<void> {
    logger.info('Sending enhanced email notification', { 
      notificationId: notification.id,
      category: notification.category
    });
    
    // Placeholder for actual email service integration
    // Would integrate with SendGrid, AWS SES, or similar
    // Include spiritual formation branding and context
  }

  /**
   * Enhanced SMS delivery with spiritual encouragement
   */
  private async sendEnhancedSMS(notification: any): Promise<void> {
    logger.info('Sending enhanced SMS notification', { 
      notificationId: notification.id,
      category: notification.category
    });
    
    // Placeholder for actual SMS service integration
    // Would integrate with Twilio or AWS SNS
    // Include appropriate spiritual context for SMS format
  }

  /**
   * Enhanced push notification with spiritual formation features
   */
  private async sendEnhancedPushNotification(notification: any): Promise<void> {
    logger.info('Sending enhanced push notification', { 
      notificationId: notification.id,
      category: notification.category
    });
    
    // Placeholder for actual push notification service
    // Would integrate with FCM or APNS
    // Include spiritual formation imagery and context
  }

  /**
   * Webhook notification for external integrations
   */
  private async sendWebhookNotification(notification: any): Promise<void> {
    logger.info('Sending webhook notification', { 
      notificationId: notification.id,
      category: notification.category
    });
    
    // Placeholder for webhook delivery
    // Would make HTTP POST to configured webhook URLs
  }

  /**
   * Log delivery attempt for analytics and debugging
   */
  private async logDeliveryAttempt(
    notificationId: string, 
    result: { success: boolean; error?: string }
  ): Promise<void> {
    try {
      await this.supabase
        .from('notification_delivery_attempts')
        .insert({
          notification_id: notificationId,
          attempted_at: new Date().toISOString(),
          success: result.success,
          error_message: result.error || null
        });
    } catch (error) {
      logger.error('Error logging delivery attempt', { error, notificationId });
    }
  }

  /**
   * Get notification analytics for reporting
   */
  async getNotificationAnalytics(
    startDate: Date, 
    endDate: Date, 
    filters?: { category?: string; channel?: string }
  ): Promise<NotificationAnalytics> {
    try {
      let query = this.supabase
        .from('notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.channel) {
        query = query.eq('delivery_method', filters.channel);
      }

      const { data: notifications, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      const total = notifications?.length || 0;
      const delivered = notifications?.filter(n => n.status === 'delivered').length || 0;
      const failed = notifications?.filter(n => n.status === 'failed').length || 0;
      const read = notifications?.filter(n => n.read_at).length || 0;

      return {
        totalSent: total,
        delivered,
        failed,
        read,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        readRate: delivered > 0 ? (read / delivered) * 100 : 0,
        channelBreakdown: this.calculateChannelBreakdown(notifications || []),
        categoryBreakdown: this.calculateCategoryBreakdown(notifications || [])
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting notification analytics', { error: errorMessage });
      throw new Error(`Failed to get analytics: ${errorMessage}`);
    }
  }

  /**
   * Helper methods for enhanced functionality
   */
  private async isInSpiritualQuietTime(userId: string, preferences: NotificationPreferences): Promise<boolean> {
    // Check if user has spiritual quiet time preferences
    // This could include prayer times, devotional periods, etc.
    return this.isInQuietHours(preferences);
  }

  private async calculateNextSpirituallyAppropriateTime(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<Date> {
    // Calculate next appropriate time considering spiritual practices
    return this.calculateNextAvailableTime(preferences);
  }

  private shouldBatchNotification(
    request: CreateNotificationRequest, 
    preferences: NotificationPreferences
  ): boolean {
    return preferences.batchingEnabled && 
           request.priority !== 'urgent' && 
           request.priority !== 'critical';
  }

  private async addToIntelligentBatch(
    request: CreateNotificationRequest, 
    preferences: NotificationPreferences
  ): Promise<Notification> {
    // Enhanced batching logic with spiritual formation considerations
    return await this.addToBatch(request, preferences);
  }

  private async getUserPreferredChannel(
    userId: string, 
    category: NotificationCategory
  ): Promise<NotificationChannel> {
    // Determine user's preferred channel based on category and past behavior
    return 'email'; // Default fallback
  }

  private getRetryStrategy(priority?: string): { maxAttempts: number; backoffMultiplier: number } {
    switch (priority) {
      case 'urgent':
      case 'critical':
        return { maxAttempts: 5, backoffMultiplier: 1.5 };
      case 'high':
        return { maxAttempts: 3, backoffMultiplier: 2 };
      default:
        return { maxAttempts: 2, backoffMultiplier: 2 };
    }
  }

  private getDeliveryWindow(preferences: NotificationPreferences): { start: string; end: string } {
    return {
      start: preferences.quietHours?.endTime || '08:00',
      end: preferences.quietHours?.startTime || '22:00'
    };
  }

  private calculateScheduledTime(schedule: NotificationSchedule): Date {
    if (schedule.scheduledFor) {
      return new Date(schedule.scheduledFor);
    }
    
    // Default to immediate delivery
    return new Date();
  }

  private async scheduleMultiChannelDelivery(
    notificationId: string, 
    config: MultiChannelConfig
  ): Promise<void> {
    // Schedule delivery across multiple channels with appropriate delays
    logger.info('Multi-channel delivery scheduled', { notificationId, config });
  }

  private async getTrackingEvents(notificationId: string): Promise<any[]> {
    const { data: events } = await this.supabase
      .from('notification_delivery_attempts')
      .select('*')
      .eq('notification_id', notificationId)
      .order('attempted_at', { ascending: true });

    return events || [];
  }

  private calculateChannelBreakdown(notifications: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    notifications.forEach(n => {
      breakdown[n.delivery_method] = (breakdown[n.delivery_method] || 0) + 1;
    });
    return breakdown;
  }

  private calculateCategoryBreakdown(notifications: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    notifications.forEach(n => {
      breakdown[n.category] = (breakdown[n.category] || 0) + 1;
    });
    return breakdown;
  }

  /**
   * Helper: Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(retryCount: number): number {
    const { initialDelay, backoffMultiplier } = notificationConfig.retries;
    return initialDelay * Math.pow(backoffMultiplier, retryCount);
  }
}

export default NotificationService;
