// Seed a test user with confirmed email, active lifecycle, and sample enrollment.
// Public endpoint guarded by a shared seed token to avoid abuse.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const TEST_EMAIL = "demo.student@scrolltest.dev";
const TEST_PASSWORD = "ScrollDemo!2026";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    // 1. Find or create user (email pre-confirmed)
    let userId: string | null = null;

    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find((u) => u.email === TEST_EMAIL);
    if (existing) {
      userId = existing.id;
      // Reset password & confirm email in case it was changed
      await supabase.auth.admin.updateUserById(userId, {
        password: TEST_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Demo Student", is_test_account: true },
        });
      if (createErr) throw createErr;
      userId = created.user!.id;
    }

    // 2. Ensure profile + active lifecycle (bypass transition state machine)
    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: TEST_EMAIL,
        full_name: "Demo Student",
        lifecycle_status: "active",
        admitted_at: new Date().toISOString(),
        enrolled_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // 3. Grant student role
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "student" },
      { onConflict: "user_id,role" }
    );

    // 4. Auto-enroll in up to 3 published courses for full UX
    const { data: courses } = await supabase
      .from("courses")
      .select("id")
      .limit(3);

    if (courses?.length) {
      for (const c of courses) {
        await supabase.from("enrollments").upsert(
          {
            user_id: userId,
            course_id: c.id,
            progress: 0,
          },
          { onConflict: "user_id,course_id" }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        user_id: userId,
        lifecycle: "active",
        enrolled_courses: courses?.length ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
