import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, ExternalLink } from "lucide-react";
import { useVirtualLabs } from "@/hooks/useVirtualLabs";

console.info("✝️ Virtual Labs — Hands-on Kingdom tech");

export default function VirtualLabsPage() {
  const navigate = useNavigate();
  const { data: labs, isLoading } = useVirtualLabs();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const filteredLabs = selectedDifficulty
    ? labs?.filter(l => l.difficulty === selectedDifficulty)
    : labs;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="Virtual Labs"
      description="Hands-on technical training in a Christ-centered environment"
    >
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedDifficulty === null ? "default" : "outline"}
            onClick={() => setSelectedDifficulty(null)}
          >
            All Levels
          </Button>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <Button
              key={level}
              variant={selectedDifficulty === level ? "default" : "outline"}
              onClick={() => setSelectedDifficulty(level)}
              className="capitalize"
            >
              {level}
            </Button>
          ))}
        </div>

        {!filteredLabs || filteredLabs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No labs available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredLabs.map((lab) => (
              <Card key={lab.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                        {lab.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {lab.difficulty}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{lab.description}</p>
                  {lab.technology_stack && lab.technology_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lab.technology_stack.map((tech, i) => (
                        <Badge key={i} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  )}
                  {lab.lab_url && (
                    <Button
                      className="w-full"
                      onClick={() => window.open(lab.lab_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Enter Lab
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
