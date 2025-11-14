import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSkillsAssessment } from '@/hooks/usePersonalization';
import { Loader2, TrendingUp, TrendingDown, Award, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';

console.info('✝️ Skills Assessment — Christ is Lord over our growth');

export default function SkillsAssessment() {
  const { data: assessment, isLoading } = useSkillsAssessment();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <PageTemplate title="Skills Assessment">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Complete some modules to generate your skills assessment.</p>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const { strengths, weaknesses, overall } = assessment;

  const getMasteryColor = (mastery: number) => {
    if (mastery >= 90) return 'text-green-500';
    if (mastery >= 70) return 'text-blue-500';
    if (mastery >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMasteryLabel = (mastery: number) => {
    if (mastery >= 90) return 'Expert';
    if (mastery >= 70) return 'Proficient';
    if (mastery >= 50) return 'Developing';
    return 'Beginner';
  };

  // Prepare data for radar chart
  const radarData = strengths.map((s: any) => ({
    faculty: s.faculty.substring(0, 15),
    mastery: s.avgMastery,
  }));

  // Prepare data for bar chart
  const barData = [...strengths, ...weaknesses].map((item: any) => ({
    faculty: item.faculty.substring(0, 20),
    mastery: item.avgMastery,
  }));

  return (
    <PageTemplate title="Skills Assessment">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Overall Performance
            </CardTitle>
            <CardDescription>
              "Whatever you do, work heartily, as for the Lord and not for men." - Colossians 3:23
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Modules Completed</p>
                <p className="text-3xl font-bold">{overall.totalModules}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Average Mastery</p>
                <div className="flex items-center gap-3">
                  <p className={`text-3xl font-bold ${getMasteryColor(overall.avgMastery)}`}>
                    {overall.avgMastery}%
                  </p>
                  <Badge>{getMasteryLabel(overall.avgMastery)}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Overall Progress</p>
                <Progress value={overall.avgMastery} className="mb-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mastery by Faculty</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faculty" angle={-45} textAnchor="end" height={100} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="mastery" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skills Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="faculty" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Mastery" dataKey="mastery" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Top Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {strengths.map((strength: any, index: number) => (
                  <div key={strength.faculty}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{strength.faculty}</span>
                      </div>
                      <span className={`font-bold ${getMasteryColor(strength.avgMastery)}`}>
                        {strength.avgMastery}%
                      </span>
                    </div>
                    <Progress value={strength.avgMastery} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {strength.modulesCompleted} modules completed
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <TrendingDown className="h-5 w-5" />
                Areas for Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weaknesses.map((weakness: any, index: number) => (
                  <div key={weakness.faculty}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <span className="font-medium">{weakness.faculty}</span>
                      </div>
                      <span className={`font-bold ${getMasteryColor(weakness.avgMastery)}`}>
                        {weakness.avgMastery}%
                      </span>
                    </div>
                    <Progress value={weakness.avgMastery} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Focus on improving this area
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
