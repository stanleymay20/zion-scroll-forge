import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Video, Loader2, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { getUserFriendlyError } from "@/lib/errors";

interface GenerateVideosButtonProps {
  courseId?: string;
}

export const GenerateVideosButton = ({ courseId }: GenerateVideosButtonProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentModule, setCurrentModule] = useState<string>('');
  const [results, setResults] = useState<Array<{ module: string; status: string; url?: string }>>([]);

  // Get modules for the course
  const { data: modules } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const { data, error } = await supabase
        .from('course_modules')
        .select('id, title, order_index')
        .eq('course_id', courseId)
        .order('order_index');
      if (error) throw error;
      return data || [];
    },
    enabled: !!courseId
  });

  const generateVideos = async () => {
    if (!modules?.length) {
      toast({
        title: 'No modules found',
        description: 'Please select a course with modules first.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      setCurrentModule(module.title);
      setProgress(Math.round((i / modules.length) * 100));

      try {
        const { data, error } = await supabase.functions.invoke('generate-video', {
          body: { module_id: module.id, regenerate: true }
        });

        if (error) throw error;

        setResults(prev => [...prev, {
          module: module.title,
          status: data.status || 'complete',
          url: data.video_url
        }]);

        toast({
          title: `Video ${i + 1}/${modules.length}`,
          description: `Generated video for: ${module.title}`,
        });

      } catch (err: any) {
        console.error('Video generation error:', err);
        setResults(prev => [...prev, {
          module: module.title,
          status: 'error'
        }]);
      }

      // Small delay between generations to avoid rate limits
      if (i < modules.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setProgress(100);
    setIsGenerating(false);
    setCurrentModule('');

    toast({
      title: 'Video Generation Complete',
      description: `Generated ${results.filter(r => r.status !== 'error').length} videos.`,
    });
  };

  const generateSingleVideo = async (moduleId: string, moduleTitle: string) => {
    setIsGenerating(true);
    setCurrentModule(moduleTitle);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: { module_id: moduleId, regenerate: true }
      });

      if (error) throw error;

      toast({
        title: 'Video Generated',
        description: data.status === 'processing' 
          ? 'Video is being processed. Check back in a few minutes.'
          : `Video ready for: ${moduleTitle}`,
      });

      if (data.video_url) {
        window.open(data.video_url, '_blank');
      }

    } catch (err: any) {
      toast({
        title: 'Generation Failed',
        description: getUserFriendlyError(err),
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setCurrentModule('');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          AI Video Generation
        </CardTitle>
        <CardDescription>
          Generate real AI avatar video lectures using D-ID for each module
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating: {currentModule}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <Button 
          onClick={generateVideos}
          disabled={isGenerating || !modules?.length}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Videos...
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Generate All Videos ({modules?.length || 0} modules)
            </>
          )}
        </Button>

        {modules && modules.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Or generate individually:</p>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {modules.map((module) => {
                const result = results.find(r => r.module === module.title);
                return (
                  <div 
                    key={module.id} 
                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                  >
                    <span className="text-sm truncate flex-1">{module.title}</span>
                    <div className="flex items-center gap-2">
                      {result && (
                        result.status === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => generateSingleVideo(module.id, module.title)}
                        disabled={isGenerating}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {results.length > 0 && !isGenerating && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Results:</p>
            <div className="text-sm text-muted-foreground">
              <p>✓ Complete: {results.filter(r => r.status === 'complete').length}</p>
              <p>⏳ Processing: {results.filter(r => r.status === 'processing').length}</p>
              <p>✕ Errors: {results.filter(r => r.status === 'error').length}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
