import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  GraduationCap, Award, Download, Star, Trophy, 
  BookOpen, CheckCircle2, Calendar, Loader2, PartyPopper,
  Eye, ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function StudentGraduation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: graduationData, isLoading } = useQuery({
    queryKey: ['graduation-eligibility', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [enrollRes, certRes, statsRes] = await Promise.all([
        supabase.from('enrollments').select('*, courses (id, title, faculty, level)')
          .eq('user_id', user.id).eq('progress', 100),
        supabase.from('course_certificates').select('*, courses:course_id (title, faculty)')
          .eq('user_id', user.id),
        supabase.from('user_stats').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const enrollments = enrollRes.data || [];
      const certificates = certRes.data || [];
      const stats = statsRes.data;
      const completedCount = enrollments.length;
      const totalXP = stats?.total_xp || 0;

      const degreeRequirements = [
        { level: 'ScrollCertificate', coursesRequired: 3, xpRequired: 500, label: 'Scroll Certificate', icon: '📜' },
        { level: 'ScrollDiploma', coursesRequired: 6, xpRequired: 1500, label: 'Scroll Diploma', icon: '🎓' },
        { level: 'ScrollBachelor', coursesRequired: 12, xpRequired: 5000, label: "Scroll Bachelor's", icon: '🏆' },
        { level: 'ScrollMaster', coursesRequired: 18, xpRequired: 10000, label: "Scroll Master's", icon: '👑' },
        { level: 'ScrollDoctorate', coursesRequired: 24, xpRequired: 20000, label: 'Scroll Doctorate', icon: '⭐' },
        { level: 'ScrollExousia', coursesRequired: 36, xpRequired: 50000, label: 'Scroll Exousia', icon: '✨' },
      ];

      const eligibility = degreeRequirements.map(req => ({
        ...req,
        coursesCompleted: completedCount,
        xpEarned: totalXP,
        courseProgress: Math.min((completedCount / req.coursesRequired) * 100, 100),
        xpProgress: Math.min((totalXP / req.xpRequired) * 100, 100),
        eligible: completedCount >= req.coursesRequired && totalXP >= req.xpRequired,
      }));

      return { enrollments, certificates, stats: stats || { total_xp: 0 }, eligibility };
    },
    enabled: !!user?.id,
  });

  const generateCertificate = useMutation({
    mutationFn: async (degreeLevel: string) => {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { userId: user?.id, degreeLevel, type: 'graduation' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      if (data?.html) {
        const win = window.open();
        if (win) win.document.write(data.html);
      }
      toast.success('🎓 Congratulations! Your degree certificate has been generated!');
      queryClient.invalidateQueries({ queryKey: ['graduation-eligibility'] });
    },
    onError: () => toast.error('Failed to generate certificate'),
  });

  const viewCertificate = useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { userId: user?.id, courseId, type: 'course' },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.html) {
        const win = window.open();
        if (win) win.document.write(data.html);
      }
    },
  });

  if (isLoading) {
    return (
      <PageTemplate title="Graduation Center" description="Your path to graduation">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      </PageTemplate>
    );
  }

  const eligibleDegrees = graduationData?.eligibility.filter(d => d.eligible) || [];
  const inProgressDegrees = graduationData?.eligibility.filter(d => !d.eligible) || [];
  const certificates = graduationData?.certificates || [];

  return (
    <PageTemplate
      title="Graduation Center"
      description="Celebrate your achievements and claim your credentials"
    >
      <div className="space-y-5">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{graduationData?.enrollments.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Courses Done</p>
            </CardContent>
          </Card>
          <Card className="bg-accent/5 border-accent/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">{graduationData?.stats.total_xp || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total XP</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{certificates.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Certificates</p>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-secondary">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{eligibleDegrees.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Degrees Ready</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="eligible" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="eligible" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <Trophy className="h-4 w-4" />
              <span>Graduate ({eligibleDegrees.length})</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              <span>Progress ({inProgressDegrees.length})</span>
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-1.5 py-2.5 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              <span>Certs ({certificates.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Eligible Degrees Tab */}
          <TabsContent value="eligible" className="mt-4">
            {eligibleDegrees.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {eligibleDegrees.map((degree) => (
                  <Card key={degree.level} className="border-green-500/30 bg-green-500/5 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2 text-green-600 text-base">
                          <span className="text-xl">{degree.icon}</span>
                          {degree.label}
                        </CardTitle>
                        <Badge variant="default" className="bg-green-500 text-xs">
                          <PartyPopper className="h-3 w-3 mr-1" /> Ready
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-background/50 rounded-lg p-2.5 text-center">
                          <span className="text-muted-foreground text-xs block">Courses</span>
                          <p className="font-bold text-green-600">
                            {degree.coursesCompleted}/{degree.coursesRequired}
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-2.5 text-center">
                          <span className="text-muted-foreground text-xs block">XP</span>
                          <p className="font-bold text-green-600">
                            {degree.xpEarned.toLocaleString()}/{degree.xpRequired.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="w-full h-11 touch-target"
                        onClick={() => generateCertificate.mutate(degree.level)}
                        disabled={generateCertificate.isPending}
                      >
                        {generateCertificate.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Claim Degree Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <GraduationCap className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Keep Learning!</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                    Complete more courses and earn XP to unlock your first degree.
                  </p>
                  <Button onClick={() => window.location.href = '/courses'}>
                    <BookOpen className="h-4 w-4 mr-2" /> Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressDegrees.map((degree) => (
                <Card key={degree.level}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <span>{degree.icon}</span>
                      {degree.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Courses</span>
                        <span className="font-medium">{degree.coursesCompleted}/{degree.coursesRequired}</span>
                      </div>
                      <Progress value={degree.courseProgress} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">XP</span>
                        <span className="font-medium">{degree.xpEarned.toLocaleString()}/{degree.xpRequired.toLocaleString()}</span>
                      </div>
                      <Progress value={degree.xpProgress} className="h-2" />
                    </div>
                    <p className="text-xs text-muted-foreground pt-1 border-t">
                      {Math.max(0, degree.coursesRequired - degree.coursesCompleted)} courses + {Math.max(0, degree.xpRequired - degree.xpEarned).toLocaleString()} XP remaining
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-4">
            {certificates.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {certificates.map((cert: any) => (
                  <Card key={cert.id} className="group hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-full shrink-0">
                          <Award className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {cert.courses?.title || 'Course Certificate'}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cert.courses?.faculty || 'Scroll University'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="h-2.5 w-2.5 mr-1" />
                              {new Date(cert.completion_date).toLocaleDateString()}
                            </Badge>
                            {cert.scroll_badge_earned && (
                              <Badge variant="secondary" className="text-xs bg-accent/10 text-accent">
                                🏆 Badge
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3 h-9"
                        onClick={() => viewCertificate.mutate(cert.course_id)}
                        disabled={viewCertificate.isPending}
                      >
                        {viewCertificate.isPending ? (
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1.5" />
                        )}
                        View Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <Award className="h-14 w-14 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Certificates Yet</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Complete a course to earn your first certificate.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}