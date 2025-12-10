/**
 * ScrollUniversity Billing System Types
 * "Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21)
 * Simple in Money, Rich in Grace
 */

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export enum SubscriptionTier {
  FREE_TIER = 'FREE_TIER',
  SINGLE_COURSE = 'SINGLE_COURSE',
  ALL_ACCESS_MONTHLY = 'ALL_ACCESS_MONTHLY',
  ALL_ACCESS_YEARLY = 'ALL_ACCESS_YEARLY',
  PROGRAM_TRACK = 'PROGRAM_TRACK',
  ELITE_LEADERSHIP = 'ELITE_LEADERSHIP',
  INSTITUTIONAL = 'INSTITUTIONAL'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
  INCOMPLETE = 'incomplete'
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  amountCents: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  aiTutorMinutes: number;
  courseAccessType: string;
  hasCertificates: boolean;
  hasLabAccess: boolean;
  hasCommunityAccess: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  userId: string;
  tier: SubscriptionTier;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  tier?: SubscriptionTier;
  status?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled'
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  scrollgoldApplied: number;
  scrollgoldDiscountCents: number;
  description?: string;
  receiptUrl?: string;
  failureReason?: string;
  metadata: Record<string, any>;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  userId: string;
  amountCents: number;
  currency: string;
  description: string;
  scrollgoldDiscount?: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// INVOICE TYPES
// ============================================================================

export enum InvoiceStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  PAID = 'paid',
  VOID = 'void',
  UNCOLLECTIBLE = 'uncollectible'
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripeInvoiceId?: string;
  invoiceNumber: string;
  amountCents: number;
  amountDueCents: number;
  amountPaidCents: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  voidedAt?: Date;
  lineItems: InvoiceLineItem[];
  invoicePdfUrl?: string;
  hostedInvoiceUrl?: string;
  notes?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  metadata?: Record<string, any>;
}

// ============================================================================
// ENROLLMENT ACCESS TYPES
// ============================================================================

export enum ResourceType {
  COURSE = 'course',
  PROGRAM = 'program',
  LAB = 'lab',
  FEATURE = 'feature',
  MENTORSHIP = 'mentorship'
}

export interface EnrollmentAccess {
  id: string;
  userId: string;
  subscriptionId?: string;
  resourceType: ResourceType;
  resourceId: string; // UUID or '*' for wildcard
  grantedAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrantAccessRequest {
  userId: string;
  subscriptionId?: string;
  resourceType: ResourceType;
  resourceId: string;
  expiresAt?: Date;
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export enum WebhookEventStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed'
}

export interface WebhookEvent {
  id: string;
  stripeEventId: string;
  eventType: string;
  status: WebhookEventStatus;
  attempts: number;
  payload: Record<string, any>;
  errorMessage?: string;
  processedAt?: Date;
  createdAt: Date;
}

// ============================================================================
// STRIPE PRODUCT TYPES
// ============================================================================

export interface StripeProduct {
  id: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description?: string;
  tier: SubscriptionTier;
  amountCents: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  features: ProductFeatures;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFeatures {
  aiTutorMinutes: number;
  courseAccessType: string;
  hasCertificates: boolean;
  hasLabAccess: boolean;
  hasCommunityAccess: boolean;
  hasScrollIntelAccess?: boolean;
  hasScrollArkAccess?: boolean;
  hasMentorshipAccess?: boolean;
  hasEntrepreneurshipStudio?: boolean;
}

export interface ProductConfig {
  tier: SubscriptionTier;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  interval?: 'month' | 'year' | 'one_time';
  features: ProductFeatures;
  metadata?: Record<string, any>;
}

// ============================================================================
// SCROLLGOLD EARNING RULES TYPES
// ============================================================================

export interface ScrollGoldEarningRule {
  id: string;
  name: string;
  description?: string;
  category: string;
  amount: number;
  conditions: Record<string, any>;
  maxPerDay?: number;
  maxPerWeek?: number;
  maxPerUser?: number;
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CHECKOUT TYPES
// ============================================================================

export interface CreateCheckoutSessionRequest {
  userId: string;
  tier: SubscriptionTier;
  scrollgoldDiscount?: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, any>;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  amountTotal: number;
  currency: string;
}

// ============================================================================
// BILLING SERVICE TYPES
// ============================================================================

export interface BillingServiceConfig {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  scrollgoldDiscountRate: number;
  defaultCurrency: string;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  lifetimeValue: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  totalRevenue: number;
  averageTransactionValue: number;
  paymentSuccessRate: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class BillingError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

export enum BillingErrorCode {
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INSUFFICIENT_SCROLLGOLD = 'INSUFFICIENT_SCROLLGOLD',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  INVALID_TIER_CHANGE = 'INVALID_TIER_CHANGE',
  WEBHOOK_VERIFICATION_FAILED = 'WEBHOOK_VERIFICATION_FAILED',
  STRIPE_API_ERROR = 'STRIPE_API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INVALID_DISCOUNT = 'INVALID_DISCOUNT',
  ACCESS_DENIED = 'ACCESS_DENIED'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
  startingAfter?: string;
  endingBefore?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  total?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================================================
// BILLING SERVICE REQUEST/RESPONSE TYPES (Task 4)
// ============================================================================

export interface InvoiceGenerationRequest {
  subscriptionId: string;
  userId: string;
  lineItems?: InvoiceLineItem[];
  daysUntilDue?: number;
  description?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceGenerationResponse {
  success: boolean;
  invoiceId: string;
  stripeInvoiceId?: string;
  invoiceNumber: string;
  amountDue: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date;
  hostedInvoiceUrl?: string;
  invoicePdfUrl?: string;
}

export interface InvoicePDFRequest {
  invoiceId: string;
  includeBase64?: boolean;
}

export interface InvoicePDFResponse {
  success: boolean;
  invoiceId: string;
  pdfUrl: string;
  downloadUrl: string;
  pdfBase64?: string;
}

export interface PaymentTrackingQuery {
  userId?: string;
  subscriptionId?: string;
  status?: PaymentStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface PaymentTrackingResponse {
  success: boolean;
  payments: PaymentTrackingItem[];
  summary: PaymentSummary;
  hasMore: boolean;
}

export interface PaymentTrackingItem {
  id: string;
  userId: string;
  subscriptionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeInvoiceId?: string;
  amountCents: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  scrollgoldApplied: number;
  scrollgoldDiscountCents: number;
  description?: string;
  receiptUrl?: string;
  failureReason?: string;
  paidAt?: Date;
  refundedAt?: Date;
  createdAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  subscription?: {
    id: string;
    tier: string;
    status: string;
  };
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmountCents: number;
  successfulCount: number;
  successfulAmountCents: number;
  failedCount: number;
  failedAmountCents: number;
  pendingCount: number;
  pendingAmountCents: number;
  refundedCount: number;
  refundedAmountCents: number;
}

export interface ReconciliationReport {
  periodStart: Date;
  periodEnd: Date;
  totalPayments: number;
  totalInvoices: number;
  matchedCount: number;
  unmatchedPaymentsCount: number;
  unmatchedInvoicesCount: number;
  discrepanciesCount: number;
  totalPaymentAmount: number;
  totalInvoiceAmount: number;
  matchedPayments: any[];
  unmatchedPayments: any[];
  unmatchedInvoices: any[];
  discrepancies: any[];
}

export interface PaymentReminderRequest {
  invoiceId: string;
  reminderType: 'upcoming' | 'due_today' | 'overdue' | 'final_notice';
  customMessage?: string;
}

export interface PaymentReminderResponse {
  success: boolean;
  invoiceId: string;
  reminderSent: boolean;
  reminderType?: string;
  sentAt?: Date;
  message?: string;
}

export interface DisputeResolutionRequest {
  invoiceId: string;
  userId: string;
  reason: string;
  description: string;
  disputedAmount?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: string[];
}

export interface DisputeResolutionResponse {
  success: boolean;
  disputeId: string;
  invoiceId: string;
  status: string;
  createdAt?: Date;
  resolvedAt?: Date;
  message?: string;
}
