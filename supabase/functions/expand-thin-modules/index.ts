// ✝️ Expand Thin Modules — fills out modules below the seal-criteria threshold.
// Uses Lovable AI Gateway (no extra API key required).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MIN_CHARS = 2000; // Curriculum standard: 2000+ chars per module
const BATCH_LIMIT_DEFAULT = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || BATCH_LIMIT_DEFAULT, 50);

    const { data: thinModules, error: queryError } = await supabase
      .from("course_modules")
      .select("id, course_id, title, content_md, content_char_count, courses(title, faculty)")
      .or("content_char_count.lt.500,content_char_count.is.null")
      .limit(limit);

    if (queryError) throw queryError;

    if (!thinModules || thinModules.length === 0) {
      return json({ success: true, message: "No thin modules found", processed: 0 });
    }

    // Process in parallel for speed (capped at 5 concurrent to respect rate limits)
    const CONCURRENCY = 5;
    const results: Array<{ id: string; status: string; chars?: number; error?: string }> = [];

    async function processOne(mod: any) {
      try {
        const courseTitle = (mod.courses as any)?.title ?? "";
        const faculty = (mod.courses as any)?.faculty ?? "";
        const prompt = buildPrompt(courseTitle, faculty, mod.title, mod.content_md ?? "");

        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content:
                  "You are a senior curriculum designer for a faith-integrated university. Write rigorous, university-grade module content (2000-3000 words) in clean Markdown. Include: introduction, 4-6 themed sections with subheadings, scriptural and scholarly grounding, real-world applications, key terms, and a synthesis. No placeholders. No filler. No mentions of being an AI.",
              },
              { role: "user", content: prompt },
            ],
          }),
        });

        if (aiRes.status === 429) {
          return { id: mod.id, status: "rate_limited" };
        }
        if (!aiRes.ok) {
          const errText = await aiRes.text();
          return { id: mod.id, status: "ai_error", error: errText.slice(0, 200) };
        }

        const data = await aiRes.json();
        const newContent: string = data?.choices?.[0]?.message?.content ?? "";
        if (!newContent || newContent.length < MIN_CHARS) {
          return { id: mod.id, status: "too_short", chars: newContent.length };
        }

        const { error: updateErr } = await supabase
          .from("course_modules")
          .update({
            content_md: newContent,
            content_char_count: newContent.length,
          })
          .eq("id", mod.id);

        if (updateErr) {
          return { id: mod.id, status: "update_failed", error: updateErr.message };
        }

        return { id: mod.id, status: "expanded", chars: newContent.length };
      } catch (e) {
        return { id: mod.id, status: "exception", error: (e as Error).message };
      }
    }

    // Run with concurrency limit
    for (let i = 0; i < thinModules.length; i += CONCURRENCY) {
      const batch = thinModules.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(batch.map(processOne));
      results.push(...(batchResults as any[]));
      if (batchResults.some((r: any) => r.status === "rate_limited")) break;
    }

    return json({
      success: true,
      processed: results.length,
      expanded: results.filter((r) => r.status === "expanded").length,
      results,
    });
  } catch (err) {
    console.error("expand-thin-modules error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function buildPrompt(course: string, faculty: string, moduleTitle: string, existing: string) {
  return `Rewrite and substantially expand the following module into a complete, university-grade chapter.

Course: ${course}
Faculty: ${faculty}
Module title: ${moduleTitle}

Existing content (may be very short or empty):
"""
${existing.slice(0, 1500)}
"""

Requirements:
- 2000-3000 words of substantive academic prose in Markdown.
- Begin with a one-paragraph orientation, then 4-6 sections with ## headings.
- Weave in scriptural references AND scholarly references naturally.
- Include a "Key Terms" subsection and a "Synthesis & Reflection" closing section.
- Tone: rigorous, reverent, accessible to undergraduates.
- Output ONLY the Markdown body — no preamble, no commentary.`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
