import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVirtualLabs } from '@/hooks/useVirtualLabs';
import { Loader2, Beaker } from 'lucide-react';

console.info('✝️ Virtual Labs—Christ is Lord over practice');

export default function VirtualLabsPage() {
  const { data, isLoading } = useVirtualLabs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'advanced': return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  return (
    <PageTemplate 
      title="Virtual Labs" 
      description="Hands-on practice in a safe, interactive environment"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {data?.map(l => (
          <Card key={l.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
                {l.title}
              </CardTitle>
              <CardDescription className="mt-2">
                <Badge className={getDifficultyColor(l.difficulty_level)}>
                  {l.difficulty_level}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{l.description}</p>
              <Button variant="default" size="sm" className="w-full">
                Launch Lab
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}
