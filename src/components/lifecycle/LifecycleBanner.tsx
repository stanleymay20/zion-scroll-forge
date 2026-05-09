import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, ScrollText, ArrowRight, IdCard, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LifecycleStepper } from "@/components/lifecycle/LifecycleStepper";

const TOTAL_ORIENTATION_STEPS = 9;

export function LifecycleBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(null);
  const [orientationDone, setOrientationDone] = useState<number>(0);
  const [matriculated, setMatriculated] = useState<boolean>(false);
  const [enrollmentCount, setEnrollmentCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [profileRes, orientRes, matricRes, enrollRes] = await Promise.all([
        supabase.from("profiles").select("lifecycle_status").eq("id", user.id).maybeSingle(),
        supabase.from("orientation_progress").select("step", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("matriculation_records").select("user_id").eq("user_id", user.id).maybeSingle(),
        supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStatus(profileRes.data?.lifecycle_status ?? "applicant");
      setOrientationDone(orientRes.count ?? 0);
      setMatriculated(!!matricRes.data);
      setEnrollmentCount(enrollRes.count ?? 0);
    })();
  }, [user?.id]);

  if (!user) return null;

  const orientationComplete = orientationDone >= TOTAL_ORIENTATION_STEPS;

  // CTA priority: orientation → matriculation → first course → none
  let cta: { to: string; icon: any; label: string; sub: string } | null = null;
  if (status === "applicant") {
    // applicants handled by Apply flow; no activation CTA
  } else if (!orientationComplete) {
    cta = { to: "/orientation", icon: Compass, label: "Begin Orientation", sub: `${orientationDone}/${TOTAL_ORIENTATION_STEPS} steps complete — become a true ScrollUniversity student` };
  } else if (!matriculated) {
    cta = { to: "/matriculation", icon: ScrollText, label: "Sign the Student Oath", sub: "You've finished orientation — complete matriculation to become an official scholar" };
  } else if (enrollmentCount === 0) {
    cta = { to: "/catalog", icon: BookOpen, label: "Enroll in your first course", sub: "You're matriculated — activate your scholarship by enrolling in a course from your program" };
  }

  if (!cta) {
    return (
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Journey</p>
            {matriculated && (
              <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
                <Link to="/student-identity"><IdCard className="h-3.5 w-3.5 mr-1" /> Identity</Link>
              </Button>
            )}
          </div>
          <LifecycleStepper status={status} />
        </CardContent>
      </Card>
    );
  }

  const Icon = cta.icon;
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/5 border-primary/30">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/15 shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-base sm:text-lg text-primary">{cta.label}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{cta.sub}</p>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to={cta.to}>
              Continue <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        <LifecycleStepper status={status} />
      </CardContent>
    </Card>
  );
}
