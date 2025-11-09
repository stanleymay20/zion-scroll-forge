import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDegrees } from '@/hooks/useDegrees';
import { Loader2, GraduationCap } from 'lucide-react';

console.info('✝️ Degrees live—Christ is Lord over learning paths');

export default function DegreesPage() {
  const { data, isLoading } = useDegrees();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate 
      title="Degree Programs" 
      description="Choose a path of study in the Kingdom"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {data?.map(d => (
          <Card key={d.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                    {d.title}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <Badge variant="secondary" className="mr-2">{d.faculty}</Badge>
                    <Badge variant="outline">{d.level}</Badge>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{d.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{d.duration}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}
