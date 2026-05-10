import { useEffect, useState } from "react";
import { AlertTriangle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Student-facing safety rail for legacy or incomplete admissions records.
 *
 * Accepted students without a degree_program_id must not be routed into a
 * random course or allowed to self-select a different programme. This banner
 * makes the blocked state understandable while the Registrar completes the
 * formal assignment workflow.
 */
export function ProgramAssignmentPendingBanner() {
  const { user } = useAuth();
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("students")
        .select("application_status, degree_program_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        setPending(data?.application_status === "accepted" && !data?.degree_program_id);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading || !pending) return null;

  return (
    <Alert className="border-amber-500/40 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Program assignment pending Registrar review</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Your admission has been accepted, but your official degree program is not yet assigned.
          Enrollment, transcript progress, and certificates remain paused so your academic record is not misrouted.
        </p>
        <Button asChild size="sm" variant="outline">
          <a href="mailto:registrar@scrolluniversity.org?subject=Program%20assignment%20review%20request">
            <Mail className="h-4 w-4 mr-2" /> Contact Registrar
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  );
}
