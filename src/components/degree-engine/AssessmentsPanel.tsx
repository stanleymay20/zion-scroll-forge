import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles,
  BookOpen,
  Heart,
  Brain,
  Award
} from 'lucide-react';
import { useDivineAssessments } from '@/hooks/useDivineAssessments';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const ASSESSMENT_TYPE_INFO: Record<string, { label: string; icon: any; color: string; description: string }> = {
  academic: { 
    label: 'Academic', 
    icon: BookOpen, 
    color: 'text-blue-500 bg-blue-500/10',
    description: 'Traditional academic evaluation'
  },
  prophetic: { 
    label: 'Prophetic', 
    icon: Sparkles, 
    color: 'text-purple-500 bg-purple-500/10',
    description: 'Spiritual discernment and prophetic wisdom'
  },
  divine: { 
    label: 'Divine', 
    icon: Heart, 
    color: 'text-rose-500 bg-rose-500/10',
    description: 'Holistic evaluation of spiritual maturity'
  },
  practical: { 
    label: 'Practical', 
    icon: Target, 
    color: 'text-green-500 bg-green-500/10',
    description: 'Real-world application assessment'
  },
  collaborative: { 
    label: 'Collaborative', 
    icon: Brain, 
    color: 'text-amber-500 bg-amber-500/10',
    description: 'Team-based evaluation'
  },
  scroll_defense: { 
    label: 'Scroll Defense', 
    icon: Award, 
    color: 'text-indigo-500 bg-indigo-500/10',
    description: 'Final thesis defense before council'
  },
};

const AssessmentsPanel = () => {
  const { assessments, myAttempts, stats, startAttempt, assessmentsLoading } = useDivineAssessments();
  const [activeTab, setActiveTab] = useState('available');

  const passedAttempts = myAttempts?.filter(a => a.passed) || [];
  const pendingAttempts = myAttempts?.filter(a => !a.submitted_at) || [];
  const failedAttempts = myAttempts?.filter(a => a.submitted_at && !a.passed) || [];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold text-blue-500">{assessments?.length || 0}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-500">{stats.attemptsPassed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-amber-500">{stats.passRate.toFixed(0)}%</p>
              </div>
              <Award className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-purple-500">{stats.avgScore.toFixed(1)}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-rose-500">{stats.totalXP}</p>
              </div>
              <Sparkles className="h-8 w-8 text-rose-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({pendingAttempts.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({passedAttempts.length + failedAttempts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {assessments?.map((assessment: any) => {
              const typeInfo = ASSESSMENT_TYPE_INFO[assessment.assessment_type] || ASSESSMENT_TYPE_INFO.academic;
              const Icon = typeInfo.icon;
              const hasAttempted = myAttempts?.some(a => a.assessment_id === assessment.id);

              return (
                <Card key={assessment.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', typeInfo.color)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{assessment.title}</CardTitle>
                          <CardDescription>{assessment.faculty?.name || 'General'}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">{typeInfo.label}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {assessment.description || typeInfo.description}
                    </p>

                    {/* Score Weights */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                      <div className="p-2 rounded bg-blue-500/10">
                        <BookOpen className="h-3 w-3 text-blue-500 mx-auto mb-1" />
                        <p className="text-muted-foreground">Academic</p>
                        <p className="font-medium">{(assessment.academic_weight * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 rounded bg-purple-500/10">
                        <Sparkles className="h-3 w-3 text-purple-500 mx-auto mb-1" />
                        <p className="text-muted-foreground">Prophetic</p>
                        <p className="font-medium">{(assessment.prophetic_weight * 100).toFixed(0)}%</p>
                      </div>
                      <div className="p-2 rounded bg-rose-500/10">
                        <Heart className="h-3 w-3 text-rose-500 mx-auto mb-1" />
                        <p className="text-muted-foreground">Character</p>
                        <p className="font-medium">{(assessment.character_weight * 100).toFixed(0)}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Pass: {assessment.passing_score}%</span>
                        {assessment.time_limit_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {assessment.time_limit_minutes} min
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-600">
                          +{assessment.xp_reward} XP
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => startAttempt.mutate(assessment.id)}
                          disabled={startAttempt.isPending || hasAttempted}
                        >
                          {hasAttempted ? 'Attempted' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {(!assessments || assessments.length === 0) && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments Available</h3>
                <p className="text-muted-foreground text-center">
                  Check back later for new divine assessments.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {pendingAttempts.length > 0 ? (
            pendingAttempts.map((attempt: any) => (
              <Card key={attempt.id} className="border-amber-500/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Clock className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">{attempt.assessment?.title || 'Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Started {format(new Date(attempt.started_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm">Continue</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Assessments In Progress</h3>
                <p className="text-muted-foreground text-center">
                  Start a new assessment to begin your evaluation.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {(passedAttempts.length > 0 || failedAttempts.length > 0) ? (
            [...passedAttempts, ...failedAttempts].map((attempt: any) => (
              <Card key={attempt.id} className={cn(
                attempt.passed ? 'border-green-500/30' : 'border-red-500/30'
              )}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        attempt.passed ? 'bg-green-500/10' : 'bg-red-500/10'
                      )}>
                        {attempt.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{attempt.assessment?.title || 'Assessment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Completed {format(new Date(attempt.submitted_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-lg font-bold',
                        attempt.passed ? 'text-green-500' : 'text-red-500'
                      )}>
                        {attempt.total_score?.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{attempt.xp_awarded} XP
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Academic</p>
                      <p className="font-medium">{attempt.academic_score?.toFixed(1) || '-'}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Prophetic</p>
                      <p className="font-medium">{attempt.prophetic_score?.toFixed(1) || '-'}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Character</p>
                      <p className="font-medium">{attempt.character_score?.toFixed(1) || '-'}%</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Scroll Align</p>
                      <p className="font-medium">{attempt.scroll_alignment_score?.toFixed(1) || '-'}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Assessments</h3>
                <p className="text-muted-foreground text-center">
                  Complete your first assessment to see your results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssessmentsPanel;
