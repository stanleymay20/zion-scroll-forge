import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useXRClassrooms } from '@/hooks/useXRClassrooms';
import { Loader2, Video, Calendar } from 'lucide-react';

console.info('✝️ XR Classrooms—Christ is Lord over immersion');

export default function XRClassroomsPage() {
  const { data, isLoading } = useXRClassrooms();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate 
      title="XR Classrooms" 
      description="Immersive learning experiences in biblical history"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {data?.map(x => (
          <Card key={x.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                {x.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <Calendar className="h-4 w-4" />
                {new Date(x.scheduled_time).toLocaleDateString()} at{' '}
                {new Date(x.scheduled_time).toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{x.description}</p>
              <div className="flex gap-2">
                <Button variant="default" size="sm">
                  Join Session
                </Button>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}
