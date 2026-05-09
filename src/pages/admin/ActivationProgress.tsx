import { useEffect, useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { BackButton } from "@/components/layout/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, ScrollText, Compass, GraduationCap, Replace } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TOTAL_ORIENTATION_STEPS = 9;

interface Row {
  user_id: string;
  full_name: string | null;
  email: string | null;
  student_id_code: string | null;
  application_status: string | null;
  lifecycle_status: string | null;
  orientation_done: number;
  matriculated: boolean;
  enrolled_count: number;
}

export default function ActivationProgress() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    (async () => {
      const { data: students } = await supabase
        .from("students")
        .select("user_id, full_name, email, student_id_code, application_status")
        .in("application_status", ["accepted", "submitted"])
        .order("created_at", { ascending: false })
        .limit(500);

      const userIds = (students ?? []).map((s) => s.user_id).filter(Boolean) as string[];
      if (userIds.length === 0) {
        setRows([]); setLoading(false); return;
      }

      const [profilesRes, orientRes, matricRes, enrollRes] = await Promise.all([
        supabase.from("profiles").select("id, lifecycle_status").in("id", userIds),
        supabase.from("orientation_progress").select("user_id, step").in("user_id", userIds),
        supabase.from("matriculation_records").select("user_id").in("user_id", userIds),
        supabase.from("enrollments").select("user_id").in("user_id", userIds),
      ]);

      const lifecycleByUser = new Map((profilesRes.data ?? []).map((p) => [p.id, p.lifecycle_status]));
      const orientByUser = new Map<string, number>();
      (orientRes.data ?? []).forEach((r) => orientByUser.set(r.user_id, (orientByUser.get(r.user_id) ?? 0) + 1));
      const matricSet = new Set((matricRes.data ?? []).map((m) => m.user_id));
      const enrollByUser = new Map<string, number>();
      (enrollRes.data ?? []).forEach((e) => enrollByUser.set(e.user_id, (enrollByUser.get(e.user_id) ?? 0) + 1));

      const built: Row[] = (students ?? []).map((s) => ({
        user_id: s.user_id!,
        full_name: s.full_name,
        email: s.email,
        student_id_code: s.student_id_code,
        application_status: s.application_status,
        lifecycle_status: lifecycleByUser.get(s.user_id!) ?? null,
        orientation_done: orientByUser.get(s.user_id!) ?? 0,
        matriculated: matricSet.has(s.user_id!),
        enrolled_count: enrollByUser.get(s.user_id!) ?? 0,
      }));

      setRows(built);
      setLoading(false);
    })();
  }, []);

  const filtered = rows.filter((r) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      (r.full_name ?? "").toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.student_id_code ?? "").toLowerCase().includes(q)
    );
  });

  const totals = {
    accepted: rows.filter((r) => r.application_status === "accepted").length,
    orientationDone: rows.filter((r) => r.orientation_done >= TOTAL_ORIENTATION_STEPS).length,
    matriculated: rows.filter((r) => r.matriculated).length,
    activated: rows.filter((r) => r.enrolled_count > 0).length,
  };

  return (
    <PageTemplate title="Activation Progress" description="Post-acceptance student journey">
      <div className="max-w-6xl mx-auto space-y-5">
        <BackButton fallbackTo="/admin" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={Users} label="Accepted" value={totals.accepted} />
          <Stat icon={Compass} label="Orientation Done" value={totals.orientationDone} />
          <Stat icon={ScrollText} label="Matriculated" value={totals.matriculated} />
          <Stat icon={GraduationCap} label="First Enrollment" value={totals.activated} />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Admitted Students
            </CardTitle>
            <div className="relative mt-2">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or student ID…"
                className="pl-8"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No students match.</p>
            ) : (
              <ul className="divide-y">
                {filtered.map((r) => {
                  const orientPct = (r.orientation_done / TOTAL_ORIENTATION_STEPS) * 100;
                  return (
                    <li key={r.user_id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{r.full_name ?? r.email ?? "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {r.student_id_code ?? "No ID"} · {r.email ?? "—"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{r.lifecycle_status ?? r.application_status ?? "applicant"}</Badge>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Compass className="h-3.5 w-3.5 text-muted-foreground" />
                          <Progress value={orientPct} className="w-20 h-1.5" />
                          <span className="text-muted-foreground tabular-nums">
                            {r.orientation_done}/{TOTAL_ORIENTATION_STEPS}
                          </span>
                        </div>
                        <Badge variant={r.matriculated ? "default" : "secondary"}>
                          {r.matriculated ? "Matriculated" : "Not matriculated"}
                        </Badge>
                        <Badge variant={r.enrolled_count > 0 ? "default" : "outline"}>
                          {r.enrolled_count} enrolled
                        </Badge>
                        <ReassignButton userId={r.user_id} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-serif">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReassignButton({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [programs, setPrograms] = useState<{ id: string; title: string }[]>([]);
  const [target, setTarget] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || programs.length) return;
    supabase
      .from("degree_programs")
      .select("id,title")
      .eq("is_active", true)
      .order("title")
      .then(({ data }) => setPrograms((data ?? []) as any));
  }, [open, programs.length]);

  if (!open) {
    return (
      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
        <Replace className="h-3.5 w-3.5 mr-1" /> Reassign
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 w-full sm:w-auto">
      <Select value={target} onValueChange={setTarget}>
        <SelectTrigger className="h-8 text-xs min-w-[180px]"><SelectValue placeholder="New program" /></SelectTrigger>
        <SelectContent>
          {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button
        size="sm" className="h-8 text-xs" disabled={!target || busy}
        onClick={async () => {
          setBusy(true);
          const { error } = await supabase.rpc("admin_reassign_program", { p_user_id: userId, p_new_program_id: target, p_reason: "Admin override" });
          setBusy(false);
          if (error) { toast.error("Reassignment failed", { description: error.message.replace(/.*?: /,'') }); return; }
          toast.success("Program reassigned");
          setOpen(false); setTarget("");
        }}
      >Apply</Button>
      <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setOpen(false)}>Cancel</Button>
    </div>
  );
}