/**
 * Billing Service
 * "Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21)
 * 
 * Handles comprehensive billing operations including:
 * - Automated invoice generation for subscriptions
 * - Invoice PDF generation with professional templates
 * - Payment tracking and reconciliation
 * - Payment reminder and notification system with spiritual encouragement
 * - Billing dispute resolution workflow with grace and compassion
 * 
 * Integrates with:
 * - Stripe API for payment processing
 * - Prisma ORM for database operations
 * - NotificationService for user communications
 * - ScrollGold economy for alternative payment methods
 */

import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { stripeConfig } from '../config/stripe.config';
import { 
  InvoiceGenerationRequest,
  InvoiceGenerationResponse,
  InvoicePDFRequest,
  InvoicePDFResponse,
  PaymentTrackingQuery,
  PaymentTrackingResponse,
  PaymentReminderRequest,
  PaymentReminderResponse,
  DisputeResolutionRequest,
  DisputeResolutionResponse,
  ReconciliationReport,
  InvoiceStatus,
  PaymentStatus
} from '../types/billing.types';

const prisma = new PrismaClient();

// Temporary type definitions until Prisma schema is updated
type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  tier: string;
  amount_cents: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
};

type InvoiceRow = {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_invoice_id?: string;
  invoice_number: string;
  amount_cents: number;
  amount_due_cents: number;
  amount_paid_cents: number;
  currency: string;
  status: string;
  due_date?: Date;
  paid_at?: Date;
  voided_at?: Date;
  line_items: any;
  invoice_pdf_url?: string;
  hosted_invoice_url?: string;
  notes?: string;
  metadata: any;
  created_at: Date;
  updated_at: Date;
};

type PaymentRow = {
  id: string;
  user_id: string;
  subscription_id?: string;
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_invoice_id?: string;
  amount_cents: number;
  currency: string;
  status: string;
  payment_method?: string;
  scrollgold_applied: number;
  scrollgold_discount_cents: number;
  description?: string;
  receipt_url?: string;
  failure_reason?: string;
  paid_at?: Date;
  refunded_at?: Date;
  created_at: Date;
  updated_at: Date;
};

type DisputeRow = {
  id: string;
  invoice_id: string;
  user_id: string;
  reason: string;
  description: string;
  status: string;
  priority: string;
  resolution_notes?: string;
  resolved_at?: Date;
  resolved_by?: string;
  metadata: any;
  created_at: Date;
  updated_at: Date;
};

export class BillingService {
  private stripe: Stripe | null = null;
  private isConfigured: boolean = false;

  constructor() {
    if (stripeConfig.apiKey) {
      this.stripe = new Stripe(stripeConfig.apiKey, {
        apiVersion: stripeConfig.apiVersion as Stripe.LatestApiVersion,
        maxNetworkRetries: stripeConfig.maxNetworkRetries,
        timeout: stripeConfig.timeout,
      });
      this.isConfigured = true;
      logger.info('BillingService initialized with Stripe API key');
    } else {
      logger.warn('BillingService initialized without Stripe API key - billing features disabled');
    }
  }

  private ensureConfigured(): void {
    if (!this.isConfigured || !this.stripe) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }
  }

  /**
   * Task 4.1: Automated invoice generation for subscriptions
   * Generates invoices automatically for subscription billing cycles
   */
  async generateSubscriptionInvoice(request: InvoiceGenerationRequest): Promise<InvoiceGenerationResponse> {
    this.ensureConfigured();
    try {
      logger.info('Generating subscription invoice', { 
        subscriptionId: request.subscriptionId,
        userId: request.userId 
      });

      // Get subscription from database with user details
      const subscription = await prisma.subscription.findFirst({
        where: {
          id: request.subscriptionId,
          userId: request.userId,
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Get or create Stripe customer
      let customerId = subscription.stripeCustomerId;
      if (!customerId) {
        const customer = await this.stripe!.customers.create({
          email: subscription.user.email,
          name: `${subscription.user.firstName} ${subscription.user.lastName}`,
          metadata: {
            userId: subscription.userId,
          },
        });
        customerId = customer.id;
        
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      }

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber();

      // Create invoice items in Stripe
      const lineItems = request.lineItems || [{
        description: `${subscription.tier} Subscription`,
        quantity: 1,
        unitAmountCents: subscription.amountCents,
        amountCents: subscription.amountCents,
      }];

      for (const item of lineItems) {
        await this.stripe!.invoiceItems.create({
          customer: customerId,
          amount: item.amountCents,
          currency: subscription.currency.toLowerCase(),
          description: item.description,
          metadata: {
            subscriptionId: subscription.id,
            tier: subscription.tier,
          },
        });
      }

      // Create invoice in Stripe
      const stripeInvoice = await this.stripe!.invoices.create({
        customer: customerId,
        auto_advance: true,
        collection_method: 'charge_automatically',
        days_until_due: request.daysUntilDue || 30,
        metadata: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          invoiceNumber,
        },
        description: request.description || `Invoice for ${subscription.tier} subscription`,
      });

      // Finalize invoice
      const finalizedInvoice = await this.stripe!.invoices.finalizeInvoice(stripeInvoice.id);

      // Create invoice record in database
      const dbInvoice = await prisma.invoice.create({
        data: {
          userId: subscription.userId,
          subscriptionId: subscription.id,
          stripeInvoiceId: finalizedInvoice.id,
          invoiceNumber,
          amountCents: finalizedInvoice.amount_due,
          amountDueCents: finalizedInvoice.amount_due,
          amountPaidCents: finalizedInvoice.amount_paid,
          currency: finalizedInvoice.currency.toUpperCase(),
          status: this.mapStripeInvoiceStatus(finalizedInvoice.status),
          dueDate: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000) : null,
          lineItems: lineItems,
          invoicePdfUrl: finalizedInvoice.invoice_pdf || null,
          hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url || null,
          notes: request.notes || null,
          metadata: {
            stripeInvoiceId: finalizedInvoice.id,
            subscriptionTier: subscription.tier,
          },
        },
        select: { id: true },
      });

      logger.info('Subscription invoice generated successfully', { 
        invoiceId: dbInvoice.id,
        stripeInvoiceId: finalizedInvoice.id,
        invoiceNumber 
      });

      return {
        success: true,
        invoiceId: dbInvoice.id,
        stripeInvoiceId: finalizedInvoice.id,
        invoiceNumber,
        amountDue: finalizedInvoice.amount_due,
        currency: finalizedInvoice.currency,
        status: this.mapStripeInvoiceStatus(finalizedInvoice.status),
        dueDate: finalizedInvoice.due_date ? new Date(finalizedInvoice.due_date * 1000) : undefined,
        hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url || undefined,
        invoicePdfUrl: finalizedInvoice.invoice_pdf || undefined,
      };
    } catch (error: any) {
      logger.error('Error generating subscription invoice', { 
        error: error.message,
        subscriptionId: request.subscriptionId 
      });
      throw new Error(`Failed to generate subscription invoice: ${error.message}`);
    }
  }

  /**
   * Task 4.2: Invoice PDF generation with professional templates
   * Generates professional PDF invoices with ScrollUniversity branding
   */
  async generateInvoicePDF(request: InvoicePDFRequest): Promise<InvoicePDFResponse> {
    this.ensureConfigured();
    try {
      logger.info('Generating invoice PDF', { invoiceId: request.invoiceId });

      // Get invoice from database
      const invoice = await prisma.invoice.findUnique({
        where: { id: request.invoiceId },
        include: {
          user: true,
          subscription: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // If Stripe invoice exists, retrieve PDF from Stripe
      if (invoice.stripeInvoiceId) {
        const stripeInvoice = await this.stripe!.invoices.retrieve(invoice.stripeInvoiceId);
        
        if (stripeInvoice.invoice_pdf) {
          // Update database with PDF URL
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { invoicePdfUrl: stripeInvoice.invoice_pdf },
          });

          logger.info('Invoice PDF retrieved from Stripe', { 
            invoiceId: invoice.id,
            pdfUrl: stripeInvoice.invoice_pdf 
          });

          return {
            success: true,
            invoiceId: invoice.id,
            pdfUrl: stripeInvoice.invoice_pdf,
            downloadUrl: stripeInvoice.invoice_pdf,
          };
        }
      }

      // Generate custom PDF template (fallback if Stripe PDF not available)
      const pdfData = await this.generateCustomInvoicePDF(invoice);

      logger.info('Custom invoice PDF generated', { invoiceId: invoice.id });

      return {
        success: true,
        invoiceId: invoice.id,
        pdfUrl: pdfData.url,
        downloadUrl: pdfData.downloadUrl,
        pdfBase64: request.includeBase64 ? pdfData.base64 : undefined,
      };
    } catch (error: any) {
      logger.error('Error generating invoice PDF', { 
        error: error.message,
        invoiceId: request.invoiceId 
      });
      throw new Error(`Failed to generate invoice PDF: ${error.message}`);
    }
  }

  /**
   * Generate custom PDF invoice with ScrollUniversity branding
   * This is a placeholder - in production, use a PDF generation library like PDFKit or Puppeteer
   */
  private async generateCustomInvoicePDF(invoice: any): Promise<{
    url: string;
    downloadUrl: string;
    base64?: string;
  }> {
    // TODO: Implement actual PDF generation with professional template
    // Integration point for PDFGenerationService
    logger.info('Generating custom PDF template', { invoiceId: invoice.id });

    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://scrolluniversity.com';
    const pdfUrl = `${frontendUrl}/api/invoices/${invoice.id}/pdf`;
    
    return {
      url: pdfUrl,
      downloadUrl: pdfUrl,
    };
  }

  /**
   * Task 4.3: Payment tracking and reconciliation
   * Tracks all payments and reconciles them with invoices
   */
  async trackPayments(query: PaymentTrackingQuery): Promise<PaymentTrackingResponse> {
    try {
      logger.info('Tracking payments', { 
        userId: query.userId,
        startDate: query.startDate,
        endDate: query.endDate 
      });

      // Build query filters
      const where: any = {};
      
      if (query.userId) {
        where.userId = query.userId;
      }
      
      if (query.subscriptionId) {
        where.subscriptionId = query.subscriptionId;
      }
      
      if (query.status) {
        where.status = query.status;
      }
      
      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = query.startDate;
        }
        if (query.endDate) {
          where.createdAt.lte = query.endDate;
        }
      }

      // Get payments from database
      const payments = await prisma.payment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          subscription: {
            select: {
              id: true,
              tier: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

      // Calculate summary statistics
      const totalAmount = payments.reduce((sum, p) => sum + p.amountCents, 0);
      const successfulPayments = payments.filter(p => p.status === 'SUCCEEDED');
      const failedPayments = payments.filter(p => p.status === 'FAILED');
      const pendingPayments = payments.filter(p => p.status === 'PENDING');
      const refundedPayments = payments.filter(p => p.status === 'REFUNDED');

      const summary = {
        totalPayments: payments.length,
        totalAmountCents: totalAmount,
        successfulCount: successfulPayments.length,
        successfulAmountCents: successfulPayments.reduce((sum, p) => sum + p.amountCents, 0),
        failedCount: failedPayments.length,
        failedAmountCents: failedPayments.reduce((sum, p) => sum + p.amountCents, 0),
        pendingCount: pendingPayments.length,
        pendingAmountCents: pendingPayments.reduce((sum, p) => sum + p.amountCents, 0),
        refundedCount: refundedPayments.length,
        refundedAmountCents: refundedPayments.reduce((sum, p) => sum + p.amountCents, 0),
      };

      logger.info('Payment tracking completed', { 
        totalPayments: payments.length,
        totalAmount: totalAmount / 100 
      });

      return {
        success: true,
        payments: payments.map(p => ({
          id: p.id,
          userId: p.userId,
          subscriptionId: p.subscriptionId,
          stripePaymentIntentId: p.stripePaymentIntentId,
          stripeChargeId: p.stripeChargeId,
          stripeInvoiceId: p.stripeInvoiceId,
          amountCents: p.amountCents,
          currency: p.currency,
          status: p.status as PaymentStatus,
          paymentMethod: p.paymentMethod,
          scrollgoldApplied: p.scrollgoldApplied,
          scrollgoldDiscountCents: p.scrollgoldDiscountCents,
          description: p.description,
          receiptUrl: p.receiptUrl,
          failureReason: p.failureReason,
          paidAt: p.paidAt,
          refundedAt: p.refundedAt,
          createdAt: p.createdAt,
          user: p.user,
          subscription: p.subscription,
        })),
        summary,
        hasMore: payments.length === (query.limit || 100),
      };
    } catch (error: any) {
      logger.error('Error tracking payments', { error: error.message });
      throw new Error(`Failed to track payments: ${error.message}`);
    }
  }

  /**
   * Reconcile payments with invoices
   * Ensures all payments are properly matched to invoices
   */
  async reconcilePayments(
    startDate: Date,
    endDate: Date
  ): Promise<ReconciliationReport> {
    try {
      logger.info('Reconciling payments', { startDate, endDate });

      // Get all payments in date range
      const payments = await prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          subscription: true,
        },
      });

      // Get all invoices in date range
      const invoices = await prisma.invoice.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Match payments to invoices
      const matchedPayments: any[] = [];
      const unmatchedPayments: any[] = [];
      const unmatchedInvoices: any[] = [];

      for (const payment of payments) {
        const matchingInvoice = invoices.find(
          inv => inv.stripeInvoiceId === payment.stripeInvoiceId
        );

        if (matchingInvoice) {
          matchedPayments.push({
            payment,
            invoice: matchingInvoice,
            amountMatch: payment.amountCents === matchingInvoice.amountCents,
          });
        } else {
          unmatchedPayments.push(payment);
        }
      }

      // Find invoices without matching payments
      for (const invoice of invoices) {
        const hasMatchingPayment = payments.some(
          p => p.stripeInvoiceId === invoice.stripeInvoiceId
        );

        if (!hasMatchingPayment && invoice.status === 'PAID') {
          unmatchedInvoices.push(invoice);
        }
      }

      // Calculate discrepancies
      const discrepancies = matchedPayments.filter(m => !m.amountMatch);

      const report: ReconciliationReport = {
        periodStart: startDate,
        periodEnd: endDate,
        totalPayments: payments.length,
        totalInvoices: invoices.length,
        matchedCount: matchedPayments.length,
        unmatchedPaymentsCount: unmatchedPayments.length,
        unmatchedInvoicesCount: unmatchedInvoices.length,
        discrepanciesCount: discrepancies.length,
        totalPaymentAmount: payments.reduce((sum, p) => sum + p.amountCents, 0),
        totalInvoiceAmount: invoices.reduce((sum, i) => sum + i.amountCents, 0),
        matchedPayments,
        unmatchedPayments,
        unmatchedInvoices,
        discrepancies,
      };

      logger.info('Payment reconciliation completed', {
        matched: matchedPayments.length,
        unmatchedPayments: unmatchedPayments.length,
        unmatchedInvoices: unmatchedInvoices.length,
        discrepancies: discrepancies.length,
      });

      return report;
    } catch (error: any) {
      logger.error('Error reconciling payments', { error: error.message });
      throw new Error(`Failed to reconcile payments: ${error.message}`);
    }
  }

  /**
   * Task 4.4: Payment reminder and notification system
   * Sends automated reminders for upcoming and overdue payments
   */
  async sendPaymentReminder(request: PaymentReminderRequest): Promise<PaymentReminderResponse> {
    try {
      logger.info('Sending payment reminder', { 
        invoiceId: request.invoiceId,
        reminderType: request.reminderType 
      });

      // Get invoice from database
      const invoice = await prisma.invoice.findUnique({
        where: { id: request.invoiceId },
        include: {
          user: true,
          subscription: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Check if invoice is already paid
      if (invoice.status === 'PAID') {
        logger.info('Invoice already paid, skipping reminder', { invoiceId: invoice.id });
        return {
          success: true,
          invoiceId: invoice.id,
          reminderSent: false,
          message: 'Invoice already paid',
        };
      }

      // Determine reminder message based on type with spiritual integration
      let subject: string;
      let message: string;
      let spiritualNote: string;

      switch (request.reminderType) {
        case 'upcoming':
          subject = `Upcoming Payment Due - Invoice ${invoice.invoiceNumber}`;
          message = `Your payment of ${invoice.currency} ${invoice.amountDueCents / 100} is due on ${invoice.dueDate?.toLocaleDateString()}`;
          spiritualNote = '\n\n"The Lord is my shepherd; I shall not want." - Psalm 23:1\n\nWe\'re here to support your educational journey. If you need assistance, please reach out.';
          break;
        case 'due_today':
          subject = `Payment Due Today - Invoice ${invoice.invoiceNumber}`;
          message = `Your payment of ${invoice.currency} ${invoice.amountDueCents / 100} is due today`;
          spiritualNote = '\n\n"Give to everyone what you owe them." - Romans 13:7\n\nThank you for your faithful stewardship.';
          break;
        case 'overdue':
          subject = `Overdue Payment - Invoice ${invoice.invoiceNumber}`;
          message = `Your payment of ${invoice.currency} ${invoice.amountDueCents / 100} is overdue. Please pay as soon as possible`;
          spiritualNote = '\n\n"The Lord is gracious and compassionate, slow to anger and rich in love." - Psalm 145:8\n\nIf you\'re experiencing financial difficulty, please contact us about payment plans or scholarship opportunities.';
          break;
        case 'final_notice':
          subject = `Final Notice - Invoice ${invoice.invoiceNumber}`;
          message = `This is a final notice for your overdue payment of ${invoice.currency} ${invoice.amountDueCents / 100}`;
          spiritualNote = '\n\n"Cast all your anxiety on him because he cares for you." - 1 Peter 5:7\n\nWe understand that circumstances can be challenging. Please reach out immediately to discuss options and avoid service interruption.';
          break;
        default:
          subject = `Payment Reminder - Invoice ${invoice.invoiceNumber}`;
          message = `Reminder about your payment of ${invoice.currency} ${invoice.amountDueCents / 100}`;
          spiritualNote = '\n\nWe\'re committed to supporting your educational journey at ScrollUniversity.';
      }

      // Append spiritual encouragement
      message += spiritualNote;

      // TODO: Integrate with email service to send actual email
      // For now, log the reminder
      logger.info('Payment reminder prepared', {
        invoiceId: invoice.id,
        userId: invoice.userId,
        email: invoice.user.email,
        subject,
        message,
      });

      // Create notification record
      await prisma.notification.create({
        data: {
          userId: invoice.userId,
          type: 'PAYMENT_REMINDER',
          title: subject,
          message,
          metadata: {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            reminderType: request.reminderType,
            amountDue: invoice.amountDueCents,
            currency: invoice.currency,
          },
        },
      });

      logger.info('Payment reminder sent successfully', { invoiceId: invoice.id });

      return {
        success: true,
        invoiceId: invoice.id,
        reminderSent: true,
        reminderType: request.reminderType,
        sentAt: new Date(),
      };
    } catch (error: any) {
      logger.error('Error sending payment reminder', { 
        error: error.message,
        invoiceId: request.invoiceId 
      });
      throw new Error(`Failed to send payment reminder: ${error.message}`);
    }
  }

  /**
   * Send automated reminders for all overdue invoices
   */
  async sendOverdueReminders(): Promise<{
    success: boolean;
    remindersSent: number;
    errors: number;
  }> {
    try {
      logger.info('Sending overdue reminders for all invoices');

      // Get all overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: 'OPEN',
          dueDate: {
            lt: new Date(),
          },
        },
      });

      let remindersSent = 0;
      let errors = 0;

      for (const invoice of overdueInvoices) {
        try {
          await this.sendPaymentReminder({
            invoiceId: invoice.id,
            reminderType: 'overdue',
          });
          remindersSent++;
        } catch (error) {
          logger.error('Error sending overdue reminder', { 
            invoiceId: invoice.id,
            error: (error as Error).message 
          });
          errors++;
        }
      }

      logger.info('Overdue reminders sent', { remindersSent, errors });

      return {
        success: true,
        remindersSent,
        errors,
      };
    } catch (error: any) {
      logger.error('Error sending overdue reminders', { error: error.message });
      throw new Error(`Failed to send overdue reminders: ${error.message}`);
    }
  }

  /**
   * Task 4.5: Billing dispute resolution workflow
   * Handles billing disputes and provides resolution workflow
   */
  async createDispute(request: DisputeResolutionRequest): Promise<DisputeResolutionResponse> {
    try {
      logger.info('Creating billing dispute', { 
        invoiceId: request.invoiceId,
        userId: request.userId 
      });

      // Get invoice from database
      const invoice = await prisma.invoice.findUnique({
        where: { id: request.invoiceId },
        include: {
          user: true,
          subscription: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Verify user owns the invoice
      if (invoice.userId !== request.userId) {
        throw new Error('Unauthorized: Invoice does not belong to user');
      }

      // Create dispute record
      const dispute = await prisma.billingDispute.create({
        data: {
          invoiceId: invoice.id,
          userId: request.userId,
          reason: request.reason,
          description: request.description,
          status: 'OPEN',
          priority: request.priority || 'MEDIUM',
          metadata: {
            invoiceNumber: invoice.invoiceNumber,
            invoiceAmount: invoice.amountCents,
            disputeAmount: request.disputedAmount || invoice.amountCents,
            attachments: request.attachments || [],
          },
        },
      });

      // Create notification for admin (using system admin from config)
      const adminUserId = process.env.BILLING_ADMIN_USER_ID || 'system-admin';
      await prisma.notification.create({
        data: {
          userId: adminUserId,
          type: 'BILLING_DISPUTE',
          title: `New Billing Dispute - Invoice ${invoice.invoiceNumber}`,
          message: `User ${invoice.user.email} has opened a dispute for invoice ${invoice.invoiceNumber}. Reason: ${request.reason}`,
          metadata: {
            disputeId: dispute.id,
            invoiceId: invoice.id,
            userId: request.userId,
            reason: request.reason,
            priority: request.priority || 'MEDIUM',
          },
        },
      });

      // Send confirmation to user
      await prisma.notification.create({
        data: {
          userId: request.userId,
          type: 'DISPUTE_CREATED',
          title: 'Dispute Created',
          message: `Your dispute for invoice ${invoice.invoiceNumber} has been created and is being reviewed`,
          metadata: {
            disputeId: dispute.id,
            invoiceId: invoice.id,
          },
        },
      });

      logger.info('Billing dispute created successfully', { 
        disputeId: dispute.id,
        invoiceId: invoice.id 
      });

      return {
        success: true,
        disputeId: dispute.id,
        invoiceId: invoice.id,
        status: 'OPEN',
        createdAt: dispute.createdAt,
        message: 'Dispute created successfully. Our team will review it within 2-3 business days.',
      };
    } catch (error: any) {
      logger.error('Error creating billing dispute', { 
        error: error.message,
        invoiceId: request.invoiceId 
      });
      throw new Error(`Failed to create billing dispute: ${error.message}`);
    }
  }

  /**
   * Resolve a billing dispute
   */
  async resolveDispute(
    disputeId: string,
    resolution: 'APPROVED' | 'REJECTED' | 'PARTIAL_REFUND',
    resolutionNotes: string,
    refundAmount?: number
  ): Promise<DisputeResolutionResponse> {
    try {
      logger.info('Resolving billing dispute', { disputeId, resolution });

      // Get dispute from database
      const dispute = await prisma.billingDispute.findUnique({
        where: { id: disputeId },
        include: {
          invoice: true,
          user: true,
        },
      });

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Update dispute status
      const adminUserId = process.env.BILLING_ADMIN_USER_ID || 'system-admin';
      const updatedDispute = await prisma.billingDispute.update({
        where: { id: disputeId },
        data: {
          status: resolution === 'APPROVED' ? 'RESOLVED' : resolution === 'REJECTED' ? 'REJECTED' : 'RESOLVED',
          resolvedAt: new Date(),
          resolvedBy: adminUserId,
          resolutionNotes,
          metadata: {
            ...dispute.metadata,
            resolution,
            refundAmount,
            resolvedBy: adminUserId,
          },
        },
      });

      // Handle refund if approved or partial
      if ((resolution === 'APPROVED' || resolution === 'PARTIAL_REFUND') && refundAmount && refundAmount > 0) {
        // Process refund through Stripe if invoice has payment
        if (dispute.invoice.stripeInvoiceId && this.stripe) {
          try {
            const stripeInvoice = await this.stripe.invoices.retrieve(dispute.invoice.stripeInvoiceId);
            
            if (stripeInvoice.charge) {
              await this.stripe.refunds.create({
                charge: stripeInvoice.charge as string,
                amount: refundAmount,
                reason: 'requested_by_customer',
                metadata: {
                  disputeId: dispute.id,
                  invoiceId: dispute.invoice.id,
                },
              });

              logger.info('Refund processed through Stripe', { 
                disputeId,
                refundAmount 
              });
            }
          } catch (error) {
            logger.error('Error processing Stripe refund', { 
              error: (error as Error).message,
              disputeId 
            });
          }
        }

        // Update invoice status
        await prisma.invoice.update({
          where: { id: dispute.invoice.id },
          data: {
            status: resolution === 'APPROVED' ? 'VOID' : 'PAID',
            metadata: {
              ...dispute.invoice.metadata,
              disputeResolved: true,
              refundAmount,
            },
          },
        });
      }

      // Send notification to user
      await prisma.notification.create({
        data: {
          userId: dispute.userId,
          type: 'DISPUTE_RESOLVED',
          title: `Dispute ${resolution === 'APPROVED' ? 'Approved' : resolution === 'REJECTED' ? 'Rejected' : 'Resolved'}`,
          message: resolutionNotes,
          metadata: {
            disputeId: dispute.id,
            invoiceId: dispute.invoice.id,
            resolution,
            refundAmount,
          },
        },
      });

      logger.info('Billing dispute resolved successfully', { 
        disputeId,
        resolution 
      });

      return {
        success: true,
        disputeId: updatedDispute.id,
        invoiceId: dispute.invoice.id,
        status: updatedDispute.status,
        resolvedAt: updatedDispute.resolvedAt,
        message: `Dispute ${resolution.toLowerCase()}. ${resolutionNotes}`,
      };
    } catch (error: any) {
      logger.error('Error resolving billing dispute', { 
        error: error.message,
        disputeId 
      });
      throw new Error(`Failed to resolve billing dispute: ${error.message}`);
    }
  }

  /**
   * Get all disputes for a user
   */
  async getUserDisputes(userId: string): Promise<any[]> {
    try {
      logger.info('Getting user disputes', { userId });

      const disputes = await prisma.billingDispute.findMany({
        where: { userId },
        include: {
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              amountCents: true,
              currency: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return disputes;
    } catch (error: any) {
      logger.error('Error getting user disputes', { 
        error: error.message,
        userId 
      });
      throw new Error(`Failed to get user disputes: ${error.message}`);
    }
  }

  /**
   * Helper method to generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of invoices this month
    const startOfMonth = new Date(year, new Date().getMonth(), 1);
    const endOfMonth = new Date(year, new Date().getMonth() + 1, 0);
    
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `INV-${year}${month}-${sequence}`;
  }

  /**
   * Helper method to map Stripe invoice status to our status
   */
  private mapStripeInvoiceStatus(stripeStatus: string | null): InvoiceStatus {
    switch (stripeStatus) {
      case 'draft':
        return 'DRAFT';
      case 'open':
        return 'OPEN';
      case 'paid':
        return 'PAID';
      case 'void':
        return 'VOID';
      case 'uncollectible':
        return 'UNCOLLECTIBLE';
      default:
        return 'DRAFT';
    }
  }

  /**
   * Get invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          subscription: {
            select: {
              id: true,
              tier: true,
              status: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    } catch (error: any) {
      logger.error('Error getting invoice', { 
        error: error.message,
        invoiceId 
      });
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  /**
   * Get all invoices for a user
   */
  async getUserInvoices(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const invoices = await prisma.invoice.findMany({
        where: { userId },
        include: {
          subscription: {
            select: {
              id: true,
              tier: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return invoices;
    } catch (error: any) {
      logger.error('Error getting user invoices', { 
        error: error.message,
        userId 
      });
      throw new Error(`Failed to get user invoices: ${error.message}`);
    }
  }
}

export default BillingService;
