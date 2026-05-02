// ✝️ Seed Empty Faculties — generates a starter catalog for faculties with no courses.
// Creates: 5 courses per faculty × 6 modules × AI-expanded content + 1 assignment per course (with 3 MCQs).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COURSES_PER_FACULTY = 5;
const MODULES_PER_COURSE = 3;
const CONCURRENCY = 6;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const body = await req.json().catch(() => ({}));
    const facultyIds: string[] | undefined = body.faculty_ids;
    const limitFaculties: number = Math.min(Number(body.limit_faculties) || 9, 12);

    // Fetch empty faculties
    let query = supabase
      .from("faculties")
      .select("id, name, faculty_code, mission, key_scripture, institution_id");
    if (facultyIds?.length) query = query.in("id", facultyIds);
    const { data: faculties, error: fErr } = await query;
    if (fErr) throw fErr;

    // Filter to those with 0 courses
    const empty: any[] = [];
    for (const f of faculties ?? []) {
      const { count } = await supabase
        .from("courses").select("id", { count: "exact", head: true }).eq("faculty_id", f.id);
      if ((count ?? 0) === 0) empty.push(f);
      if (empty.length >= limitFaculties) break;
    }

    if (empty.length === 0) {
      return json({ success: true, message: "No empty faculties", processed: 0 });
    }

    const results: any[] = [];

    for (const faculty of empty) {
      try {
        // 1) Generate course catalog outline via AI
        const outline = await generateCatalog(lovableKey, faculty);
        if (!outline?.courses?.length) {
          results.push({ faculty: faculty.name, status: "no_outline" });
          continue;
        }

        const facultyResult = { faculty: faculty.name, courses: [] as any[] };

        for (const courseSpec of outline.courses.slice(0, COURSES_PER_FACULTY)) {
          // Insert course
          const { data: course, error: cErr } = await supabase
            .from("courses")
            .insert({
              title: courseSpec.title,
              description: courseSpec.description,
              faculty: faculty.name,
              faculty_id: faculty.id,
              institution_id: faculty.institution_id,
              level: "ScrollBachelor",
              duration: "12 weeks",
              credit_hours: 3,
              learning_outcomes: courseSpec.learning_outcomes ?? [],
              tags: courseSpec.tags ?? [],
              price_cents: 10000,
              scroll_coin_cost: 100,
              scholarship_eligible: true,
              locked_baseline: false,
            })
            .select("id, title")
            .single();
          if (cErr) {
            facultyResult.courses.push({ title: courseSpec.title, status: "course_insert_failed", error: cErr.message });
            continue;
          }

          // Modules: parallel content generation
          const moduleSpecs = (courseSpec.modules ?? []).slice(0, MODULES_PER_COURSE);
          const moduleRows: any[] = [];

          for (let i = 0; i < moduleSpecs.length; i += CONCURRENCY) {
            const batch = moduleSpecs.slice(i, i + CONCURRENCY);
            const expanded = await Promise.all(
              batch.map((m: any, idx: number) =>
                expandModule(lovableKey, faculty, course.title, m.title).then((content) => ({
                  title: m.title,
                  content_md: content,
                  order_index: i + idx,
                  duration_minutes: 60,
                  has_study_guide: true,
                  has_video_script: true,
                  content_char_count: content.length,
                  course_id: course.id,
                  institution_id: faculty.institution_id,
                })),
              ),
            );
            moduleRows.push(...expanded);
          }

          if (moduleRows.length) {
            const { error: mErr } = await supabase.from("course_modules").insert(moduleRows);
            if (mErr) {
              facultyResult.courses.push({ title: course.title, status: "modules_failed", error: mErr.message });
              continue;
            }
          }

          // Assignment + quiz with 3 MCQs
          const { data: assignment, error: aErr } = await supabase
            .from("assignments")
            .insert({
              course_id: course.id,
              title: `${course.title} — Capstone Assessment`,
              description: `Comprehensive rubric-based assessment covering core competencies. Rubric: knowledge (40%), application (30%), reflection (30%).`,
              type: "quiz",
              total_points: 30,
              published: true,
              institution_id: faculty.institution_id,
            })
            .select("id")
            .single();

          if (!aErr && assignment) {
            const questions = await generateQuestions(lovableKey, faculty.name, course.title);
            if (questions.length) {
              await supabase.from("quiz_questions").insert(
                questions.map((q, idx) => ({
                  assignment_id: assignment.id,
                  kind: "mcq",
                  prompt: q.prompt,
                  options: q.options,
                  answer: q.answer,
                  points: 10,
                  order_index: idx,
                  difficulty_rating: 3,
                })),
              );
            }
          }

          facultyResult.courses.push({ title: course.title, modules: moduleRows.length, status: "ok" });
        }

        results.push(facultyResult);
      } catch (e) {
        results.push({ faculty: faculty.name, status: "exception", error: (e as Error).message });
      }
    }

    return json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("seed-empty-faculties error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

async function aiCall(key: string, system: string, user: string, jsonMode = false) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? "";
}

async function generateCatalog(key: string, faculty: any) {
  const sys = "You are a senior university provost designing a faith-integrated catalog. Output valid JSON only.";
  const user = `Design ${COURSES_PER_FACULTY} foundational undergraduate courses for the Faculty of "${faculty.name}".
Faculty mission: ${faculty.mission ?? "Integrate scholarship with kingdom calling."}
Key scripture: ${faculty.key_scripture ?? "—"}

Return JSON:
{ "courses": [
  { "title": "...", "description": "150-word academic course description",
    "level": "Undergraduate" | "Graduate",
    "learning_outcomes": ["...", "...", "..."],
    "tags": ["...", "..."],
    "modules": [ { "title": "Module 1: ..." }, ... 6 modules ]
  }
] }
Make titles distinctive, rigorous, and faith-integrated. No filler.`;
  const raw = await aiCall(key, sys, user, true);
  try { return JSON.parse(raw); } catch { return null; }
}

async function expandModule(key: string, faculty: any, courseTitle: string, moduleTitle: string) {
  const sys = "You are a senior curriculum designer. Write rigorous Markdown module content (2000-2800 words) with ## sections, scriptural and scholarly grounding, key terms, and a synthesis section. No placeholders, no AI mentions.";
  const user = `Faculty: ${faculty.name}\nCourse: ${courseTitle}\nModule: ${moduleTitle}\n\nWrite the complete module body in Markdown only.`;
  const content = await aiCall(key, sys, user, false);
  return content || `# ${moduleTitle}\n\n_Content pending expansion._`;
}

async function generateQuestions(key: string, facultyName: string, courseTitle: string) {
  const sys = "You write rigorous multiple-choice exam questions. Output valid JSON only.";
  const user = `Generate 3 university-level MCQs for course "${courseTitle}" (Faculty: ${facultyName}).
Return JSON: { "questions": [ { "prompt": "...", "options": ["A","B","C","D"], "answer": "B" }, ... ] }
The "answer" must be the exact option text.`;
  try {
    const raw = await aiCall(key, sys, user, true);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.questions) ? parsed.questions : [];
  } catch { return []; }
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
