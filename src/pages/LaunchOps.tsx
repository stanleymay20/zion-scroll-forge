import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLaunchOpsMetrics, useCohortStatus } from '@/hooks/useLaunchOps';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Users, GraduationCap, BookOpen, FileCheck, Award,
  Activity, AlertTriangle, Sparkles, ClipboardList, CheckCircle2
} from 'lucide-react';

const StatCard = ({
  icon: Icon, label, value, hint,
}: { icon: any; label: string; value: number | string; hint?: string }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-3xl font-serif font-bold mt-1">{value}</p>
          {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
        </div>
        <Icon className="h-5 w-5 text-primary opacity-70" />
      </div>
    </CardContent>
  </Card>
);

export default function LaunchOps() {
  const { data: m, isLoading, error } = useLaunchOpsMetrics();
  const { data: cohort } = useCohortStatus();

  if (isLoading) {
    return <PageTemplate title="Launch Ops" description="Loading…"><div /></PageTemplate>;
  }
  if (error || !m) {
    return (
      <PageTemplate title="Launch Ops" description="Admin access required">
        <Card><CardContent className="py-10 text-center text-muted-foreground">
          You need admin role to view launch metrics.
        </CardContent></Card>
      </PageTemplate>
    );
  }

  const c = cohort ?? m.cohort;
  const pct = c ? Math.min(100, Math.round((c.admitted / c.cohort_cap) * 100)) : 0;

  return (
    <PageTemplate
      title="Controlled Launch Ops"
      description="Live operational health of ScrollUniversity's beta cohort"
    >
      {c && (
        <Card className="mb-6 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                {c.cohort_label}
              </CardTitle>
              <Badge variant={c.is_open ? 'default' : 'secondary'}>
                {c.is_open ? 'Open' : 'Closed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>{c.admitted} / {c.cohort_cap} admitted</span>
              <span className="text-muted-foreground">{c.seats_remaining} seats remaining</span>
            </div>
            <Progress value={pct} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={ClipboardList} label="Applications" value={m.applications_received}
          hint={`${m.applications_submitted} pending`} />
        <StatCard icon={CheckCircle2} label="Admitted" value={m.students_admitted} />
        <StatCard icon={Users} label="Enrolled" value={m.students_enrolled} />
        <StatCard icon={Activity} label="Active Learners" value={m.active_learners} />
        <StatCard icon={BookOpen} label="Courses Started" value={m.courses_started} />
        <StatCard icon={FileCheck} label="Modules Completed" value={m.modules_completed} />
        <StatCard icon={ClipboardList} label="Assignments" value={m.assignments_submitted} />
        <StatCard icon={Award} label="Certificates" value={m.certificates_generated} />
        <StatCard icon={GraduationCap} label="Graduations" value={m.graduations} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Recent Failed Lifecycle Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {m.recent_audit_failures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent failures recorded.</p>
          ) : (
            <ul className="divide-y">
              {m.recent_audit_failures.map((f, i) => (
                <li key={i} className="py-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{f.action_type} • {f.entity_type}</span>
                    <span className="text-muted-foreground">{new Date(f.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-muted-foreground text-xs">{f.reason}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground mt-6 text-right">
        Last refreshed: {new Date(m.generated_at).toLocaleTimeString()}
      </p>
    </PageTemplate>
  );
}
