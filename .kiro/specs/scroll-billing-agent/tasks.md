# ScrollBillingAgent Implementation Plan

## Phase 1: Core Stripe + Supabase Integration

- [x] 1. Create Supabase database schema for billing system



  - [x] 1.1 Create subscriptions table with tier, status, pricing, and feature flags




  - [x] 1.2 Create payments table with Stripe integration fields and ScrollGold tracking


  - [x] 1.3 Create invoices table with line items and PDF generation support


  - [x] 1.4 Create enrollment_access table for subscription-based access control


  - [x] 1.5 Create webhook_events table for Stripe event logging and idempotency


  - [x] 1.6 Create stripe_products configuration table


  - [x] 1.7 Set up Row Level Security (RLS) policies for all billing tables


  - [x] 1.8 Create database indexes for performance optimization



  - _Requirements: 1.1, 1.2, 2.1, 17.1_

- [x] 2. Enhance StripePaymentService with subscription tier management






  - [x] 2.1 Extend createSubscription to support all tier types (FREE_TIER, ALL_ACCESS_MONTHLY, ALL_ACCESS_YEARLY, ELITE_LEADERSHIP, INSTITUTIONAL)

  - [x] 2.2 Implement tier upgrade/downgrade logic with prorated billing


  - [x] 2.3 Add ScrollGold discount application at checkout


  - [x] 2.4 Implement subscription metadata management for feature flags


  - [x] 2.5 Add subscription analytics tracking (MRR, ARR, churn)


  - _Requirements: 4.1, 4.2, 12.1, 12.2_

- [x] 3. Implement comprehensive webhook handler system







  - [x] 3.1 Enhance handleCheckoutCompleted to grant access and initialize ScrollGold wallet




  - [x] 3.2 Enhance handleInvoicePaymentSucceeded to extend subscription and award loyalty ScrollGold






  - [x] 3.3 Implement handleInvoicePaymentFailed with grace period and retry logic

  - [x] 3.4 Implement handleSubscriptionDeleted to revoke access appropriately

  - [x] 3.5 Implement handleSubscriptionUpdated for tier changes

  - [x] 3.6 Add webhook event logging and idempotency checks

  - [x] 3.7 Implement webhook retry logic with exponential backoff

  - _Requirements: 1.5, 4.3, 4.4_
- [x] 4. Create BillingService for invoice and payment management




- [ ] 4. Create BillingService for invoice and payment management

  - [x] 4.1 Implement automated invoice generation for subscriptions


  - [x] 4.2 Create invoice PDF generation with professional templates

  - [x] 4.3 Implement payment tracking and reconciliation

  - [x] 4.4 Add payment reminder and notification system

  - [x] 4.5 Create billing dispute resolution workflow

  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

## Phase 2: ScrollGold Economy System

- [x] 5. Enhance ScrollGold database schema for billing integration
  - [x] 5.1 Add scrollgold_earning_rules table for configurable earning logic
  - [x] 5.2 Extend scrollgold_transactions with billing-specific categories
  - [x] 5.3 Add spending_options configuration for discounts and features
  - [x] 5.4 Create indexes for transaction history queries
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 6. Enhance ScrollGoldService with billing integration





  - [x] 6.1 Implement module completion reward logic (80%+ score = 50 ScrollGold)


  - [x] 6.2 Implement daily streak reward system


  - [x] 6.3 Implement community service reward tracking

  - [x] 6.4 Add faithful payment bonus (20 ScrollGold per recurring payment)

  - [x] 6.5 Implement bestowScrollGold for admin honor-based awards

  - [x] 6.6 Create getEarningOpportunities for student motivation

  - _Requirements: 11.2, 18.2, 18.3_

- [x] 7. Implement ScrollGold spending and discount system






  - [x] 7.1 Create applyScrollGoldDiscount function (100 ScrollGold = €5 discount, max 50%)


  - [x] 7.2 Implement premium feature unlocking (AI lab hours, mentorship circles)


  - [x] 7.3 Add governance vote purchasing system

  - [x] 7.4 Create transaction validation and fraud prevention


  - [x] 7.5 Implement balance manipulation detection


  - _Requirements: 11.4, 11.5, 18.4_

- [x] 8. Build ScrollGold wallet interface and API





  - [x] 8.1 Create GET /api/scrollgold/wallet endpoint for balance and stats


  - [x] 8.2 Create GET /api/scrollgold/transactions endpoint for history

  - [x] 8.3 Create GET /api/scrollgold/earning-opportunities endpoint


  - [x] 8.4 Create POST /api/scrollgold/apply-discount endpoint for checkout

  - [x] 8.5 Create POST /api/scrollgold/bestow endpoint (admin only)

  - _Requirements: 11.4, 11.6_

## Phase 3: Subscription Management & Access Control

- [x] 9. Implement SubscriptionManager service






  - [x] 9.1 Create subscription tier upgrade logic with prorated billing

  - [x] 9.2 Create subscription tier downgrade logic

  - [x] 9.3 Implement access control grant/revoke based on subscription status

  - [x] 9.4 Add subscription analytics (churn rate, LTV, conversion rates)

  - [x] 9.5 Implement subscription cancellation with grace period

  - _Requirements: 4.1, 4.2, 4.5, 12.1, 12.2_

- [x] 10. Build webhook-driven access control system





  - [x] 10.1 Implement automatic course access granting on payment success


  - [x] 10.2 Implement automatic access revocation on subscription cancellation

  - [x] 10.3 Create grace period handling for failed payments

  - [x] 10.4 Add access audit logging for compliance


  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

- [ ] 11. Create subscription product configuration system
  - [ ] 11.1 Implement Stripe product creation for all tiers
  - [ ] 11.2 Add product metadata management (features, limits, ScrollGold credits)
  - [ ] 11.3 Create product pricing configuration (monthly, yearly, one-time)
  - [ ] 11.4 Implement product activation/deactivation
  - _Requirements: 12.1, 12.2, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

## Phase 4: Institutional Licensing & Advanced Features

- [ ] 12. Implement institutional licensing system
  - [ ] 12.1 Create multi-seat subscription management
  - [ ] 12.2 Implement seat allocation and user assignment
  - [ ] 12.3 Add institutional billing with NET-30/60 terms
  - [ ] 12.4 Create institutional admin portal access
  - [ ] 12.5 Implement usage analytics for institutional accounts
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [ ] 13. Build financial reporting and analytics system
  - [ ] 13.1 Create ReportingService for revenue analytics
  - [ ] 13.2 Implement MRR/ARR calculation and tracking
  - [ ] 13.3 Add churn rate analysis and forecasting
  - [ ] 13.4 Create customer lifetime value (CLV) calculations
  - [ ] 13.5 Implement ScrollGold economy health metrics
  - [ ] 13.6 Build executive dashboard with key financial KPIs
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 14. Implement tax calculation and compliance system
  - [ ] 14.1 Create TaxCalculator service for multi-jurisdiction tax
  - [ ] 14.2 Implement educational institution tax exemptions
  - [ ] 14.3 Add tax rate management with automatic updates
  - [ ] 14.4 Create tax reporting and filing functionality
  - [ ] 14.5 Implement audit trail for tax compliance
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

## Phase 5: AI Cost Optimization & Kingdom Economics

- [ ] 15. Implement AI cost optimization system
  - [ ] 15.1 Create three-tier AI model selection (free, cheap, premium)
  - [ ] 15.2 Implement per-course generation cost tracking
  - [ ] 15.3 Add per-student tutoring cost monitoring
  - [ ] 15.4 Create budget limit alerts and automatic tier shifting
  - [ ] 15.5 Implement AI usage analytics and ROI reporting
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 16. Build kingdom economics integration
  - [ ] 16.1 Create KingdomEconomicsService for mission-aligned decisions
  - [ ] 16.2 Implement transparency features for fee communication
  - [ ] 16.3 Add stewardship optimization tracking
  - [ ] 16.4 Create community benefit measurement
  - [ ] 16.5 Implement student access prioritization metrics
  - _Requirements: 16.2, 16.3, 16.4, 16.5, 16.6_

- [ ] 17. Implement global pricing tiers
  - [ ] 17.1 Create geographic pricing detection system
  - [ ] 17.2 Implement three-tier pricing (Tier 1: €40-€90, Tier 2: €10-€30, Tier 3: €1-€5)
  - [ ] 17.3 Add self-declaration override with verification
  - [ ] 17.4 Create exchange rate management for stable local pricing
  - [ ] 17.5 Implement pricing equity analytics
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

## Phase 6: Security, Monitoring & Production Readiness

- [ ] 18. Implement fraud detection and security system
  - [ ] 18.1 Create FraudDetectionService with pattern recognition
  - [ ] 18.2 Implement real-time transaction monitoring
  - [ ] 18.3 Add chargeback management and dispute resolution
  - [ ] 18.4 Create security audit logging
  - [ ] 18.5 Implement multi-factor authentication for financial operations
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 19. Build comprehensive monitoring and alerting
  - [ ] 19.1 Create financial operations monitoring dashboard
  - [ ] 19.2 Implement payment failure alerting
  - [ ] 19.3 Add fraud detection alerts
  - [ ] 19.4 Create compliance monitoring for regulatory requirements
  - [ ] 19.5 Implement business intelligence dashboards
  - _Requirements: 5.4, 5.5, 5.6, 9.5_

- [ ] 20. Implement multi-gateway payment infrastructure
  - [ ] 20.1 Integrate PayPal as secondary payment option
  - [ ] 20.2 Add mobile money integration (MTN, Vodafone) for African markets
  - [ ] 20.3 Implement Apple Pay and Google Pay
  - [ ] 20.4 Add Wise/Payoneer for international transfers
  - [ ] 20.5 Create payment method selection based on user location
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] 21. Build customer financial management system
  - [ ] 21.1 Create CustomerFinancialService for account management
  - [ ] 21.2 Implement flexible payment plan creation
  - [ ] 21.3 Add financial aid integration with scholarship system
  - [ ] 21.4 Create hardship program management
  - [ ] 21.5 Implement financial counseling tools
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 22. Implement revenue recognition and accounting integration
  - [ ] 22.1 Create RevenueRecognitionService (GAAP/IFRS compliant)
  - [ ] 22.2 Implement deferred revenue tracking
  - [ ] 22.3 Add journal entry generation
  - [ ] 22.4 Create financial reconciliation tools
  - [ ] 22.5 Implement period-end closing automation
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

## Phase 7: Testing, Documentation & Deployment

- [ ] 23. Build comprehensive testing suite
  - [ ] 23.1 Create unit tests for all billing calculations
  - [ ] 23.2 Implement integration tests for Stripe webhooks
  - [ ] 23.3 Add end-to-end tests for complete payment flows
  - [ ] 23.4 Create performance tests for high-volume transactions
  - [ ] 23.5 Implement security tests for PCI compliance
  - _Requirements: All requirements validation_

- [ ] 24. Create API documentation and user guides
  - [ ] 24.1 Write comprehensive API documentation with examples
  - [ ] 24.2 Create admin user manual for billing operations
  - [ ] 24.3 Write troubleshooting guide for common issues
  - [ ] 24.4 Create compliance documentation for audits
  - [ ] 24.5 Build in-system help and guidance features
  - _Requirements: Support for all functional requirements_

- [ ] 25. Implement deployment and infrastructure
  - [ ] 25.1 Create environment configuration for dev/staging/production
  - [ ] 25.2 Set up Stripe webhook endpoints in all environments
  - [ ] 25.3 Implement database backup and disaster recovery
  - [ ] 25.4 Create CI/CD pipeline with automated testing
  - [ ] 25.5 Write deployment runbook and rollback procedures
  - _Requirements: System reliability and availability_