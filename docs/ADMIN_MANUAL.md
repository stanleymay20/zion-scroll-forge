# ScrollUniversity Administrator Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [User Management](#user-management)
4. [Course Management](#course-management)
5. [Content Moderation](#content-moderation)
6. [System Configuration](#system-configuration)
7. [Analytics & Reporting](#analytics--reporting)
8. [Financial Management](#financial-management)
9. [Security & Compliance](#security--compliance)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

---

## Introduction

This manual provides comprehensive guidance for administrators managing the ScrollUniversity platform. As an administrator,
you have access to powerful tools for managing users, content, system configuration, and monitoring platform health.

### Administrator Roles

**Super Admin:**
- Full system access
- User role management
- System configuration
- Financial oversight

**Content Admin:**
- Course approval
- Content moderation
- Faculty management

**Support Admin:**
- User support
- Issue resolution
- Basic reporting

### Accessing the Admin Dashboard

1. Log in with your admin credentials
2. Navigate to `/admin` or click "Admin" in the user menu
3. You'll see the admin dashboard with key metrics and quick actions

---

## Admin Dashboard Overview

### Dashboard Sections

**System Health:**
- Server status and uptime
- Database connectivity
- Redis cache status
- External service health (OpenAI, Stripe, etc.)
- Error rates and response times

**Key Metrics:**
- Total users (students, faculty, admins)
- Active enrollments
- Course completions this month
- Revenue (USD and ScrollCoin)
- Support tickets pending

**Quick Actions:**
- Approve pending courses
- Review flagged content
- Manage user roles
- View system logs
- Generate reports


## User Management

### Viewing Users

1. Navigate to **Admin → Users**
2. Use filters to find specific users:
   - Role (Student, Faculty, Admin)
   - Status (Active, Suspended, Pending)
   - Registration date
   - Last login

### User Actions

**View User Profile:**
- Click on any user to see detailed information
- View enrollment history
- Check ScrollCoin balance
- Review activity logs

**Edit User:**
1. Click "Edit" on user profile
2. Update user information:
   - Name and email
   - Role assignment
   - Account status
   - Permissions
3. Click "Save Changes"

**Suspend User:**
1. Navigate to user profile
2. Click "Suspend Account"
3. Provide reason for suspension
4. Set suspension duration (temporary/permanent)
5. User will be notified via email

**Delete User:**
1. Navigate to user profile
2. Click "Delete Account"
3. Confirm deletion (irreversible)
4. User data will be anonymized per GDPR

### Role Management

**Assigning Roles:**
1. Go to user profile
2. Click "Manage Roles"
3. Select role(s):
   - STUDENT: Basic learning access
   - FACULTY: Course creation and grading
   - ADMIN: Platform administration
4. Save changes

**Custom Permissions:**
- Fine-grained permission control
- Override default role permissions
- Temporary permission grants

### Bulk Operations

**Bulk User Import:**
1. Navigate to **Admin → Users → Import**
2. Download CSV template
3. Fill in user data
4. Upload CSV file
5. Review and confirm import

**Bulk Role Assignment:**
1. Select multiple users
2. Click "Bulk Actions"
3. Choose "Assign Role"
4. Select role and confirm


## Course Management

### Course Approval Workflow

**Pending Courses:**
1. Navigate to **Admin → Courses → Pending Approval**
2. Review course details:
   - Course content and syllabus
   - Instructor qualifications
   - Theological alignment
   - Technical quality
3. Actions:
   - **Approve**: Course goes live immediately
   - **Request Changes**: Send feedback to instructor
   - **Reject**: Provide detailed reason

**Course Quality Checklist:**
- [ ] Theologically sound content
- [ ] Clear learning objectives
- [ ] Comprehensive syllabus
- [ ] High-quality video lectures
- [ ] Appropriate assessments
- [ ] Proper citations and references
- [ ] Accessibility compliance

### Managing Active Courses

**Edit Course:**
1. Find course in course list
2. Click "Edit"
3. Modify details as needed
4. Save changes

**Disable Course:**
- Temporarily remove from catalog
- Existing enrollments continue
- Can be re-enabled later

**Archive Course:**
- Permanently remove from catalog
- Existing students can complete
- No new enrollments allowed

---

## Content Moderation

### Moderation Queue

**Accessing the Queue:**
1. Navigate to **Admin → Moderation**
2. View flagged content by type:
   - Community posts
   - Comments
   - User profiles
   - Course reviews

**Moderation Actions:**

**Review Content:**
1. Click on flagged item
2. View full context
3. Check flagging reason
4. Review user history

**Take Action:**
- **Approve**: Remove flag, content stays
- **Remove**: Delete content, notify user
- **Edit**: Modify content to comply
- **Warn User**: Send warning message
- **Suspend User**: Temporary account suspension
- **Ban User**: Permanent account ban

**Moderation Guidelines:**
- Follow community guidelines strictly
- Be consistent in decisions
- Document reasoning
- Escalate unclear cases
- Respond within 24 hours

### Automated Moderation

**AI Content Scanning:**
- Inappropriate language detection
- Theological alignment checking
- Plagiarism detection
- Spam identification

**Configuration:**
1. Go to **Admin → Settings → Moderation**
2. Adjust sensitivity levels
3. Configure auto-actions
4. Set review thresholds

---

## System Configuration

### General Settings

**Platform Configuration:**
1. Navigate to **Admin → Settings → General**
2. Configure:
   - Platform name and branding
   - Default language
   - Timezone settings
   - Maintenance mode
   - Feature flags

**Email Settings:**
- SMTP configuration
- Email templates
- Notification preferences
- Sender information

**Storage Settings:**
- File upload limits
- Allowed file types
- Storage quotas
- CDN configuration

### Security Settings

**Authentication:**
- Password policies
- Session timeout
- 2FA requirements
- OAuth providers

**Access Control:**
- IP whitelist/blacklist
- Rate limiting rules
- API key management
- CORS configuration

**Audit Logging:**
- Enable/disable logging
- Log retention period
- Log export options
- Alert configuration

---

## Analytics & Reporting

### Dashboard Analytics

**Key Metrics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Course enrollment trends
- Completion rates
- Revenue metrics
- ScrollCoin circulation

**Custom Reports:**
1. Navigate to **Admin → Analytics → Reports**
2. Click "Create Report"
3. Select metrics and dimensions
4. Set date range
5. Apply filters
6. Generate report

**Scheduled Reports:**
- Daily summary emails
- Weekly performance reports
- Monthly financial reports
- Quarterly board reports

### Export Data

**Export Options:**
- CSV for spreadsheet analysis
- PDF for presentations
- JSON for API integration
- Excel for advanced analysis

**Data Privacy:**
- Anonymize user data
- Comply with GDPR
- Secure export process
- Audit trail maintained

---

## Financial Management

### Revenue Tracking

**Payment Overview:**
- Total revenue (USD)
- ScrollCoin transactions
- Scholarship disbursements
- Refunds processed

**Payment Methods:**
- Credit card (Stripe)
- ScrollCoin
- Scholarships
- Institutional billing

### ScrollCoin Management

**Minting ScrollCoin:**
1. Navigate to **Admin → ScrollCoin → Mint**
2. Enter amount and reason
3. Select recipient(s)
4. Confirm transaction
5. Blockchain confirmation

**Monitoring Economy:**
- Total supply
- Circulation metrics
- Earning patterns
- Spending patterns
- Exchange rates

### Scholarship Administration

**Review Applications:**
1. Go to **Admin → Scholarships → Applications**
2. Review applicant details
3. Check eligibility criteria
4. Assess financial need
5. Make decision

**Award Scholarship:**
- Set award amount
- Define duration
- Add conditions
- Notify recipient
- Track disbursement

---

## Backup & Recovery

### Automated Backups

**Backup Schedule:**
- Database: Daily at 2 AM UTC
- File storage: Daily at 3 AM UTC
- Configuration: Weekly
- Retention: 30 days

**Backup Verification:**
1. Navigate to **Admin → System → Backups**
2. View backup history
3. Check backup status
4. Verify backup integrity

### Manual Backup

**Create Backup:**
1. Go to **Admin → System → Backups**
2. Click "Create Backup Now"
3. Select backup type:
   - Full system backup
   - Database only
   - Files only
4. Wait for completion
5. Download backup file

### Disaster Recovery

**Restore from Backup:**
1. Navigate to **Admin → System → Restore**
2. Select backup to restore
3. Choose restore options:
   - Full restore
   - Partial restore
   - Point-in-time recovery
4. Confirm restoration
5. Monitor progress
6. Verify data integrity

**Recovery Testing:**
- Test restores quarterly
- Document recovery procedures
- Train backup administrators
- Update recovery plan

---

## Troubleshooting

### System Health Checks

**Health Dashboard:**
1. Navigate to **Admin → System → Health**
2. Check service status:
   - API server
   - Database
   - Redis cache
   - External services

**Common Issues:**

**High Error Rate:**
- Check error logs
- Review recent deployments
- Verify external service status
- Restart affected services

**Slow Performance:**
- Check database queries
- Review cache hit rates
- Monitor server resources
- Analyze traffic patterns

**Service Outage:**
- Check service status page
- Review system logs
- Contact DevOps team
- Communicate with users

### User Support

**Handling Support Tickets:**
1. Navigate to **Admin → Support → Tickets**
2. Review ticket details
3. Investigate issue
4. Provide solution
5. Close ticket

**Escalation Process:**
- Level 1: Support admin
- Level 2: Technical team
- Level 3: Engineering team
- Level 4: CTO/Leadership

---

## Best Practices

### Daily Tasks
- [ ] Review overnight alerts
- [ ] Check pending approvals
- [ ] Monitor system health
- [ ] Review support tickets
- [ ] Check moderation queue

### Weekly Tasks
- [ ] Review analytics reports
- [ ] Audit user accounts
- [ ] Check backup status
- [ ] Review security logs
- [ ] Update documentation

### Monthly Tasks
- [ ] Generate financial reports
- [ ] Review system performance
- [ ] Update security policies
- [ ] Conduct user surveys
- [ ] Plan system improvements

---

*Last Updated: December 2024*
*Version: 1.0.0*

