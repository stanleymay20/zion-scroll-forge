# Zapier Automation System - Foundation Setup Guide

## Overview

This guide provides step-by-step instructions for completing the foundation setup tasks for the Zapier Automation System. These are manual configuration tasks that must be completed before implementing automated workflows.

**Estimated Time:** 2-3 hours  
**Cost:** $69/month (Zapier Professional + Airtable Pro)

## Task 1.1: Set up Zapier Professional Account

### Prerequisites
- Credit card for subscription payment
- Business email address
- Organization details

### Steps

#### 1. Create Zapier Professional Account

1. Visit https://zapier.com/sign-up
2. Click "Start Free Trial" or "Sign Up"
3. Enter your email and create a password
4. Verify your email address

#### 2. Upgrade to Professional Plan

1. Navigate to **Settings** → **Plans & Billing**
2. Click **Upgrade** button
3. Select **Professional Plan** ($49/month)
4. Features included:
   - Unlimited Zaps
   - Multi-step Zaps
   - Premium apps
   - Webhooks
   - Custom logic
   - Paths
   - Error handling
5. Enter payment information
6. Confirm subscription

#### 3. Configure Organization Settings

1. Go to **Settings** → **Organization**
2. Set organization name: "ScrollUniversity"
3. Add team members:
   - Admissions team
   - Support team
   - Marketing team
   - IT administrators
4. Set permissions for each team member:
   - **Admin:** Full access to all Zaps
   - **Editor:** Can create and edit Zaps
   - **Viewer:** Can view Zaps only

#### 4. Set Up Folder Structure

Create folders to organize workflows:

```
ScrollUniversity Zaps/
├── 01-Admissions/
│   ├── Application Processing
│   ├── Document Management
│   └── Interview Scheduling
├── 02-Student-Support/
│   ├── Ticket Management
│   ├── FAQ Automation
│   └── Follow-up Workflows
├── 03-Marketing/
│   ├── Lead Capture
│   ├── Email Campaigns
│   └── Social Media
├── 04-Enrollment/
│   ├── Payment Processing
│   ├── Access Management
│   └── Welcome Sequences
├── 05-Communication/
│   ├── Reminders
│   ├── Notifications
│   └── Announcements
├── 06-Payment-Billing/
│   ├── Invoice Generation
│   ├── Payment Tracking
│   └── Overdue Management
├── 07-Faculty-Support/
│   ├── Assignment Notifications
│   ├── Grade Management
│   └── Office Hours
├── 08-Analytics/
│   ├── Daily Reports
│   ├── Weekly Dashboards
│   └── Monthly Summaries
├── 09-Calendar/
│   ├── Scheduling
│   ├── Reminders
│   └── Cancellations
└── 10-Data-Sync/
    ├── Student Data
    ├── Course Data
    └── Conflict Resolution
```

#### 5. Enable Error Notifications

1. Go to **Settings** → **Notifications**
2. Enable email notifications for:
   - Zap errors
   - Zap turned off
   - Task limit warnings
3. Set notification recipients:
   - Primary: IT administrator
   - Secondary: Operations manager
4. Configure Slack notifications (optional):
   - Connect Slack workspace
   - Select #zapier-alerts channel
   - Enable real-time error notifications

#### 6. Configure Monitoring

1. Go to **Settings** → **Monitoring**
2. Enable:
   - Task history (90 days)
   - Error tracking
   - Performance metrics
3. Set up dashboard:
   - Pin critical Zaps
   - Create custom views
   - Set up filters

### Verification

- [ ] Professional plan active
- [ ] Team members added
- [ ] Folder structure created
- [ ] Error notifications configured
- [ ] Monitoring enabled

---

## Task 1.2: Set up Airtable Pro Account

### Prerequisites
- Credit card for subscription payment
- Business email address

### Steps

#### 1. Create Airtable Pro Account

1. Visit https://airtable.com/signup
2. Enter email and create password
3. Verify email address
4. Upgrade to Pro plan ($20/month per user)

#### 2. Create ScrollUniversity Workspace

1. Click **Create Workspace**
2. Name: "ScrollUniversity Operations"
3. Invite team members
4. Set permissions

#### 3. Design Applicants Base

Create a new base: **Applicants**

**Tables:**

**Table 1: Applications**
- Application ID (Auto-number, Primary)
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Application Date (Date)
- Status (Single select: Submitted, Under Review, Interview Scheduled, Accepted, Rejected)
- Program (Single select: Theology, Ministry, Biblical Studies, etc.)
- Documents (Attachments)
- Interview Date (Date)
- Decision Date (Date)
- Decision Notes (Long text)
- Assigned Reviewer (User)
- Priority (Single select: High, Medium, Low)

**Views:**
- All Applications
- Pending Review
- Interview Scheduled
- Accepted
- Rejected
- By Program
- By Reviewer

**Table 2: Documents**
- Document ID (Auto-number, Primary)
- Application (Link to Applications)
- Document Type (Single select: Transcript, Resume, Essay, Recommendation)
- File (Attachment)
- Upload Date (Date)
- Status (Single select: Pending, Verified, Rejected)

#### 4. Design Students Base

Create a new base: **Students**

**Tables:**

**Table 1: Students**
- Student ID (Auto-number, Primary)
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Enrollment Date (Date)
- Status (Single select: Active, Suspended, Completed, Withdrawn)
- Program (Single select)
- Current Courses (Link to Enrollments)
- GPA (Number)
- Credits Completed (Number)
- Advisor (User)
- Payment Status (Single select: Current, Overdue, Suspended)

**Table 2: Enrollments**
- Enrollment ID (Auto-number, Primary)
- Student (Link to Students)
- Course (Single line text)
- Enrollment Date (Date)
- Status (Single select: Active, Completed, Withdrawn)
- Grade (Single select: A, B, C, D, F, Incomplete)
- Progress (Percent)

**Views:**
- All Students
- Active Students
- By Program
- By Advisor
- Payment Issues

#### 5. Design Support Base

Create a new base: **Support**

**Tables:**

**Table 1: Tickets**
- Ticket ID (Auto-number, Primary)
- Student (Link to Students)
- Subject (Single line text)
- Description (Long text)
- Category (Single select: Technical, Academic, Financial, General)
- Priority (Single select: Urgent, High, Medium, Low)
- Status (Single select: Open, In Progress, Resolved, Closed)
- Created Date (Date)
- Assigned To (User)
- Resolution (Long text)
- Resolved Date (Date)

**Views:**
- Open Tickets
- Urgent Tickets
- By Category
- By Assignee
- Resolved This Week

#### 6. Design Leads Base

Create a new base: **Leads**

**Tables:**

**Table 1: Leads**
- Lead ID (Auto-number, Primary)
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Source (Single select: Website, Social Media, Referral, Event)
- Interest (Single select: Program types)
- Lead Score (Number)
- Status (Single select: New, Contacted, Qualified, Converted, Lost)
- Created Date (Date)
- Last Contact (Date)
- Notes (Long text)

**Table 2: Interactions**
- Interaction ID (Auto-number, Primary)
- Lead (Link to Leads)
- Type (Single select: Email, Call, Meeting, Download)
- Date (Date)
- Notes (Long text)
- Score Impact (Number)

**Views:**
- New Leads
- Hot Leads (Score > 50)
- By Source
- Converted This Month

#### 7. Design Faculty Base

Create a new base: **Faculty**

**Tables:**

**Table 1: Candidates**
- Candidate ID (Auto-number, Primary)
- First Name (Single line text)
- Last Name (Single line text)
- Email (Email)
- Phone (Phone number)
- Application Date (Date)
- Status (Single select: Applied, Screening, Interview, Offer, Hired, Rejected)
- Resume (Attachment)
- Education (Long text)
- Experience (Long text)
- Certifications (Long text)
- Score (Number)
- Interview Date (Date)
- Interviewer (User)
- Notes (Long text)

**Views:**
- All Candidates
- Screening
- Interview Scheduled
- Offers Extended
- Hired

#### 8. Configure Views, Filters, and Relationships

For each base:

1. **Create Custom Views:**
   - Grid view (default)
   - Kanban view (by status)
   - Calendar view (by date)
   - Gallery view (for documents)

2. **Set Up Filters:**
   - Active records only
   - By date range
   - By status
   - By assignee

3. **Configure Relationships:**
   - Link Applications to Students
   - Link Students to Enrollments
   - Link Tickets to Students
   - Link Leads to Applications

4. **Set Up Automations:**
   - Send email when status changes
   - Update related records
   - Create tasks for team members

### Verification

- [ ] Airtable Pro account active
- [ ] All 5 bases created
- [ ] Tables and fields configured
- [ ] Views and filters set up
- [ ] Relationships established

---

## Task 1.3: Configure External Service Integrations

### Prerequisites
- Admin access to all services
- API keys and credentials ready

### Steps

#### 1. Set Up Gmail/Google Workspace

**For Email Automation:**

1. Go to https://workspace.google.com
2. Set up or verify domain
3. Create service accounts:
   - admissions@scrolluniversity.com
   - support@scrolluniversity.com
   - notifications@scrolluniversity.com
4. Enable Gmail API:
   - Go to Google Cloud Console
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download credentials JSON
5. Connect to Zapier:
   - In Zapier, add Gmail app
   - Authenticate with service account
   - Grant necessary permissions

#### 2. Configure Calendly

**For Scheduling Automation:**

1. Visit https://calendly.com
2. Create account or sign in
3. Set up event types:
   - Admissions Interview (30 min)
   - Academic Advising (45 min)
   - Faculty Interview (60 min)
4. Configure availability:
   - Set working hours
   - Add buffer times
   - Set meeting limits
5. Get API key:
   - Go to Integrations → API & Webhooks
   - Generate API key
   - Copy and store securely
6. Connect to Zapier:
   - Add Calendly app in Zapier
   - Enter API key
   - Test connection

#### 3. Set Up Mailchimp/ConvertKit

**For Email Marketing:**

**Option A: Mailchimp**
1. Visit https://mailchimp.com
2. Create account
3. Set up audience lists:
   - Prospective Students
   - Current Students
   - Alumni
   - Faculty
4. Create segments:
   - By program interest
   - By engagement level
   - By enrollment status
5. Get API key:
   - Account → Extras → API keys
   - Generate new key
6. Connect to Zapier

**Option B: ConvertKit**
1. Visit https://convertkit.com
2. Create account
3. Set up forms and sequences
4. Get API key from settings
5. Connect to Zapier

#### 4. Configure Slack Workspace

**For Team Communication:**

1. Visit https://slack.com
2. Create workspace: "ScrollUniversity"
3. Create channels:
   - #admissions
   - #support
   - #marketing
   - #faculty
   - #it-alerts
   - #zapier-notifications
4. Invite team members
5. Set up Slack app:
   - Go to api.slack.com
   - Create new app
   - Add bot permissions:
     - chat:write
     - channels:read
     - users:read
   - Install app to workspace
   - Copy Bot Token
6. Connect to Zapier:
   - Add Slack app
   - Authenticate
   - Select workspace

#### 5. Set Up Typeform

**For Form Submissions:**

1. Visit https://typeform.com
2. Create account
3. Create forms:
   - Admissions Application
   - Contact Form
   - Faculty Application
   - Support Request
   - Lead Capture
4. Customize forms:
   - Add logic jumps
   - Set up calculations
   - Add hidden fields
5. Get API key:
   - Account → Settings → API
   - Generate personal token
6. Connect to Zapier

#### 6. Configure Twilio

**For SMS Notifications:**

1. Visit https://twilio.com
2. Create account
3. Verify phone number
4. Purchase phone number for SMS
5. Get credentials:
   - Account SID
   - Auth Token
6. Set up messaging service
7. Connect to Zapier:
   - Add Twilio app
   - Enter credentials
   - Test SMS sending

#### 7. Store API Keys Securely in Zapier

1. Go to Zapier → Settings → Storage
2. Create storage entries:
   ```
   GMAIL_CLIENT_ID
   GMAIL_CLIENT_SECRET
   CALENDLY_API_KEY
   MAILCHIMP_API_KEY
   SLACK_BOT_TOKEN
   TYPEFORM_API_KEY
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   SCROLLUNIVERSITY_WEBHOOK_SECRET
   ```
3. Use storage values in Zaps instead of hardcoding

### Verification

- [ ] Gmail/Google Workspace configured
- [ ] Calendly set up and connected
- [ ] Email marketing platform configured
- [ ] Slack workspace created and connected
- [ ] Typeform account set up
- [ ] Twilio configured for SMS
- [ ] All API keys stored securely in Zapier

---

## Next Steps

After completing all foundation setup tasks:

1. **Test Connections:**
   - Create test Zaps for each integration
   - Verify data flows correctly
   - Check error handling

2. **Document Configuration:**
   - Record all account details
   - Document API keys (securely)
   - Create team access guide

3. **Begin Workflow Implementation:**
   - Start with Task 2: Admissions Automation
   - Follow the implementation plan in tasks.md
   - Test each workflow thoroughly

4. **Set Up Monitoring:**
   - Create dashboard for Zap health
   - Set up alerts for failures
   - Schedule regular reviews

## Support Resources

- **Zapier Help:** https://help.zapier.com
- **Airtable Support:** https://support.airtable.com
- **Gmail API Docs:** https://developers.google.com/gmail/api
- **Calendly API Docs:** https://developer.calendly.com
- **Mailchimp API Docs:** https://mailchimp.com/developer
- **Slack API Docs:** https://api.slack.com
- **Typeform API Docs:** https://developer.typeform.com
- **Twilio Docs:** https://www.twilio.com/docs

## Estimated Costs

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Zapier | Professional | $49 |
| Airtable | Pro (2 users) | $40 |
| Google Workspace | Business Starter | $12 |
| Calendly | Professional | $12 |
| Mailchimp | Essentials | $13 |
| Slack | Pro | $8/user |
| Typeform | Basic | $25 |
| Twilio | Pay-as-you-go | ~$10 |
| **Total** | | **~$169/month** |

Note: Costs may vary based on usage and number of users.

## Completion Checklist

### Task 1.1: Zapier Professional Account
- [ ] Account created and verified
- [ ] Upgraded to Professional plan
- [ ] Organization settings configured
- [ ] Team members added with appropriate permissions
- [ ] Folder structure created for workflow organization
- [ ] Error notifications enabled (email + Slack)
- [ ] Monitoring dashboard configured

### Task 1.2: Airtable Pro Account
- [ ] Account created and upgraded to Pro
- [ ] Applicants base created with all tables and views
- [ ] Students base created with enrollment tracking
- [ ] Support base created with ticket management
- [ ] Leads base created with marketing automation
- [ ] Faculty base created with recruitment tracking
- [ ] All views, filters, and relationships configured

### Task 1.3: External Service Integrations
- [ ] Gmail/Google Workspace configured for email automation
- [ ] Calendly configured for scheduling automation
- [ ] Mailchimp/ConvertKit set up for email marketing
- [ ] Slack workspace configured with channels
- [ ] Typeform set up for form submissions
- [ ] Twilio configured for SMS notifications
- [ ] All API keys stored securely in Zapier Storage

### Task 1.4: ScrollUniversity Webhook Endpoints
- [x] Webhook receiver endpoints implemented in backend
- [x] Authentication and validation middleware added
- [x] Endpoints created for enrollment, access grants, grade updates
- [x] Webhook signature verification implemented
- [x] Rate limiting and error handling added
- [x] Webhook API specifications documented

## Ready to Proceed

Once all tasks are complete, you're ready to begin implementing automated workflows starting with Task 2: Admissions Automation Implementation.
