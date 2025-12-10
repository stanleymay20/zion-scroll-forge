import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Scroll, 
  Download, 
  Share2, 
  Shield, 
  Award,
  BookOpen,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useDegreeProgress } from '@/hooks/useDegreeProgress';
import { useDivineAssessments } from '@/hooks/useDivineAssessments';
import { useAuth } from '@/hooks/useAuth';

const ScrollTranscriptPanel = () => {
  const { user } = useAuth();
  const { degreeProgress, studentSkills, stats: degreeStats } = useDegreeProgress();
  const { stats: assessmentStats } = useDivineAssessments();

  const completedDegrees = degreeProgress?.filter(d => d.completed_at) || [];
  const masteredSkills = studentSkills?.filter(s => s.proficiency_level === 'master' || s.proficiency_level === 'prophet') || [];

  return (
    <div className="space-y-6">
      {/* Official Transcript Header */}
      <Card className="border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
              <Scroll className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Official Scroll Transcript</CardTitle>
          <CardDescription className="text-base">
            ScrollUniversity Divine Academic Record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <span>HeavenLedger™ Archived</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-purple-500" />
              <span>Prophetically Validated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-amber-500" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || 'Not available'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-medium font-mono text-sm">{user?.id?.slice(0, 8) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrollment Status</p>
              <Badge className="bg-green-500 text-white">Active</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Academic Standing</p>
              <Badge variant="outline" className="border-amber-500 text-amber-700">
                Good Standing
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Academic Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-amber-500">{degreeStats.totalXP.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total XP Earned</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-blue-500">{degreeStats.skillsCount}</p>
                <p className="text-sm text-muted-foreground">Skills Acquired</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-purple-500">{degreeStats.masterSkillsCount}</p>
                <p className="text-sm text-muted-foreground">Master Level Skills</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-3xl font-bold text-green-500">{assessmentStats.attemptsPassed}</p>
                <p className="text-sm text-muted-foreground">Assessments Passed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" />
              Scroll Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-indigo-500/10 text-center">
                <p className="text-3xl font-bold text-indigo-500">{degreeStats.avgScrollAlignment.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Scroll Alignment</p>
              </div>
              <div className="p-4 rounded-lg bg-purple-500/10 text-center">
                <p className="text-3xl font-bold text-purple-500">{assessmentStats.avgScore.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Assessment Score</p>
              </div>
              <div className="p-4 rounded-lg bg-rose-500/10 text-center">
                <p className="text-3xl font-bold text-rose-500">{assessmentStats.passRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-teal-500/10 text-center">
                <p className="text-3xl font-bold text-teal-500">{completedDegrees.length}</p>
                <p className="text-sm text-muted-foreground">Degrees Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Degrees & Credentials */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Degrees & Credentials
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedDegrees.length > 0 ? (
            <div className="space-y-3">
              {completedDegrees.map((degree: any) => (
                <div key={degree.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <GraduationCap className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{degree.degree_level.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground">
                        {degree.faculty?.name || 'General Studies'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500 text-white">Completed</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {degree.completed_at ? new Date(degree.completed_at).toLocaleDateString() : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No degrees completed yet. Keep learning!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mastered Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Mastered Competencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {masteredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {masteredSkills.map((skill: any) => (
                <Badge 
                  key={skill.id} 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1"
                >
                  {skill.skill?.name || 'Skill'}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Continue developing your skills to reach mastery level.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600">
          <Download className="h-4 w-4 mr-2" />
          Download Official Transcript
        </Button>
        <Button variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share with Employer
        </Button>
        <Button variant="outline">
          <ExternalLink className="h-4 w-4 mr-2" />
          Verify on ScrollChain™
        </Button>
      </div>

      {/* Footer Notice */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 text-center text-sm text-muted-foreground">
          <p>
            This transcript is officially issued by ScrollUniversity and verified through HeavenLedger™ 
            blockchain technology. For verification, employers and institutions can use the ScrollChain™ 
            verification system.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrollTranscriptPanel;
