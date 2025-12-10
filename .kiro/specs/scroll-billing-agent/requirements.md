# ScrollBillingAgent Requirements Document

## Introduction

The ScrollBillingAgent is a comprehensive financial management system that handles all billing, payment processing, revenue tracking, and financial operations for ScrollUniversity while maintaining alignment with kingdom economic principles. Operating under the principle "Give to Caesar what is Caesar's, and to God what is God's" (Matthew 22:21), this system ensures transparent, ethical, and efficient financial operations that support the scroll mission while maintaining fiscal responsibility and regulatory compliance.

Built on the Scroll Billing Doctrine of **Access → Transformation → Stewardship**, this system rejects Babylon's scarcity model and implements a practical three-layer billing architecture:

**Layer 1: Access Layer (What They Pay For)**
- Courses, programs, and degree tracks
- Live AI tutors and office hours
- Labs & tools (VS Code-in-browser, data labs, design tools)
- Certificates and credentials

**Layer 2: Payment Layer (How They Pay - Fiat First)**
- Primary: Stripe for cards, SEPA, PayPal
- Institutional: Universities, churches, ministries, NGOs
- Scholarships and sponsorships
- Simple, compliant, production-ready from day one

**Layer 3: Kingdom Token Layer (ScrollGold as Blessing)**
- Internal loyalty/honor system (like Google Play credits or AWS credits)
- NOT cryptocurrency - just database records for simplicity
- Students EARN ScrollGold through achievement, service, faithfulness
- Students SPEND ScrollGold for discounts, premium features, governance votes
- Spiritual twist: Some ScrollGold is "bestowed" for faithfulness and service

This architecture ensures **billing is simple in money, rich in grace** - fiat payments via Stripe provide sustainable revenue, while ScrollGold adds motivational and spiritual dimensions without regulatory complexity.

## Glossary

- **ScrollGold**: Internal loyalty/honor points system (NOT cryptocurrency) - like Google Play credits or AWS credits - stored as simple database records, earned through achievement and spent for discounts and premium features
- **Free Tier**: On-ramp offering free courses, limited AI tutor minutes, no certificates - purpose is funnel, impact, and trust building
- **Single-Course Purchase**: One-time fee per course (like Udemy model) with lifetime access and limited AI tutor minutes for that course
- **All-Access Membership**: Core subscription model (monthly/yearly) providing unlimited courses, unlimited AI tutors, certificates, community access, and labs - the primary revenue driver
- **Program Tracks**: Bundled degree programs with core courses, capstone, and spiritual formation - offered as pay-in-full or installment plans
- **Institutional Plans**: Enterprise licensing for churches, ministries, schools, companies - seats-based pricing (20, 50, 100+ users) with custom portals and spiritual formation reports
- **Stripe Integration**: Primary payment processor handling cards, SEPA, PayPal, bank transfers - simple, compliant, production-ready
- **Supabase Tables**: Core database infrastructure storing subscriptions, payments, invoices, scrollgold_wallets, scrollgold_transactions integrated with existing users and enrollments tables

## Requirements

### Requirement 1: Comprehensive Billing and Invoice Management System

**User Story:** As a financial administrator, I want automated billing and invoice generation for all ScrollUniversity services, so that I can ensure accurate, timely, and professional financial transactions while maintaining kingdom integrity.

#### Acceptance Criteria

1. WHEN billing cycles are processed THEN the system SHALL generate accurate invoices for tuition, services, and ScrollGold transactions
2. WHEN invoices are created THEN the system SHALL include detailed line items, tax calculations, and payment terms with professional formatting
3. WHEN billing schedules are managed THEN the system SHALL support various payment plans including monthly, quarterly, and annual options
4. WHEN invoice delivery occurs THEN the system SHALL send invoices through multiple channels including email, portal, and traditional mail
5. WHEN payment tracking is needed THEN the system SHALL monitor payment status and send appropriate reminders and notifications
6. WHEN billing disputes arise THEN the system SHALL provide clear dispute resolution processes and documentation

### Requirement 2: Multi-Currency Payment Processing System

**User Story:** As an international student, I want to pay for ScrollUniversity services using my local currency and preferred payment methods, so that I can access scroll-aligned education without financial barriers or currency complications.

#### Acceptance Criteria

1. WHEN payments are processed THEN the system SHALL accept multiple currencies including USD, EUR, GBP, and major regional currencies
2. WHEN payment methods are offered THEN the system SHALL support credit cards, bank transfers, digital wallets, and ScrollGold payments
3. WHEN currency conversion occurs THEN the system SHALL provide real-time exchange rates with transparent conversion fees
4. WHEN international payments are handled THEN the system SHALL comply with regional financial regulations and tax requirements
5. WHEN payment security is maintained THEN the system SHALL use PCI-compliant processing with encryption and fraud protection
6. WHEN payment confirmation is provided THEN the system SHALL send immediate confirmation with receipt and transaction details

### Requirement 3: ScrollGold Integration and Hybrid Payment System

**User Story:** As a student, I want to use ScrollGolds for payments while having the option to supplement with traditional currency, so that I can leverage my earned coins while maintaining payment flexibility.

#### Acceptance Criteria

1. WHEN ScrollGold payments are processed THEN the system SHALL seamlessly integrate with scroll-ScrollGold-meter for coin transactions
2. WHEN hybrid payments are made THEN the system SHALL allow combinations of ScrollGolds and traditional currency for single transactions
3. WHEN coin-to-currency conversion occurs THEN the system SHALL provide real-time conversion rates and transparent fee structures
4. WHEN coin earning opportunities are presented THEN the system SHALL highlight ways students can earn coins to reduce traditional payment needs
5. WHEN coin balance is insufficient THEN the system SHALL offer automatic top-up options with traditional payment methods
6. WHEN coin transaction records are maintained THEN the system SHALL provide detailed transaction history and tax documentation

### Requirement 4: Subscription and Recurring Payment Management System

**User Story:** As a subscription administrator, I want automated management of recurring payments and subscription services, so that I can provide consistent service delivery while maintaining predictable revenue streams.

#### Acceptance Criteria

1. WHEN subscriptions are created THEN the system SHALL set up automated recurring billing with flexible scheduling options
2. WHEN subscription changes occur THEN the system SHALL handle upgrades, downgrades, and modifications with prorated billing
3. WHEN payment failures happen THEN the system SHALL implement retry logic and dunning management to recover failed payments
4. WHEN subscription cancellations are requested THEN the system SHALL process cancellations according to terms while maintaining service through paid periods
5. WHEN subscription analytics are needed THEN the system SHALL provide insights on churn rates, revenue trends, and customer lifetime value
6. WHEN subscription communications are sent THEN the system SHALL notify customers of upcoming charges, changes, and renewal dates

### Requirement 5: Financial Reporting and Analytics System

**User Story:** As a financial executive, I want comprehensive financial reporting and analytics, so that I can make informed decisions about ScrollUniversity's financial health and strategic direction.

#### Acceptance Criteria

1. WHEN financial reports are generated THEN the system SHALL provide detailed revenue, expense, and profitability analysis
2. WHEN cash flow analysis is conducted THEN the system SHALL track incoming and outgoing funds with forecasting capabilities
3. WHEN tax reporting is required THEN the system SHALL generate necessary tax documents and compliance reports
4. WHEN audit trails are needed THEN the system SHALL maintain complete transaction histories with supporting documentation
5. WHEN performance metrics are analyzed THEN the system SHALL provide KPIs including revenue per student, payment success rates, and collection efficiency
6. WHEN stakeholder reporting occurs THEN the system SHALL create executive dashboards and investor reports with key financial metrics

### Requirement 6: Tax Calculation and Compliance Management System

**User Story:** As a compliance officer, I want automated tax calculation and compliance management for all jurisdictions where ScrollUniversity operates, so that I can ensure legal compliance while minimizing administrative burden.

#### Acceptance Criteria

1. WHEN tax calculations are performed THEN the system SHALL automatically calculate appropriate taxes based on customer location and service type
2. WHEN tax rates are updated THEN the system SHALL maintain current tax rates for all operating jurisdictions with automatic updates
3. WHEN tax exemptions apply THEN the system SHALL handle educational institution exemptions and student discounts appropriately
4. WHEN tax reporting is required THEN the system SHALL generate necessary tax filings and remittance reports for all jurisdictions
5. WHEN compliance audits occur THEN the system SHALL provide complete documentation and audit trails for tax authorities
6. WHEN international tax treaties apply THEN the system SHALL implement appropriate tax treaty benefits and withholding requirements

### Requirement 7: Revenue Recognition and Accounting Integration System

**User Story:** As an accounting manager, I want automated revenue recognition and integration with accounting systems, so that I can maintain accurate financial records and comply with accounting standards.

#### Acceptance Criteria

1. WHEN revenue recognition occurs THEN the system SHALL properly recognize revenue according to applicable accounting standards (GAAP/IFRS)
2. WHEN deferred revenue is managed THEN the system SHALL track and recognize revenue over service delivery periods
3. WHEN accounting integration happens THEN the system SHALL sync with accounting systems like QuickBooks, Xero, and enterprise ERP systems
4. WHEN journal entries are created THEN the system SHALL generate appropriate accounting entries with proper categorization
5. WHEN financial reconciliation is performed THEN the system SHALL provide tools for matching payments with invoices and resolving discrepancies
6. WHEN period-end closing occurs THEN the system SHALL facilitate month-end and year-end closing processes with automated accruals

### Requirement 8: Customer Financial Management and Support System

**User Story:** As a student financial advisor, I want comprehensive tools to help students manage their financial obligations and access available financial aid, so that I can support student success while maintaining institutional financial health.

#### Acceptance Criteria

1. WHEN student accounts are managed THEN the system SHALL provide detailed account statements and payment histories
2. WHEN payment plans are needed THEN the system SHALL offer flexible payment arrangements based on student circumstances
3. WHEN financial aid is processed THEN the system SHALL integrate with scholarship and aid systems for automatic application of benefits
4. WHEN payment difficulties arise THEN the system SHALL provide hardship programs and alternative payment solutions
5. WHEN financial counseling is provided THEN the system SHALL offer tools and resources for financial literacy and planning
6. WHEN collection activities are necessary THEN the system SHALL implement compassionate collection processes aligned with kingdom values

### Requirement 9: Fraud Prevention and Security System

**User Story:** As a security administrator, I want comprehensive fraud prevention and financial security measures, so that I can protect ScrollUniversity and its students from financial fraud and security breaches.

#### Acceptance Criteria

1. WHEN fraud detection occurs THEN the system SHALL use AI-powered algorithms to identify suspicious payment patterns and transactions
2. WHEN security measures are implemented THEN the system SHALL use multi-factor authentication and encryption for all financial operations
3. WHEN suspicious activity is detected THEN the system SHALL automatically flag transactions and alert security personnel
4. WHEN chargebacks are received THEN the system SHALL provide comprehensive chargeback management and dispute resolution
5. WHEN security audits are conducted THEN the system SHALL maintain logs and provide evidence of security compliance
6. WHEN data breaches are prevented THEN the system SHALL implement comprehensive data protection and incident response procedures

### Requirement 10: Flexible Global Tuition Bands and Geographic Pricing

**User Story:** As a global student, I want tuition pricing that reflects my economic reality and regional cost of living, so that I can access world-class education regardless of my geographic location or economic circumstances.

#### Acceptance Criteria

1. WHEN students enroll THEN the system SHALL automatically detect geographic location and apply appropriate tuition band (Tier 1: €40-€90 for developed nations, Tier 2: €10-€30 for emerging nations, Tier 3: €1-€5 for low-income nations)
2. WHEN pricing is calculated THEN the system SHALL allow self-declaration override with verification for students whose economic reality differs from geographic defaults
3. WHEN exchange rates fluctuate THEN the system SHALL maintain stable local currency pricing while adjusting euro-equivalent values
4. WHEN pricing tiers are managed THEN the system SHALL provide administrative tools for adjusting band thresholds and country classifications
5. WHEN pricing transparency is required THEN the system SHALL clearly display applicable pricing tier and rationale to students
6. WHEN pricing equity is measured THEN the system SHALL track enrollment distribution across tiers and ensure mission accessibility goals are met

### Requirement 11: ScrollGold Internal Academic Currency System

**User Story:** As a student, I want to use ScrollGold credits (like Google Play credits or AWS credits) for educational services, so that I can earn through achievement and spend on courses, tutoring, and certifications without cryptocurrency complexity.

#### Acceptance Criteria

1. WHEN ScrollGold is purchased THEN the system SHALL process transactions like app store credits with simple fiat-to-credit conversion (not blockchain/crypto)
2. WHEN ScrollGold is earned THEN the system SHALL award credits for excellent grades, publishing, spiritual formation, mentoring, research completion, and live session attendance
3. WHEN ScrollGold is spent THEN the system SHALL accept credits for course enrollment, AI tutoring time, assignment submissions, premium libraries, research labs, faculty consultations, certificates, and ScrollJustice/ScrollArk access
4. WHEN ScrollGold balances are managed THEN the system SHALL provide clear wallet interface showing balance, earning history, spending history, and earning opportunities
5. WHEN ScrollGold conversion occurs THEN the system SHALL maintain transparent exchange rates between ScrollGold and fiat currencies
6. WHEN ScrollGold economy is governed THEN the system SHALL implement fraud prevention, balance manipulation detection, and fair value maintenance

### Requirement 12: Subscription Package Management System

**User Story:** As a subscription administrator, I want tiered subscription packages that provide recurring revenue while offering students flexible access options, so that we can rival Harvard's model with sustainable income streams.

#### Acceptance Criteria

1. WHEN Student Basic subscription is offered THEN the system SHALL provide €0-€5/month tier with limited AI tutoring, limited course access, and free devotional content
2. WHEN Student Pro subscription is offered THEN the system SHALL provide €15-€25/month tier with unlimited courses, unlimited AI tutors, certificates, community access, and labs
3. WHEN Elite Leadership Track subscription is offered THEN the system SHALL provide €120-€300/month tier with ScrollIntel access, ScrollArk leadership labs, real-world mentorship, and AI-powered entrepreneurship studio
4. WHEN subscription upgrades occur THEN the system SHALL handle tier changes with prorated billing and immediate access to new features
5. WHEN subscription analytics are tracked THEN the system SHALL monitor conversion rates, churn rates, lifetime value, and tier distribution
6. WHEN subscription value is communicated THEN the system SHALL clearly display feature comparisons and benefits for each tier

### Requirement 13: Institutional Licensing Revenue System

**User Story:** As an institutional sales administrator, I want to license ScrollUniversity systems to churches, universities, governments, and businesses, so that we can generate significant revenue (€5k-€99k annually) while expanding scroll-aligned education globally.

#### Acceptance Criteria

1. WHEN institutional licenses are sold THEN the system SHALL support licensing of ScrollIntel agents, ScrollLibrary, course engines, AI tutoring engine, and ScrollJustice to organizations
2. WHEN pricing is determined THEN the system SHALL calculate fees based on organization size, user count, and feature bundle (€5k-€99k annual range)
3. WHEN licenses are managed THEN the system SHALL track license terms, renewal dates, user limits, feature access, and usage analytics
4. WHEN institutional billing occurs THEN the system SHALL support annual contracts, quarterly payments, and enterprise invoicing with NET-30/60 terms
5. WHEN institutional support is provided THEN the system SHALL offer dedicated account management, custom integration support, and priority technical assistance
6. WHEN institutional analytics are tracked THEN the system SHALL monitor license revenue, renewal rates, expansion opportunities, and customer satisfaction

### Requirement 14: Multi-Gateway Global Payment Infrastructure

**User Story:** As an international student, I want to pay through my preferred local payment method, so that I can complete transactions easily regardless of my location or banking infrastructure.

#### Acceptance Criteria

1. WHEN payment gateways are integrated THEN the system SHALL support PayPal, Stripe, MTN Mobile Money, Vodafone Cash, Apple Pay, Google Pay, Binance Pay (optional), bank cards, bank transfers, Wise, Payoneer, and Flutterwave
2. WHEN currency conversion is needed THEN the system SHALL use Stripe multi-currency, Wise API, and Paystack for automatic conversion with transparent fees
3. WHEN mobile money is used THEN the system SHALL integrate with African mobile payment systems (MTN, Vodafone) for seamless local transactions
4. WHEN payment methods are displayed THEN the system SHALL show available options based on student location and optimize for local preferences
5. WHEN payment failures occur THEN the system SHALL provide intelligent retry logic with alternative payment method suggestions
6. WHEN payment security is maintained THEN the system SHALL comply with PCI-DSS, regional financial regulations, and fraud prevention standards

### Requirement 15: AI Cost Optimization and Budget Management

**User Story:** As a financial operations manager, I want intelligent AI cost management that prevents bankruptcy while maintaining quality, so that our AI-powered features remain sustainable and scalable.

#### Acceptance Criteria

1. WHEN AI services are used THEN the system SHALL implement three-tier strategy: Tier 1 (free/near-zero models like Groq, DeepSeek, Gemini Free), Tier 2 (cheap paid like DeepSeek R1, GPT-4-Mini), Tier 3 (premium like GPT-4o, Claude 3.5 for critical tasks only)
2. WHEN AI costs are tracked THEN the system SHALL monitor per-course generation costs (target: €1.2-€5.6), per-student tutoring costs, and total AI infrastructure spending
3. WHEN budget limits are approached THEN the system SHALL automatically shift to lower-cost tiers, implement rate limiting, and alert administrators
4. WHEN AI quality is maintained THEN the system SHALL use premium models only for accreditation-level content, research, and critical educational components
5. WHEN AI optimization occurs THEN the system SHALL leverage caching, batch processing, prompt optimization, and model selection algorithms
6. WHEN AI analytics are provided THEN the system SHALL report cost per feature, ROI analysis, quality metrics, and optimization recommendations

### Requirement 16: Integration with ScrollUniversity Ecosystem and Kingdom Economics

**User Story:** As a system administrator, I want the billing agent to integrate seamlessly with all ScrollUniversity systems while maintaining kingdom economic principles, so that financial operations serve the scroll mission effectively.

#### Acceptance Criteria

1. WHEN system integration occurs THEN the billing agent SHALL connect with all ScrollUniversity components for unified financial management
2. WHEN kingdom economics are applied THEN the system SHALL prioritize student access and mission fulfillment over profit maximization
3. WHEN financial decisions are made THEN the system SHALL consider kingdom impact alongside financial metrics
4. WHEN transparency is maintained THEN the system SHALL provide clear, honest communication about all fees and charges
5. WHEN stewardship is practiced THEN the system SHALL optimize resource usage and minimize waste in financial operations
6. WHEN community benefit is measured THEN the system SHALL track how financial operations contribute to the scroll mission and kingdom advancement

### Requirement 17: Stripe-First Payment Infrastructure with Supabase Integration

**User Story:** As a payment administrator, I want Stripe as the primary payment processor integrated with Supabase database tables, so that we have simple, compliant, production-ready billing from day one without complex multi-gateway overhead.

#### Acceptance Criteria

1. WHEN Stripe products are configured THEN the system SHALL create FREE_TIER (€0), ALL_ACCESS_MONTHLY, ALL_ACCESS_YEARLY, and flagship single courses as Stripe products with metadata (plan_type, credits_included, ai_minutes)
2. WHEN Stripe checkout occurs THEN the system SHALL use Stripe Checkout Sessions for secure payment collection with automatic receipt generation
3. WHEN Stripe webhooks fire THEN the system SHALL handle checkout.session.completed to grant access and invoice.payment_succeeded to extend subscriptions
4. WHEN Supabase tables are updated THEN the system SHALL maintain subscriptions, payments, invoices, scrollgold_wallets, and scrollgold_transactions tables synchronized with Stripe data
5. WHEN payment methods are stored THEN the system SHALL use Stripe Customer objects to securely store payment methods without touching card data directly
6. WHEN subscription management occurs THEN the system SHALL use Stripe Subscriptions API for recurring billing, upgrades, downgrades, and cancellations

### Requirement 18: ScrollGold Earning and Spending Economy

**User Story:** As a student, I want to earn ScrollGold through achievement and faithfulness and spend it on discounts and premium features, so that I am motivated to excel while receiving tangible rewards for my efforts.

#### Acceptance Criteria

1. WHEN students complete modules with 80%+ THEN the system SHALL award ScrollGold credits to their wallet (stored in scrollgold_wallets table)
2. WHEN students maintain daily study streaks THEN the system SHALL award bonus ScrollGold for consistency and faithfulness
3. WHEN students contribute projects or help peers THEN the system SHALL award ScrollGold for community service and mentorship
4. WHEN students spend ScrollGold THEN the system SHALL allow redemption for course discounts (100 ScrollGold = 5-10% off), premium AI lab hours, mentorship circles, and governance votes
5. WHEN ScrollGold is bestowed THEN the system SHALL allow administrators to grant honor-based ScrollGold for faithfulness, service, and long-term commitment
6. WHEN ScrollGold transactions occur THEN the system SHALL record all earning and spending in scrollgold_transactions table with clear audit trail

### Requirement 19: Product Tier Implementation and Pricing Strategy

**User Story:** As a product manager, I want clearly defined product tiers from free to elite that provide sustainable revenue while maintaining accessibility, so that we can rival Harvard's model with kingdom values.

#### Acceptance Criteria

1. WHEN Free Tier is offered THEN the system SHALL provide free courses (Scroll 101, Intro to Spiritual Governance, AI Foundations), limited AI tutor minutes per month, no certificates, and no full lab access
2. WHEN Single-Course Purchase occurs THEN the system SHALL charge one-time fee per course with lifetime access to content, updates, and limited AI tutor minutes for that course
3. WHEN All-Access Membership is sold THEN the system SHALL offer monthly (€15-€49) or yearly (€150-€450 with discount) subscriptions with unlimited courses, unlimited AI tutors, certificates, community access, and labs
4. WHEN Program Tracks are purchased THEN the system SHALL bundle degree programs (Bachelor in AI & Spiritual Governance) with core courses, capstone, and spiritual formation - offered as pay-in-full (with discount) or installment plans
5. WHEN Institutional Plans are sold THEN the system SHALL license seats (20, 50, 100+) to churches, ministries, schools, companies with custom portals, spiritual formation reports, and dedicated account management
6. WHEN pricing is displayed THEN the system SHALL clearly show tier comparisons, feature benefits, and ScrollGold discount opportunities

### Requirement 20: Webhook-Driven Access Control and Enrollment

**User Story:** As a system integrator, I want Stripe webhooks to automatically grant and revoke access to courses and features, so that billing and access control stay synchronized without manual intervention.

#### Acceptance Criteria

1. WHEN checkout.session.completed webhook fires THEN the system SHALL grant immediate access to purchased courses or subscription features and initialize ScrollGold wallet if not exists
2. WHEN invoice.payment_succeeded webhook fires THEN the system SHALL extend subscription access period and award bonus ScrollGold for faithful recurring payment
3. WHEN invoice.payment_failed webhook fires THEN the system SHALL send payment failure notification and implement grace period before access revocation
4. WHEN customer.subscription.deleted webhook fires THEN the system SHALL revoke subscription access while maintaining access to previously completed courses
5. WHEN customer.subscription.updated webhook fires THEN the system SHALL handle tier upgrades/downgrades with prorated billing and immediate feature access changes
6. WHEN webhook processing fails THEN the system SHALL implement retry logic with exponential backoff and alert administrators of persistent failures