/**
 * System Health Overview Component
 * Displays real-time system health metrics and alerts
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Server,
  Database,
  HardDrive,
  Cpu,
  Network,
  Bell,
  BellOff,
} from 'lucide-react';
import adminService from '@/services/adminService';
import type { SystemHealth, ServiceHealth, SystemAlert } from '@/types/admin';

export const SystemHealthOverview: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSystemHealth();
    const interval = setInterval(loadSystemHealth, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      const data = await adminService.getSystemHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await adminService.acknowledgeAlert(alertId);
      await loadSystemHealth();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'critical':
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'up':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
      case 'down':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'Failed to load system health'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(health.status)}
                System Status
              </CardTitle>
              <CardDescription>
                Last updated: {new Date(health.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(health.status)}>
              {health.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Active Alerts */}
      {health.alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Active Alerts ({health.alerts.filter(a => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health.alerts
              .filter(a => !a.acknowledged)
              .map((alert) => (
                <Alert key={alert.id} className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{alert.source}</span>
                      </div>
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription>{alert.message}</AlertDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      <BellOff className="h-4 w-4" />
                    </Button>
                  </div>
                </Alert>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Response: {service.responseTime}ms | Uptime: {service.uptime.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CPU & Memory */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              CPU & Memory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">CPU Usage</span>
                <span className="text-sm text-muted-foreground">
                  {health.metrics.cpu.usage.toFixed(1)}%
                </span>
              </div>
              <Progress value={health.metrics.cpu.usage} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Memory Usage</span>
                <span className="text-sm text-muted-foreground">
                  {health.metrics.memory.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={health.metrics.memory.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {(health.metrics.memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / 
                {(health.metrics.memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database & Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Database Connections</span>
                <span className="text-sm text-muted-foreground">
                  {health.metrics.database.connections} / {health.metrics.database.maxConnections}
                </span>
              </div>
              <Progress 
                value={(health.metrics.database.connections / health.metrics.database.maxConnections) * 100} 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-muted-foreground">
                  {health.metrics.storage.percentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={health.metrics.storage.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {(health.metrics.storage.used / 1024 / 1024 / 1024).toFixed(2)} GB / 
                {(health.metrics.storage.total / 1024 / 1024 / 1024).toFixed(2)} GB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium mb-1">Requests/Min</p>
                <p className="text-2xl font-bold">{health.metrics.network.requestsPerMinute}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Active Connections</p>
                <p className="text-2xl font-bold">{health.metrics.network.activeConnections}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Bandwidth</p>
                <p className="text-2xl font-bold">
                  {(health.metrics.network.bandwidth / 1024 / 1024).toFixed(2)} MB/s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
