import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Download, CheckCircle2, XCircle, Clock, 
  BarChart3, FileJson, Calendar, Zap, Loader2 
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface GenerationReport {
  id: string;
  created_at: string;
  report_data: {
    totalDuration: number;
    faculties: number;
    courses: number;
    modules: number;
    quizzes: number;
    materials: number;
    tutors: number;
    terms: number;
    offerings: number;
    antiDriftValidations?: number;
    antiDriftFailures?: number;
    errors?: string[];
  };
  status: string;
}

const GenerationHistory = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [liveProgress, setLiveProgress] = useState<any>(null);
  const queryClient = useQueryClient();

  // Real-time subscription for live generation progress
  useEffect(() => {
    const channel = supabase
      .channel('generation-progress')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'generation_progress' },
        (payload) => {
          console.log('Live generation update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setLiveProgress(payload.new);
          } else if (payload.eventType === 'DELETE') {
            setLiveProgress(null);
          }
          queryClient.invalidateQueries({ queryKey: ['generation-reports'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['generation-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .storage
        .from('materials')
        .list('generation-reports', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      // Fetch report data
      const reportsWithData = await Promise.all(
        (data || []).map(async (file) => {
          try {
            const { data: fileData } = await supabase.storage
              .from('materials')
              .download(`generation-reports/${file.name}`);
            
            if (fileData) {
              const text = await fileData.text();
              const reportData = JSON.parse(text);
              return {
                id: file.name,
                created_at: file.created_at,
                report_data: reportData,
                status: 'success',
              };
            }
          } catch (err) {
            console.error('Error loading report:', err);
          }
          return null;
        })
      );

      return reportsWithData.filter(Boolean) as GenerationReport[];
    },
  });

  const downloadReport = async (reportId: string) => {
    setDownloadingId(reportId);
    try {
      const { data, error } = await supabase.storage
        .from('materials')
        .download(`generation-reports/${reportId}`);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = reportId;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const totalStats = reports?.reduce(
    (acc, report) => ({
      faculties: acc.faculties + (report.report_data.faculties || 0),
      courses: acc.courses + (report.report_data.courses || 0),
      modules: acc.modules + (report.report_data.modules || 0),
      quizzes: acc.quizzes + (report.report_data.quizzes || 0),
      materials: acc.materials + (report.report_data.materials || 0),
      tutors: acc.tutors + (report.report_data.tutors || 0),
    }),
    { faculties: 0, courses: 0, modules: 0, quizzes: 0, materials: 0, tutors: 0 }
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Generation History</h1>
        <p className="text-muted-foreground">
          Track all content generation runs and download detailed reports
        </p>
      </div>

      {/* Live Progress Monitor */}
      {liveProgress && (
        <Card className="mb-8 border-2 border-primary animate-pulse">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <CardTitle>Generation In Progress</CardTitle>
                  <CardDescription>Real-time updates</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="animate-pulse">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{liveProgress.current_stage || 'Processing...'}</span>
                <span className="text-muted-foreground">
                  {Math.round(liveProgress.progress || 0)}%
                </span>
              </div>
              <Progress value={liveProgress.progress || 0} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {liveProgress.faculties_created > 0 && (
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-xl font-bold text-primary">{liveProgress.faculties_created}</div>
                  <div className="text-xs text-muted-foreground">Faculties</div>
                </div>
              )}
              {liveProgress.courses_created > 0 && (
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-xl font-bold text-primary">{liveProgress.courses_created}</div>
                  <div className="text-xs text-muted-foreground">Courses</div>
                </div>
              )}
              {liveProgress.modules_created > 0 && (
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-xl font-bold text-primary">{liveProgress.modules_created}</div>
                  <div className="text-xs text-muted-foreground">Modules</div>
                </div>
              )}
              {liveProgress.tutors_created > 0 && (
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-xl font-bold text-primary">{liveProgress.tutors_created}</div>
                  <div className="text-xs text-muted-foreground">AI Tutors</div>
                </div>
              )}
            </div>

            {liveProgress.estimated_time_remaining && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Estimated time remaining: {liveProgress.estimated_time_remaining}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Faculties</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.faculties || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Courses</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.courses || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Modules</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.modules || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Quizzes</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.quizzes || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Materials</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.materials || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>AI Tutors</CardDescription>
            <CardTitle className="text-3xl">{totalStats?.tutors || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Generation Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Runs</CardTitle>
          <CardDescription>
            {reports?.length || 0} generation{reports?.length !== 1 ? 's' : ''} completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <Card key={report.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">Generation Run</CardTitle>
                          <Badge variant="secondary">{report.status}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(report.created_at).toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {(report.report_data.totalDuration / 1000 / 60).toFixed(1)} minutes
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport(report.id)}
                        disabled={downloadingId === report.id}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingId === report.id ? 'Downloading...' : 'Download JSON'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.faculties}</div>
                        <div className="text-xs text-muted-foreground">Faculties</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.courses}</div>
                        <div className="text-xs text-muted-foreground">Courses</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.modules}</div>
                        <div className="text-xs text-muted-foreground">Modules</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.quizzes}</div>
                        <div className="text-xs text-muted-foreground">Quizzes</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.materials}</div>
                        <div className="text-xs text-muted-foreground">Materials</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.tutors}</div>
                        <div className="text-xs text-muted-foreground">AI Tutors</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.terms}</div>
                        <div className="text-xs text-muted-foreground">Terms</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded">
                        <div className="text-2xl font-bold text-primary">{report.report_data.offerings}</div>
                        <div className="text-xs text-muted-foreground">Offerings</div>
                      </div>
                    </div>

                    {/* Anti-Drift Validations */}
                    {(report.report_data.antiDriftValidations || report.report_data.antiDriftFailures) && (
                      <div className="flex items-center gap-4 p-3 bg-accent/20 rounded text-sm">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent" />
                          <span className="font-medium">Anti-Drift:</span>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {report.report_data.antiDriftValidations || 0} validations
                        </Badge>
                        {report.report_data.antiDriftFailures ? (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            {report.report_data.antiDriftFailures} failures
                          </Badge>
                        ) : null}
                      </div>
                    )}

                    {/* Errors */}
                    {report.report_data.errors && report.report_data.errors.length > 0 && (
                      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="font-medium text-sm">Errors</span>
                        </div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {report.report_data.errors.slice(0, 3).map((error, idx) => (
                            <li key={idx} className="truncate">• {error}</li>
                          ))}
                          {report.report_data.errors.length > 3 && (
                            <li className="text-xs">+ {report.report_data.errors.length - 3} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileJson className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Generation Runs Yet</h3>
              <p className="text-muted-foreground mb-4">
                Run the content generation pipeline to see reports here.
              </p>
              <Button onClick={() => window.location.href = '/content-generation'}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Go to Content Generation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerationHistory;
