import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, Award, Download, Star, Trophy, 
  BookOpen, CheckCircle2, Calendar, Loader2, PartyPopper
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

console.info('✝️ Graduation Page — Christ is Lord over all achievements');

export default function StudentGraduation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

  // Fetch graduation eligibility and progress
  const { data: graduationData, isLoading } = useQuery({
    queryKey: ['graduation-eligibility', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch completed courses
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            faculty,
            level
          )
        `)
        .eq('user_id', user.id)
        .eq('progress', 100);

      if (enrollError) throw enrollError;

      // Fetch certificates
      const { data: certificates } = await supabase
        .from('course_certificates')
        .select('*')
        .eq('user_id', user.id);

      // Fetch user stats
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Calculate graduation eligibility per degree level
      const completedCount = enrollments?.length || 0;
      const totalXP = stats?.total_xp || 0;

      const degreeRequirements = [
        { level: 'ScrollCertificate', coursesRequired: 3, xpRequired: 500, label: 'Scroll Certificate' },
        { level: 'ScrollDiploma', coursesRequired: 6, xpRequired: 1500, label: 'Scroll Diploma' },
        { level: 'ScrollBachelor', coursesRequired: 12, xpRequired: 5000, label: 'Scroll Bachelor' },
        { level: 'ScrollMaster', coursesRequired: 18, xpRequired: 10000, label: 'Scroll Master' },
        { level: 'ScrollDoctorate', coursesRequired: 24, xpRequired: 20000, label: 'Scroll Doctorate' },
        { level: 'ScrollExousia', coursesRequired: 36, xpRequired: 50000, label: 'Scroll Exousia' },
      ];

      const eligibility = degreeRequirements.map(req => ({
        ...req,
        coursesCompleted: completedCount,
        xpEarned: totalXP,
        courseProgress: Math.min((completedCount / req.coursesRequired) * 100, 100),
        xpProgress: Math.min((totalXP / req.xpRequired) * 100, 100),
        eligible: completedCount >= req.coursesRequired && totalXP >= req.xpRequired,
      }));

      return {
        enrollments: enrollments || [],
        certificates: certificates || [],
        stats: stats || { total_xp: 0, courses_completed: 0 },
        eligibility,
      };
    },
    enabled: !!user?.id,
  });

  // Generate certificate mutation
  const generateCertificate = useMutation({
    mutationFn: async (degreeLevel: string) => {
      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { 
          userId: user?.id,
          degreeLevel,
          type: 'graduation'
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (data?.html) {
        const win = window.open();
        if (win) {
          win.document.write(data.html);
        }
      }

      toast.success('🎓 Congratulations! Your certificate has been generated!');
      queryClient.invalidateQueries({ queryKey: ['graduation-eligibility'] });
    },
    onError: () => {
      toast.error('Failed to generate certificate');
    },
  });

  if (isLoading) {
    return (
      <PageTemplate title="Graduation Center" description="Your path to graduation">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  const eligibleDegrees = graduationData?.eligibility.filter(d => d.eligible) || [];
  const inProgressDegrees = graduationData?.eligibility.filter(d => !d.eligible) || [];

  return (
    <PageTemplate
      title="Graduation Center"
      description="Celebrate your achievements and claim your credentials"
    >
      <div className="space-y-6">
        {/* Hero Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 border-primary/20">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/20 rounded-full">
                  <GraduationCap className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">
                    Your Graduation Journey
                  </h2>
                  <p className="text-muted-foreground">
                    {graduationData?.enrollments.length || 0} courses completed • {graduationData?.stats.total_xp || 0} XP earned
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge variant="secondary" className="text-lg py-2 px-4">
                  <Award className="h-4 w-4 mr-2" />
                  {eligibleDegrees.length} Degrees Eligible
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="eligible" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eligible" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ready to Graduate ({eligibleDegrees.length})
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              In Progress ({inProgressDegrees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="mt-6">
            {eligibleDegrees.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {eligibleDegrees.map((degree) => (
                  <Card key={degree.level} className="border-green-500/30 bg-green-500/5">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            {degree.label}
                          </CardTitle>
                          <CardDescription>
                            All requirements completed!
                          </CardDescription>
                        </div>
                        <Badge variant="default" className="bg-green-500">
                          <PartyPopper className="h-3 w-3 mr-1" />
                          Eligible
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Courses</span>
                          <p className="font-medium text-green-600">
                            {degree.coursesCompleted} / {degree.coursesRequired}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">XP</span>
                          <p className="font-medium text-green-600">
                            {degree.xpEarned.toLocaleString()} / {degree.xpRequired.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => generateCertificate.mutate(degree.level)}
                        disabled={generateCertificate.isPending}
                      >
                        {generateCertificate.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Generate Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Keep Learning!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You're not yet eligible for any degrees. Complete more courses to unlock your graduation.
                  </p>
                  <Button className="mt-4" onClick={() => window.location.href = '/courses'}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressDegrees.map((degree) => (
                <Card key={degree.level}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Star className="h-5 w-5 text-primary" />
                      {degree.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Courses</span>
                          <span className="font-medium">
                            {degree.coursesCompleted} / {degree.coursesRequired}
                          </span>
                        </div>
                        <Progress value={degree.courseProgress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">XP</span>
                          <span className="font-medium">
                            {degree.xpEarned.toLocaleString()} / {degree.xpRequired.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={degree.xpProgress} className="h-2" />
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {Math.max(0, degree.coursesRequired - degree.coursesCompleted)} more courses and {Math.max(0, degree.xpRequired - degree.xpEarned).toLocaleString()} more XP needed
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Certificates */}
        {graduationData?.certificates && graduationData.certificates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Certificates
              </CardTitle>
              <CardDescription>
                Certificates you've earned on your journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {graduationData.certificates.map((cert: any) => (
                  <div key={cert.id} className="p-4 border rounded-lg flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">Course Certificate</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(cert.completion_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}
