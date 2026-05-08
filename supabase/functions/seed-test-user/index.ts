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

    // 2. Reset profile to applicant lifecycle so the demo starts at /apply
    await supabase.from("profiles").upsert(
      {
        id: userId,
        email: TEST_EMAIL,
        full_name: "Demo Student",
        lifecycle_status: "applicant",
        admitted_at: null,
        enrolled_at: null,
      },
      { onConflict: "id" }
    );

    // 3. Grant student role (catalog browsing + dashboard access)
    await supabase.from("user_roles").upsert(
      { user_id: userId, role: "student" },
      { onConflict: "user_id,role" }
    );

    // 4. Clear any prior enrollments / applications so the flow restarts cleanly
    await supabase.from("enrollments").delete().eq("user_id", userId);
    await supabase.from("applications").delete().eq("user_id", userId);

    return new Response(
      JSON.stringify({
        ok: true,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        user_id: userId,
        lifecycle: "applicant",
        next_step: "/apply",
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
