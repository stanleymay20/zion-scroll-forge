import { EventEmitter } from 'events';

export interface SecurityThreat {
  id: string;
  type: 'authentication' | 'authorization' | 'data_breach' | 'ddos' | 'injection' | 'xss' | 'csrf';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  timestamp: Date;
  details: any;
  status: 'detected' | 'investigating' | 'mitigated' | 'resolved';
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'access_control' | 'data_protection' | 'network_security' | 'application_security';
  rules: SecurityRule[];
  enabled: boolean;
  lastUpdated: Date;
}

export interface SecurityRule {
  id: string;
  condition: string;
  action: 'allow' | 'deny' | 'log' | 'alert' | 'quarantine';
  priority: number;
}

export interface SecurityAuditLog {
  id: string;
  userId?: string;
  action: string;
  resource: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure' | 'blocked';
  riskScore: number;
}

export class SecurityComplianceService extends EventEmitter {
  private threats: Map<string, SecurityThreat> = new Map();
  private policies: Map<string, SecurityPolicy> = new Map();
  private auditLogs: SecurityAuditLog[] = [];
  private activeMonitoring: boolean = true;

  constructor() {
    super();
    this.initializeDefaultPolicies();
    this.startSecurityMonitoring();
  }

  // Threat Detection and Response
  async detectThreat(
    type: SecurityThreat['type'],
    source: string,
    details: any
  ): Promise<SecurityThreat> {
    const threat: SecurityThreat = {
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity: this.calculateThreatSeverity(type, details),
      source,
      timestamp: new Date(),
      details,
      status: 'detected'
    };

    this.threats.set(threat.id, threat);
    this.emit('threatDetected', threat);

    // Auto-response for critical threats
    if (threat.severity === 'critical') {
      await this.respondToThreat(threat.id);
    }

    return threat;
  }

  async respondToThreat(threatId: string): Promise<void> {
    const threat = this.threats.get(threatId);
    if (!threat) return;

    threat.status = 'investigating';

    switch (threat.type) {
      case 'ddos':
        await this.activateRateLimiting(threat.source);
        break;
      case 'injection':
      case 'xss':
        await this.quarantineRequest(threat.details);
        break;
      case 'authentication':
        await this.lockAccount(threat.details.userId);
        break;
      default:
        await this.logSecurityIncident(threat);
    }

    threat.status = 'mitigated';
    this.emit('threatMitigated', threat);
  }

  // Security Policy Management
  async createSecurityPolicy(policy: Omit<SecurityPolicy, 'id' | 'lastUpdated'>): Promise<SecurityPolicy> {
    const newPolicy: SecurityPolicy = {
      ...policy,
      id: `policy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date()
    };

    this.policies.set(newPolicy.id, newPolicy);
    this.emit('policyCreated', newPolicy);
    return newPolicy;
  }

  async updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy | null> {
    const policy = this.policies.get(policyId);
    if (!policy) return null;

    const updatedPolicy = {
      ...policy,
      ...updates,
      lastUpdated: new Date()
    };

    this.policies.set(policyId, updatedPolicy);
    this.emit('policyUpdated', updatedPolicy);
    return updatedPolicy;
  }

  // Access Control and Authorization
  async validateAccess(
    userId: string,
    resource: string,
    action: string,
    context: any = {}
  ): Promise<{ allowed: boolean; reason?: string }> {
    const auditLog: SecurityAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      resource,
      timestamp: new Date(),
      ipAddress: context.ipAddress || 'unknown',
      userAgent: context.userAgent || 'unknown',
      result: 'success',
      riskScore: 0
    };

    // Check security policies
    const applicablePolicies = Array.from(this.policies.values())
      .filter(p => p.enabled && p.type === 'access_control');

    for (const policy of applicablePolicies) {
      for (const rule of policy.rules.sort((a, b) => b.priority - a.priority)) {
        if (this.evaluateRule(rule, { userId, resource, action, context })) {
          if (rule.action === 'deny') {
            auditLog.result = 'blocked';
            auditLog.riskScore = 8;
            this.auditLogs.push(auditLog);
            return { allowed: false, reason: `Blocked by policy: ${policy.name}` };
          }
        }
      }
    }

    // Calculate risk score
    auditLog.riskScore = await this.calculateRiskScore(userId, resource, action, context);

    // High risk actions require additional verification
    if (auditLog.riskScore > 7) {
      auditLog.result = 'blocked';
      this.auditLogs.push(auditLog);
      return { allowed: false, reason: 'High risk activity detected' };
    }

    this.auditLogs.push(auditLog);
    return { allowed: true };
  }

  // Security Monitoring
  private startSecurityMonitoring(): void {
    if (!this.activeMonitoring) return;

    setInterval(() => {
      this.performSecurityScan();
    }, 60000); // Every minute

    setInterval(() => {
      this.analyzeSecurityTrends();
    }, 300000); // Every 5 minutes
  }

  private async performSecurityScan(): Promise<void> {
    // Check for suspicious patterns in audit logs
    const recentLogs = this.auditLogs.filter(
      log => Date.now() - log.timestamp.getTime() < 300000 // Last 5 minutes
    );

    // Detect brute force attempts
    const failedAttempts = recentLogs.filter(log => log.result === 'failure');
    const attemptsByUser = new Map<string, number>();

    failedAttempts.forEach(log => {
      if (log.userId) {
        attemptsByUser.set(log.userId, (attemptsByUser.get(log.userId) || 0) + 1);
      }
    });

    for (const [userId, attempts] of attemptsByUser) {
      if (attempts > 5) {
        await this.detectThreat('authentication', userId, {
          attempts,
          timeWindow: '5 minutes'
        });
      }
    }

    // Detect unusual access patterns
    const highRiskLogs = recentLogs.filter(log => log.riskScore > 6);
    if (highRiskLogs.length > 10) {
      await this.detectThreat('authorization', 'system', {
        highRiskActivities: highRiskLogs.length,
        timeWindow: '5 minutes'
      });
    }
  }

  private async analyzeSecurityTrends(): Promise<void> {
    const recentThreats = Array.from(this.threats.values())
      .filter(threat => Date.now() - threat.timestamp.getTime() < 3600000); // Last hour

    if (recentThreats.length > 20) {
      this.emit('securityAlert', {
        type: 'high_threat_volume',
        count: recentThreats.length,
        timeWindow: '1 hour'
      });
    }

    // Analyze threat patterns
    const threatsByType = new Map<string, number>();
    recentThreats.forEach(threat => {
      threatsByType.set(threat.type, (threatsByType.get(threat.type) || 0) + 1);
    });

    for (const [type, count] of threatsByType) {
      if (count > 5) {
        this.emit('threatPattern', { type, count, timeWindow: '1 hour' });
      }
    }
  }

  // Helper Methods
  private calculateThreatSeverity(type: SecurityThreat['type'], details: any): SecurityThreat['severity'] {
    const severityMap: Record<SecurityThreat['type'], SecurityThreat['severity']> = {
      'authentication': 'medium',
      'authorization': 'high',
      'data_breach': 'critical',
      'ddos': 'high',
      'injection': 'critical',
      'xss': 'high',
      'csrf': 'medium'
    };

    let baseSeverity = severityMap[type] || 'low';

    // Adjust based on details
    if (details.volume && details.volume > 1000) {
      baseSeverity = 'critical';
    }

    return baseSeverity;
  }

  private evaluateRule(rule: SecurityRule, context: any): boolean {
    // Simple rule evaluation - in production, use a proper rule engine
    try {
      return eval(rule.condition.replace(/\$\{(\w+)\}/g, (_, key) => {
        return JSON.stringify(context[key]);
      }));
    } catch {
      return false;
    }
  }

  private async calculateRiskScore(
    userId: string,
    resource: string,
    action: string,
    context: any
  ): Promise<number> {
    let score = 0;

    // Base risk by action type
    const actionRisk: Record<string, number> = {
      'read': 1,
      'create': 3,
      'update': 4,
      'delete': 6,
      'admin': 8
    };
    score += actionRisk[action] || 2;

    // Time-based risk (higher risk outside business hours)
    const hour = new Date().getHours();
    if (hour < 6 || hour > 22) score += 2;

    // Location-based risk (if available)
    if (context.location && context.location.country !== 'expected') {
      score += 3;
    }

    // Recent activity pattern
    const recentActivity = this.auditLogs.filter(
      log => log.userId === userId && 
      Date.now() - log.timestamp.getTime() < 3600000 // Last hour
    );

    if (recentActivity.length > 50) score += 4;

    return Math.min(score, 10);
  }

  private async activateRateLimiting(source: string): Promise<void> {
    // Implementation would integrate with rate limiting service
    console.log(`Activating rate limiting for source: ${source}`);
  }

  private async quarantineRequest(details: any): Promise<void> {
    // Implementation would quarantine malicious requests
    console.log(`Quarantining request:`, details);
  }

  private async lockAccount(userId: string): Promise<void> {
    // Implementation would lock user account
    console.log(`Locking account: ${userId}`);
  }

  private async logSecurityIncident(threat: SecurityThreat): Promise<void> {
    // Implementation would log to security incident system
    console.log(`Security incident logged:`, threat);
  }

  private initializeDefaultPolicies(): void {
    // Default access control policy
    this.policies.set('default_access', {
      id: 'default_access',
      name: 'Default Access Control',
      type: 'access_control',
      rules: [
        {
          id: 'admin_only',
          condition: '${resource}.includes("admin") && ${context.userRole} !== "admin"',
          action: 'deny',
          priority: 100
        },
        {
          id: 'rate_limit',
          condition: '${context.requestCount} > 100',
          action: 'deny',
          priority: 90
        }
      ],
      enabled: true,
      lastUpdated: new Date()
    });
  }

  // Public API Methods
  async getSecurityStatus(): Promise<{
    activeThreats: number;
    resolvedThreats: number;
    activePolicies: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const activeThreats = Array.from(this.threats.values())
      .filter(t => t.status !== 'resolved').length;
    
    const resolvedThreats = Array.from(this.threats.values())
      .filter(t => t.status === 'resolved').length;

    const activePolicies = Array.from(this.policies.values())
      .filter(p => p.enabled).length;

    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (activeThreats > 10) riskLevel = 'critical';
    else if (activeThreats > 5) riskLevel = 'high';
    else if (activeThreats > 2) riskLevel = 'medium';

    return {
      activeThreats,
      resolvedThreats,
      activePolicies,
      riskLevel
    };
  }

  async getAuditLogs(limit: number = 100): Promise<SecurityAuditLog[]> {
    return this.auditLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getThreats(status?: SecurityThreat['status']): Promise<SecurityThreat[]> {
    const threats = Array.from(this.threats.values());
    return status ? threats.filter(t => t.status === status) : threats;
  }
}