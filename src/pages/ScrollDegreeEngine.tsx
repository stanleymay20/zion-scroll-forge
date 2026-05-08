import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Target, 
  Users, 
  Award, 
  BookOpen, 
  TrendingUp,
  Sparkles,
  Crown,
  Scroll,
  Brain,
  Heart,
  Shield
} from 'lucide-react';
import { useDegreeProgress } from '@/hooks/useDegreeProgress';
import { useMentorship } from '@/hooks/useMentorship';
import { useDivineAssessments } from '@/hooks/useDivineAssessments';
import { useSupremeDegrees, SUPREME_DEGREES } from '@/hooks/useSupremeDegrees';
import SkillsTracker from '@/components/degree-engine/SkillsTracker';
import DegreeProgressCard from '@/components/degree-engine/DegreeProgressCard';
import MentorshipPanel from '@/components/degree-engine/MentorshipPanel';
import AssessmentsPanel from '@/components/degree-engine/AssessmentsPanel';
import SupremeDegreesPanel from '@/components/degree-engine/SupremeDegreesPanel';
import ScrollTranscriptPanel from '@/components/degree-engine/ScrollTranscriptPanel';
import { toast } from "sonner";

const ScrollDegreeEngine = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { degreeProgress, studentSkills, stats: degreeStats } = useDegreeProgress();
  const { stats: mentorshipStats } = useMentorship();
  const { stats: assessmentStats } = useDivineAssessments();
  const { applications } = useSupremeDegrees();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
                  ScrollDegree Engine
                </h1>
                <p className="text-muted-foreground">
                  Divine Assessment • Skill Tracking • Supreme Degrees
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
              <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Total XP</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-500">{degreeStats.totalXP.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-muted-foreground">Skills</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{degreeStats.skillsCount}</p>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-muted-foreground">Mastered</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-500">{degreeStats.masterSkillsCount}</p>
                </CardContent>
              </Card>

              <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-muted-foreground">Mentorship</span>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{mentorshipStats.activeRelationships}</p>
                </CardContent>
              </Card>

              <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-rose-500" />
                    <span className="text-sm text-muted-foreground">Assessments</span>
                  </div>
                  <p className="text-2xl font-bold text-rose-500">{assessmentStats.attemptsPassed}/{assessmentStats.attemptsTotal}</p>
                </CardContent>
              </Card>

              <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Scroll className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-muted-foreground">Scroll Alignment</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-500">{degreeStats.avgScrollAlignment.toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-2 bg-muted/50">
              <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2 py-3">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Skills</span>
              </TabsTrigger>
              <TabsTrigger value="assessments" className="flex items-center gap-2 py-3">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Assessments</span>
              </TabsTrigger>
              <TabsTrigger value="mentorship" className="flex items-center gap-2 py-3">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Mentorship</span>
              </TabsTrigger>
              <TabsTrigger value="supreme" className="flex items-center gap-2 py-3">
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Supreme</span>
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-2 py-3">
                <Scroll className="h-4 w-4" />
                <span className="hidden sm:inline">Transcript</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Degree Progress */}
              <div className="grid gap-6 md:grid-cols-2">
                {degreeProgress?.map((progress: any) => (
                  <DegreeProgressCard key={progress.id} progress={progress} />
                ))}
                {(!degreeProgress || degreeProgress.length === 0) && (
                  <Card className="md:col-span-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Active Degree Programs</h3>
                      <p className="text-muted-foreground text-center mb-4">
                        Start your divine academic journey by enrolling in a degree program.
                      </p>
                      <Button className="bg-gradient-to-r from-amber-500 to-amber-600" onClick={() => toast.info("This action is launching with the next release.")}>
                        Browse Programs
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recent Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Recent Skill Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {studentSkills?.slice(0, 6).map((skill: any) => (
                      <div key={skill.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Brain className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{skill.skill?.name || 'Unknown Skill'}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {skill.proficiency_level}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {skill.xp_earned} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Supreme Degrees Preview */}
              <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Supreme Scroll Degrees
                  </CardTitle>
                  <CardDescription>
                    The highest honors in ScrollUniversity - eternal, prophetic, and governance-based credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {SUPREME_DEGREES.slice(0, 3).map((degree) => (
                      <div 
                        key={degree.code} 
                        className="p-4 rounded-lg border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent"
                      >
                        <Badge className="mb-2 bg-amber-500/20 text-amber-700 hover:bg-amber-500/30">
                          {degree.shortName}
                        </Badge>
                        <h4 className="font-semibold text-sm mb-1">{degree.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{degree.description}</p>
                        <p className="text-xs text-amber-600 mt-2 font-medium">
                          ₿ {degree.scrollgoldValue.toLocaleString()} ScrollGold
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-4 border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
                    onClick={() => setActiveTab('supreme')}
                  >
                    View All Supreme Degrees
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <SkillsTracker />
            </TabsContent>

            <TabsContent value="assessments">
              <AssessmentsPanel />
            </TabsContent>

            <TabsContent value="mentorship">
              <MentorshipPanel />
            </TabsContent>

            <TabsContent value="supreme">
              <SupremeDegreesPanel />
            </TabsContent>

            <TabsContent value="transcript">
              <ScrollTranscriptPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
};

export default ScrollDegreeEngine;
