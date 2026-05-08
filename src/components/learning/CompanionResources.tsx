/**
 * CompanionResources — Deep links to external research & library tools.
 * scrolllibrary.org and atlasresearch.info open in a new tab, optionally
 * pre-filled with the current topic.
 */
import { Library, FlaskConical, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CompanionResourcesProps {
  topic?: string;
  variant?: 'card' | 'inline';
  className?: string;
}

export function CompanionResources({ topic, variant = 'card', className }: CompanionResourcesProps) {
  const q = topic ? encodeURIComponent(topic) : '';
  const libraryUrl = topic ? `https://scrolllibrary.org/?q=${q}` : 'https://scrolllibrary.org';
  const atlasUrl = topic ? `https://atlasresearch.info/?q=${q}` : 'https://atlasresearch.info';

  const buttons = (
    <div className="flex flex-wrap gap-2">
      <Button asChild size="sm" variant="outline" className="gap-2">
        <a href={libraryUrl} target="_blank" rel="noreferrer">
          <Library className="h-4 w-4" />
          ScrollLibrary
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </Button>
      <Button asChild size="sm" variant="outline" className="gap-2">
        <a href={atlasUrl} target="_blank" rel="noreferrer">
          <FlaskConical className="h-4 w-4" />
          AtlasResearch
          <ExternalLink className="h-3 w-3 opacity-60" />
        </a>
      </Button>
    </div>
  );

  if (variant === 'inline') {
    return <div className={className}>{buttons}</div>;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Library className="h-4 w-4 text-primary" />
          Companion Research & Library
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-xs text-muted-foreground mb-3">
          Open primary sources and scholarship related to{topic ? <> <span className="font-medium text-foreground">{topic}</span></> : ' this lecture'}.
        </p>
        {buttons}
      </CardContent>
    </Card>
  );
}
