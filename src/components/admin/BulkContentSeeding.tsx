import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Database, CheckCircle2, AlertCircle, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function BulkContentSeeding() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [result, setResult] = useState<any>(null);

  // Check how many courses need modules
  const { data: courseStats, isLoading: loadingStats, refetch } = useQuery({
    queryKey: ['course-module-stats'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          course_modules(id)
        `);
      
      if (error) throw error;

      const withModules = courses?.filter(c => (c.course_modules as any[])?.length > 0).length || 0;
      const withoutModules = courses?.filter(c => !(c.course_modules as any[])?.length).length || 0;
      const totalModules = courses?.reduce((acc, c) => acc + ((c.course_modules as any[])?.length || 0), 0) || 0;

      return {
        total: courses?.length || 0,
        withModules,
        withoutModules,
        totalModules,
        percentage: courses?.length ? Math.round((withModules / courses.length) * 100) : 0
      };
    }
  });

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('bulk-seed-content', {
        body: { limit: batchSize }
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Successfully processed ${data.processed} courses with 8 weeks of content each`);
      refetch();
    } catch (error: any) {
      console.error('Seeding error:', error);
      toast.error(error.message || 'Failed to seed content');
      setResult({ error: error.message });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Card className="border-green-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-green-500" />
          Bulk Content Seeding
        </CardTitle>
        <CardDescription>
          Generate comprehensive 8-week modules for courses missing content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        {loadingStats ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading course statistics...
          </div>
        ) : courseStats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{courseStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Courses</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{courseStats.withModules}</p>
                <p className="text-xs text-muted-foreground">With Modules</p>
              </div>
              <div className="text-center p-3 bg-amber-500/10 rounded-lg">
                <p className="text-2xl font-bold text-amber-600">{courseStats.withoutModules}</p>
                <p className="text-xs text-muted-foreground">Need Content</p>
              </div>
              <div className="text-center p-3 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">{courseStats.totalModules}</p>
                <p className="text-xs text-muted-foreground">Total Modules</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content Coverage</span>
                <span>{courseStats.percentage}%</span>
              </div>
              <Progress value={courseStats.percentage} className="h-2" />
            </div>

            {courseStats.withoutModules === 0 && (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  All courses have comprehensive content! Students can enjoy a full learning experience.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Seeding Controls */}
        {courseStats && courseStats.withoutModules > 0 && (
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="batch-size">Courses to Process</Label>
                <Input
                  id="batch-size"
                  type="number"
                  min={1}
                  max={50}
                  value={batchSize}
                  onChange={(e) => setBatchSize(parseInt(e.target.value) || 10)}
                />
              </div>
              <Button
                onClick={handleSeed}
                disabled={isSeeding}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
              <p className="font-medium">Each course will receive:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  8 comprehensive weekly modules (2000+ words each)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  10 quiz questions per module (80 total)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Scripture memory verses and discussion questions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  Weekly assignments with ScrollCoin rewards
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-2">
            {result.error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-green-500/10 border-green-500/30">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Processed {result.processed} courses successfully!
                  {result.results && (
                    <ul className="mt-2 space-y-1">
                      {result.results.slice(0, 5).map((r: any, i: number) => (
                        <li key={i} className="text-xs">
                          ✅ {r.course}: {r.modules} modules created
                        </li>
                      ))}
                      {result.results.length > 5 && (
                        <li className="text-xs text-muted-foreground">
                          ...and {result.results.length - 5} more
                        </li>
                      )}
                    </ul>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
