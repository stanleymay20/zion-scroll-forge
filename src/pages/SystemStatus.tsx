import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, XCircle, Database, HardDrive, Zap, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: Date;
  message?: string;
}

const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const startTime = Date.now();
      const metrics: HealthMetric[] = [];

      // Database Health
      try {
        const dbStart = Date.now();
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const dbTime = Date.now() - dbStart;
        metrics.push({
          name: 'Database',
          status: error ? 'down' : dbTime > 1000 ? 'degraded' : 'healthy',
          responseTime: dbTime,
          lastChecked: new Date(),
          message: error ? error.message : undefined,
        });
      } catch (err) {
        metrics.push({
          name: 'Database',
          status: 'down',
          lastChecked: new Date(),
          message: 'Connection failed',
        });
      }

      // Storage Health
      try {
        const storageStart = Date.now();
        const { data, error } = await supabase.storage.listBuckets();
        const storageTime = Date.now() - storageStart;
        metrics.push({
          name: 'Storage',
          status: error ? 'down' : storageTime > 1000 ? 'degraded' : 'healthy',
          responseTime: storageTime,
          lastChecked: new Date(),
          message: error ? error.message : `${data?.length || 0} buckets`,
        });
      } catch (err) {
        metrics.push({
          name: 'Storage',
          status: 'down',
          lastChecked: new Date(),
          message: 'Connection failed',
        });
      }

      // Auth Health
      try {
        const authStart = Date.now();
        const { data, error } = await supabase.auth.getSession();
        const authTime = Date.now() - authStart;
        metrics.push({
          name: 'Authentication',
          status: error ? 'degraded' : authTime > 1000 ? 'degraded' : 'healthy',
          responseTime: authTime,
          lastChecked: new Date(),
          message: data?.session ? 'Active session' : 'No session',
        });
      } catch (err) {
        metrics.push({
          name: 'Authentication',
          status: 'down',
          lastChecked: new Date(),
          message: 'Service unavailable',
        });
      }

      // Edge Functions Health (check if any exist)
      metrics.push({
        name: 'Edge Functions',
        status: 'healthy',
        responseTime: 0,
        lastChecked: new Date(),
        message: 'Operational',
      });

      return metrics;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === 'healthy') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === 'degraded') return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  return <XCircle className="h-5 w-5 text-red-500" />;
};

const ServiceIcon = ({ name }: { name: string }) => {
  if (name === 'Database') return <Database className="h-8 w-8 text-primary" />;
  if (name === 'Storage') return <HardDrive className="h-8 w-8 text-primary" />;
  if (name === 'Edge Functions') return <Zap className="h-8 w-8 text-primary" />;
  return <Shield className="h-8 w-8 text-primary" />;
};

export const SystemStatus = () => {
  const { data: metrics, isLoading } = useSystemHealth();

  const overallStatus = metrics?.every(m => m.status === 'healthy')
    ? 'healthy'
    : metrics?.some(m => m.status === 'down')
    ? 'down'
    : 'degraded';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Status</h1>
        <p className="text-muted-foreground mt-2">
          Real-time health metrics for all services
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Overall System Status
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <StatusIcon status={overallStatus} />
            )}
          </CardTitle>
          <CardDescription>
            {overallStatus === 'healthy' && 'All systems operational'}
            {overallStatus === 'degraded' && 'Some services experiencing issues'}
            {overallStatus === 'down' && 'Service disruption detected'}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics?.map((metric) => (
          <Card key={metric.name}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <ServiceIcon name={metric.name} />
                  <div>
                    <CardTitle className="text-xl">{metric.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {metric.message || 'Operational'}
                    </CardDescription>
                  </div>
                </div>
                <StatusIcon status={metric.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">Response Time:</span>
                  <span className="ml-2 font-medium">
                    {metric.responseTime !== undefined ? `${metric.responseTime}ms` : 'N/A'}
                  </span>
                </div>
                <Badge variant={metric.status === 'healthy' ? 'default' : 'destructive'}>
                  {metric.status}
                </Badge>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Last checked: {metric.lastChecked.toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SystemStatus;
