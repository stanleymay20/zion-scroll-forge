import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useAutoScheduleClassSessions, useAutoGenerateAssignments, useAutoScheduleExams } from '@/hooks/useAcademicScheduling';
import { useSemesters } from '@/hooks/useAcademicYear';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AutoSchedulePreviewProps {
  onComplete?: () => void;
}

export const AutoSchedulePreview = ({ onComplete }: AutoSchedulePreviewProps) => {
  const { data: semesters = [] } = useSemesters();
  const { data: courses = [] } = useQuery({
    queryKey: ['courses-list'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from('courses').select('id, title').limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:30');
  const [assignmentPattern, setAssignmentPattern] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [includeMidterm, setIncludeMidterm] = useState(true);
  const [includeFinal, setIncludeFinal] = useState(true);

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const scheduleClasses = useAutoScheduleClassSessions();
  const generateAssignments = useAutoGenerateAssignments();
  const scheduleExams = useAutoScheduleExams();

  const handleScheduleClasses = async () => {
    if (!selectedCourse || !selectedSemester) return;
    
    await scheduleClasses.mutateAsync({
      courseId: selectedCourse,
      semesterId: selectedSemester,
      dayOfWeek,
      startTime,
      endTime,
    });
    setCompletedSteps((prev) => [...prev, 'classes']);
  };

  const handleGenerateAssignments = async () => {
    if (!selectedCourse || !selectedSemester) return;
    
    await generateAssignments.mutateAsync({
      courseId: selectedCourse,
      semesterId: selectedSemester,
      assignmentPattern,
    });
    setCompletedSteps((prev) => [...prev, 'assignments']);
  };

  const handleScheduleExams = async () => {
    if (!selectedCourse || !selectedSemester) return;
    
    await scheduleExams.mutateAsync({
      courseId: selectedCourse,
      semesterId: selectedSemester,
      includeMidterm,
      includeFinal,
    });
    setCompletedSteps((prev) => [...prev, 'exams']);
  };

  const handleScheduleAll = async () => {
    await handleScheduleClasses();
    await handleGenerateAssignments();
    await handleScheduleExams();
    onComplete?.();
  };

  const isLoading = scheduleClasses.isPending || generateAssignments.isPending || scheduleExams.isPending;
  const canSchedule = selectedCourse && selectedSemester;

  return (
    <div className="space-y-6">
      {/* Course & Semester Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Auto-Schedule Configuration</CardTitle>
          <CardDescription>
            Select a course and semester to automatically generate the full schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Semester</Label>
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Sessions Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Class Sessions</CardTitle>
            </div>
            {completedSteps.includes('classes') && (
              <Badge className="bg-green-500/10 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> Scheduled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <SelectItem key={day} value={day.toLowerCase()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '18:00', '19:00'].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['09:30', '10:30', '11:30', '12:30', '14:30', '15:30', '16:30', '17:30', '19:30', '20:30'].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleScheduleClasses}
            disabled={!canSchedule || scheduleClasses.isPending}
            variant="outline"
            className="w-full"
          >
            {scheduleClasses.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Class Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Assignments Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Assignments</CardTitle>
            </div>
            {completedSteps.includes('assignments') && (
              <Badge className="bg-green-500/10 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> Generated
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment Frequency</Label>
            <Select value={assignmentPattern} onValueChange={(v) => setAssignmentPattern(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerateAssignments}
            disabled={!canSchedule || generateAssignments.isPending}
            variant="outline"
            className="w-full"
          >
            {generateAssignments.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Generate Assignment Deadlines
          </Button>
        </CardContent>
      </Card>

      {/* Exams Config */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Examinations</CardTitle>
            </div>
            {completedSteps.includes('exams') && (
              <Badge className="bg-green-500/10 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" /> Scheduled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="midterm">Include Midterm Exam</Label>
              <Switch
                id="midterm"
                checked={includeMidterm}
                onCheckedChange={setIncludeMidterm}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="final">Include Final Exam</Label>
              <Switch
                id="final"
                checked={includeFinal}
                onCheckedChange={setIncludeFinal}
              />
            </div>
          </div>

          <Button
            onClick={handleScheduleExams}
            disabled={!canSchedule || scheduleExams.isPending}
            variant="outline"
            className="w-full"
          >
            {scheduleExams.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Schedule Exams
          </Button>
        </CardContent>
      </Card>

      {/* Schedule All Button */}
      <Button
        onClick={handleScheduleAll}
        disabled={!canSchedule || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Generate Complete Schedule
      </Button>
    </div>
  );
};
