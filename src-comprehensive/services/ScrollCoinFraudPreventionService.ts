import { EventEmitter } from 'events';

export interface ScrollCoinTransaction {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: 'reward' | 'transfer' | 'purchase' | 'refund' | 'penalty';
  description: string;
  timestamp: Date;
  blockchainHash?: string;
  status: 'pending' | 'confirmed' | 'failed' | 'suspicious' | 'blocked';
  metadata: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    deviceId?: string;
  };
}

export interface FraudAlert {
  id: string;
  type: 'velocity' | 'pattern' | 'amount' | 'location' | 'device' | 'behavioral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
  transactionId?: string;
  description: string;
  riskScore: number;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
  investigatedBy?: string;
  resolution?: string;
}

export interface UserRiskProfile {
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  lastUpdated: Date;
  transactionHistory: TransactionPattern;
  behaviorProfile: BehaviorProfile;
  restrictions: UserRestriction[];
}

export interface RiskFactor {
  type: string;
  description: string;
  weight: number;
  value: number;
  lastObserved: Date;
}

export interface TransactionPattern {
  averageAmount: number;
  frequencyPerDay: number;
  preferredHours: number[];
  commonRecipients: string[];
  unusualActivity: boolean;
}

export interface BehaviorProfile {
  loginFrequency: number;
  deviceConsistency: number;
  locationStability: number;
  interactionPatterns: string[];
  suspiciousActivities: number;
}

export interface UserRestriction {
  type: 'transaction_limit' | 'recipient_limit' | 'time_restriction' | 'manual_approval';
  description: string;
  value: number;
  expiresAt?: Date;
  reason: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  type: 'velocity' | 'amount' | 'pattern' | 'behavioral' | 'location';
  conditions: RuleCondition[];
  action: 'flag' | 'block' | 'require_approval' | 'limit' | 'alert';
  severity: FraudAlert['severity'];
  enabled: boolean;
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne' | 'in' | 'not_in' | 'contains' | 'regex';
  value: any;
  timeWindow?: number; // minutes
}

export class ScrollCoinFraudPreventionService extends EventEmitter {
  private userRiskProfiles: Map<string, UserRiskProfile> = new Map();
  private fraudAlerts: Map<string, FraudAlert> = new Map();
  private fraudRules: Map<string, FraudRule> = new Map();
  private transactionHistory: Map<string, ScrollCoinTransaction[]> = new Map();
  private blockedUsers: Set<string> = new Set();
  private suspiciousIPs: Set<string> = new Set();

  constructor() {
    super();
    this.initializeFraudRules();
    this.startFraudMonitoring();
  }

  // Transaction Validation
  async validateTransaction(transaction: ScrollCoinTransaction): Promise<{
    allowed: boolean;
    riskScore: number;
    alerts: FraudAlert[];
    restrictions?: string[];
  }> {
    const alerts: FraudAlert[] = [];
    let riskScore = 0;
    const restrictions: string[] = [];

    // Check if user is blocked
    if (this.blockedUsers.has(transaction.fromUserId)) {
      return {
        allowed: false,
        riskScore: 100,
        alerts: [],
        restrictions: ['User account is blocked due to fraud']
      };
    }

    // Get or create user risk profile
    const userProfile = await this.getUserRiskProfile(transaction.fromUserId);
    riskScore = userProfile.riskScore;

    // Apply fraud rules
    for (const [ruleId, rule] of this.fraudRules) {
      if (!rule.enabled) continue;

      const ruleResult = await this.evaluateFraudRule(transaction, rule, userProfile);
      if (ruleResult.triggered) {
        const alert = await this.createFraudAlert(
          rule.type,
          rule.severity,
          transaction.fromUserId,
          transaction.id,
          ruleResult.description,
          ruleResult.riskScore
        );
        alerts.push(alert);
        riskScore = Math.max(riskScore, ruleResult.riskScore);

        // Apply rule actions
        switch (rule.action) {
          case 'block':
            return {
              allowed: false,
              riskScore,
              alerts,
              restrictions: [`Transaction blocked by rule: ${rule.name}`]
            };
          case 'require_approval':
            restrictions.push(`Manual approval required: ${rule.name}`);
            break;
          case 'limit':
            restrictions.push(`Transaction limited by rule: ${rule.name}`);
            break;
        }
      }
    }

    // Update user risk profile
    await this.updateUserRiskProfile(transaction.fromUserId, transaction);

    // Determine if transaction should be allowed
    const allowed = riskScore < 80 && restrictions.length === 0;

    return {
      allowed,
      riskScore,
      alerts,
      restrictions: restrictions.length > 0 ? restrictions : undefined
    };
  }

  // Risk Profile Management
  async getUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    let profile = this.userRiskProfiles.get(userId);
    
    if (!profile) {
      profile = await this.createUserRiskProfile(userId);
      this.userRiskProfiles.set(userId, profile);
    }

    return profile;
  }

  private async createUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    const userTransactions = this.transactionHistory.get(userId) || [];
    
    const profile: UserRiskProfile = {
      userId,
      riskScore: 20, // Base risk score
      riskLevel: 'low',
      factors: [],
      lastUpdated: new Date(),
      transactionHistory: this.analyzeTransactionPattern(userTransactions),
      behaviorProfile: await this.analyzeBehaviorProfile(userId),
      restrictions: []
    };

    // Calculate initial risk factors
    profile.factors = await this.calculateRiskFactors(userId, userTransactions);
    profile.riskScore = this.calculateOverallRiskScore(profile.factors);
    profile.riskLevel = this.determineRiskLevel(profile.riskScore);

    return profile;
  }

  private async updateUserRiskProfile(userId: string, transaction: ScrollCoinTransaction): Promise<void> {
    const profile = await this.getUserRiskProfile(userId);
    
    // Add transaction to history
    const userTransactions = this.transactionHistory.get(userId) || [];
    userTransactions.push(transaction);
    this.transactionHistory.set(userId, userTransactions);

    // Update transaction pattern
    profile.transactionHistory = this.analyzeTransactionPattern(userTransactions);
    
    // Recalculate risk factors
    profile.factors = await this.calculateRiskFactors(userId, userTransactions);
    profile.riskScore = this.calculateOverallRiskScore(profile.factors);
    profile.riskLevel = this.determineRiskLevel(profile.riskScore);
    profile.lastUpdated = new Date();

    this.userRiskProfiles.set(userId, profile);
    this.emit('riskProfileUpdated', profile);

    // Apply automatic restrictions for high-risk users
    if (profile.riskLevel === 'critical') {
      await this.applyAutomaticRestrictions(userId);
    }
  }

  // Fraud Detection Rules
  private async evaluateFraudRule(
    transaction: ScrollCoinTransaction,
    rule: FraudRule,
    userProfile: UserRiskProfile
  ): Promise<{
    triggered: boolean;
    description: string;
    riskScore: number;
  }> {
    let triggered = true;
    let riskScore = 0;

    for (const condition of rule.conditions) {
      const conditionMet = await this.evaluateRuleCondition(condition, transaction, userProfile);
      if (!conditionMet) {
        triggered = false;
        break;
      }
    }

    if (triggered) {
      riskScore = this.calculateRuleRiskScore(rule, transaction, userProfile);
    }

    return {
      triggered,
      description: `Rule triggered: ${rule.description}`,
      riskScore
    };
  }

  private async evaluateRuleCondition(
    condition: RuleCondition,
    transaction: ScrollCoinTransaction,
    userProfile: UserRiskProfile
  ): Promise<boolean> {
    let value: any;

    // Get the field value
    switch (condition.field) {
      case 'amount':
        value = transaction.amount;
        break;
      case 'velocity':
        value = await this.calculateTransactionVelocity(transaction.fromUserId, condition.timeWindow || 60);
        break;
      case 'riskScore':
        value = userProfile.riskScore;
        break;
      case 'location':
        value = transaction.metadata.location;
        break;
      case 'deviceId':
        value = transaction.metadata.deviceId;
        break;
      case 'ipAddress':
        value = transaction.metadata.ipAddress;
        break;
      default:
        return false;
    }

    // Evaluate condition
    switch (condition.operator) {
      case 'gt':
        return value > condition.value;
      case 'lt':
        return value < condition.value;
      case 'eq':
        return value === condition.value;
      case 'ne':
        return value !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'contains':
        return typeof value === 'string' && value.includes(condition.value);
      case 'regex':
        return typeof value === 'string' && new RegExp(condition.value).test(value);
      default:
        return false;
    }
  }

  // Fraud Alert Management
  private async createFraudAlert(
    type: FraudAlert['type'],
    severity: FraudAlert['severity'],
    userId: string,
    transactionId: string | undefined,
    description: string,
    riskScore: number
  ): Promise<FraudAlert> {
    const alert: FraudAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      userId,
      transactionId,
      description,
      riskScore,
      timestamp: new Date(),
      status: 'active'
    };

    this.fraudAlerts.set(alert.id, alert);
    this.emit('fraudAlertCreated', alert);

    // Auto-escalate critical alerts
    if (severity === 'critical') {
      await this.escalateFraudAlert(alert.id);
    }

    return alert;
  }

  async investigateFraudAlert(
    alertId: string,
    investigatorId: string,
    resolution: 'confirmed_fraud' | 'false_positive' | 'needs_monitoring'
  ): Promise<FraudAlert | null> {
    const alert = this.fraudAlerts.get(alertId);
    if (!alert) return null;

    alert.status = 'investigating';
    alert.investigatedBy = investigatorId;

    switch (resolution) {
      case 'confirmed_fraud':
        alert.status = 'resolved';
        alert.resolution = 'Confirmed fraud - user restricted';
        await this.handleConfirmedFraud(alert.userId);
        break;
      case 'false_positive':
        alert.status = 'resolved';
        alert.resolution = 'False positive - no action needed';
        await this.handleFalsePositive(alert.userId);
        break;
      case 'needs_monitoring':
        alert.status = 'active';
        alert.resolution = 'Requires continued monitoring';
        await this.increaseUserMonitoring(alert.userId);
        break;
    }

    this.fraudAlerts.set(alertId, alert);
    this.emit('fraudAlertResolved', alert);
    return alert;
  }

  // User Management
  async blockUser(userId: string, reason: string): Promise<void> {
    this.blockedUsers.add(userId);
    
    const profile = await this.getUserRiskProfile(userId);
    profile.restrictions.push({
      type: 'manual_approval',
      description: 'Account blocked due to fraud',
      value: 0,
      reason
    });

    this.userRiskProfiles.set(userId, profile);
    this.emit('userBlocked', { userId, reason });
  }

  async unblockUser(userId: string, reason: string): Promise<void> {
    this.blockedUsers.delete(userId);
    
    const profile = await this.getUserRiskProfile(userId);
    profile.restrictions = profile.restrictions.filter(r => r.type !== 'manual_approval');
    profile.riskScore = Math.max(profile.riskScore - 20, 0);
    profile.riskLevel = this.determineRiskLevel(profile.riskScore);

    this.userRiskProfiles.set(userId, profile);
    this.emit('userUnblocked', { userId, reason });
  }

  // Analytics and Reporting
  async getFraudAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
    blockedTransactions: number;
    falsePositiveRate: number;
    averageRiskScore: number;
    topRiskUsers: { userId: string; riskScore: number }[];
  }> {
    const cutoffDate = new Date();
    switch (timeframe) {
      case 'day':
        cutoffDate.setDate(cutoffDate.getDate() - 1);
        break;
      case 'week':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
    }

    const recentAlerts = Array.from(this.fraudAlerts.values())
      .filter(alert => alert.timestamp > cutoffDate);

    const totalAlerts = recentAlerts.length;

    const alertsBySeverity: Record<string, number> = {};
    const alertsByType: Record<string, number> = {};

    recentAlerts.forEach(alert => {
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
      alertsByType[alert.type] = (alertsByType[alert.type] || 0) + 1;
    });

    const resolvedAlerts = recentAlerts.filter(a => a.status === 'resolved');
    const falsePositives = resolvedAlerts.filter(a => a.resolution?.includes('false positive'));
    const falsePositiveRate = resolvedAlerts.length > 0 
      ? (falsePositives.length / resolvedAlerts.length) * 100 
      : 0;

    const allProfiles = Array.from(this.userRiskProfiles.values());
    const averageRiskScore = allProfiles.length > 0
      ? allProfiles.reduce((sum, p) => sum + p.riskScore, 0) / allProfiles.length
      : 0;

    const topRiskUsers = allProfiles
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10)
      .map(p => ({ userId: p.userId, riskScore: p.riskScore }));

    // Count blocked transactions (simplified)
    const blockedTransactions = recentAlerts.filter(a => 
      a.description.includes('blocked') || a.severity === 'critical'
    ).length;

    return {
      totalAlerts,
      alertsBySeverity,
      alertsByType,
      blockedTransactions,
      falsePositiveRate,
      averageRiskScore,
      topRiskUsers
    };
  }

  // Helper Methods
  private async calculateTransactionVelocity(userId: string, timeWindowMinutes: number): Promise<number> {
    const userTransactions = this.transactionHistory.get(userId) || [];
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    
    return userTransactions.filter(tx => tx.timestamp > cutoffTime).length;
  }

  private analyzeTransactionPattern(transactions: ScrollCoinTransaction[]): TransactionPattern {
    if (transactions.length === 0) {
      return {
        averageAmount: 0,
        frequencyPerDay: 0,
        preferredHours: [],
        commonRecipients: [],
        unusualActivity: false
      };
    }

    const amounts = transactions.map(tx => tx.amount);
    const averageAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

    const daySpan = Math.max(1, (Date.now() - transactions[0].timestamp.getTime()) / (24 * 60 * 60 * 1000));
    const frequencyPerDay = transactions.length / daySpan;

    const hours = transactions.map(tx => tx.timestamp.getHours());
    const hourCounts = new Map<number, number>();
    hours.forEach(hour => hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1));
    const preferredHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => hour);

    const recipientCounts = new Map<string, number>();
    transactions.forEach(tx => {
      if (tx.toUserId) {
        recipientCounts.set(tx.toUserId, (recipientCounts.get(tx.toUserId) || 0) + 1);
      }
    });
    const commonRecipients = Array.from(recipientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([userId]) => userId);

    // Detect unusual activity patterns
    const recentTransactions = transactions.filter(tx => 
      Date.now() - tx.timestamp.getTime() < 24 * 60 * 60 * 1000
    );
    const unusualActivity = recentTransactions.length > frequencyPerDay * 3;

    return {
      averageAmount,
      frequencyPerDay,
      preferredHours,
      commonRecipients,
      unusualActivity
    };
  }

  private async analyzeBehaviorProfile(userId: string): Promise<BehaviorProfile> {
    // In production, this would analyze user behavior from various sources
    return {
      loginFrequency: 5, // logins per day
      deviceConsistency: 0.8, // 0-1 score
      locationStability: 0.9, // 0-1 score
      interactionPatterns: ['morning_active', 'mobile_preferred'],
      suspiciousActivities: 0
    };
  }

  private async calculateRiskFactors(userId: string, transactions: ScrollCoinTransaction[]): Promise<RiskFactor[]> {
    const factors: RiskFactor[] = [];

    // Transaction velocity factor
    const recentTransactions = transactions.filter(tx => 
      Date.now() - tx.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    );
    if (recentTransactions.length > 10) {
      factors.push({
        type: 'high_velocity',
        description: 'High transaction velocity detected',
        weight: 0.3,
        value: recentTransactions.length,
        lastObserved: new Date()
      });
    }

    // Large amount factor
    const largeTransactions = transactions.filter(tx => tx.amount > 1000);
    if (largeTransactions.length > 0) {
      factors.push({
        type: 'large_amounts',
        description: 'Large transaction amounts',
        weight: 0.2,
        value: largeTransactions.length,
        lastObserved: new Date()
      });
    }

    // Unusual timing factor
    const nightTransactions = transactions.filter(tx => {
      const hour = tx.timestamp.getHours();
      return hour < 6 || hour > 22;
    });
    if (nightTransactions.length > transactions.length * 0.3) {
      factors.push({
        type: 'unusual_timing',
        description: 'Unusual transaction timing patterns',
        weight: 0.15,
        value: nightTransactions.length,
        lastObserved: new Date()
      });
    }

    return factors;
  }

  private calculateOverallRiskScore(factors: RiskFactor[]): number {
    if (factors.length === 0) return 20; // Base score

    const weightedScore = factors.reduce((sum, factor) => {
      return sum + (factor.value * factor.weight * 10);
    }, 20);

    return Math.min(weightedScore, 100);
  }

  private determineRiskLevel(riskScore: number): UserRiskProfile['riskLevel'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    return 'low';
  }

  private calculateRuleRiskScore(
    rule: FraudRule,
    transaction: ScrollCoinTransaction,
    userProfile: UserRiskProfile
  ): number {
    let baseScore = 0;

    switch (rule.severity) {
      case 'critical':
        baseScore = 90;
        break;
      case 'high':
        baseScore = 70;
        break;
      case 'medium':
        baseScore = 50;
        break;
      case 'low':
        baseScore = 30;
        break;
    }

    // Adjust based on user's existing risk score
    const adjustment = userProfile.riskScore * 0.2;
    return Math.min(baseScore + adjustment, 100);
  }

  private async escalateFraudAlert(alertId: string): Promise<void> {
    const alert = this.fraudAlerts.get(alertId);
    if (!alert) return;

    // Auto-block user for critical alerts
    if (alert.severity === 'critical') {
      await this.blockUser(alert.userId, `Critical fraud alert: ${alert.description}`);
    }

    this.emit('fraudAlertEscalated', alert);
  }

  private async handleConfirmedFraud(userId: string): Promise<void> {
    await this.blockUser(userId, 'Confirmed fraudulent activity');
    
    // Increase monitoring for related users
    const userTransactions = this.transactionHistory.get(userId) || [];
    const relatedUsers = new Set<string>();
    
    userTransactions.forEach(tx => {
      if (tx.toUserId) relatedUsers.add(tx.toUserId);
    });

    for (const relatedUserId of relatedUsers) {
      await this.increaseUserMonitoring(relatedUserId);
    }
  }

  private async handleFalsePositive(userId: string): Promise<void> {
    const profile = await this.getUserRiskProfile(userId);
    profile.riskScore = Math.max(profile.riskScore - 10, 0);
    profile.riskLevel = this.determineRiskLevel(profile.riskScore);
    this.userRiskProfiles.set(userId, profile);
  }

  private async increaseUserMonitoring(userId: string): Promise<void> {
    const profile = await this.getUserRiskProfile(userId);
    profile.riskScore = Math.min(profile.riskScore + 5, 100);
    profile.riskLevel = this.determineRiskLevel(profile.riskScore);
    this.userRiskProfiles.set(userId, profile);
  }

  private async applyAutomaticRestrictions(userId: string): Promise<void> {
    const profile = await this.getUserRiskProfile(userId);
    
    profile.restrictions.push({
      type: 'transaction_limit',
      description: 'Daily transaction limit due to high risk',
      value: 100, // Max 100 ScrollCoin per day
      reason: 'High risk score detected'
    });

    profile.restrictions.push({
      type: 'manual_approval',
      description: 'Manual approval required for all transactions',
      value: 1,
      reason: 'Critical risk level'
    });

    this.userRiskProfiles.set(userId, profile);
    this.emit('automaticRestrictionsApplied', { userId, restrictions: profile.restrictions });
  }

  private initializeFraudRules(): void {
    // High velocity rule
    this.fraudRules.set('high_velocity', {
      id: 'high_velocity',
      name: 'High Transaction Velocity',
      description: 'Detects unusually high transaction frequency',
      type: 'velocity',
      conditions: [
        {
          field: 'velocity',
          operator: 'gt',
          value: 20,
          timeWindow: 60 // 20 transactions in 60 minutes
        }
      ],
      action: 'require_approval',
      severity: 'high',
      enabled: true,
      priority: 1
    });

    // Large amount rule
    this.fraudRules.set('large_amount', {
      id: 'large_amount',
      name: 'Large Transaction Amount',
      description: 'Detects unusually large transaction amounts',
      type: 'amount',
      conditions: [
        {
          field: 'amount',
          operator: 'gt',
          value: 5000
        }
      ],
      action: 'require_approval',
      severity: 'medium',
      enabled: true,
      priority: 2
    });

    // Suspicious IP rule
    this.fraudRules.set('suspicious_ip', {
      id: 'suspicious_ip',
      name: 'Suspicious IP Address',
      description: 'Detects transactions from known suspicious IP addresses',
      type: 'location',
      conditions: [
        {
          field: 'ipAddress',
          operator: 'in',
          value: Array.from(this.suspiciousIPs)
        }
      ],
      action: 'block',
      severity: 'critical',
      enabled: true,
      priority: 3
    });

    // High risk user rule
    this.fraudRules.set('high_risk_user', {
      id: 'high_risk_user',
      name: 'High Risk User',
      description: 'Monitors transactions from high-risk users',
      type: 'behavioral',
      conditions: [
        {
          field: 'riskScore',
          operator: 'gt',
          value: 70
        }
      ],
      action: 'flag',
      severity: 'high',
      enabled: true,
      priority: 4
    });
  }

  private startFraudMonitoring(): void {
    // Real-time transaction monitoring
    setInterval(() => {
      this.performRealTimeAnalysis();
    }, 30000); // Every 30 seconds

    // Hourly risk profile updates
    setInterval(() => {
      this.updateAllRiskProfiles();
    }, 3600000); // Every hour

    // Daily cleanup and analysis
    setInterval(() => {
      this.performDailyAnalysis();
    }, 86400000); // Daily
  }

  private async performRealTimeAnalysis(): Promise<void> {
    // Analyze recent transaction patterns
    const recentTime = new Date(Date.now() - 300000); // Last 5 minutes
    
    for (const [userId, transactions] of this.transactionHistory) {
      const recentTransactions = transactions.filter(tx => tx.timestamp > recentTime);
      
      if (recentTransactions.length > 5) {
        await this.createFraudAlert(
          'velocity',
          'medium',
          userId,
          undefined,
          'High transaction velocity detected in real-time monitoring',
          60
        );
      }
    }
  }

  private async updateAllRiskProfiles(): Promise<void> {
    for (const userId of this.userRiskProfiles.keys()) {
      const transactions = this.transactionHistory.get(userId) || [];
      if (transactions.length > 0) {
        const lastTransaction = transactions[transactions.length - 1];
        await this.updateUserRiskProfile(userId, lastTransaction);
      }
    }
  }

  private async performDailyAnalysis(): Promise<void> {
    const analytics = await this.getFraudAnalytics('day');
    
    this.emit('dailyFraudReport', {
      date: new Date().toISOString().split('T')[0],
      analytics
    });

    // Clean up old alerts (keep 30 days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    for (const [alertId, alert] of this.fraudAlerts) {
      if (alert.timestamp < cutoffDate && alert.status === 'resolved') {
        this.fraudAlerts.delete(alertId);
      }
    }
  }

  // Public API Methods
  async getFraudAlerts(status?: FraudAlert['status']): Promise<FraudAlert[]> {
    const alerts = Array.from(this.fraudAlerts.values());
    return status ? alerts.filter(a => a.status === status) : alerts;
  }

  async getUserRestrictions(userId: string): Promise<UserRestriction[]> {
    const profile = await this.getUserRiskProfile(userId);
    return profile.restrictions;
  }

  async addSuspiciousIP(ipAddress: string): Promise<void> {
    this.suspiciousIPs.add(ipAddress);
    this.emit('suspiciousIPAdded', ipAddress);
  }

  async removeSuspiciousIP(ipAddress: string): Promise<void> {
    this.suspiciousIPs.delete(ipAddress);
    this.emit('suspiciousIPRemoved', ipAddress);
  }

  async createCustomFraudRule(rule: Omit<FraudRule, 'id'>): Promise<FraudRule> {
    const newRule: FraudRule = {
      ...rule,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.fraudRules.set(newRule.id, newRule);
    this.emit('fraudRuleCreated', newRule);
    return newRule;
  }

  async updateFraudRule(ruleId: string, updates: Partial<FraudRule>): Promise<FraudRule | null> {
    const rule = this.fraudRules.get(ruleId);
    if (!rule) return null;

    const updatedRule = { ...rule, ...updates };
    this.fraudRules.set(ruleId, updatedRule);
    this.emit('fraudRuleUpdated', updatedRule);
    return updatedRule;
  }
}