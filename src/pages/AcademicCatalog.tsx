/**
 * Grouped academic catalog — Browse by Faculty / Degree / Level / Career Track.
 * Pulls existing courses (no reseed) and groups them client-side.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "@/components/brand/Logo";
import { BookOpen, Clock, GraduationCap, Lock, Search } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  faculty: string | null;
  faculty_id: string | null;
  level: string | null;
  visibility: string | null;
  credit_hours: number | null;
  estimated_duration_hours: number | null;
  duration: string | null;
  career_track: string[] | null;
  thumbnail_url: string | null;
}

const LEVEL_ORDER = ["foundation", "intermediate", "advanced", "capstone"];

function CourseCard({ c }: { c: Course }) {
  const locked = c.visibility && c.visibility !== "public_preview";
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-serif text-lg leading-tight">{c.title}</CardTitle>
          {locked ? (
            <Badge variant="secondary" className="shrink-0">
              <Lock className="h-3 w-3 mr-1" /> {c.visibility?.replace("_", " ")}
            </Badge>
          ) : (
            <Badge variant="outline" className="shrink-0">Preview</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {c.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
        )}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {c.faculty && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> {c.faculty}
            </span>
          )}
          {c.level && <Badge variant="secondary" className="text-[10px]">{c.level}</Badge>}
          {(c.estimated_duration_hours || c.duration) && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {c.estimated_duration_hours ? `${c.estimated_duration_hours}h` : c.duration}
            </span>
          )}
          {c.credit_hours ? <span>{c.credit_hours} cr</span> : null}
        </div>
        <div className="flex gap-2 pt-1">
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to={`/course/${c.id}/preview`}>
              <BookOpen className="h-3 w-3 mr-1" /> Preview
            </Link>
          </Button>
          <Button asChild size="sm" className="flex-1">
            <Link to={`/courses/${c.id}`}>Enroll</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Group({
  title,
  courses,
}: {
  title: string;
  courses: Course[];
}) {
  if (courses.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {courses.length} course{courses.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <CourseCard key={c.id} c={c} />
        ))}
      </div>
    </section>
  );
}

export default function AcademicCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [programLinks, setProgramLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("faculty");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [{ data: cs }, { data: ps }, { data: pls }] = await Promise.all([
        supabase
          .from("courses")
          .select(
            "id,title,description,faculty,faculty_id,level,visibility,credit_hours,estimated_duration_hours,duration,career_track,thumbnail_url"
          )
          .order("title"),
        supabase.from("degree_programs").select("id,title,faculty"),
        supabase
          .from("degree_program_courses" as any)
          .select("degree_program_id,course_id"),
      ]);
      if (cancelled) return;
      setCourses((cs as Course[]) ?? []);
      setPrograms(ps ?? []);
      setProgramLinks(pls ?? []);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(needle) ||
        (c.faculty || "").toLowerCase().includes(needle) ||
        (c.description || "").toLowerCase().includes(needle)
    );
  }, [courses, q]);

  const byFaculty = useMemo(() => {
    const map = new Map<string, Course[]>();
    filtered.forEach((c) => {
      const k = c.faculty || "Unassigned faculty";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const byLevel = useMemo(() => {
    const map = new Map<string, Course[]>();
    filtered.forEach((c) => {
      const k = (c.level || "unspecified").toLowerCase();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    });
    return Array.from(map.entries()).sort(
      ([a], [b]) => (LEVEL_ORDER.indexOf(a) + 99) - (LEVEL_ORDER.indexOf(b) + 99)
    );
  }, [filtered]);

  const byTrack = useMemo(() => {
    const map = new Map<string, Course[]>();
    filtered.forEach((c) => {
      const tracks = (c.career_track && c.career_track.length > 0)
        ? c.career_track
        : ["General"];
      tracks.forEach((t) => {
        if (!map.has(t)) map.set(t, []);
        map.get(t)!.push(c);
      });
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const byProgram = useMemo(() => {
    const courseById = new Map(filtered.map((c) => [c.id, c]));
    return programs
      .map((p) => {
        const ids = programLinks
          .filter((l) => l.degree_program_id === p.id)
          .map((l) => l.course_id);
        const list = ids
          .map((id) => courseById.get(id))
          .filter(Boolean) as Course[];
        return { program: p, list };
      })
      .filter((g) => g.list.length > 0);
  }, [programs, programLinks, filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory to-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="sm" to="/" />
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/degrees">Degrees</Link></Button>
            <Button variant="ghost" asChild><Link to="/faculties">Faculties</Link></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="font-serif text-4xl">Academic Catalog</h1>
          <p className="text-muted-foreground">
            Browse courses across the 12 Supreme Scroll Faculties. Preview any course; enroll to unlock the full curriculum.
          </p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, faculties, topics…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="faculty">By Faculty</TabsTrigger>
            <TabsTrigger value="program">By Degree Program</TabsTrigger>
            <TabsTrigger value="level">By Level</TabsTrigger>
            <TabsTrigger value="track">By Career Track</TabsTrigger>
          </TabsList>

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          )}

          {!loading && (
            <>
              <TabsContent value="faculty" className="space-y-8 mt-6">
                {byFaculty.map(([name, list]) => (
                  <Group key={name} title={name} courses={list} />
                ))}
              </TabsContent>
              <TabsContent value="program" className="space-y-8 mt-6">
                {byProgram.length === 0 && (
                  <p className="text-muted-foreground">
                    No degree programs are linked to courses yet.
                  </p>
                )}
                {byProgram.map(({ program, list }) => (
                  <Group key={program.id} title={program.title} courses={list} />
                ))}
              </TabsContent>
              <TabsContent value="level" className="space-y-8 mt-6">
                {byLevel.map(([name, list]) => (
                  <Group key={name} title={name.charAt(0).toUpperCase() + name.slice(1)} courses={list} />
                ))}
              </TabsContent>
              <TabsContent value="track" className="space-y-8 mt-6">
                {byTrack.map(([name, list]) => (
                  <Group key={name} title={name} courses={list} />
                ))}
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}
