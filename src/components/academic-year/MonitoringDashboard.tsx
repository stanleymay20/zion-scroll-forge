/**
 * Academic Year Monitoring Dashboard
 * Real-time monitoring and alerting interface
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Users,
  Calendar,
  BookOpen,
  Workflow,
  Bot
} from 'lucide-react';

interface SystemHealth {
  timestamp: string;
  components: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'critical';
      uptime: number;
      errorRate: number;
      responseTime: number;
      lastCheck: string;
      issues: string[];
    };
  };
  overallStatus: 'healthy' | 'degraded' | 'critical';
}

interface WorkflowDashboard {
  totalWorkflows: number;
  runningWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageDuration: number;
  successRate: number;
}

interface AgentDashboard {
  totalAgents: number;
  totalRequests: number;
  averageSuccessRate: number;
  averageResponseTime: number;
  averageConfidence: number;
  agentPerformance: Array<{
    agentName: string;
    successRate: number;
    responseTime: number;
    confidence: number;
  }>;
}

interface AlertData {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ruleName: string;
  message: string;
  triggeredAt: string;
  status: 'active' | 'resolved' | 'acknowledged';
}

export const MonitoringDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [workflowDashboard, setWorkflowDashboard] = useState<WorkflowDashboard | null>(null);
  const [agentDashboard, setAgentDashboard] = useState<AgentDashboard | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    if (autoRefresh) {
      const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/academic-year-monitoring/dashboard');
      const result = await response.json();

      if (result.success) {
        setSystemHealth(result.data.systemHealth);
        setWorkflowDashboard(result.data.workflows);
        setAgentDashboard(result.data.agents);
        setAlerts(result.data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive',
      critical: 'destructive'
    };

    return (
      <Badge variant={variants[severity] || 'default'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await fetch(`/api/academic-year-monitoring/alerts/${alertId}/acknowledge`, {
        method: 'POST'
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await fetch(`/api/academic-year-monitoring/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Academic Year Monitoring</h1>
          <p className="text-muted-foreground">Real-time system health and performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          <Button onClick={fetchDashboardData}>
            Refresh Now
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(systemHealth.overallStatus)}
              System Health
            </CardTitle>
            <CardDescription>
              Overall system status: {systemHealth.overallStatus.toUpperCase()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(systemHealth.components).map(([name, component]) => (
                <Card key={name}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {getStatusIcon(component.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Error Rate:</span>
                        <span className={component.errorRate > 0.05 ? 'text-red-600' : ''}>
                          {(component.errorRate * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response Time:</span>
                        <span>{component.responseTime.toFixed(0)}ms</span>
                      </div>
                      {component.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-red-600 font-medium">Issues:</p>
                          <ul className="list-disc list-inside text-xs">
                            {component.issues.map((issue, idx) => (
                              <li key={idx}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Bot className="h-4 w-4 mr-2" />
            AI Agents
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        {/* Workflow Dashboard */}
        <TabsContent value="workflows">
          {workflowDashboard && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{workflowDashboard.totalWorkflows}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Running</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {workflowDashboard.runningWorkflows}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {(workflowDashboard.successRate * 100).toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {workflowDashboard.completedWorkflows}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Failed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">
                    {workflowDashboard.failedWorkflows}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Avg Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {(workflowDashboard.averageDuration / 1000).toFixed(1)}s
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* AI Agent Dashboard */}
        <TabsContent value="agents">
          {agentDashboard && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Total Agents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{agentDashboard.totalAgents}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Total Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{agentDashboard.totalRequests}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {(agentDashboard.averageSuccessRate * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Avg Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {(agentDashboard.averageConfidence * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agentDashboard.agentPerformance.map((agent) => (
                      <div key={agent.agentName} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{agent.agentName}</h4>
                          <Badge variant={agent.successRate > 0.9 ? 'default' : 'destructive'}>
                            {(agent.successRate * 100).toFixed(1)}% Success
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Response Time</p>
                            <p className="font-medium">{agent.responseTime.toFixed(0)}ms</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Confidence</p>
                            <p className="font-medium">{(agent.confidence * 100).toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Status</p>
                            <p className="font-medium">
                              {agent.successRate > 0.9 ? '✓ Healthy' : '⚠ Degraded'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Alerts */}
        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>No active alerts</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'critical' || alert.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.ruleName}</span>
                    {getSeverityBadge(alert.severity)}
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        </>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Badge variant="secondary">Acknowledged</Badge>
                      )}
                      {alert.status === 'resolved' && (
                        <Badge variant="default">Resolved</Badge>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
