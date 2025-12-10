import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Minus, Award, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentProgressRowProps {
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    gpa: number;
    previousGpa?: number;
    creditsEarned: number;
    creditsAttempted: number;
    standing: 'good' | 'probation' | 'warning' | 'suspension' | 'dismissed';
    enrolledCourses: number;
    completedAssignments: number;
    totalAssignments: number;
    deansList?: boolean;
  };
  onClick?: () => void;
}

export const StudentProgressRow = ({ student, onClick }: StudentProgressRowProps) => {
  const gpaChange = student.previousGpa ? student.gpa - student.previousGpa : 0;
  const assignmentProgress = (student.completedAssignments / Math.max(1, student.totalAssignments)) * 100;

  const getStandingBadge = () => {
    switch (student.standing) {
      case 'good':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Good Standing</Badge>;
      case 'probation':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Academic Probation</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Warning</Badge>;
      case 'suspension':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'dismissed':
        return <Badge variant="destructive">Dismissed</Badge>;
    }
  };

  const getGpaTrend = () => {
    if (gpaChange > 0.1) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (gpaChange < -0.1) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-green-500';
    if (gpa >= 3.0) return 'text-blue-500';
    if (gpa >= 2.5) return 'text-yellow-500';
    if (gpa >= 2.0) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-md cursor-pointer',
        student.standing !== 'good' && 'border-orange-500/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback>
                {student.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{student.name}</p>
                {student.deansList && (
                  <Award className="h-4 w-4 text-amber-500" />
                )}
                {student.standing !== 'good' && (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{student.email}</p>
            </div>
          </div>

          {/* GPA */}
          <div className="text-center px-4 border-l">
            <div className="flex items-center gap-1">
              <span className={cn('text-xl font-bold', getGpaColor(student.gpa))}>
                {student.gpa.toFixed(2)}
              </span>
              {getGpaTrend()}
            </div>
            <p className="text-xs text-muted-foreground">GPA</p>
          </div>

          {/* Credits */}
          <div className="text-center px-4 border-l hidden md:block">
            <p className="text-lg font-semibold">{student.creditsEarned}</p>
            <p className="text-xs text-muted-foreground">
              of {student.creditsAttempted} credits
            </p>
          </div>

          {/* Assignment Progress */}
          <div className="w-32 hidden lg:block px-4 border-l">
            <div className="flex justify-between text-xs mb-1">
              <span>Assignments</span>
              <span>{student.completedAssignments}/{student.totalAssignments}</span>
            </div>
            <Progress value={assignmentProgress} className="h-2" />
          </div>

          {/* Standing Badge */}
          <div className="flex-shrink-0">
            {getStandingBadge()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
