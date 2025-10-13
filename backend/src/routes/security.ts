import express from 'express';
import { ComprehensiveSecurityService } from '../../../src/services/ComprehensiveSecurityService';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();
const securityService = new ComprehensiveSecurityService();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Security Dashboard Data
router.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = await securityService.getDashboardData();
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching security dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch security dashboard data' });
  }
});

// Security Status
router.get('/status', async (req, res) => {
  try {
    const status = await securityService.getSecurityStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching security status:', error);
    res.status(500).json({ error: 'Failed to fetch security status' });
  }
});

// Security Scan
router.post('/scan', async (req, res) => {
  try {
    const scanResult = await securityService.performSecurityScan();
    res.json(scanResult);
  } catch (error) {
    console.error('Error performing security scan:', error);
    res.status(500).json({ error: 'Failed to perform security scan' });
  }
});

// Threat Management
router.get('/threats', async (req, res) => {
  try {
    const { status } = req.query;
    const threats = await securityService.getSecurityService().getThreats(status as any);
    res.json(threats);
  } catch (error) {
    console.error('Error fetching threats:', error);
    res.status(500).json({ error: 'Failed to fetch threats' });
  }
});

router.post('/threats/:threatId/respond', async (req, res) => {
  try {
    const { threatId } = req.params;
    await securityService.getSecurityService().respondToThreat(threatId);
    res.json({ success: true, message: 'Threat response initiated' });
  } catch (error) {
    console.error('Error responding to threat:', error);
    res.status(500).json({ error: 'Failed to respond to threat' });
  }
});

// Security Policies
router.get('/policies', async (req, res) => {
  try {
    // This would fetch policies from the security service
    res.json({ policies: [] }); // Placeholder
  } catch (error) {
    console.error('Error fetching security policies:', error);
    res.status(500).json({ error: 'Failed to fetch security policies' });
  }
});

router.post('/policies', async (req, res) => {
  try {
    const policyData = req.body;
    const policy = await securityService.getSecurityService().createSecurityPolicy(policyData);
    res.status(201).json(policy);
  } catch (error) {
    console.error('Error creating security policy:', error);
    res.status(500).json({ error: 'Failed to create security policy' });
  }
});

// Access Control
router.post('/validate-access', async (req, res) => {
  try {
    const { userId, resource, action, context } = req.body;
    const result = await securityService.getSecurityService().validateAccess(
      userId,
      resource,
      action,
      context
    );
    res.json(result);
  } catch (error) {
    console.error('Error validating access:', error);
    res.status(500).json({ error: 'Failed to validate access' });
  }
});

// Audit Logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await securityService.getSecurityService().getAuditLogs(Number(limit));
    res.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Data Privacy Routes
router.get('/privacy/status', async (req, res) => {
  try {
    const status = await securityService.getPrivacyService().getComplianceStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching privacy status:', error);
    res.status(500).json({ error: 'Failed to fetch privacy status' });
  }
});

router.post('/privacy/consent', async (req, res) => {
  try {
    const { userId, consentData, ipAddress } = req.body;
    const consent = await securityService.getPrivacyService().recordConsent(
      userId,
      consentData,
      ipAddress
    );
    res.json(consent);
  } catch (error) {
    console.error('Error recording consent:', error);
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

router.post('/privacy/data-request', async (req, res) => {
  try {
    const { subjectId, type, details } = req.body;
    const request = await securityService.getPrivacyService().submitDataRequest(
      subjectId,
      type,
      details
    );
    res.status(201).json(request);
  } catch (error) {
    console.error('Error submitting data request:', error);
    res.status(500).json({ error: 'Failed to submit data request' });
  }
});

router.post('/privacy/data-breach', async (req, res) => {
  try {
    const { type, affectedRecords, dataTypes, severity } = req.body;
    const incident = await securityService.getPrivacyService().reportDataBreach(
      type,
      affectedRecords,
      dataTypes,
      severity
    );
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error reporting data breach:', error);
    res.status(500).json({ error: 'Failed to report data breach' });
  }
});

router.post('/privacy/register-subject', async (req, res) => {
  try {
    const userData = req.body;
    const subject = await securityService.getPrivacyService().registerDataSubject(userData);
    res.status(201).json(subject);
  } catch (error) {
    console.error('Error registering data subject:', error);
    res.status(500).json({ error: 'Failed to register data subject' });
  }
});

// Content Filtering Routes
router.post('/content/filter', async (req, res) => {
  try {
    const content = req.body;
    const alignmentCheck = await securityService.getContentService().filterContent(content);
    res.json(alignmentCheck);
  } catch (error) {
    console.error('Error filtering content:', error);
    res.status(500).json({ error: 'Failed to filter content' });
  }
});

router.get('/content/analytics', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const analytics = await securityService.getContentService().getContentAnalytics(timeframe as any);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Failed to fetch content analytics' });
  }
});

router.post('/content/review/:checkId', async (req, res) => {
  try {
    const { checkId } = req.params;
    const { reviewerId, decision, feedback } = req.body;
    const result = await securityService.getContentService().reviewContent(
      checkId,
      reviewerId,
      decision,
      feedback
    );
    res.json(result);
  } catch (error) {
    console.error('Error reviewing content:', error);
    res.status(500).json({ error: 'Failed to review content' });
  }
});

router.get('/content/status/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const status = await securityService.getContentService().getContentStatus(contentId);
    res.json({ status });
  } catch (error) {
    console.error('Error fetching content status:', error);
    res.status(500).json({ error: 'Failed to fetch content status' });
  }
});

router.get('/content/standards', async (req, res) => {
  try {
    const standards = await securityService.getContentService().getSpiritualStandards();
    res.json(standards);
  } catch (error) {
    console.error('Error fetching spiritual standards:', error);
    res.status(500).json({ error: 'Failed to fetch spiritual standards' });
  }
});

router.post('/content/prophetic-witness', async (req, res) => {
  try {
    const { verificationId, witnessId, testimony, scriptureSupport } = req.body;
    const result = await securityService.getContentService().submitPropheticWitness(
      verificationId,
      witnessId,
      testimony,
      scriptureSupport
    );
    res.json({ success: result });
  } catch (error) {
    console.error('Error submitting prophetic witness:', error);
    res.status(500).json({ error: 'Failed to submit prophetic witness' });
  }
});

// Fraud Prevention Routes
router.post('/fraud/validate-transaction', async (req, res) => {
  try {
    const transaction = req.body;
    const validation = await securityService.getFraudService().validateTransaction(transaction);
    res.json(validation);
  } catch (error) {
    console.error('Error validating transaction:', error);
    res.status(500).json({ error: 'Failed to validate transaction' });
  }
});

router.get('/fraud/analytics', async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const analytics = await securityService.getFraudService().getFraudAnalytics(timeframe as any);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching fraud analytics:', error);
    res.status(500).json({ error: 'Failed to fetch fraud analytics' });
  }
});

router.get('/fraud/alerts', async (req, res) => {
  try {
    const { status } = req.query;
    const alerts = await securityService.getFraudService().getFraudAlerts(status as any);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching fraud alerts:', error);
    res.status(500).json({ error: 'Failed to fetch fraud alerts' });
  }
});

router.post('/fraud/investigate/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { investigatorId, resolution } = req.body;
    const result = await securityService.getFraudService().investigateFraudAlert(
      alertId,
      investigatorId,
      resolution
    );
    res.json(result);
  } catch (error) {
    console.error('Error investigating fraud alert:', error);
    res.status(500).json({ error: 'Failed to investigate fraud alert' });
  }
});

router.post('/fraud/block-user', async (req, res) => {
  try {
    const { userId, reason } = req.body;
    await securityService.getFraudService().blockUser(userId, reason);
    res.json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: 'Failed to block user' });
  }
});

router.post('/fraud/unblock-user', async (req, res) => {
  try {
    const { userId, reason } = req.body;
    await securityService.getFraudService().unblockUser(userId, reason);
    res.json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ error: 'Failed to unblock user' });
  }
});

router.get('/fraud/user-restrictions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const restrictions = await securityService.getFraudService().getUserRestrictions(userId);
    res.json(restrictions);
  } catch (error) {
    console.error('Error fetching user restrictions:', error);
    res.status(500).json({ error: 'Failed to fetch user restrictions' });
  }
});

router.post('/fraud/suspicious-ip', async (req, res) => {
  try {
    const { ipAddress, action } = req.body; // action: 'add' or 'remove'
    
    if (action === 'add') {
      await securityService.getFraudService().addSuspiciousIP(ipAddress);
    } else if (action === 'remove') {
      await securityService.getFraudService().removeSuspiciousIP(ipAddress);
    }
    
    res.json({ success: true, message: `IP ${action}ed successfully` });
  } catch (error) {
    console.error('Error managing suspicious IP:', error);
    res.status(500).json({ error: 'Failed to manage suspicious IP' });
  }
});

// Incident Management Routes
router.get('/incidents', async (req, res) => {
  try {
    const { status } = req.query;
    const incidents = await securityService.getIncidents(status as any);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

router.post('/incidents', async (req, res) => {
  try {
    const { type, severity, title, description, affectedSystems, impact } = req.body;
    const incident = await securityService.createSecurityIncident(
      type,
      severity,
      title,
      description,
      affectedSystems,
      impact
    );
    res.status(201).json(incident);
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

router.put('/incidents/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { status, assignedTo, resolution } = req.body;
    const incident = await securityService.updateIncidentStatus(
      incidentId,
      status,
      assignedTo,
      resolution
    );
    res.json(incident);
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

// Audit Reports
router.get('/reports', async (req, res) => {
  try {
    const { type } = req.query;
    const reports = await securityService.getAuditReports(type as any);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching audit reports:', error);
    res.status(500).json({ error: 'Failed to fetch audit reports' });
  }
});

router.post('/reports/generate', async (req, res) => {
  try {
    const { type, period } = req.body;
    const report = await securityService.generateAuditReport(type, period);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error generating audit report:', error);
    res.status(500).json({ error: 'Failed to generate audit report' });
  }
});

// Configuration Management
router.get('/config', async (req, res) => {
  try {
    const config = securityService.getConfiguration();
    res.json(config);
  } catch (error) {
    console.error('Error fetching security configuration:', error);
    res.status(500).json({ error: 'Failed to fetch security configuration' });
  }
});

router.put('/config', async (req, res) => {
  try {
    const updates = req.body;
    await securityService.updateConfiguration(updates);
    res.json({ success: true, message: 'Configuration updated successfully' });
  } catch (error) {
    console.error('Error updating security configuration:', error);
    res.status(500).json({ error: 'Failed to update security configuration' });
  }
});

// Real-time Security Events (WebSocket endpoint would be better for this)
router.get('/events/stream', async (req, res) => {
  try {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Listen for real-time alerts
    securityService.on('realTimeAlert', sendEvent);
    securityService.on('securityIncidentCreated', sendEvent);
    securityService.on('fraudAlertCreated', sendEvent);

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      securityService.removeListener('realTimeAlert', sendEvent);
      securityService.removeListener('securityIncidentCreated', sendEvent);
      securityService.removeListener('fraudAlertCreated', sendEvent);
    });

  } catch (error) {
    console.error('Error setting up event stream:', error);
    res.status(500).json({ error: 'Failed to set up event stream' });
  }
});

export default router;