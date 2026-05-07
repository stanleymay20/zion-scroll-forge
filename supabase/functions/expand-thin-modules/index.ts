// ✝️ Expand Thin Modules — fills out modules below the seal-criteria threshold.
// Uses Lovable AI Gateway (no extra API key required).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MIN_CHARS = 8000; // Elite curriculum standard: 8000+ chars (~1300 words) per module
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
    const deepseekKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!lovableKey && !deepseekKey) {
      return json({ error: "No AI provider configured" }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Number(body.limit) || BATCH_LIMIT_DEFAULT, 50);
    const forceProvider: "lovable" | "deepseek" | undefined = body.provider;

    const { data: thinModules, error: queryError } = await supabase
      .from("course_modules")
      .select("id, course_id, title, content_md, content_char_count, courses(title, faculty)")
      .or("content_char_count.lt.8000,content_char_count.is.null")
      .limit(limit);

    if (queryError) throw queryError;

    if (!thinModules || thinModules.length === 0) {
      return json({ success: true, message: "No thin modules found", processed: 0 });
    }

    // Process in parallel for speed (capped at 5 concurrent to respect rate limits)
    const CONCURRENCY = 5;
    const results: Array<{ id: string; status: string; chars?: number; error?: string }> = [];

    const SYSTEM_PROMPT =
      "You are a senior endowed-chair professor designing the definitive university-grade chapter for a faith-integrated, MIT/Harvard-tier institution. Write 2500-3500 words of rigorous, citation-grounded academic prose in clean Markdown. Include: an orientation, 6-8 themed sections with ## headings, primary-source quotations, named scholarly references (real authors, real works), worked examples or case studies, scripture engaged exegetically (not as decoration), key terms, discussion questions, further reading, and a synthesis. No placeholders. No filler. No mentions of being an AI. No first-person.";

    async function callLovable(prompt: string) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
        }),
      });
      return res;
    }

    async function callDeepSeek(prompt: string) {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${deepseekKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
          max_tokens: 8000,
        }),
      });
      return res;
    }

    async function processOne(mod: any) {
      try {
        const courseTitle = (mod.courses as any)?.title ?? "";
        const faculty = (mod.courses as any)?.faculty ?? "";
        const prompt = buildPrompt(courseTitle, faculty, mod.title, mod.content_md ?? "");

        let aiRes: Response | null = null;
        let usedProvider = "";

        // Try Lovable first unless deepseek explicitly requested
        if (lovableKey && forceProvider !== "deepseek") {
          aiRes = await callLovable(prompt);
          usedProvider = "lovable";
          if (aiRes.status === 402 && deepseekKey) {
            // Out of credits — fall back to DeepSeek
            aiRes = await callDeepSeek(prompt);
            usedProvider = "deepseek";
          }
        } else if (deepseekKey) {
          aiRes = await callDeepSeek(prompt);
          usedProvider = "deepseek";
        }

        if (!aiRes) return { id: mod.id, status: "no_provider" };
        if (aiRes.status === 429) return { id: mod.id, status: "rate_limited", provider: usedProvider };
        if (!aiRes.ok) {
          const errText = await aiRes.text();
          return { id: mod.id, status: "ai_error", provider: usedProvider, error: errText.slice(0, 200) };
        }

        const data = await aiRes.json();
        const newContent: string = data?.choices?.[0]?.message?.content ?? "";
        if (!newContent || newContent.length < MIN_CHARS) {
          return { id: mod.id, status: "too_short", provider: usedProvider, chars: newContent.length };
        }

        const { error: updateErr } = await supabase
          .from("course_modules")
          .update({ content_md: newContent, content_char_count: newContent.length })
          .eq("id", mod.id);

        if (updateErr) return { id: mod.id, status: "update_failed", error: updateErr.message };
        return { id: mod.id, status: "expanded", provider: usedProvider, chars: newContent.length };
      } catch (e) {
        return { id: mod.id, status: "exception", error: (e as Error).message };
      }
    }

    // Run in BACKGROUND so HTTP returns immediately (DeepSeek can take 60s+ per call)
    const runBackground = async () => {
      for (let i = 0; i < thinModules.length; i += CONCURRENCY) {
        const batch = thinModules.slice(i, i + CONCURRENCY);
        const batchResults = await Promise.all(batch.map(processOne));
        results.push(...(batchResults as any[]));
        const expanded = batchResults.filter((r: any) => r.status === "expanded").length;
        const failed = batchResults.filter((r: any) => r.status !== "expanded").length;
        console.log(`[expand-thin-modules] batch ${i / CONCURRENCY + 1}: +${expanded} expanded, ${failed} other`);
        if (batchResults.every((r: any) => r.status === "rate_limited" || r.status === "ai_error")) break;
      }
      console.log(`[expand-thin-modules] DONE: ${results.filter(r => r.status === "expanded").length}/${results.length} expanded`);
    };

    // @ts-ignore - EdgeRuntime is available in Supabase Edge Functions
    if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
      // @ts-ignore
      EdgeRuntime.waitUntil(runBackground());
      return json({
        success: true,
        queued: thinModules.length,
        message: `Background expansion started for ${thinModules.length} modules. Check logs for progress.`,
      });
    }

    // Fallback: run synchronously
    await runBackground();
    return json({
      success: true,
      processed: results.length,
      expanded: results.filter((r) => r.status === "expanded").length,
      results: results.slice(0, 20),
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
- 2500-3500 words of substantive, rigorous academic prose in Markdown.
- Open with a one-paragraph orientation framing the module's stakes and trajectory.
- 6-8 sections using ## headings, each with depth (definitions, mechanisms, examples).
- Engage scripture exegetically (cite chapter:verse) AND named scholarly works (real author + title).
- Include at least one worked example, case study, or thought experiment.
- Add "## Key Terms", "## Discussion Questions" (5 items), "## Further Reading" (4-6 real sources), and "## Synthesis & Reflection".
- Tone: doctoral seminar, reverent, accessible to advanced undergraduates.
- Output ONLY the Markdown body — no preamble, no meta-commentary.`;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
