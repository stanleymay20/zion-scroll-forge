// ScrollUniversity — Controlled Launch: cohort onboard / decision engine
// Admin-only. Supports actions: accept (default), waitlist, reject.
// On accept: enforces 50-seat cap, assigns student_id_code + institutional_email,
// transitions applicant → admitted → enrolled → active, enrolls into starter
// course, generates admission letter, notifies. On waitlist: marks waitlisted
// with timestamp + position. On reject: marks rejected with reason.

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

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return json({ error: "unauthorized" }, 401);

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) return json({ error: "admin role required" }, 403);

    const body = await req.json().catch(() => ({}));
    const studentId: string | undefined = body.student_id;
    const action: "accept" | "waitlist" | "reject" = body.action ?? "accept";
    const reason: string = body.reason ?? "";
    if (!studentId) return json({ error: "student_id required" }, 400);

    const { data: student, error: sErr } = await supabase
      .from("students")
      .select("id, user_id, full_name, email, application_status, degree_program_id, student_id_code, institutional_email")
      .eq("id", studentId)
      .maybeSingle();
    if (sErr || !student) return json({ error: "student not found" }, 404);

    // ---------------- WAITLIST ----------------
    if (action === "waitlist") {
      await supabase.from("students").update({
        application_status: "waitlisted",
        waitlisted_at: new Date().toISOString(),
        rejection_reason: null,
      }).eq("id", studentId);
      const { data: pos } = await supabase.rpc("waitlist_position", { p_student_id: studentId });
      await supabase.from("notifications").insert({
        user_id: student.user_id,
        title: "📋 You've been waitlisted",
        body: `Your ScrollUniversity application is on the waitlist. ${reason || "We'll notify you as seats free up."}`,
        type: "admission",
      });
      return json({ ok: true, action, waitlist_position: pos });
    }

    // ---------------- REJECT ----------------
    if (action === "reject") {
      await supabase.from("students").update({
        application_status: "rejected",
        rejection_reason: reason || "Application not advanced at this time.",
      }).eq("id", studentId);
      await supabase.from("notifications").insert({
        user_id: student.user_id,
        title: "Application Decision",
        body: reason || "Thank you for applying. We're unable to advance your application at this time.",
        type: "admission",
      });
      return json({ ok: true, action });
    }

    // ---------------- ACCEPT ----------------
    if (student.application_status === "accepted") {
      return json({ ok: true, already_admitted: true,
        student_id_code: student.student_id_code,
        institutional_email: student.institutional_email });
    }

    const { data: cohort } = await supabase.rpc("beta_cohort_status");
    if (cohort && cohort.is_open === false) {
      // Cap reached → auto-waitlist instead of accept
      await supabase.from("students").update({
        application_status: "waitlisted",
        waitlisted_at: new Date().toISOString(),
      }).eq("id", studentId);
      const { data: pos } = await supabase.rpc("waitlist_position", { p_student_id: studentId });
      await supabase.from("notifications").insert({
        user_id: student.user_id,
        title: "📋 Cohort full — added to waitlist",
        body: `${cohort.cohort_label} is at capacity. You're #${pos} on the waitlist.`,
        type: "admission",
      });
      return json({ ok: false, auto_waitlisted: true, waitlist_position: pos, cohort });
    }

    const cohortNumber = (cohort?.admitted ?? 0) + 1;

    // 1) Generate institutional identity (student ID + email alias)
    const { data: identity, error: idErr } = await supabase.rpc("generate_student_identity", {
      p_student_id: studentId,
    });
    if (idErr) {
      console.error("identity gen failed", idErr);
      return json({ error: `identity generation failed: ${idErr.message}` }, 500);
    }

    // 2) Mark accepted + assign cohort number
    const { error: upErr } = await supabase.from("students").update({
      application_status: "accepted",
      cohort_number: cohortNumber,
    }).eq("id", studentId);
    if (upErr) throw upErr;

    // 3) Lifecycle transitions
    for (const status of ["admitted", "enrolled", "active"]) {
      const { error: trErr } = await supabase.rpc("transition_student_status", {
        p_user_id: student.user_id,
        p_new_status: status,
        p_reason: `cohort-onboard: ${cohortNumber}`,
      });
      if (trErr) console.error(`transition to ${status} failed`, trErr);
    }

    // 4) Enroll into starter course
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
        .from("courses").select("id").order("created_at", { ascending: true }).limit(1).maybeSingle();
      starterCourseId = anyCourse?.id ?? null;
    }
    if (starterCourseId) {
      await supabase.from("enrollments").upsert(
        { user_id: student.user_id, course_id: starterCourseId, progress: 0 },
        { onConflict: "user_id,course_id" },
      );
    }

    // 5) Admission letter (best-effort)
    try {
      await supabase.functions.invoke("generate-admission-letter", {
        body: { studentId: student.id },
      });
    } catch (e) { console.error("admission letter failed", e); }

    // 6) Notification with institutional identity
    await supabase.from("notifications").insert({
      user_id: student.user_id,
      title: "🎓 You've been admitted to ScrollUniversity",
      body: `Welcome to ${cohort?.cohort_label ?? "the beta cohort"}.\n\n` +
        `Student ID: ${(identity as any)?.student_id_code}\n` +
        `Institutional Email: ${(identity as any)?.institutional_email}\n\n` +
        `Your dashboard is ready.`,
      type: "admission",
    });

    return json({
      ok: true,
      action: "accept",
      student_id: studentId,
      cohort_number: cohortNumber,
      starter_course_id: starterCourseId,
      ...(identity as object),
    });
  } catch (e: any) {
    console.error("cohort-onboard error", e);
    return json({ error: e.message ?? "internal error" }, 500);
  }
});
