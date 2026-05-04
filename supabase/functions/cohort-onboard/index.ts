// ScrollUniversity — Controlled Launch: cohort onboard
// Admits a student (admin only), enforces 50-seat cap, transitions
// applicant → admitted → enrolled → active, enrolls into the program's
// first available course, and triggers admission letter + notification.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // JWT validation
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: "unauthorized" }, 401);

    // Admin role check via has_role
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "admin role required" }, 403);

    const body = await req.json().catch(() => ({}));
    const studentId: string | undefined = body.student_id;
    if (!studentId) return json({ error: "student_id required" }, 400);

    // Cohort cap enforcement
    const { data: cohort } = await supabase.rpc("beta_cohort_status");
    if (cohort && cohort.is_open === false) {
      return json({ error: "cohort closed", cohort }, 409);
    }

    // Load student
    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, user_id, full_name, email, application_status, degree_program_id")
      .eq("id", studentId)
      .maybeSingle();
    if (sErr || !student) return json({ error: "student not found" }, 404);
    if (student.application_status === "accepted") {
      return json({ ok: true, already_admitted: true });
    }

    // 1) Mark accepted + assign cohort number
    const cohortNumber = (cohort?.admitted ?? 0) + 1;
    const { error: upErr } = await supabase
      .from("students")
      .update({ application_status: "accepted", cohort_number: cohortNumber })
      .eq("id", studentId);
    if (upErr) throw upErr;

    // 2) Lifecycle transitions: applicant → admitted → enrolled → active
    const transitions = ["admitted", "enrolled", "active"];
    for (const status of transitions) {
      const { error: trErr } = await supabase.rpc("transition_student_status", {
        p_user_id: student.user_id,
        p_new_status: status,
        p_reason: `cohort-onboard: ${cohortNumber}`,
      });
      if (trErr) {
        console.error(`transition to ${status} failed`, trErr);
        // continue — log but don't block enrollment for legacy states
      }
    }

    // 3) Enroll into a starter course (program's first, fallback any active)
    let starterCourseId: string | null = null;
    if (student.degree_program_id) {
      const { data: req } = await supabase
        .from("degree_course_requirements")
        .select("course_id")
        .eq("degree_program_id", student.degree_program_id)
        .limit(1)
        .maybeSingle();
      starterCourseId = req?.course_id ?? null;
    }
    if (!starterCourseId) {
      const { data: anyCourse } = await supabase
        .from("courses")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      starterCourseId = anyCourse?.id ?? null;
    }

    if (starterCourseId) {
      await supabase.from("enrollments").upsert(
        {
          user_id: student.user_id,
          course_id: starterCourseId,
          progress: 0,
        },
        { onConflict: "user_id,course_id" },
      );
    }

    // 4) Admission letter (best-effort)
    try {
      await supabase.functions.invoke("generate-admission-letter", {
        body: { studentId: student.id },
      });
    } catch (e) {
      console.error("admission letter failed", e);
    }

    // 5) Notification
    await supabase.from("notifications").insert({
      user_id: student.user_id,
      title: "🎓 You've been admitted to ScrollUniversity",
      body: `Welcome to ${cohort?.cohort_label ?? "the beta cohort"}. Your dashboard is ready.`,
      type: "admission",
    });

    return json({
      ok: true,
      student_id: studentId,
      cohort_number: cohortNumber,
      starter_course_id: starterCourseId,
    });
  } catch (e: any) {
    console.error("cohort-onboard error", e);
    return json({ error: e.message ?? "internal error" }, 500);
  }
});
