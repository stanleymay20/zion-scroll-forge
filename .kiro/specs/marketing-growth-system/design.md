# Marketing & Growth System Design

## Overview

The Marketing & Growth System is the strategic engine for acquiring ScrollUniversity's first 100 students by Summer 2026. This system integrates brand positioning, multi-channel marketing, lead generation, conversion optimization, and retention strategies specifically designed for the Christian higher education market. Unlike operational automation (Zapier), this system defines the strategic "what" and "who" of marketing, while Zapier handles the tactical "how" of execution.

The system operates on a full-funnel approach: Awareness → Interest → Decision → Action → Retention, with each stage supported by specific channels, content, and automation.

## Architecture

### System Components

```
Marketing & Growth System
├── Brand & Positioning Layer
│   ├── Brand Identity Management
│   ├── Value Proposition Framework
│   ├── Messaging Architecture
│   └── Visual Identity System
├── Audience Intelligence Layer
│   ├── Persona Management
│   ├── Segmentation Engine
│   ├── Behavioral Tracking
│   └── Competitive Intelligence
├── Content & SEO Layer
│   ├── Content Strategy & Calendar
│   ├── SEO Optimization Engine
│   ├── Content Production Workflow
│   └── Content Distribution System
├── Channel Management Layer
│   ├── Organic Channels (SEO, Social, Referral)
│   ├── Paid Channels (Google, Facebook, LinkedIn)
│   ├── Email Marketing & Automation
│   └── Partnership & Affiliate Network
├── Conversion Optimization Layer
│   ├── Website Optimization
│   ├── Landing Page System
│   ├── Form & Lead Capture
│   └── A/B Testing Framework
├── Analytics & Attribution Layer
│   ├── Multi-Touch Attribution
│   ├── Marketing Dashboards
│   ├── ROI Tracking
│   └── Predictive Analytics
└── Integration Layer
    ├── CRM Integration (Supabase)
    ├── Marketing Automation (Zapier)
    ├── Analytics Integration (Google Analytics, Mixpanel)
    └── Ad Platform APIs
```

### Technology Stack

**Marketing Automation & CRM:**
- Zapier: Workflow automation connecting all marketing tools
- Supabase: CRM and lead database
- Mailchimp/ConvertKit: Email marketing platform
- HubSpot (optional): Advanced marketing automation

**Analytics & Tracking:**
- Google Analytics 4: Website analytics and conversion tracking
- Google Tag Manager: Tag management and event tracking
- Mixpanel: Product analytics and user behavior
- Hotjar: Heatmaps and session recordings

**Advertising Platforms:**
- Google Ads: Search, Display, YouTube advertising
- Facebook Ads Manager: Facebook and Instagram advertising
- LinkedIn Campaign Manager: Professional audience targeting

**SEO & Content:**
- Ahrefs/SEMrush: SEO research and competitive analysis
- WordPress/Ghost: Blog platform
- Canva: Visual content creation
- Loom: Video content creation

**Social Media Management:**
- Buffer/Hootsuite: Social media scheduling
- Native platform tools: Facebook, Instagram, LinkedIn, Twitter, YouTube

**Landing Pages & Conversion:**
- Unbounce/Instapage: Landing page builder
- Optimizely/VWO: A/B testing platform
- Typeform: Interactive forms and surveys


## Components and Interfaces

### 1. Brand & Positioning Layer

**Brand Identity Management**
- Manages brand guidelines, logo usage, color palette, typography
- Ensures consistent brand voice across all channels
- Maintains brand asset library (logos, images, templates)

**Value Proposition Framework**
- Core value proposition: "Kingdom-focused AI-powered Christian education"
- Differentiation pillars:
  - Spiritual Formation + Academic Excellence
  - AI-Enhanced Personalized Learning
  - Blockchain-Verified Credentials
  - Global Accessibility & Affordability
  - Community-Driven Learning

**Messaging Architecture**
- Primary message: Transform your calling into credentials through AI-powered Christian education
- Secondary messages by audience:
  - Traditional students: "Affordable, flexible Christian education with cutting-edge AI"
  - Adult learners: "Advance your career while deepening your faith"
  - Missionaries: "Earn your degree while serving on the field"
  - Ministry leaders: "Equip yourself for greater kingdom impact"

**Visual Identity System**
- Logo variations and usage guidelines
- Color palette: Primary (kingdom gold, scroll blue), Secondary (spiritual purple, grace white)
- Typography: Headings (bold, authoritative), Body (readable, warm)
- Photography style: Diverse, authentic, spiritually grounded
- Iconography: Modern, clean, meaningful

### 2. Audience Intelligence Layer

**Persona Management**

*Persona 1: Traditional Student (18-22)*
- Demographics: High school graduate, 18-22 years old, Christian background
- Psychographics: Seeking purpose, values community, tech-savvy
- Pain points: Cost of education, uncertain career path, desire for spiritual depth
- Goals: Affordable degree, career preparation, spiritual growth
- Channels: Instagram, TikTok, YouTube, Google Search

*Persona 2: Adult Learner (23-35)*
- Demographics: Working professional, 23-35 years old, some college or bachelor's
- Psychographics: Career-focused, time-constrained, values flexibility
- Pain points: Balancing work/family/education, need for career advancement
- Goals: Career growth, credential completion, skill development
- Channels: LinkedIn, Facebook, Google Search, Email

*Persona 3: Missionary/Ministry Worker (25-45)*
- Demographics: Active in ministry, 25-45 years old, various education levels
- Psychographics: Mission-driven, globally mobile, resource-conscious
- Pain points: Limited access to education, financial constraints, time zones
- Goals: Formal credentials, theological depth, ministry effectiveness
- Channels: Ministry networks, Facebook, Email, Referrals

*Persona 4: Ministry Leader (30-55)*
- Demographics: Pastor/leader, 30-55 years old, bachelor's or master's
- Psychographics: Influence-focused, continuous learner, community builder
- Pain points: Leadership development, theological training, time management
- Goals: Advanced credentials, leadership skills, organizational impact
- Channels: LinkedIn, Ministry conferences, Referrals, Email

*Persona 5: Career Changer (28-45)*
- Demographics: Professional seeking purpose, 28-45 years old, bachelor's degree
- Psychographics: Purpose-driven, financially stable, seeking meaning
- Pain points: Unfulfilling career, desire for kingdom work, need for transition
- Goals: Career pivot, ministry preparation, purpose alignment
- Channels: LinkedIn, Google Search, Facebook, Podcasts

**Segmentation Engine**
- Demographic segmentation: Age, location, education level, income
- Behavioral segmentation: Website activity, content engagement, email opens
- Psychographic segmentation: Values, interests, lifestyle, motivations
- Lifecycle segmentation: Awareness, Consideration, Decision, Retention

**Behavioral Tracking**
- Website behavior: Pages visited, time on site, scroll depth, CTAs clicked
- Content engagement: Blog reads, video views, resource downloads
- Email engagement: Opens, clicks, forwards, unsubscribes
- Social engagement: Likes, shares, comments, follows
- Ad engagement: Impressions, clicks, conversions

**Competitive Intelligence**
- Direct competitors: Liberty University Online, Regent University, Biola University
- Indirect competitors: Coursera, Udemy, traditional Christian colleges
- Competitive analysis framework:
  - Positioning: How they position themselves
  - Pricing: Tuition and fee structure
  - Programs: Degree offerings and specializations
  - Marketing: Channels, messaging, campaigns
  - Strengths/Weaknesses: What they do well/poorly


### 3. Content & SEO Layer

**Content Strategy & Calendar**
- Content pillars:
  - Christian Education & Theology
  - AI in Learning & Technology
  - Career Development & Ministry
  - Spiritual Formation & Growth
  - Student Success Stories
- Content types:
  - Blog posts (2x per week)
  - Video content (1x per week)
  - Infographics (2x per month)
  - Case studies (1x per month)
  - Downloadable resources (1x per month)
- Editorial calendar: 90-day rolling calendar with themes and topics

**SEO Optimization Engine**
- Keyword research and targeting:
  - Primary keywords: "Christian online university", "AI-powered Christian education", "biblical higher education"
  - Secondary keywords: "online theology degree", "Christian distance learning", "affordable Christian college"
  - Long-tail keywords: "how to earn a Christian degree while working", "best online Christian university with AI"
- On-page SEO:
  - Title tags, meta descriptions, header tags
  - Internal linking structure
  - Image optimization with alt text
  - Schema markup for rich snippets
- Technical SEO:
  - Site speed optimization
  - Mobile responsiveness
  - XML sitemap and robots.txt
  - Canonical tags and redirects
- Off-page SEO:
  - Backlink acquisition strategy
  - Guest posting on Christian education blogs
  - Directory submissions
  - Social signals

**Content Production Workflow**
1. Ideation: Keyword research, audience needs, competitive gaps
2. Planning: Content brief, outline, SEO requirements
3. Creation: Writing, design, video production
4. Review: Quality check, theological alignment, SEO optimization
5. Publishing: CMS upload, formatting, metadata
6. Distribution: Social sharing, email newsletter, partner channels
7. Promotion: Paid amplification, influencer outreach
8. Measurement: Traffic, engagement, conversions

**Content Distribution System**
- Owned channels: Website blog, email newsletter, social media
- Earned channels: PR coverage, guest posts, backlinks
- Paid channels: Promoted posts, content syndication, native ads
- Partner channels: Church bulletins, ministry newsletters, affiliate sites

### 4. Channel Management Layer

**Organic Channels**

*SEO (Search Engine Optimization)*
- Target: 5,000 monthly organic visitors by month 6
- Strategy: Content-driven SEO with focus on Christian education keywords
- Tactics:
  - Publish 2 SEO-optimized blog posts per week
  - Build 50+ high-quality backlinks
  - Optimize all website pages for target keywords
  - Create pillar content and topic clusters
- Measurement: Organic traffic, keyword rankings, domain authority

*Social Media*
- Platforms: Facebook, Instagram, LinkedIn, YouTube, Twitter
- Target: 10,000 total followers by month 6
- Strategy: Community building through valuable content and engagement
- Tactics:
  - Post 5x per week on each platform
  - Engage with comments and messages within 24 hours
  - Run social contests and giveaways
  - Partner with Christian influencers
- Measurement: Followers, engagement rate, traffic, leads

*Referral & Word-of-Mouth*
- Target: 20% of enrollments from referrals
- Strategy: Incentivized referral program with ScrollGold rewards
- Tactics:
  - Provide unique referral links to all students
  - Offer rewards for both referrer and referee
  - Create shareable content and testimonials
  - Build ambassador program with top referrers
- Measurement: Referral traffic, referral conversions, viral coefficient

**Paid Channels**

*Google Ads*
- Budget: $5,000/month
- Target: 500 clicks, 50 leads, 5 enrollments per month
- Strategy: Search-focused with high-intent keywords
- Campaign structure:
  - Brand campaigns: ScrollUniversity branded terms
  - Competitor campaigns: Competitor university names
  - Generic campaigns: "Christian online university", "online theology degree"
  - Remarketing campaigns: Website visitors, video viewers
- Tactics:
  - Bid on high-intent keywords
  - Create compelling ad copy with unique value props
  - Use ad extensions (sitelinks, callouts, structured snippets)
  - Optimize landing pages for conversion
- Measurement: Impressions, clicks, CTR, CPC, conversions, ROAS

*Facebook & Instagram Ads*
- Budget: $3,000/month
- Target: 300,000 impressions, 30 leads, 3 enrollments per month
- Strategy: Awareness and consideration campaigns with precise targeting
- Campaign structure:
  - Awareness campaigns: Video views, page likes
  - Consideration campaigns: Traffic, engagement, lead generation
  - Conversion campaigns: Application starts, enrollments
  - Retargeting campaigns: Website visitors, video viewers, engaged users
- Tactics:
  - Target Christian interests, education seekers, ministry workers
  - Use video content and testimonials
  - Test multiple ad creatives and audiences
  - Implement Facebook Pixel for tracking
- Measurement: Reach, impressions, engagement, leads, cost per lead

*LinkedIn Ads*
- Budget: $2,000/month
- Target: 100,000 impressions, 20 leads, 2 enrollments per month
- Strategy: Professional audience targeting for adult learners and ministry leaders
- Campaign structure:
  - Sponsored content: Thought leadership articles
  - Sponsored InMail: Personalized outreach
  - Text ads: Direct response
- Tactics:
  - Target by job title, industry, interests
  - Use professional, credible messaging
  - Offer valuable resources (whitepapers, webinars)
- Measurement: Impressions, clicks, leads, cost per lead

**Email Marketing & Automation**

*Email Segmentation*
- New leads: Welcome series (5 emails over 2 weeks)
- Program interest: Program-specific nurture (8 emails over 4 weeks)
- Application started: Application completion series (3 emails over 1 week)
- Enrolled students: Onboarding and engagement series
- Inactive leads: Re-engagement campaign

*Email Sequences*
- Welcome series: Introduction, value proposition, social proof, program overview, application CTA
- Nurture series: Educational content, student stories, faculty profiles, financial aid info, application CTA
- Application series: Application tips, deadline reminders, support resources
- Onboarding series: Welcome, orientation info, community introduction, first steps

*Email Best Practices*
- Personalization: Use name, program interest, engagement history
- Mobile optimization: Responsive design, short subject lines
- Clear CTAs: Single primary action per email
- Testing: A/B test subject lines, content, CTAs
- Compliance: GDPR, CAN-SPAM compliance

**Partnership & Affiliate Network**

*Church Partnerships*
- Target: 50 church partners by month 6
- Strategy: Co-marketing with tuition discounts for church members
- Tactics:
  - Identify churches with 500+ members
  - Offer 10% tuition discount for church members
  - Provide co-branded marketing materials
  - Host information sessions at churches
- Measurement: Partner sign-ups, leads from partners, enrollments

*Ministry Organization Partnerships*
- Target: 20 ministry partners by month 6
- Strategy: Affiliate program with commission for referrals
- Tactics:
  - Identify mission organizations, parachurch ministries
  - Offer 15% commission on enrollments
  - Provide affiliate tracking links and materials
  - Create co-branded landing pages
- Measurement: Affiliate sign-ups, referrals, enrollments, commissions paid

*Educational Institution Partnerships*
- Target: 10 institution partners by month 6
- Strategy: Transfer credit agreements and pathway programs
- Tactics:
  - Identify Christian colleges and Bible schools
  - Negotiate transfer credit policies
  - Create articulation agreements
  - Co-market to their alumni
- Measurement: Partnership agreements, transfer students, enrollments


### 5. Conversion Optimization Layer

**Website Optimization**
- Homepage optimization:
  - Clear value proposition above the fold
  - Prominent CTA buttons (Apply Now, Request Info, Browse Programs)
  - Social proof (student testimonials, enrollment numbers, accreditation)
  - Trust signals (security badges, privacy policy, contact info)
- Program pages optimization:
  - Detailed program information (curriculum, outcomes, faculty)
  - Clear pricing and financial aid information
  - Application process and requirements
  - Student testimonials specific to program
- Navigation optimization:
  - Simple, intuitive menu structure
  - Sticky header with CTA
  - Footer with important links
  - Search functionality

**Landing Page System**
- Landing page templates:
  - Program-specific pages (one per degree program)
  - Campaign-specific pages (one per major campaign)
  - Resource download pages (ebooks, guides, webinars)
  - Event registration pages (webinars, info sessions)
- Landing page best practices:
  - Single clear CTA
  - Minimal navigation (remove header/footer)
  - Compelling headline and subheadline
  - Benefits-focused copy
  - Social proof and trust signals
  - Mobile-optimized design
  - Fast load time (<2 seconds)

**Form & Lead Capture**
- Form types:
  - Short form (name, email, phone) for top-of-funnel
  - Medium form (+ program interest, start date) for mid-funnel
  - Long form (full application) for bottom-of-funnel
- Form optimization:
  - Progressive profiling (ask for more info over time)
  - Smart defaults and auto-fill
  - Clear privacy policy and data usage
  - Immediate confirmation and next steps
  - Mobile-friendly design
- Lead capture tactics:
  - Exit-intent popups
  - Slide-in forms
  - Embedded forms in content
  - Chatbot lead capture
  - Gated content (ebooks, webinars)

**A/B Testing Framework**
- Testing methodology:
  - Hypothesis-driven testing
  - Statistical significance (95% confidence)
  - Minimum sample size (1,000 visitors per variation)
  - Test duration (minimum 2 weeks)
- Testing priorities:
  - Headlines and value propositions
  - CTA button text and color
  - Form fields and length
  - Page layout and design
  - Social proof placement
- Testing tools:
  - Google Optimize (free)
  - Optimizely or VWO (paid)
  - Built-in platform testing (Unbounce, Instapage)

### 6. Analytics & Attribution Layer

**Multi-Touch Attribution**
- Attribution models:
  - First-touch: Credit to first interaction
  - Last-touch: Credit to last interaction before conversion
  - Linear: Equal credit to all touchpoints
  - Time-decay: More credit to recent touchpoints
  - Position-based: More credit to first and last touchpoints
- Implementation:
  - UTM parameters on all marketing links
  - Google Analytics 4 with custom events
  - CRM integration for closed-loop reporting
  - Marketing automation platform tracking

**Marketing Dashboards**
- Executive dashboard:
  - Total leads, MQLs, SQLs, applications, enrollments
  - CAC (Customer Acquisition Cost)
  - LTV (Lifetime Value)
  - ROI by channel
  - Funnel conversion rates
- Channel performance dashboard:
  - Traffic by source
  - Leads by source
  - Conversion rate by source
  - Cost per lead by source
  - Cost per enrollment by source
- Content performance dashboard:
  - Top performing content by traffic
  - Top performing content by leads
  - Content engagement metrics
  - SEO performance (rankings, organic traffic)
- Campaign performance dashboard:
  - Campaign-specific metrics
  - Ad performance (impressions, clicks, conversions)
  - Landing page performance
  - Email campaign performance

**ROI Tracking**
- Cost tracking:
  - Ad spend by platform
  - Tool and software costs
  - Content production costs
  - Personnel costs (if applicable)
- Revenue tracking:
  - Tuition revenue by cohort
  - Lifetime value projections
  - Retention and upsell revenue
- ROI calculation:
  - ROI = (Revenue - Cost) / Cost
  - Target ROI: 3:1 (3 dollars revenue for every 1 dollar spent)
  - Payback period: 12 months

**Predictive Analytics**
- Lead scoring:
  - Demographic score (fit with ideal student profile)
  - Behavioral score (engagement with content and website)
  - Combined score (0-100) to prioritize follow-up
- Conversion prediction:
  - Likelihood to apply (based on engagement patterns)
  - Likelihood to enroll (based on application data)
  - Churn risk (for enrolled students)
- Budget optimization:
  - Predictive modeling for channel performance
  - Budget allocation recommendations
  - Scenario planning for different spend levels


## Data Models

### Lead Data Model
```typescript
interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: LeadSource;
  campaign?: string;
  utmParams: UTMParameters;
  programInterest?: string[];
  startDate?: string;
  leadScore: number;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
  interactions: Interaction[];
}

enum LeadSource {
  ORGANIC_SEARCH = 'organic_search',
  PAID_SEARCH = 'paid_search',
  SOCIAL_ORGANIC = 'social_organic',
  SOCIAL_PAID = 'social_paid',
  EMAIL = 'email',
  REFERRAL = 'referral',
  DIRECT = 'direct',
  PARTNERSHIP = 'partnership'
}

enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  NURTURING = 'nurturing',
  APPLICATION_STARTED = 'application_started',
  APPLIED = 'applied',
  ENROLLED = 'enrolled',
  LOST = 'lost'
}

interface UTMParameters {
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
}

interface Interaction {
  type: InteractionType;
  timestamp: Date;
  details: any;
}

enum InteractionType {
  PAGE_VIEW = 'page_view',
  FORM_SUBMISSION = 'form_submission',
  EMAIL_OPEN = 'email_open',
  EMAIL_CLICK = 'email_click',
  AD_CLICK = 'ad_click',
  WEBINAR_ATTENDANCE = 'webinar_attendance',
  PHONE_CALL = 'phone_call'
}
```

### Campaign Data Model
```typescript
interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  channel: MarketingChannel;
  status: CampaignStatus;
  budget: number;
  spent: number;
  startDate: Date;
  endDate?: Date;
  targetAudience: Audience;
  goals: CampaignGoal[];
  creatives: Creative[];
  performance: CampaignPerformance;
}

enum CampaignType {
  AWARENESS = 'awareness',
  CONSIDERATION = 'consideration',
  CONVERSION = 'conversion',
  RETENTION = 'retention'
}

enum MarketingChannel {
  GOOGLE_SEARCH = 'google_search',
  GOOGLE_DISPLAY = 'google_display',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  EMAIL = 'email',
  CONTENT = 'content',
  PARTNERSHIP = 'partnership'
}

enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

interface CampaignGoal {
  metric: string;
  target: number;
  actual?: number;
}

interface CampaignPerformance {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  cost: number;
  cpc: number;
  cpa: number;
  roas: number;
}
```

### Content Data Model
```typescript
interface Content {
  id: string;
  title: string;
  type: ContentType;
  category: ContentCategory;
  author: string;
  publishDate: Date;
  url: string;
  seoKeywords: string[];
  targetPersona: string[];
  funnelStage: FunnelStage;
  performance: ContentPerformance;
  status: ContentStatus;
}

enum ContentType {
  BLOG_POST = 'blog_post',
  VIDEO = 'video',
  INFOGRAPHIC = 'infographic',
  CASE_STUDY = 'case_study',
  EBOOK = 'ebook',
  WEBINAR = 'webinar',
  PODCAST = 'podcast'
}

enum ContentCategory {
  CHRISTIAN_EDUCATION = 'christian_education',
  AI_TECHNOLOGY = 'ai_technology',
  CAREER_MINISTRY = 'career_ministry',
  SPIRITUAL_FORMATION = 'spiritual_formation',
  STUDENT_STORIES = 'student_stories'
}

enum FunnelStage {
  AWARENESS = 'awareness',
  INTEREST = 'interest',
  DECISION = 'decision',
  ACTION = 'action',
  RETENTION = 'retention'
}

enum ContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

interface ContentPerformance {
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  socialShares: number;
  leads: number;
  conversions: number;
}
```

### Analytics Data Model
```typescript
interface MarketingMetrics {
  period: DateRange;
  traffic: TrafficMetrics;
  leads: LeadMetrics;
  conversions: ConversionMetrics;
  revenue: RevenueMetrics;
  channelPerformance: ChannelMetrics[];
}

interface TrafficMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  newVsReturning: {
    new: number;
    returning: number;
  };
}

interface LeadMetrics {
  totalLeads: number;
  mqls: number;
  sqls: number;
  leadsBySource: Record<LeadSource, number>;
  leadConversionRate: number;
  avgLeadScore: number;
}

interface ConversionMetrics {
  applications: number;
  enrollments: number;
  applicationRate: number;
  enrollmentRate: number;
  avgTimeToConvert: number;
}

interface RevenueMetrics {
  totalRevenue: number;
  avgRevenuePerStudent: number;
  ltv: number;
  cac: number;
  ltvCacRatio: number;
  roi: number;
}

interface ChannelMetrics {
  channel: MarketingChannel;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
  roi: number;
  cpl: number;
  cpa: number;
}
```


## Conversion Funnel Design

### Full Funnel Overview

```
AWARENESS (Top of Funnel)
├── Organic Search (SEO)
├── Social Media (Organic)
├── Content Marketing
├── PR & Media Coverage
├── Paid Advertising
└── Partnership Promotion
    ↓
INTEREST (Middle of Funnel)
├── Website Visit
├── Content Consumption
├── Social Engagement
├── Email Subscription
└── Resource Download
    ↓
DECISION (Bottom of Funnel)
├── Program Research
├── Webinar Attendance
├── Info Request
├── Application Start
└── Financial Aid Inquiry
    ↓
ACTION (Conversion)
├── Application Submission
├── Admissions Interview
├── Acceptance
└── Enrollment
    ↓
RETENTION (Post-Conversion)
├── Onboarding
├── Engagement
├── Progress Tracking
├── Referral Generation
└── Upsell/Cross-sell
```

### Funnel Metrics & Targets

**Awareness Stage**
- Target: 50,000 unique visitors by month 6
- Channels: 40% organic, 30% paid, 20% social, 10% referral
- Content: Blog posts, videos, social content, ads
- Conversion goal: 10% to Interest stage

**Interest Stage**
- Target: 5,000 engaged visitors (email subscribers, resource downloaders)
- Activities: Email subscription, content downloads, webinar registration
- Nurture: Email sequences, retargeting ads, social engagement
- Conversion goal: 20% to Decision stage

**Decision Stage**
- Target: 1,000 qualified leads (MQLs)
- Activities: Program research, info requests, webinar attendance
- Nurture: Personalized emails, phone calls, application support
- Conversion goal: 30% to Action stage

**Action Stage**
- Target: 300 applications
- Activities: Application submission, admissions process
- Support: Application assistance, financial aid counseling, interview prep
- Conversion goal: 33% to Enrollment (100 students)

**Retention Stage**
- Target: 90% retention rate (90 of 100 students continue)
- Activities: Onboarding, engagement, support, community building
- Upsell: Additional courses, degree programs, certifications
- Referral: 20% of students refer new students

### Conversion Rate Optimization Strategy

**Homepage Optimization**
- Hypothesis: Clear value proposition increases engagement
- Test: Different headlines emphasizing different benefits
- Metric: Time on site, bounce rate, CTA clicks
- Target: 50% bounce rate, 2 minutes avg time on site

**Landing Page Optimization**
- Hypothesis: Shorter forms increase conversion
- Test: 3-field form vs 5-field form vs 7-field form
- Metric: Form submission rate
- Target: 15% form submission rate

**Email Optimization**
- Hypothesis: Personalized subject lines increase open rates
- Test: Generic vs personalized vs question-based subject lines
- Metric: Open rate, click-through rate
- Target: 25% open rate, 5% click-through rate

**Ad Creative Optimization**
- Hypothesis: Video ads outperform image ads
- Test: Video vs image vs carousel ads
- Metric: CTR, conversion rate, cost per conversion
- Target: 2% CTR, 5% conversion rate


## Marketing Automation Architecture

### Zapier Integration Workflows

**Lead Capture & CRM Sync**
```
Trigger: New form submission (Website, Landing Page, Typeform)
Actions:
1. Create lead in Supabase CRM
2. Add to Mailchimp/ConvertKit email list
3. Send Slack notification to admissions team
4. Create task in project management tool
5. Send welcome email to lead
```

**Email Engagement Tracking**
```
Trigger: Email opened/clicked (Mailchimp/ConvertKit)
Actions:
1. Update lead score in Supabase
2. Tag lead based on link clicked
3. Trigger follow-up email sequence
4. Notify sales if high-engagement
```

**Ad Lead Sync**
```
Trigger: New lead from Facebook/Google Ads
Actions:
1. Create lead in Supabase with UTM parameters
2. Add to appropriate email nurture sequence
3. Send lead notification to admissions
4. Update ad platform with conversion event
```

**Webinar Registration & Follow-up**
```
Trigger: Webinar registration (Zoom, WebinarJam)
Actions:
1. Create/update lead in Supabase
2. Send confirmation email with calendar invite
3. Add to webinar reminder sequence
4. Tag lead as "webinar registrant"
5. Send post-webinar follow-up sequence
```

**Application Status Updates**
```
Trigger: Application status change (Supabase)
Actions:
1. Send status update email to applicant
2. Update lead status in CRM
3. Trigger appropriate email sequence
4. Notify admissions team
5. Update analytics dashboard
```

### Email Marketing Automation

**Welcome Series (New Leads)**
- Email 1 (Immediate): Welcome + Value Proposition
- Email 2 (Day 2): About ScrollUniversity + Mission
- Email 3 (Day 4): Program Overview + Student Stories
- Email 4 (Day 7): Financial Aid + Affordability
- Email 5 (Day 10): Application Process + CTA

**Program Interest Nurture (MQLs)**
- Email 1 (Day 1): Program Details + Curriculum
- Email 2 (Day 3): Faculty Profiles + Expertise
- Email 3 (Day 5): Student Testimonials + Outcomes
- Email 4 (Day 8): Career Opportunities + ROI
- Email 5 (Day 11): Spiritual Formation + Community
- Email 6 (Day 14): Financial Aid Options
- Email 7 (Day 18): Application Tips + Support
- Email 8 (Day 21): Final CTA + Deadline Reminder

**Application Completion (SQLs)**
- Email 1 (Immediate): Application Started Confirmation
- Email 2 (Day 1): Application Tips + Resources
- Email 3 (Day 3): Deadline Reminder + Support Offer
- Email 4 (Day 5): Final Reminder + Urgency

**Re-engagement (Inactive Leads)**
- Email 1: "We Miss You" + New Content
- Email 2: Student Success Story + Inspiration
- Email 3: Special Offer + Limited Time
- Email 4: Final Attempt + Unsubscribe Option

### Lead Scoring System

**Demographic Scoring (0-40 points)**
- Christian background: +10
- Age 18-35: +10
- Bachelor's degree or higher: +10
- Located in target geography: +10

**Behavioral Scoring (0-60 points)**
- Email opens: +2 per open (max 10)
- Email clicks: +5 per click (max 15)
- Website visits: +3 per visit (max 15)
- Content downloads: +10 per download (max 20)
- Webinar attendance: +20
- Application started: +30

**Lead Score Ranges**
- 0-30: Cold lead (automated nurture only)
- 31-60: Warm lead (automated nurture + occasional personal outreach)
- 61-80: Hot lead (active personal follow-up)
- 81-100: Very hot lead (immediate personal contact)


## Budget Allocation & Financial Planning

### 6-Month Marketing Budget (Pre-Launch)

**Total Budget: $60,000**

**Paid Advertising: $30,000 (50%)**
- Google Ads: $15,000 ($2,500/month)
- Facebook/Instagram Ads: $9,000 ($1,500/month)
- LinkedIn Ads: $6,000 ($1,000/month)

**Tools & Software: $12,000 (20%)**
- Marketing automation (Mailchimp/HubSpot): $3,000
- SEO tools (Ahrefs/SEMrush): $1,800
- Analytics tools (Mixpanel, Hotjar): $1,200
- Landing page builder (Unbounce): $1,200
- Social media management (Buffer): $600
- A/B testing (Optimizely): $1,800
- CRM enhancements: $1,200
- Design tools (Canva Pro): $600
- Video tools (Loom, Descript): $600

**Content Production: $10,000 (17%)**
- Blog content (freelance writers): $3,000
- Video production: $4,000
- Graphic design: $2,000
- Photography: $1,000

**Partnerships & Events: $5,000 (8%)**
- Partnership development: $2,000
- Webinar hosting: $1,500
- Event sponsorships: $1,500

**Contingency: $3,000 (5%)**
- Unexpected opportunities
- Testing new channels
- Emergency campaigns

### ROI Projections

**Target: 100 Students by Summer 2026**

**Revenue Calculation:**
- Average tuition per student: $10,000/year
- Total revenue from 100 students: $1,000,000
- First-year revenue (assuming 6-month enrollment): $500,000

**Cost Calculation:**
- Marketing spend: $60,000
- CAC (Customer Acquisition Cost): $600 per student

**ROI Calculation:**
- ROI = (Revenue - Cost) / Cost
- ROI = ($500,000 - $60,000) / $60,000
- ROI = 733% or 7.3:1

**LTV:CAC Ratio:**
- LTV (4-year degree): $40,000
- CAC: $600
- LTV:CAC = 67:1 (Excellent)

### Channel Budget Allocation Strategy

**Month 1-2: Foundation Building**
- 60% Content & SEO (build organic foundation)
- 20% Paid ads (test and learn)
- 20% Tools & infrastructure

**Month 3-4: Scale What Works**
- 40% Paid ads (scale winning campaigns)
- 30% Content & SEO (maintain momentum)
- 20% Partnerships (activate network)
- 10% Tools & optimization

**Month 5-6: Launch Push**
- 50% Paid ads (maximum visibility)
- 25% Partnerships & events (leverage network)
- 15% Content & SEO (maintain presence)
- 10% Retargeting & conversion optimization


## Launch Campaign Strategy (Summer 2026)

### Pre-Launch Phase (6 Months Before)

**Objectives:**
- Build awareness and anticipation
- Capture early interest and build email list
- Establish thought leadership
- Secure partnerships

**Tactics:**
- Launch "Coming Soon" landing page with email capture
- Begin content marketing (blog, social media)
- Start SEO optimization
- Develop partnerships with churches and ministries
- Create founding student program with special benefits
- Build social media following
- Produce video content showcasing vision

**Metrics:**
- 10,000 email subscribers
- 5,000 social media followers
- 50 partnership agreements
- 500 founding student applications

### Launch Phase (Launch Month)

**Objectives:**
- Maximum visibility and awareness
- Drive applications and enrollments
- Generate media coverage
- Activate partnerships

**Tactics:**
- Coordinated launch across all channels
- Press release to Christian media outlets
- Launch event (virtual) with keynote speakers
- Early-bird tuition discount (20% off for first 100 students)
- Founding student benefits (lifetime alumni network access, special recognition)
- Influencer partnerships and endorsements
- Paid advertising blitz
- Email campaign to entire list
- Social media takeover
- Partnership activation (churches promote to members)

**Metrics:**
- 100,000 website visitors in launch month
- 1,000 applications
- 100 enrollments
- 10+ media mentions

### Post-Launch Phase (3 Months After)

**Objectives:**
- Maintain momentum
- Fill remaining seats
- Build community
- Generate referrals

**Tactics:**
- Student success stories and testimonials
- Community building events
- Referral program activation
- Continued content marketing
- Retargeting campaigns
- Partnership nurture
- Application deadline campaigns

**Metrics:**
- 90% retention of enrolled students
- 20 referral enrollments
- 50 additional enrollments (total 150)
- 4.5+ star reviews

## Key Performance Indicators (KPIs)

### Primary KPIs (North Star Metrics)
1. **Total Enrollments**: 100 students by Summer 2026
2. **CAC (Customer Acquisition Cost)**: <$600 per student
3. **LTV:CAC Ratio**: >40:1
4. **ROI**: >5:1

### Secondary KPIs (Leading Indicators)

**Traffic Metrics:**
- Monthly website visitors: 10,000 by month 6
- Organic traffic growth: 20% month-over-month
- Paid traffic conversion rate: >3%

**Lead Metrics:**
- Total leads: 2,000 by month 6
- MQL rate: 50% of leads
- SQL rate: 30% of MQLs
- Lead-to-application rate: 30%

**Conversion Metrics:**
- Application-to-enrollment rate: 33%
- Average time to convert: 30 days
- Funnel drop-off rate: <50% at each stage

**Engagement Metrics:**
- Email open rate: >25%
- Email click-through rate: >5%
- Social media engagement rate: >3%
- Content average time on page: >2 minutes

**Channel Performance:**
- Organic search: 30% of traffic, 25% of leads
- Paid search: 25% of traffic, 30% of leads
- Social media: 20% of traffic, 20% of leads
- Referral: 15% of traffic, 15% of leads
- Direct: 10% of traffic, 10% of leads

### Dashboard & Reporting

**Weekly Dashboard:**
- Traffic by source
- Leads by source
- Lead score distribution
- Active campaigns performance
- Budget pacing

**Monthly Dashboard:**
- Full funnel metrics
- Channel ROI
- Content performance
- Email campaign results
- Social media growth
- Partnership performance

**Quarterly Dashboard:**
- Strategic goal progress
- Budget vs actual
- Competitive analysis
- Market trends
- Recommendations for next quarter


## Error Handling & Risk Mitigation

### Marketing Risks & Mitigation Strategies

**Risk 1: Low Conversion Rates**
- Mitigation: Extensive A/B testing, landing page optimization, clear value proposition
- Contingency: Increase budget for retargeting, improve lead nurture sequences
- Monitoring: Weekly conversion rate tracking, funnel analysis

**Risk 2: High CAC**
- Mitigation: Focus on organic channels, optimize ad targeting, improve quality score
- Contingency: Shift budget to lower-cost channels, increase organic efforts
- Monitoring: Daily CAC tracking by channel, weekly budget reviews

**Risk 3: Ad Account Suspension**
- Mitigation: Follow platform policies strictly, maintain backup accounts, diversify channels
- Contingency: Activate backup accounts, shift to other platforms, increase organic
- Monitoring: Daily account health checks, policy compliance reviews

**Risk 4: Low Brand Awareness**
- Mitigation: PR strategy, influencer partnerships, content marketing, social media
- Contingency: Increase paid advertising, partnership activation, event marketing
- Monitoring: Brand search volume, social mentions, direct traffic

**Risk 5: Competitive Pressure**
- Mitigation: Strong differentiation, unique value proposition, competitive pricing
- Contingency: Adjust messaging, enhance offerings, increase marketing spend
- Monitoring: Competitive analysis, market share tracking, win/loss analysis

**Risk 6: Budget Overruns**
- Mitigation: Strict budget tracking, automated alerts, approval processes
- Contingency: Pause low-performing campaigns, reallocate budget, seek additional funding
- Monitoring: Daily spend tracking, weekly budget pacing reports

**Risk 7: Poor Lead Quality**
- Mitigation: Clear targeting, qualification questions, lead scoring
- Contingency: Adjust targeting, improve messaging, enhance qualification process
- Monitoring: Lead quality scores, SQL conversion rate, enrollment rate

**Risk 8: Technology Failures**
- Mitigation: Backup systems, redundancy, regular testing, vendor SLAs
- Contingency: Manual processes, alternative tools, vendor escalation
- Monitoring: System uptime monitoring, error tracking, performance metrics

### Compliance & Legal Considerations

**Data Privacy:**
- GDPR compliance for international students
- CCPA compliance for California residents
- Clear privacy policy and data usage disclosure
- Opt-in consent for email marketing
- Right to be forgotten processes

**Advertising Compliance:**
- Truth in advertising standards
- Educational institution advertising regulations
- Platform-specific ad policies (Google, Facebook, LinkedIn)
- Disclosure of partnerships and affiliates
- Accreditation and credential claims accuracy

**Email Marketing Compliance:**
- CAN-SPAM Act compliance
- Unsubscribe mechanism in every email
- Accurate sender information
- Clear subject lines
- Honor opt-out requests within 10 days

**Accessibility:**
- WCAG 2.1 AA compliance for website
- Alt text for images
- Captions for videos
- Keyboard navigation
- Screen reader compatibility

## Testing Strategy

### A/B Testing Roadmap

**Month 1-2: Foundation Testing**
- Homepage headline variations
- Primary CTA button text and color
- Form field optimization (3 vs 5 vs 7 fields)
- Email subject line testing

**Month 3-4: Optimization Testing**
- Landing page layouts
- Social proof placement
- Video vs image on landing pages
- Email send time optimization

**Month 5-6: Advanced Testing**
- Personalization vs generic messaging
- Long-form vs short-form content
- Pricing presentation
- Application process flow

### Testing Methodology

**Hypothesis Formation:**
- Based on data, research, and best practices
- Clear prediction of expected outcome
- Measurable success criteria

**Test Design:**
- Control vs variation(s)
- Minimum sample size calculation
- Test duration determination
- Statistical significance threshold (95%)

**Implementation:**
- Use testing tools (Google Optimize, Optimizely)
- Ensure proper tracking
- QA test before launch
- Monitor for technical issues

**Analysis:**
- Statistical significance check
- Segment analysis (by traffic source, device, etc.)
- Secondary metric impact
- Qualitative feedback

**Decision:**
- Implement winner
- Document learnings
- Plan follow-up tests
- Share insights with team


## Integration with Existing Systems

### CRM Integration (Supabase)

**Lead Data Flow:**
```
Marketing Channels → Lead Capture → Zapier → Supabase CRM
                                              ↓
                                    Lead Scoring & Routing
                                              ↓
                                    Admissions Team Dashboard
```

**Data Synchronization:**
- Real-time lead creation from all sources
- Bidirectional sync with email platform
- Lead score updates based on behavior
- Status updates from admissions process
- Enrollment confirmation and student creation

**CRM Schema Extensions:**
```sql
-- Marketing-specific fields in leads table
ALTER TABLE leads ADD COLUMN utm_source VARCHAR(255);
ALTER TABLE leads ADD COLUMN utm_medium VARCHAR(255);
ALTER TABLE leads ADD COLUMN utm_campaign VARCHAR(255);
ALTER TABLE leads ADD COLUMN utm_term VARCHAR(255);
ALTER TABLE leads ADD COLUMN utm_content VARCHAR(255);
ALTER TABLE leads ADD COLUMN lead_score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN lead_source VARCHAR(100);
ALTER TABLE leads ADD COLUMN first_touch_channel VARCHAR(100);
ALTER TABLE leads ADD COLUMN last_touch_channel VARCHAR(100);
ALTER TABLE leads ADD COLUMN total_interactions INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN last_interaction_date TIMESTAMP;

-- Marketing interactions tracking table
CREATE TABLE marketing_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  interaction_type VARCHAR(100),
  interaction_date TIMESTAMP DEFAULT NOW(),
  channel VARCHAR(100),
  campaign VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Campaign performance tracking table
CREATE TABLE campaign_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id VARCHAR(255),
  campaign_name VARCHAR(255),
  channel VARCHAR(100),
  date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Zapier Automation Integration

**Key Zapier Workflows:**

1. **Lead Capture Workflow**
   - Trigger: New form submission (Typeform, Website, Landing Page)
   - Actions: Create lead in Supabase, Add to email list, Send notification

2. **Email Engagement Workflow**
   - Trigger: Email opened/clicked (Mailchimp)
   - Actions: Update lead score, Tag lead, Trigger follow-up

3. **Ad Platform Sync**
   - Trigger: New lead from ads (Facebook, Google)
   - Actions: Create lead with UTM data, Add to nurture, Update ad platform

4. **Webinar Workflow**
   - Trigger: Webinar registration (Zoom)
   - Actions: Create/update lead, Send confirmation, Add to reminder sequence

5. **Application Workflow**
   - Trigger: Application status change (Supabase)
   - Actions: Send email, Update CRM, Notify team, Update analytics

### Analytics Integration

**Google Analytics 4 Setup:**
- Custom events for key actions (form submissions, downloads, applications)
- Enhanced ecommerce tracking for enrollment value
- Custom dimensions for lead source, campaign, persona
- Goal tracking for each funnel stage
- Audience segmentation for retargeting

**Mixpanel Integration:**
- User identification and tracking
- Event tracking for detailed behavior analysis
- Funnel analysis for conversion optimization
- Cohort analysis for retention tracking
- A/B test result tracking

**Data Warehouse Integration:**
- Daily export of marketing data to data warehouse
- Integration with Supabase for unified reporting
- Custom dashboards in Metabase or Tableau
- Automated reporting and alerts

### Email Platform Integration

**Mailchimp/ConvertKit Setup:**
- Audience segmentation by persona, stage, score
- Automated email sequences (welcome, nurture, application)
- Tag-based automation triggers
- Custom fields for personalization
- Integration with Supabase for data sync

**Email Deliverability:**
- SPF, DKIM, DMARC authentication
- Dedicated IP address (if volume warrants)
- List hygiene and bounce management
- Engagement-based sending
- Reputation monitoring

### Ad Platform Integration

**Google Ads:**
- Conversion tracking via Google Tag Manager
- Offline conversion import from Supabase
- Audience sync for remarketing
- Automated bidding based on conversion value
- Performance reporting API integration

**Facebook Ads:**
- Facebook Pixel implementation
- Conversion API for server-side tracking
- Custom audience sync from CRM
- Lookalike audience creation
- Automated rules for budget optimization

**LinkedIn Ads:**
- LinkedIn Insight Tag implementation
- Conversion tracking setup
- Matched audience sync
- Lead gen form integration
- Performance reporting


## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Week 1-2: Setup & Infrastructure**
- Set up marketing tools (analytics, email, automation)
- Configure tracking (Google Analytics, Tag Manager, pixels)
- Create brand guidelines and assets
- Set up CRM marketing fields and integrations
- Configure Zapier workflows
- Set up social media accounts

**Week 3-4: Content & SEO Foundation**
- Conduct keyword research
- Create content calendar (90 days)
- Optimize website for SEO
- Write and publish first 8 blog posts
- Create lead magnets (ebooks, guides)
- Set up email sequences

**Week 5-6: Paid Advertising Setup**
- Set up ad accounts (Google, Facebook, LinkedIn)
- Create ad campaigns and ad groups
- Design ad creatives (images, videos, copy)
- Set up conversion tracking
- Launch initial campaigns with small budget
- Monitor and optimize daily

**Week 7-8: Partnerships & Community**
- Identify target partners (churches, ministries)
- Create partnership materials and agreements
- Reach out to first 20 partners
- Set up affiliate tracking
- Plan first webinar
- Build social media following

### Phase 2: Optimization (Months 3-4)

**Week 9-10: Scale What Works**
- Analyze first 2 months of data
- Identify winning channels and campaigns
- Increase budget for top performers
- Pause or optimize underperformers
- Expand content production
- Activate first partnerships

**Week 11-12: Conversion Optimization**
- Implement A/B testing program
- Optimize landing pages
- Improve email sequences
- Enhance lead scoring
- Implement retargeting campaigns
- Create case studies and testimonials

**Week 13-14: Advanced Tactics**
- Launch video marketing campaigns
- Implement influencer partnerships
- Create webinar series
- Expand social media presence
- Develop PR strategy
- Build community engagement

**Week 15-16: Mid-Point Review**
- Comprehensive performance review
- Budget reallocation based on ROI
- Refine targeting and messaging
- Update content strategy
- Strengthen partnerships
- Plan for launch phase

### Phase 3: Launch Preparation (Months 5-6)

**Week 17-18: Launch Campaign Development**
- Create launch campaign strategy
- Develop launch creative assets
- Plan launch event
- Prepare PR materials
- Coordinate partnership activation
- Build launch landing pages

**Week 19-20: Pre-Launch Buzz**
- Increase content production
- Ramp up social media activity
- Launch countdown campaign
- Activate early-bird program
- Secure media coverage
- Finalize launch logistics

**Week 21-22: Launch Execution**
- Execute coordinated launch
- Monitor performance in real-time
- Adjust campaigns as needed
- Engage with community
- Respond to inquiries quickly
- Capture and share launch momentum

**Week 23-24: Post-Launch Optimization**
- Analyze launch performance
- Optimize for remaining seats
- Activate referral program
- Continue momentum campaigns
- Plan for next cohort
- Document learnings

### Success Metrics by Phase

**Phase 1 Success Criteria:**
- 5,000 website visitors
- 500 email subscribers
- 100 leads
- 10 MQLs
- All tools and tracking operational
- First 10 partnerships secured

**Phase 2 Success Criteria:**
- 15,000 website visitors
- 2,000 email subscribers
- 500 leads
- 100 MQLs
- 20 SQLs
- 30 partnerships secured
- Positive ROI on paid campaigns

**Phase 3 Success Criteria:**
- 50,000 website visitors
- 10,000 email subscribers
- 2,000 leads
- 1,000 MQLs
- 300 applications
- 100 enrollments
- 50 partnerships activated
- 5:1 ROI overall

