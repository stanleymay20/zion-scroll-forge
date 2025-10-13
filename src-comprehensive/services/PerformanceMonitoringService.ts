import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  timestamp: Date;
  system: SystemMetrics;
  application: ApplicationMetrics;
  database: DatabaseMetrics;
  network: NetworkMetrics;
  ai: AIMetrics;
  spiritual: SpiritualMetrics;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  loadAverage: number[];
  uptime: number;
}

export interface ApplicationMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
  throughput: number;
  cacheHitRatio: number;
}

export interface DatabaseMetrics {
  connectionCount: number;
  queryTime: number;
  slowQueries: number;
  lockWaitTime: number;
  indexEfficiency: number;
}

export interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  connectionErrors: number;
  cdnHitRatio: number;
}

export interface AIMetrics {
  responseTime: number;
  tokensPerSecond: number;
  modelAccuracy: number;
  spiritualAlignment: number;
  culturalAdaptation: number;
  propheticInsights: number;
}

export interface SpiritualMetrics {
  contentAlignment: number;
  propheticAccuracy: number;
  spiritualGrowthRate: number;
  prayerRequestsProcessed: number;
  divineInterventions: number;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  channels: AlertChannel[];
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'prophetic_alert';
  config: Record<string, any>;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface PerformanceReport {
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime: Date;
  endTime: Date;
  summary: PerformanceSummary;
  trends: PerformanceTrend[];
  recommendations: string[];
}

export interface PerformanceSummary {
  averageResponseTime: number;
  totalRequests: number;
  errorRate: number;
  uptime: number;
  spiritualAlignment: number;
}

export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'degrading' | 'stable';
  changePercent: number;
  significance: 'low' | 'medium' | 'high';
}

export class PerformanceMonitoringService extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, Alert> = new Map();
  private alertHistory: Alert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeDefaultAlertRules();
    this.startMonitoring();
  }

  private initializeDefaultAlertRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'high-cpu',
        name: 'High CPU Usage',
        metric: 'system.cpuUsage',
        condition: 'greater_than',
        threshold: 80,
        duration: 300, // 5 minutes
        severity: 'high',
        enabled: true,
        channels: [{ type: 'email', config: {} }]
      },
      {
        id: 'high-memory',
        name: 'High Memory Usage',
        metric: 'system.memoryUsage',
        condition: 'greater_than',
        threshold: 85,
        duration: 300,
        severity: 'high',
        enabled: true,
        channels: [{ type: 'email', config: {} }]
      },
      {
        id: 'slow-response',
        name: 'Slow Response Time',
        metric: 'application.averageResponseTime',
        condition: 'greater_than',
        threshold: 2000, // 2 seconds
        duration: 180, // 3 minutes
        severity: 'medium',
        enabled: true,
        channels: [{ type: 'slack', config: {} }]
      },
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        metric: 'application.errorRate',
        condition: 'greater_than',
        threshold: 5, // 5%
        duration: 120, // 2 minutes
        severity: 'critical',
        enabled: true,
        channels: [{ type: 'email', config: {} }, { type: 'sms', config: {} }]
      },
      {
        id: 'spiritual-misalignment',
        name: 'Spiritual Content Misalignment',
        metric: 'spiritual.contentAlignment',
        condition: 'less_than',
        threshold: 90, // 90%
        duration: 60, // 1 minute
        severity: 'critical',
        enabled: true,
        channels: [{ type: 'prophetic_alert', config: {} }]
      },
      {
        id: 'ai-performance-degradation',
        name: 'AI Performance Degradation',
        metric: 'ai.responseTime',
        condition: 'greater_than',
        threshold: 5000, // 5 seconds
        duration: 300,
        severity: 'high',
        enabled: true,
        channels: [{ type: 'email', config: {} }]
      }
    ];

    defaultRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlerts();
    }, 30000); // Collect metrics every 30 seconds
  }

  private async collectMetrics(): Promise<void> {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      system: await this.collectSystemMetrics(),
      application: await this.collectApplicationMetrics(),
      database: await this.collectDatabaseMetrics(),
      network: await this.collectNetworkMetrics(),
      ai: await this.collectAIMetrics(),
      spiritual: await this.collectSpiritualMetrics()
    };

    this.metrics.push(metrics);
    
    // Keep only last 24 hours of metrics (2880 data points at 30s intervals)
    if (this.metrics.length > 2880) {
      this.metrics = this.metrics.slice(-2880);
    }

    this.emit('metricsCollected', metrics);
  }

  private async collectSystemMetrics(): Promise<SystemMetrics> {
    // Simulate system metrics collection
    return {
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      diskUsage: Math.random() * 100,
      loadAverage: [Math.random() * 4, Math.random() * 4, Math.random() * 4],
      uptime: Date.now() - 1000000 // Simulate uptime
    };
  }

  private async collectApplicationMetrics(): Promise<ApplicationMetrics> {
    return {
      requestsPerSecond: Math.random() * 1000,
      averageResponseTime: Math.random() * 3000 + 100,
      errorRate: Math.random() * 10,
      activeUsers: Math.floor(Math.random() * 10000),
      throughput: Math.random() * 1000000,
      cacheHitRatio: Math.random() * 100
    };
  }

  private async collectDatabaseMetrics(): Promise<DatabaseMetrics> {
    return {
      connectionCount: Math.floor(Math.random() * 100),
      queryTime: Math.random() * 1000,
      slowQueries: Math.floor(Math.random() * 10),
      lockWaitTime: Math.random() * 100,
      indexEfficiency: Math.random() * 100
    };
  }

  private async collectNetworkMetrics(): Promise<NetworkMetrics> {
    return {
      bandwidth: Math.random() * 1000000000, // bytes/sec
      latency: Math.random() * 200 + 10,
      packetLoss: Math.random() * 5,
      connectionErrors: Math.floor(Math.random() * 10),
      cdnHitRatio: Math.random() * 100
    };
  }

  private async collectAIMetrics(): Promise<AIMetrics> {
    return {
      responseTime: Math.random() * 8000 + 500,
      tokensPerSecond: Math.random() * 100,
      modelAccuracy: Math.random() * 20 + 80, // 80-100%
      spiritualAlignment: Math.random() * 10 + 90, // 90-100%
      culturalAdaptation: Math.random() * 20 + 80,
      propheticInsights: Math.random() * 100
    };
  }

  private async collectSpiritualMetrics(): Promise<SpiritualMetrics> {
    return {
      contentAlignment: Math.random() * 10 + 90, // 90-100%
      propheticAccuracy: Math.random() * 20 + 80,
      spiritualGrowthRate: Math.random() * 100,
      prayerRequestsProcessed: Math.floor(Math.random() * 1000),
      divineInterventions: Math.floor(Math.random() * 10)
    };
  }

  private evaluateAlerts(): void {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    for (const [ruleId, rule] of this.alertRules) {
      if (!rule.enabled) continue;

      const value = this.getMetricValue(latestMetrics, rule.metric);
      const shouldAlert = this.evaluateCondition(value, rule.condition, rule.threshold);

      if (shouldAlert) {
        this.handleAlert(rule, value);
      } else {
        this.resolveAlert(ruleId);
      }
    }
  }

  private getMetricValue(metrics: PerformanceMetrics, metricPath: string): number {
    const parts = metricPath.split('.');
    let value: any = metrics;
    
    for (const part of parts) {
      value = value[part];
      if (value === undefined) return 0;
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateCondition(value: number, condition: string, threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  private handleAlert(rule: AlertRule, value: number): void {
    const existingAlert = this.activeAlerts.get(rule.id);
    
    if (!existingAlert) {
      const alert: Alert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        severity: rule.severity,
        message: `${rule.name}: ${value.toFixed(2)} ${rule.condition.replace('_', ' ')} ${rule.threshold}`,
        value,
        threshold: rule.threshold,
        timestamp: new Date(),
        resolved: false
      };

      this.activeAlerts.set(rule.id, alert);
      this.alertHistory.push(alert);
      this.sendAlert(alert, rule.channels);
      this.emit('alertTriggered', alert);
    }
  }

  private resolveAlert(ruleId: string): void {
    const alert = this.activeAlerts.get(ruleId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.activeAlerts.delete(ruleId);
      this.emit('alertResolved', alert);
    }
  }

  private async sendAlert(alert: Alert, channels: AlertChannel[]): Promise<void> {
    for (const channel of channels) {
      try {
        await this.sendToChannel(alert, channel);
      } catch (error) {
        console.error(`Failed to send alert to ${channel.type}:`, error);
      }
    }
  }

  private async sendToChannel(alert: Alert, channel: AlertChannel): Promise<void> {
    switch (channel.type) {
      case 'email':
        await this.sendEmailAlert(alert, channel.config);
        break;
      case 'slack':
        await this.sendSlackAlert(alert, channel.config);
        break;
      case 'webhook':
        await this.sendWebhookAlert(alert, channel.config);
        break;
      case 'sms':
        await this.sendSMSAlert(alert, channel.config);
        break;
      case 'prophetic_alert':
        await this.sendPropheticAlert(alert, channel.config);
        break;
    }
  }

  private async sendEmailAlert(alert: Alert, config: any): Promise<void> {
    // Simulate email sending
    console.log(`Email alert sent: ${alert.message}`);
  }

  private async sendSlackAlert(alert: Alert, config: any): Promise<void> {
    // Simulate Slack notification
    console.log(`Slack alert sent: ${alert.message}`);
  }

  private async sendWebhookAlert(alert: Alert, config: any): Promise<void> {
    // Simulate webhook call
    console.log(`Webhook alert sent: ${alert.message}`);
  }

  private async sendSMSAlert(alert: Alert, config: any): Promise<void> {
    // Simulate SMS sending
    console.log(`SMS alert sent: ${alert.message}`);
  }

  private async sendPropheticAlert(alert: Alert, config: any): Promise<void> {
    // Special handling for spiritual/prophetic alerts
    console.log(`🙏 PROPHETIC ALERT: ${alert.message} - Requires immediate spiritual oversight`);
    this.emit('propheticAlert', alert);
  }

  async generateReport(period: 'hourly' | 'daily' | 'weekly' | 'monthly'): Promise<PerformanceReport> {
    const now = new Date();
    const startTime = this.getReportStartTime(now, period);
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);

    const summary = this.calculateSummary(relevantMetrics);
    const trends = this.calculateTrends(relevantMetrics, period);
    const recommendations = this.generateRecommendations(summary, trends);

    return {
      period,
      startTime,
      endTime: now,
      summary,
      trends,
      recommendations
    };
  }

  private getReportStartTime(now: Date, period: string): Date {
    const start = new Date(now);
    switch (period) {
      case 'hourly':
        start.setHours(start.getHours() - 1);
        break;
      case 'daily':
        start.setDate(start.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(start.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(start.getMonth() - 1);
        break;
    }
    return start;
  }

  private calculateSummary(metrics: PerformanceMetrics[]): PerformanceSummary {
    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        uptime: 0,
        spiritualAlignment: 0
      };
    }

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.application.averageResponseTime, 0) / metrics.length;
    const totalRequests = metrics.reduce((sum, m) => sum + m.application.requestsPerSecond, 0);
    const avgErrorRate = metrics.reduce((sum, m) => sum + m.application.errorRate, 0) / metrics.length;
    const avgSpiritualAlignment = metrics.reduce((sum, m) => sum + m.spiritual.contentAlignment, 0) / metrics.length;

    return {
      averageResponseTime: avgResponseTime,
      totalRequests: totalRequests,
      errorRate: avgErrorRate,
      uptime: 99.9, // Calculate based on downtime events
      spiritualAlignment: avgSpiritualAlignment
    };
  }

  private calculateTrends(metrics: PerformanceMetrics[], period: string): PerformanceTrend[] {
    // Simple trend calculation - compare first half vs second half
    const midpoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, midpoint);
    const secondHalf = metrics.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) return [];

    const trends: PerformanceTrend[] = [];

    // Response time trend
    const firstAvgResponse = firstHalf.reduce((sum, m) => sum + m.application.averageResponseTime, 0) / firstHalf.length;
    const secondAvgResponse = secondHalf.reduce((sum, m) => sum + m.application.averageResponseTime, 0) / secondHalf.length;
    const responseChange = ((secondAvgResponse - firstAvgResponse) / firstAvgResponse) * 100;

    trends.push({
      metric: 'Response Time',
      trend: responseChange > 5 ? 'degrading' : responseChange < -5 ? 'improving' : 'stable',
      changePercent: responseChange,
      significance: Math.abs(responseChange) > 20 ? 'high' : Math.abs(responseChange) > 10 ? 'medium' : 'low'
    });

    return trends;
  }

  private generateRecommendations(summary: PerformanceSummary, trends: PerformanceTrend[]): string[] {
    const recommendations: string[] = [];

    if (summary.averageResponseTime > 1000) {
      recommendations.push('Consider implementing caching strategies to improve response times');
    }

    if (summary.errorRate > 2) {
      recommendations.push('Investigate and fix sources of application errors');
    }

    if (summary.spiritualAlignment < 95) {
      recommendations.push('Review AI content filters and spiritual alignment mechanisms');
    }

    const degradingTrends = trends.filter(t => t.trend === 'degrading' && t.significance === 'high');
    if (degradingTrends.length > 0) {
      recommendations.push(`Address degrading performance in: ${degradingTrends.map(t => t.metric).join(', ')}`);
    }

    return recommendations;
  }

  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('alertRuleAdded', rule);
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.alertRules.get(ruleId);
    if (rule) {
      const updatedRule = { ...rule, ...updates };
      this.alertRules.set(ruleId, updatedRule);
      this.emit('alertRuleUpdated', updatedRule);
    }
  }

  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
    this.resolveAlert(ruleId);
    this.emit('alertRuleRemoved', ruleId);
  }

  getMetrics(startTime?: Date, endTime?: Date): PerformanceMetrics[] {
    let filteredMetrics = this.metrics;

    if (startTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= startTime);
    }

    if (endTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= endTime);
    }

    return filteredMetrics;
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values());
  }

  getAlertHistory(): Alert[] {
    return this.alertHistory.slice(-100); // Last 100 alerts
  }

  getAlertRules(): AlertRule[] {
    return Array.from(this.alertRules.values());
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

export default PerformanceMonitoringService;