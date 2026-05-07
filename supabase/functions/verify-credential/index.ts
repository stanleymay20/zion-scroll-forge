// Public credential verification endpoint
// Anyone (employer, registrar) can POST { token } to verify a ScrollUniversity credential
// Logs all verification attempts for audit
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json().catch(() => ({}));
    if (!token || typeof token !== "string" || token.length < 8 || token.length > 200) {
      return new Response(
        JSON.stringify({ outcome: "invalid_format", message: "Provide a valid credential token." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Token can be a course_certificates.id (UUID) for now
    const { data: cert } = await supabase
      .from("course_certificates")
      .select("id, course_id, completion_date, user_id, courses(title), profiles!inner(full_name)")
      .eq("id", token)
      .maybeSingle();

    let outcome: "valid" | "not_found" = "not_found";
    let payload: Record<string, unknown> = { outcome, token };

    if (cert) {
      outcome = "valid";
      payload = {
        outcome,
        token,
        credential_type: "ScrollCourseCertificate",
        verified_subject: (cert as any).profiles?.full_name ?? null,
        course_title: (cert as any).courses?.title ?? null,
        completion_date: cert.completion_date,
        issued_by: "ScrollUniversity",
        verified_at: new Date().toISOString(),
      };
    }

    const ip = req.headers.get("x-forwarded-for") ?? null;
    await supabase.from("credential_verification_log").insert({
      credential_token: token,
      credential_type: cert ? "ScrollCourseCertificate" : null,
      verified_subject: (payload as any).verified_subject ?? null,
      verifier_ip: ip,
      outcome,
    });

    return new Response(JSON.stringify(payload), {
      status: outcome === "valid" ? 200 : 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ outcome: "error", message: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
