import { useEffect, useState } from "react";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, AlertCircle, BookOpen, FileText, Brain } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ Generation Monitor — Christ governs all creation");

export default function GenerationMonitor() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: progress, refetch } = useQuery({
    queryKey: ["generation-progress"],
    queryFn: async () => {
      const { data } = await supabase
        .from("generation_progress")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    refetchInterval: autoRefresh ? 3000 : false
  });

  useEffect(() => {
    if (progress && progress.progress >= 100) {
      setAutoRefresh(false);
    }
  }, [progress]);

  const isGenerating = progress && progress.progress >= 0 && progress.progress < 100;
  const isComplete = progress && progress.progress === 100;
  const hasError = progress && progress.progress === -1;

  return (
    <PageTemplate
      title="Phase 7: Content Generation Monitor"
      description="Real-time tracking of comprehensive content generation"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <Card className={`border-2 ${
          isComplete ? 'border-green-500 bg-green-50' :
          isGenerating ? 'border-primary bg-primary/5' :
          hasError ? 'border-red-500 bg-red-50' :
          'border-border'
        }`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isGenerating && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                {isComplete && <CheckCircle2 className="h-6 w-6 text-green-600" />}
                {hasError && <AlertCircle className="h-6 w-6 text-red-600" />}
                <div>
                  <CardTitle>
                    {isGenerating && 'Generation In Progress'}
                    {isComplete && 'Generation Complete'}
                    {hasError && 'Generation Error'}
                    {!progress && 'Waiting to Start'}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {progress?.current_stage || 'Initializing...'}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={
                isComplete ? 'default' :
                isGenerating ? 'secondary' :
                hasError ? 'destructive' :
                'outline'
              } className="text-lg px-4 py-2">
                {progress?.progress || 0}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress?.progress || 0} className="h-3" />
          </CardContent>
        </Card>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faculties</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress?.faculties_created || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Processing all 20 faculties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress?.courses_created || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 120+ courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progress?.modules_created || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Target: 960+ modules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Materials</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(progress?.modules_created || 0) * 5}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PDFs, quizzes, videos, etc.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Details</CardTitle>
            <CardDescription>Comprehensive content creation for ScrollUniversity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Started:</span>
                <span className="font-medium">
                  {progress?.created_at ? new Date(progress.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="font-medium">
                  {progress?.updated_at ? new Date(progress.updated_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              {progress?.estimated_time_remaining && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Time:</span>
                  <span className="font-medium">{progress.estimated_time_remaining}</span>
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">What's Being Generated:</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ 20 Faculties with comprehensive descriptions</li>
                <li>✓ 6 courses per faculty (120 total)</li>
                <li>✓ 8 modules per course (960 total)</li>
                <li>✓ 1000+ words of content per module</li>
                <li>✓ Scripture integration in every module</li>
                <li>✓ 8 quiz questions per module</li>
                <li>✓ 4 learning materials per module (PDF, slides, infographic, video)</li>
                <li>✓ ScrollCoin rewards and Christ-Lordship statements</li>
              </ul>
            </div>

            {isComplete && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-green-900 mb-2">
                  ✝️ Generation Complete - All Glory to Christ
                </p>
                <p className="text-sm text-green-800">
                  Comprehensive content has been generated for all faculties. Students can now
                  enroll in courses and begin their transformative learning journey.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
