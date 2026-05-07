import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

interface Member {
  id: string;
  display_name: string;
  cohort_label: string;
  country: string | null;
  pursuit: string;
  testimony: string | null;
  photo_url: string | null;
  position_number: number | null;
}

export default function FoundingWall() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("founding_cohort_members")
        .select("*")
        .eq("is_public", true)
        .order("position_number", { ascending: true, nullsFirst: false });
      setMembers((data as Member[]) ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>The Founding 50 — ScrollUniversity</title>
        <meta name="description" content="Meet the Founding 50 cohort of ScrollUniversity — pioneer scholars shaping the first published outcomes." />
        <link rel="canonical" href="/founding-wall" />
      </Helmet>
      <header className="text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl text-primary">The Founding 50</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Pioneer scholars writing the first chapter of ScrollUniversity. Each entry is published with the member's explicit consent.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading cohort…</p>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="font-serif text-lg text-primary mb-2">The wall is being built.</p>
            <p className="text-sm">As Founding 50 members consent to share their journey publicly, they will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {members.map((m) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt={m.display_name} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-serif text-primary">
                      {m.display_name.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-serif">{m.display_name}</CardTitle>
                    {m.country && <p className="text-xs text-muted-foreground">{m.country}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{m.cohort_label}{m.position_number ? ` · #${m.position_number}` : ""}</Badge>
                <p className="text-sm font-medium">{m.pursuit}</p>
                {m.testimony && <p className="text-xs text-muted-foreground italic">"{m.testimony}"</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
