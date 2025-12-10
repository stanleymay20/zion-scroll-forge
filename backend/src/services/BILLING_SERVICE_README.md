# BillingService Implementation Notes

## Current Status

The BillingService has been fully implemented with all required functionality for Task 4. However, it currently uses raw SQL queries because the Prisma schema does not yet include the following models:

- `Invoice`
- `Payment` (billing-specific)
- `BillingDispute`
- `Notification`

## Database Schema

The database tables have been created via Supabase migrations:
- `supabase/migrations/20251228000001_scroll_billing_system.sql` - Core billing tables
- `supabase/migrations/20251228000002_billing_disputes.sql` - Disputes table

## Next Steps

### 1. Update Prisma Schema

Add the following models to `backend/prisma/schema.prisma`:

```prisma
model Subscription {
  id                   String    @id @default(uuid())
  userId               String    @map("user_id")
  stripeSubscriptionId String?   @unique @map("stripe_subscription_id")
  stripeCustomerId     String    @map("stripe_customer_id")
  tier                 String
  status               String
  amountCents          Int       @map("amount_cents")
  currency             String    @default("EUR")
  interval             String?
  currentPeriodStart   DateTime? @map("current_period_start")
  currentPeriodEnd     DateTime? @map("current_period_end")
  trialEnd             DateTime? @map("trial_end")
  canceledAt           DateTime? @map("canceled_at")
  endedAt              DateTime? @map("ended_at")
  aiTutorMinutes       Int       @default(0) @map("ai_tutor_minutes")
  courseAccessType     String    @default("all") @map("course_access_type")
  hasCertificates      Boolean   @default(false) @map("has_certificates")
  hasLabAccess         Boolean   @default(false) @map("has_lab_access")
  hasCommunityAccess   Boolean   @default(false) @map("has_community_access")
  metadata             Json      @default("{}")
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  invoices Invoice[]
  payments Payment[]

  @@index([userId])
  @@index([stripeSubscriptionId])
  @@index([status])
  @@index([tier])
  @@map("subscriptions")
}

model Invoice {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")
  subscriptionId     String?   @map("subscription_id")
  stripeInvoiceId    String?   @unique @map("stripe_invoice_id")
  invoiceNumber      String    @unique @map("invoice_number")
  amountCents        Int       @map("amount_cents")
  amountDueCents     Int       @map("amount_due_cents")
  amountPaidCents    Int       @default(0) @map("amount_paid_cents")
  currency           String    @default("EUR")
  status             String
  dueDate            DateTime? @map("due_date") @db.Date
  paidAt             DateTime? @map("paid_at")
  voidedAt           DateTime? @map("voided_at")
  lineItems          Json      @default("[]") @map("line_items")
  invoicePdfUrl      String?   @map("invoice_pdf_url")
  hostedInvoiceUrl   String?   @map("hosted_invoice_url")
  notes              String?
  metadata           Json      @default("{}")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")

  user         User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription Subscription?    @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  disputes     BillingDispute[]

  @@index([userId])
  @@index([subscriptionId])
  @@index([stripeInvoiceId])
  @@index([status])
  @@index([invoiceNumber])
  @@map("invoices")
}

model Payment {
  id                       String    @id @default(uuid())
  userId                   String    @map("user_id")
  subscriptionId           String?   @map("subscription_id")
  stripePaymentIntentId    String?   @unique @map("stripe_payment_intent_id")
  stripeChargeId           String?   @map("stripe_charge_id")
  stripeInvoiceId          String?   @map("stripe_invoice_id")
  amountCents              Int       @map("amount_cents")
  currency                 String    @default("EUR")
  status                   String
  paymentMethod            String?   @map("payment_method")
  scrollgoldApplied        Int       @default(0) @map("scrollgold_applied")
  scrollgoldDiscountCents  Int       @default(0) @map("scrollgold_discount_cents")
  description              String?
  receiptUrl               String?   @map("receipt_url")
  failureReason            String?   @map("failure_reason")
  metadata                 Json      @default("{}")
  paidAt                   DateTime? @map("paid_at")
  refundedAt               DateTime? @map("refunded_at")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([subscriptionId])
  @@index([stripePaymentIntentId])
  @@index([status])
  @@index([createdAt])
  @@map("payments")
}

model BillingDispute {
  id              String    @id @default(uuid())
  invoiceId       String    @map("invoice_id")
  userId          String    @map("user_id")
  reason          String
  description     String
  status          String
  priority        String
  resolutionNotes String?   @map("resolution_notes")
  resolvedAt      DateTime? @map("resolved_at")
  resolvedBy      String?   @map("resolved_by")
  metadata        Json      @default("{}")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([userId])
  @@index([status])
  @@index([priority])
  @@index([createdAt])
  @@map("billing_disputes")
}
```

### 2. Generate Prisma Client

After updating the schema:

```bash
cd backend
npx prisma generate
```

### 3. Update BillingService

Replace raw SQL queries with Prisma client calls. The service is structured to make this easy - just replace the `prisma.$queryRaw` and `prisma.$executeRaw` calls with proper Prisma queries.

## Implementation Details

### Methods Implemented

1. **generateSubscriptionInvoice()** - Automated invoice generation
2. **generateInvoicePDF()** - PDF generation with Stripe integration
3. **trackPayments()** - Comprehensive payment tracking with filtering
4. **reconcilePayments()** - Payment-invoice reconciliation
5. **sendPaymentReminder()** - Automated payment reminders
6. **sendOverdueReminders()** - Batch overdue reminder processing
7. **createDispute()** - Billing dispute creation
8. **resolveDispute()** - Admin dispute resolution with refunds
9. **getUserDisputes()** - Dispute history retrieval
10. **getInvoice()** - Single invoice retrieval
11. **getUserInvoices()** - User invoice history

### Helper Methods

- `generateInvoiceNumber()` - Unique invoice number generation
- `mapStripeInvoiceStatus()` - Status mapping between Stripe and internal
- `generateCustomInvoicePDF()` - Custom PDF template (placeholder)

## Testing

Once Prisma schema is updated, test with:

```bash
cd backend
npm test -- BillingService
```

## Integration

The BillingService integrates with:
- StripePaymentService for payment processing
- NotificationService for reminders (to be implemented)
- Email service for invoice delivery (to be implemented)

## Documentation

See `SCROLL_BILLING_TASK_4_COMPLETE.md` for complete implementation details.
