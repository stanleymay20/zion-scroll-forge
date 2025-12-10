import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Calendar, Target, Sparkles, Scroll } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DegreeProgressCardProps {
  progress: {
    id: string;
    degree_level: string;
    completion_percentage: number;
    skills_completed: number;
    skills_required: number;
    current_xp: number;
    target_xp: number;
    scroll_alignment_score: number;
    prophetic_score: number;
    started_at: string;
    expected_completion_at: string | null;
    completed_at: string | null;
    faculty?: {
      name: string;
      emblem_url?: string;
    };
  };
}

const DEGREE_LABELS: Record<string, { label: string; color: string }> = {
  scroll_certificate: { label: 'Scroll Certificate', color: 'bg-gray-500' },
  scroll_diploma: { label: 'Scroll Diploma', color: 'bg-blue-500' },
  bachelor: { label: 'Bachelor\'s Degree', color: 'bg-green-500' },
  master: { label: 'Master\'s Degree', color: 'bg-purple-500' },
  doctorate: { label: 'Doctorate', color: 'bg-amber-500' },
  dpt: { label: 'D.P.T.', color: 'bg-rose-500' },
  dshr: { label: 'D.S.H.R.', color: 'bg-indigo-500' },
  dehsm: { label: 'D.E.H.S.M.', color: 'bg-teal-500' },
  sman: { label: 'S.M.A.N.', color: 'bg-orange-500' },
  dsgei: { label: 'D.S.G.E.I.', color: 'bg-gradient-to-r from-amber-500 to-rose-500' },
  sef: { label: 'S.E.F.', color: 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600' },
};

const DegreeProgressCard = ({ progress }: DegreeProgressCardProps) => {
  const degreeInfo = DEGREE_LABELS[progress.degree_level] || { label: progress.degree_level, color: 'bg-gray-500' };
  const completionPercent = Number(progress.completion_percentage) || 0;
  const skillsPercent = progress.skills_required > 0 
    ? (progress.skills_completed / progress.skills_required) * 100 
    : 0;
  const xpPercent = progress.target_xp > 0 
    ? (progress.current_xp / progress.target_xp) * 100 
    : 0;

  return (
    <Card className={cn(
      'relative overflow-hidden',
      progress.completed_at && 'border-green-500/50 bg-green-500/5'
    )}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {progress.completed_at ? (
          <Badge className="bg-green-500 text-white">Completed</Badge>
        ) : (
          <Badge className={cn(degreeInfo.color, 'text-white')}>In Progress</Badge>
        )}
      </div>

      <CardHeader>
        <div className="flex items-center gap-3">
          {progress.faculty?.emblem_url ? (
            <img 
              src={progress.faculty.emblem_url} 
              alt={progress.faculty.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className={cn('p-3 rounded-lg', degreeInfo.color.includes('gradient') ? degreeInfo.color : `${degreeInfo.color}/20`)}>
              <GraduationCap className={cn('h-6 w-6', degreeInfo.color.includes('gradient') ? 'text-white' : degreeInfo.color.replace('bg-', 'text-'))} />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{degreeInfo.label}</CardTitle>
            <CardDescription>
              {progress.faculty?.name || 'General Studies'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{completionPercent.toFixed(1)}%</span>
          </div>
          <Progress value={completionPercent} className="h-3" />
        </div>

        {/* Skills Progress */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Skills</span>
            </div>
            <p className="font-medium">
              {progress.skills_completed} / {progress.skills_required}
            </p>
            <Progress value={skillsPercent} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-muted-foreground">XP</span>
            </div>
            <p className="font-medium">
              {progress.current_xp.toLocaleString()} / {progress.target_xp.toLocaleString()}
            </p>
            <Progress value={xpPercent} className="h-1.5" />
          </div>
        </div>

        {/* Scroll Scores */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center p-2 rounded-lg bg-indigo-500/10">
            <Scroll className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Scroll Alignment</p>
            <p className="font-bold text-indigo-500">{Number(progress.scroll_alignment_score).toFixed(1)}%</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-purple-500/10">
            <Sparkles className="h-4 w-4 text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Prophetic Score</p>
            <p className="font-bold text-purple-500">{Number(progress.prophetic_score).toFixed(1)}%</p>
          </div>
        </div>

        {/* Dates */}
        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Started: {format(new Date(progress.started_at), 'MMM d, yyyy')}</span>
          </div>
          {progress.expected_completion_at && !progress.completed_at && (
            <div className="flex items-center gap-1">
              <span>Expected: {format(new Date(progress.expected_completion_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {progress.completed_at && (
            <div className="flex items-center gap-1 text-green-600">
              <span>Completed: {format(new Date(progress.completed_at), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DegreeProgressCard;
