import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { BackButton } from "@/components/layout/BackButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IdCard, GraduationCap, Mail, Hash, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Identity {
  full_name: string | null;
  student_id_code: string | null;
  institutional_email: string | null;
  cohort_number: number | null;
  cohort_label: string | null;
  program_name: string | null;
  application_status: string | null;
  lifecycle_status: string | null;
  matriculated: boolean;
  matriculation_cert: string | null;
}

const STATUS_TONE: Record<string, string> = {
  accepted: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  admitted: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  enrolled: "bg-primary/15 text-primary border-primary/30",
  active: "bg-primary/15 text-primary border-primary/30",
  applicant: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  submitted: "bg-amber-500/15 text-amber-700 border-amber-500/30",
};

export default function StudentIdentity() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<Identity | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [profileRes, studentRes, matricRes, cohortRes] = await Promise.all([
        supabase.from("profiles").select("full_name, lifecycle_status").eq("id", user.id).maybeSingle(),
        supabase.from("students").select("id, full_name, student_id_code, institutional_email, cohort_number, application_status, degree_program_id").eq("user_id", user.id).maybeSingle(),
        supabase.from("matriculation_records").select("cert_number, cohort_label").eq("user_id", user.id).maybeSingle(),
        supabase.from("launch_settings").select("cohort_label").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

      let programName: string | null = null;
      if (studentRes.data?.degree_program_id) {
        const { data: prog } = await supabase
          .from("degree_programs")
          .select("name")
          .eq("id", studentRes.data.degree_program_id)
          .maybeSingle();
        programName = prog?.name ?? null;
      }

      setIdentity({
        full_name: studentRes.data?.full_name ?? profileRes.data?.full_name ?? user.email ?? "Student",
        student_id_code: studentRes.data?.student_id_code ?? null,
        institutional_email: studentRes.data?.institutional_email ?? null,
        cohort_number: studentRes.data?.cohort_number ?? null,
        cohort_label: matricRes.data?.cohort_label ?? cohortRes.data?.cohort_label ?? "Inaugural Cohort",
        program_name: programName,
        application_status: studentRes.data?.application_status ?? null,
        lifecycle_status: profileRes.data?.lifecycle_status ?? null,
        matriculated: !!matricRes.data,
        matriculation_cert: matricRes.data?.cert_number ?? null,
      });
      setLoading(false);
    })();
  }, [user?.id, user?.email]);

  if (loading) {
    return (
      <PageTemplate title="Student Identity" description="Your official ScrollUniversity record">
        <Skeleton className="h-64 w-full rounded-xl max-w-3xl mx-auto" />
      </PageTemplate>
    );
  }

  if (!identity?.student_id_code) {
    return (
      <PageTemplate title="Student Identity" description="Your official ScrollUniversity record">
        <div className="max-w-2xl mx-auto space-y-4">
          <BackButton fallbackTo="/dashboard" />
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <IdCard className="h-10 w-10 text-muted-foreground mx-auto" />
              <h3 className="font-serif text-lg">No student identity issued yet</h3>
              <p className="text-sm text-muted-foreground">
                Your Student ID and institutional email are issued during matriculation.
              </p>
              <Button asChild>
                <Link to="/matriculation">Continue to Matriculation <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageTemplate>
    );
  }

  const statusLabel = identity.lifecycle_status ?? identity.application_status ?? "applicant";
  const tone = STATUS_TONE[statusLabel] ?? "bg-muted text-muted-foreground border-transparent";

  return (
    <PageTemplate title="Student Identity" description="Your official ScrollUniversity record">
      <div className="max-w-3xl mx-auto space-y-5">
        <BackButton fallbackTo="/dashboard" />

        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2 font-serif">
                <IdCard className="h-5 w-5 text-primary" /> {identity.full_name}
              </CardTitle>
              <Badge variant="outline" className={tone}>{statusLabel}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 grid sm:grid-cols-2 gap-4">
            <Field icon={Hash} label="Student ID" value={identity.student_id_code} mono />
            <Field icon={Mail} label="Institutional Email" value={identity.institutional_email} mono breakAll />
            <Field
              icon={Sparkles}
              label="Cohort"
              value={
                identity.cohort_number
                  ? `${identity.cohort_label} · #${identity.cohort_number}`
                  : identity.cohort_label
              }
            />
            <Field icon={GraduationCap} label="Program" value={identity.program_name ?? "Awaiting placement"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-base">
              <ShieldCheck className="h-4 w-4 text-primary" /> Matriculation
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {identity.matriculated ? (
              <>
                <p>You are an officially matriculated ScrollUniversity scholar.</p>
                {identity.matriculation_cert && (
                  <p className="text-xs text-muted-foreground">
                    Certificate: <span className="font-mono">{identity.matriculation_cert}</span>
                  </p>
                )}
              </>
            ) : (
              <>
                <p>You have not yet completed matriculation.</p>
                <Button asChild size="sm" className="mt-1">
                  <Link to="/matriculation">Sign the Student Oath <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}

function Field({
  icon: Icon, label, value, mono, breakAll,
}: { icon: any; label: string; value: string | null; mono?: boolean; breakAll?: boolean }) {
  return (
    <div className="border rounded-md p-3">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</p>
      <p className={`text-sm mt-1 ${mono ? "font-mono" : "font-medium"} ${breakAll ? "break-all" : ""}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}
