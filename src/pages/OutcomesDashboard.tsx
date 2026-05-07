import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";

interface Outcome {
  id: string;
  metric_key: string;
  metric_label: string;
  metric_value: number;
  metric_unit: string | null;
  category: string;
  display_format: string | null;
  audit_notes: string | null;
  reporting_period: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  employment: "Performance",
  academic: "Academic",
  impact: "Global Impact",
  spiritual: "Spiritual Formation",
  financial: "Accessibility",
};

function formatValue(o: Outcome) {
  if (o.display_format === "currency") return `$${o.metric_value.toLocaleString()}`;
  if (o.display_format === "percent") return `${o.metric_value}%`;
  return o.metric_value.toLocaleString();
}

export default function OutcomesDashboard() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("institutional_outcomes")
        .select("*")
        .eq("is_published", true)
        .order("category");
      setOutcomes((data as Outcome[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const grouped = outcomes.reduce<Record<string, Outcome[]>>((acc, o) => {
    (acc[o.category] ??= []).push(o);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <Helmet>
        <title>Public Outcomes Dashboard — ScrollUniversity</title>
        <meta name="description" content="Real-time, audited public dashboard of ScrollUniversity learning outcomes, employment, accessibility, and impact metrics." />
        <link rel="canonical" href="/outcomes" />
      </Helmet>
      <header className="text-center space-y-3">
        <h1 className="font-serif text-4xl md:text-5xl text-primary">Public Outcomes</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transparency through measurement. Every number below is auditable and updated from live institutional data.
        </p>
      </header>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading metrics…</p>
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <section key={cat} className="space-y-4">
            <h2 className="font-serif text-2xl text-primary">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {items.map((o) => (
                <Card key={o.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{o.metric_label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-serif text-primary">{formatValue(o)}</div>
                    {o.metric_unit && <p className="text-xs text-muted-foreground mt-1">{o.metric_unit}</p>}
                    {o.reporting_period && <Badge variant="outline" className="mt-2 text-xs">{o.reporting_period}</Badge>}
                    {o.audit_notes && <p className="text-xs text-muted-foreground mt-2">{o.audit_notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
