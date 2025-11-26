# Zapier Integration Guide for ScrollUniversity

## Overview

This guide provides comprehensive instructions for integrating ScrollUniversity with Zapier automation workflows. The integration enables automated workflows for admissions, enrollment, support, marketing, and operational processes.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Instructions](#setup-instructions)
3. [Webhook Endpoints](#webhook-endpoints)
4. [Security Configuration](#security-configuration)
5. [Testing](#testing)
6. [Common Workflows](#common-workflows)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

## Prerequisites

Before setting up the Zapier integration, ensure you have:

- **Zapier Professional Account** ($49/month) - Required for webhook actions and multi-step Zaps
- **ScrollUniversity Backend** - Running and accessible via HTTPS
- **Environment Variables** - Properly configured (see below)
- **API Access** - Admin access to ScrollUniversity backend

## Setup Instructions

### Step 1: Configure Backend Environment

Add the following environment variables to your `.env` file:

```bash
# Zapier Webhook Integration
ZAPIER_WEBHOOK_SECRET="your-secure-random-secret-key"
WEBHOOK_RATE_LIMIT_MAX="100"
WEBHOOK_RATE_LIMIT_WINDOW="60000"
```

**Generate a secure webhook secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Step 2: Restart Backend Server

After adding environment variables, restart your backend server:

```bash
cd backend
npm run dev  # Development
# OR
npm start    # Production
```

### Step 3: Verify Webhook Endpoint

Test that the webhook endpoint is accessible:

```bash
curl https://api.scrolluniversity.com/api/webhooks/zapier/health
```

Expected response:
```json
{
  "success": true,
  "message": "Zapier webhook endpoint is healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### Step 4: Configure Zapier Account

1. Log in to your Zapier Professional account
2. Navigate to **My Apps** → **Add Connection**
3. Search for "Webhooks by Zapier"
4. Add the webhook connection

## Webhook Endpoints

### Base URL

```
https://api.scrolluniversity.com/api/webhooks/zapier
```

### Available Endpoints

| Endpoint | Method | Purpose | Requirements |
|----------|--------|---------|--------------|
| `/health` | GET | Health check | None |
| `/test` | POST | Test webhook | Signature |
| `/enrollment/grant-access` | POST | Grant course access | Signature |
| `/enrollment/revoke-access` | POST | Revoke course access | Signature |
| `/enrollment/update-status` | POST | Update enrollment status | Signature |
| `/grades/update` | POST | Update student grade | Signature |
| `/grades/batch-update` | POST | Batch grade update | Signature |
| `/sync/student` | POST | Sync student data | Signature |
| `/sync/course` | POST | Sync course data | Signature |
| `/notifications/send` | POST | Send notification | Signature |

For detailed endpoint documentation, see [Zapier Webhook API Documentation](./src/docs/zapier-webhook-api.md).

## Security Configuration

### Webhook Signature Verification

All webhook requests (except `/health`) must include a valid HMAC SHA-256 signature.

**Signature Generation in Zapier:**

1. In your Zap, add a **Code by Zapier** step before the webhook action
2. Use the following JavaScript code:

```javascript
const crypto = require('crypto');

// Your webhook secret (store in Zapier Storage)
const webhookSecret = 'your-zapier-webhook-secret-key';

// The data you're sending to the webhook
const payload = {
  userId: inputData.userId,
  courseId: inputData.courseId,
  // ... other fields
};

// Generate signature
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(JSON.stringify(payload))
  .digest('hex');

// Return signature and payload
output = {
  signature: signature,
  payload: payload
};
```

3. In the webhook action, add header:
   - **Key:** `x-zapier-signature`
   - **Value:** `{{signature}}` (from Code step)

### Rate Limiting

- **Limit:** 100 requests per minute per IP address
- **Window:** 60 seconds (configurable)
- **Response:** 429 Too Many Requests when exceeded

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Testing

### Test Webhook Connectivity

1. Create a simple Zap with a manual trigger
2. Add a **Webhooks by Zapier** action
3. Configure:
   - **Method:** POST
   - **URL:** `https://api.scrolluniversity.com/api/webhooks/zapier/test`
   - **Headers:** `x-zapier-signature: [generated signature]`
   - **Body:** `{"testData": "Hello from Zapier"}`
4. Run the Zap and verify response

### Test Enrollment Workflow

1. Create a Zap: **Stripe Payment Successful** → **Grant Course Access**
2. Configure webhook action:
   - **URL:** `https://api.scrolluniversity.com/api/webhooks/zapier/enrollment/grant-access`
   - **Body:**
     ```json
     {
       "userId": "{{customer_id}}",
       "courseId": "{{metadata__course_id}}",
       "enrollmentId": "{{metadata__enrollment_id}}"
     }
     ```
3. Test with a test payment in Stripe

## Common Workflows

### 1. Enrollment Automation

**Trigger:** Stripe payment successful  
**Actions:**
1. Create enrollment record in Airtable
2. Grant course access (webhook)
3. Send welcome email
4. Add to course Slack channel

**Zap Configuration:**
```
Trigger: Stripe → New Payment
Filter: Payment Status = Succeeded
Action 1: Airtable → Create Record
Action 2: Webhooks → POST to /enrollment/grant-access
Action 3: Gmail → Send Email
Action 4: Slack → Add to Channel
```

### 2. Grade Update Notification

**Trigger:** Airtable record updated (Grades table)  
**Actions:**
1. Update grade in ScrollUniversity (webhook)
2. Send notification to student
3. Update transcript

**Zap Configuration:**
```
Trigger: Airtable → Updated Record (Grades)
Filter: Grade Field is not empty
Action 1: Webhooks → POST to /grades/update
Action 2: Gmail → Send Email to Student
Action 3: Webhooks → POST to /sync/student
```

### 3. Support Ticket Creation

**Trigger:** Email received at support@scrolluniversity.com  
**Actions:**
1. Create ticket in Airtable
2. Send auto-reply
3. Notify support team via Slack

**Zap Configuration:**
```
Trigger: Gmail → New Email
Filter: To = support@scrolluniversity.com
Action 1: Airtable → Create Record (Support Tickets)
Action 2: Gmail → Send Reply
Action 3: Slack → Send Message (#support)
```

### 4. Student Data Synchronization

**Trigger:** Airtable record updated (Students table)  
**Actions:**
1. Sync data to ScrollUniversity (webhook)
2. Update CRM
3. Log sync operation

**Zap Configuration:**
```
Trigger: Airtable → Updated Record (Students)
Action 1: Webhooks → POST to /sync/student
Action 2: HubSpot → Update Contact
Action 3: Google Sheets → Add Row (Sync Log)
```

## Troubleshooting

### Common Issues

#### 1. Signature Verification Failed

**Error:** `Invalid webhook signature`

**Solutions:**
- Verify `ZAPIER_WEBHOOK_SECRET` matches in both systems
- Ensure signature is generated correctly (see Security Configuration)
- Check that request body is not modified after signature generation
- Verify Content-Type is `application/json`

#### 2. Rate Limit Exceeded

**Error:** `Rate limit exceeded`

**Solutions:**
- Reduce Zap execution frequency
- Implement delays between actions
- Use batch endpoints where available
- Contact support to increase rate limits

#### 3. Missing Required Fields

**Error:** `Missing required fields: userId, courseId`

**Solutions:**
- Verify all required fields are included in request body
- Check field mapping in Zapier action
- Ensure data is available from previous steps

#### 4. Webhook Timeout

**Error:** Request timeout

**Solutions:**
- Check backend server is running and accessible
- Verify firewall rules allow Zapier IP addresses
- Increase timeout in Zapier webhook settings
- Check backend logs for errors

### Debugging Steps

1. **Check Zapier Task History:**
   - View detailed logs of each Zap execution
   - Inspect request/response data
   - Identify failed steps

2. **Check Backend Logs:**
   ```bash
   # View recent webhook logs
   tail -f logs/production.log | grep "webhook"
   ```

3. **Test Endpoint Manually:**
   ```bash
   curl -X POST https://api.scrolluniversity.com/api/webhooks/zapier/test \
     -H "Content-Type: application/json" \
     -H "x-zapier-signature: YOUR_SIGNATURE" \
     -d '{"testData": "manual test"}'
   ```

4. **Verify Environment Variables:**
   ```bash
   # In backend directory
   echo $ZAPIER_WEBHOOK_SECRET
   ```

## Best Practices

### 1. Security

- **Never expose webhook secret** in client-side code or public repositories
- **Rotate webhook secret** periodically (every 90 days)
- **Use HTTPS only** for all webhook endpoints
- **Implement IP whitelisting** if possible (Zapier IP ranges)
- **Monitor webhook logs** for suspicious activity

### 2. Reliability

- **Implement retry logic** in Zapier for failed webhooks
- **Use idempotent operations** to handle duplicate calls
- **Add error notifications** for critical workflows
- **Test in staging** before deploying to production
- **Monitor webhook success rates** and set up alerts

### 3. Performance

- **Use batch endpoints** for bulk operations
- **Implement caching** where appropriate
- **Optimize database queries** in webhook handlers
- **Use async processing** for long-running operations
- **Monitor response times** and optimize slow endpoints

### 4. Maintenance

- **Document all Zaps** with clear descriptions
- **Use consistent naming** conventions for Zaps
- **Organize Zaps** into folders by function
- **Review and update** Zaps regularly
- **Archive unused Zaps** to reduce clutter

### 5. Monitoring

- **Set up alerts** for webhook failures
- **Track key metrics:**
  - Success rate
  - Response time
  - Error rate
  - Rate limit usage
- **Review logs** regularly for issues
- **Create dashboards** for webhook analytics

## Support

For assistance with Zapier integration:

- **Documentation:** https://docs.scrolluniversity.com/webhooks
- **Email:** support@scrolluniversity.com
- **Slack:** #zapier-integration (internal)
- **Status Page:** https://status.scrolluniversity.com

## Additional Resources

- [Zapier Webhook API Documentation](./src/docs/zapier-webhook-api.md)
- [Zapier Official Documentation](https://zapier.com/help/create/code-webhooks/make-requests-in-zaps)
- [HMAC Signature Verification](https://zapier.com/help/create/code-webhooks/verify-webhook-signatures)
- [ScrollUniversity API Documentation](./src/docs/api-documentation.md)

## Version History

- **v1.0.0** (2024-01-15): Initial webhook implementation
  - Enrollment webhooks
  - Grade update webhooks
  - Data sync webhooks
  - Notification webhooks
  - Signature verification
  - Rate limiting
