/**
 * SUYAS - Course Scheduling Engine
 * Course offerings per term, sections, capacity, conflict detection
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  BookOpen, 
  Plus, 
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Calendar,
  MapPin
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

console.info("✝️ SUYAS Course Scheduling — Orchestrating the curriculum");

interface CourseOffering {
  id: string;
  course_id: string;
  term_id: string;
  section_number?: string;
  capacity: number;
  enrolled_count: number;
  instructor_id?: string;
  schedule: {
    days: string[];
    start_time: string;
    end_time: string;
    room?: string;
  };
  status: 'draft' | 'open' | 'closed' | 'cancelled';
  course?: {
    title: string;
    faculty?: string;
  };
  term?: {
    name: string;
  };
}

interface ClassSession {
  id: string;
  course_id: string;
  title: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  is_virtual: boolean;
  room_location?: string;
  meeting_url?: string;
  status: string;
}

// Fetch courses
const useCourses = () => {
  return useQuery({
    queryKey: ['courses-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, faculty, level, duration')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });
};

// Fetch terms
const useTerms = () => {
  return useQuery({
    queryKey: ['academic-terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('academic_terms')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};

// Fetch class sessions
const useClassSessions = (courseId?: string) => {
  return useQuery({
    queryKey: ['class-sessions', courseId],
    queryFn: async () => {
      let query = supabase
        .from('class_sessions')
        .select('*')
        .order('scheduled_date', { ascending: true });
      
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ClassSession[];
    }
  });
};

// Create class session
const useCreateSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (session: Partial<ClassSession>) => {
      const { data, error } = await supabase
        .from('class_sessions')
        .insert(session)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-sessions'] });
      toast.success('Session scheduled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to schedule session: ${error.message}`);
    }
  });
};

// Conflict detection
const detectConflicts = (sessions: ClassSession[], newSession: Partial<ClassSession>): string[] => {
  const conflicts: string[] = [];
  
  sessions.forEach(session => {
    if (session.scheduled_date === newSession.scheduled_date) {
      // Check time overlap
      const existingStart = session.start_time;
      const existingEnd = session.end_time;
      const newStart = newSession.start_time;
      const newEnd = newSession.end_time;
      
      if (newStart && newEnd && existingStart < newEnd && newStart < existingEnd) {
        conflicts.push(`Time conflict with "${session.title}" at ${existingStart}`);
      }
      
      // Check room conflict
      if (session.room_location && session.room_location === newSession.room_location) {
        conflicts.push(`Room conflict: ${session.room_location} already booked`);
      }
    }
  });
  
  return conflicts;
};

export default function CourseSchedulingEngine() {
  const { data: courses, isLoading: coursesLoading } = useCourses();
  const { data: terms } = useTerms();
  const { data: sessions, isLoading: sessionsLoading } = useClassSessions();
  const createSession = useCreateSession();

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [conflicts, setConflicts] = useState<string[]>([]);
  
  const [sessionForm, setSessionForm] = useState({
    title: '',
    scheduled_date: '',
    start_time: '09:00',
    end_time: '10:30',
    is_virtual: true,
    room_location: '',
    meeting_url: ''
  });

  const checkConflicts = () => {
    if (!sessions) return;
    const detected = detectConflicts(sessions, {
      ...sessionForm,
      course_id: selectedCourse
    });
    setConflicts(detected);
  };

  const handleScheduleSession = async () => {
    if (conflicts.length > 0) {
      toast.error('Please resolve conflicts before scheduling');
      return;
    }
    
    await createSession.mutateAsync({
      title: sessionForm.title,
      scheduled_date: sessionForm.scheduled_date,
      start_time: sessionForm.start_time,
      end_time: sessionForm.end_time,
      is_virtual: sessionForm.is_virtual,
      room_location: sessionForm.room_location || null,
      meeting_url: sessionForm.meeting_url || null,
      course_id: selectedCourse,
      status: 'scheduled'
    } as any);
    
    setScheduleDialogOpen(false);
    setSessionForm({
      title: '',
      scheduled_date: '',
      start_time: '09:00',
      end_time: '10:30',
      is_virtual: true,
      room_location: '',
      meeting_url: ''
    });
    setConflicts([]);
  };

  const isLoading = coursesLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group sessions by date for timetable view
  const sessionsByDate = sessions?.reduce((acc, session) => {
    const date = session.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, ClassSession[]>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Course Scheduling Engine
          </h2>
          <p className="text-muted-foreground">
            Schedule classes, detect conflicts, manage capacity
          </p>
        </div>

        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule Class Session</DialogTitle>
              <DialogDescription>
                Add a new class session with conflict detection
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Week 1: Introduction"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={sessionForm.scheduled_date}
                  onChange={(e) => {
                    setSessionForm({ ...sessionForm, scheduled_date: e.target.value });
                    checkConflicts();
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Time</Label>
                  <Input
                    id="start"
                    type="time"
                    value={sessionForm.start_time}
                    onChange={(e) => {
                      setSessionForm({ ...sessionForm, start_time: e.target.value });
                      checkConflicts();
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Time</Label>
                  <Input
                    id="end"
                    type="time"
                    value={sessionForm.end_time}
                    onChange={(e) => {
                      setSessionForm({ ...sessionForm, end_time: e.target.value });
                      checkConflicts();
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">Room / Location</Label>
                <Input
                  id="room"
                  placeholder="e.g., Room 101 or Virtual"
                  value={sessionForm.room_location}
                  onChange={(e) => {
                    setSessionForm({ ...sessionForm, room_location: e.target.value });
                    checkConflicts();
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meeting_url">Meeting URL (if virtual)</Label>
                <Input
                  id="meeting_url"
                  placeholder="https://meet.google.com/..."
                  value={sessionForm.meeting_url}
                  onChange={(e) => setSessionForm({ ...sessionForm, meeting_url: e.target.value })}
                />
              </div>

              {/* Conflict Warnings */}
              {conflicts.length > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Scheduling Conflicts Detected
                  </div>
                  <ul className="text-sm space-y-1">
                    {conflicts.map((conflict, i) => (
                      <li key={i}>• {conflict}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleSession} 
                disabled={createSession.isPending || conflicts.length > 0 || !selectedCourse || !sessionForm.title}
              >
                {createSession.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {conflicts.length > 0 ? 'Resolve Conflicts' : 'Schedule Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{courses?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{sessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Scheduled Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold">{terms?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Terms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Conflicts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Class Sessions</CardTitle>
          <CardDescription>
            View and manage scheduled class sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 10).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">{session.title}</TableCell>
                    <TableCell>
                      {format(parseISO(session.scheduled_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {session.start_time} - {session.end_time}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {session.is_virtual ? (
                          <>
                            <MapPin className="h-3 w-3" />
                            Virtual
                          </>
                        ) : (
                          session.room_location || 'TBD'
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No class sessions scheduled</p>
              <p className="text-sm mt-2">Click "Schedule Session" to add your first class.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
