import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

interface NamedFaculty {
  id: string;
  full_name: string;
  title: string;
  faculty_chair: string | null;
  supreme_faculty: string;
  bio: string;
  photo_url: string | null;
  orcid_id: string | null;
  h_index: number;
  publications_count: number;
  notable_works: string[];
  website_url: string | null;
}

export default function FacultyDirectory() {
  const [faculty, setFaculty] = useState<NamedFaculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("named_faculty")
        .select("*")
        .eq("is_published", true)
        .order("joined_at", { ascending: true });
      setFaculty((data as NamedFaculty[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Named Faculty — ScrollUniversity</title>
        <meta name="description" content="Public directory of named ScrollUniversity faculty chairs, ORCID IDs, h-index, and notable works." />
        <link rel="canonical" href="/faculty-directory" />
      </Helmet>
      <header className="text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl text-primary">Named Faculty</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Public scholar directory. Every chair is verifiable via ORCID and named publications.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading scholars…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {faculty.map((f) => (
            <Card key={f.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-4">
                  {f.photo_url ? (
                    <img src={f.photo_url} alt={f.full_name} className="h-16 w-16 rounded-full object-cover" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center font-serif text-xl text-primary">
                      {f.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <div className="flex-1">
                    <CardTitle className="font-serif text-xl">{f.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{f.title}</p>
                    {f.faculty_chair && <p className="text-xs text-primary mt-1">{f.faculty_chair}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge variant="secondary">{f.supreme_faculty}</Badge>
                <p className="text-sm">{f.bio}</p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {f.orcid_id && <span>ORCID: {f.orcid_id}</span>}
                  <span>h-index: {f.h_index}</span>
                  <span>Publications: {f.publications_count}</span>
                </div>
                {f.notable_works?.length > 0 && (
                  <div className="text-xs">
                    <p className="font-medium mb-1">Notable Works</p>
                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                      {f.notable_works.slice(0, 3).map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
