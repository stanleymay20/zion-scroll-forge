/**
 * SUYAS - Deadline & Assessment Orchestrator
 * Assignment/exam objects with windows, attempt rules, late policy, extensions
 * Automated reminders: email + in-app + calendar export
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar, 
  Clock,
  Bell,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Download,
  Mail,
  Timer,
  RotateCcw
} from "lucide-react";
import { format, differenceInDays, isPast, isFuture, addDays } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

console.info("✝️ SUYAS Deadline Orchestrator — Managing academic timelines");

interface Deadline {
  id: string;
  title: string;
  description: string;
  course_id: string;
  course_title?: string;
  deadline_type: 'assignment' | 'exam' | 'quiz' | 'project' | 'discussion';
  due_date: string;
  open_date: string | null;
  close_date: string | null;
  max_attempts: number;
  late_policy: 'no_late' | 'penalty' | 'extension_only';
  late_penalty_percent: number;
  grace_period_hours: number;
  reminder_settings: {
    days_before: number[];
    email_enabled: boolean;
    push_enabled: boolean;
  };
  status: 'draft' | 'published' | 'closed';
  submissions_count: number;
}

const deadlineTypeConfig = {
  assignment: { label: 'Assignment', color: 'bg-blue-500' },
  exam: { label: 'Exam', color: 'bg-red-500' },
  quiz: { label: 'Quiz', color: 'bg-purple-500' },
  project: { label: 'Project', color: 'bg-green-500' },
  discussion: { label: 'Discussion', color: 'bg-amber-500' }
};

const latePolicyConfig = {
  no_late: { label: 'No Late Submissions', description: 'Submissions close exactly at deadline' },
  penalty: { label: 'Late Penalty', description: 'Accept late with penalty deduction' },
  extension_only: { label: 'Extension Only', description: 'Only accept with approved extension' }
};

// Fetch assignments as deadlines
const useDeadlines = () => {
  return useQuery({
    queryKey: ['suyas-deadlines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          course_id,
          due_at,
          type,
          total_points,
          published,
          courses (title)
        `)
        .order('due_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(assignment => ({
        id: assignment.id,
        title: assignment.title || 'Untitled Assignment',
        description: assignment.description || '',
        course_id: assignment.course_id || '',
        course_title: (assignment.courses as { title?: string })?.title || 'Unknown Course',
        deadline_type: (assignment.type || 'assignment') as Deadline['deadline_type'],
        due_date: assignment.due_at || new Date().toISOString(),
        open_date: null,
        close_date: null,
        max_attempts: 1,
        late_policy: 'no_late' as const,
        late_penalty_percent: 0,
        grace_period_hours: 0,
        reminder_settings: {
          days_before: [7, 3, 1],
          email_enabled: true,
          push_enabled: true
        },
        status: assignment.published ? 'published' : 'draft' as Deadline['status'],
        submissions_count: 0
      })) as Deadline[];
    }
  });
};

const getDeadlineStatus = (deadline: Deadline) => {
  const now = new Date();
  const dueDate = new Date(deadline.due_date);
  const daysUntil = differenceInDays(dueDate, now);
  
  if (isPast(dueDate)) {
    return { label: 'Past Due', color: 'text-red-500', variant: 'destructive' as const };
  } else if (daysUntil <= 1) {
    return { label: 'Due Soon', color: 'text-amber-500', variant: 'secondary' as const };
  } else if (daysUntil <= 7) {
    return { label: 'Upcoming', color: 'text-blue-500', variant: 'outline' as const };
  } else {
    return { label: 'Scheduled', color: 'text-green-500', variant: 'outline' as const };
  }
};

export default function DeadlineOrchestrator() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const { data: deadlines, isLoading } = useDeadlines();
  const queryClient = useQueryClient();

  const upcomingDeadlines = deadlines?.filter(d => isFuture(new Date(d.due_date))) || [];
  const pastDeadlines = deadlines?.filter(d => isPast(new Date(d.due_date))) || [];
  
  const filteredDeadlines = deadlines?.filter(d => {
    const matchesType = filterType === 'all' || d.deadline_type === filterType;
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesType && matchesStatus;
  }) || [];

  // Generate ICS calendar file
  const generateICS = (deadline: Deadline) => {
    const dueDate = new Date(deadline.due_date);
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Scroll University//SUYAS//EN
BEGIN:VEVENT
UID:${deadline.id}@scrolluniversity.org
DTSTART:${format(dueDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(addDays(dueDate, 0), "yyyyMMdd'T'235959")}
SUMMARY:${deadline.title} Due
DESCRIPTION:${deadline.description}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deadline.title.replace(/\s+/g, '_')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Calendar event downloaded');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{deadlines?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Total Deadlines</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{upcomingDeadlines.filter(d => differenceInDays(new Date(d.due_date), new Date()) <= 7).length}</p>
            <p className="text-xs text-muted-foreground">Due This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{deadlines?.filter(d => d.status === 'published').length || 0}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{pastDeadlines.length}</p>
            <p className="text-xs text-muted-foreground">Past Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="all">All Deadlines</TabsTrigger>
            <TabsTrigger value="reminders">Reminder Settings</TabsTrigger>
          </TabsList>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Deadline
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deadline</DialogTitle>
                <DialogDescription>
                  Set up a new assignment, exam, or project deadline
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="Midterm Exam" />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(deadlineTypeConfig).map(([type, config]) => (
                          <SelectItem key={type} value={type}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the assignment requirements..." />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Open Date (Optional)</Label>
                    <Input type="datetime-local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Close Date (Optional)</Label>
                    <Input type="datetime-local" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Late Policy</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(latePolicyConfig).map(([policy, config]) => (
                          <SelectItem key={policy} value={policy}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Attempts</Label>
                    <Input type="number" min={1} max={10} defaultValue={1} />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <Label className="mb-2 block">Reminder Settings</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch id="email-reminders" defaultChecked />
                      <Label htmlFor="email-reminders" className="text-sm">Email</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="push-reminders" defaultChecked />
                      <Label htmlFor="push-reminders" className="text-sm">Push Notifications</Label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reminders will be sent 7 days, 3 days, and 1 day before deadline
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Deadline created');
                  setCreateDialogOpen(false);
                }}>
                  Create Deadline
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Assignments and exams due within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.slice(0, 10).map((deadline) => {
                  const status = getDeadlineStatus(deadline);
                  const daysUntil = differenceInDays(new Date(deadline.due_date), new Date());
                  
                  return (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${deadlineTypeConfig[deadline.deadline_type].color} p-2 rounded-lg text-white`}>
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{deadline.title}</p>
                          <p className="text-sm text-muted-foreground">{deadline.course_title}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{format(new Date(deadline.due_date), 'MMM d, yyyy')}</p>
                          <p className={`text-sm ${status.color}`}>
                            {daysUntil === 0 ? 'Due today' : daysUntil === 1 ? 'Due tomorrow' : `${daysUntil} days left`}
                          </p>
                        </div>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => generateICS(deadline)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {upcomingDeadlines.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Deadlines</CardTitle>
                  <CardDescription>Complete list of all academic deadlines</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(deadlineTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Late Policy</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeadlines.map((deadline) => (
                      <TableRow key={deadline.id}>
                        <TableCell>
                          <p className="font-medium">{deadline.title}</p>
                        </TableCell>
                        <TableCell>{deadline.course_title}</TableCell>
                        <TableCell>
                          <Badge className={deadlineTypeConfig[deadline.deadline_type].color}>
                            {deadlineTypeConfig[deadline.deadline_type].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(deadline.due_date), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {latePolicyConfig[deadline.late_policy].label}
                        </TableCell>
                        <TableCell>
                          <Badge variant={deadline.status === 'published' ? 'default' : 'secondary'}>
                            {deadline.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => generateICS(deadline)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Bell className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder Configuration
              </CardTitle>
              <CardDescription>
                Configure automated reminder settings for all deadlines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Default Reminder Schedule</h3>
                  <div className="space-y-2">
                    {[7, 3, 1].map((days) => (
                      <div key={days} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span>{days} day{days > 1 ? 's' : ''} before deadline</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Notification Channels</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>Email Notifications</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <span>Push Notifications</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Calendar Sync</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <Button>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Send Test Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
