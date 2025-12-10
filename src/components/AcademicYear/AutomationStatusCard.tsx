import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Calendar, 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle,
  PlayCircle,
  PauseCircle,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutomationJob {
  id: string;
  name: string;
  description: string;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
  enabled: boolean;
}

interface AutomationStatusCardProps {
  jobs?: AutomationJob[];
  onToggle?: (jobId: string, enabled: boolean) => void;
}

const defaultJobs: AutomationJob[] = [
  {
    id: 'daily-progress',
    name: 'Daily Progress Check',
    description: 'Updates student progress and sends reminders for overdue tasks',
    schedule: 'Daily at 6:00 AM',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    enabled: true,
  },
  {
    id: 'weekly-scheduling',
    name: 'Weekly Schedule Validation',
    description: 'Validates class schedules and detects conflicts',
    schedule: 'Every Sunday at 12:00 AM',
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    enabled: true,
  },
  {
    id: 'assignment-reminders',
    name: 'Assignment Reminders',
    description: 'Sends reminders 3 days before assignment due dates',
    schedule: 'Daily at 9:00 AM',
    lastRun: new Date().toISOString(),
    nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    enabled: true,
  },
  {
    id: 'billing-sync',
    name: 'Monthly Billing Sync',
    description: 'Syncs tuition billing with payment systems',
    schedule: '1st of each month',
    lastRun: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    enabled: true,
  },
  {
    id: 'semester-routines',
    name: 'Semester Start/End Routines',
    description: 'Handles semester transitions and course closures',
    schedule: 'On semester dates',
    status: 'paused',
    enabled: false,
  },
  {
    id: 'graduation-processor',
    name: 'Graduation Eligibility Processor',
    description: 'Checks and updates graduation eligibility for all students',
    schedule: 'Weekly on Fridays',
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    enabled: true,
  },
];

export const AutomationStatusCard = ({ jobs = defaultJobs, onToggle }: AutomationStatusCardProps) => {
  const activeJobs = jobs.filter((j) => j.enabled && j.status === 'active').length;
  const totalJobs = jobs.length;

  const getStatusIcon = (status: AutomationJob['status']) => {
    switch (status) {
      case 'active':
        return <PlayCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: AutomationJob['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Paused</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Automation Status</CardTitle>
              <p className="text-sm text-muted-foreground">
                {activeJobs} of {totalJobs} jobs active
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <RefreshCcw className="h-3 w-3" />
            System Healthy
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={cn(
                'p-4 rounded-lg border transition-colors',
                job.enabled ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(job.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{job.name}</p>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.schedule}
                      </span>
                      {job.lastRun && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Last: {formatTime(job.lastRun)}
                        </span>
                      )}
                      {job.nextRun && job.enabled && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Next: {formatTime(job.nextRun)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={job.enabled}
                  onCheckedChange={(enabled) => onToggle?.(job.id, enabled)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
