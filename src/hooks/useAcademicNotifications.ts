import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AcademicNotification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  related_id: string | null;
  related_type: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  channel: 'in_app' | 'email' | 'both';
  metadata: Record<string, any>;
  created_at: string;
}

// Notification types
export type NotificationType =
  | 'lecture_available'
  | 'assignment_due_soon'
  | 'assignment_overdue'
  | 'exam_window_open'
  | 'semester_starting'
  | 'semester_ending'
  | 'billing_due'
  | 'billing_overdue'
  | 'academic_probation'
  | 'graduation_approved'
  | 'grade_posted'
  | 'registration_open'
  | 'course_dropped'
  | 'scrollgold_earned';

// Fetch user's academic notifications
export const useAcademicNotifications = (status?: string) => {
  return useQuery({
    queryKey: ['academic-notifications', status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = (supabase as any)
        .from('academic_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as AcademicNotification[];
    },
  });
};

// Fetch pending notifications count
export const usePendingNotificationsCount = () => {
  return useQuery({
    queryKey: ['academic-notifications-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await (supabase as any)
        .from('academic_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      return count || 0;
    },
  });
};

// Create notification
export const useCreateAcademicNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notification: Partial<AcademicNotification>) => {
      const { data, error } = await (supabase as any)
        .from('academic_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['academic-notifications-count'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Bulk create notifications
export const useBulkCreateNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notifications: Partial<AcademicNotification>[]) => {
      const { data, error } = await (supabase as any)
        .from('academic_notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academic-notifications'] });
      toast({ title: 'Success', description: `${data.length} notifications scheduled` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Schedule reminder notifications
export const useScheduleReminders = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      type,
      targetUsers,
      relatedId,
      relatedType,
      scheduledFor,
      title,
      body,
    }: {
      type: NotificationType;
      targetUsers: string[];
      relatedId?: string;
      relatedType?: string;
      scheduledFor: string;
      title: string;
      body: string;
    }) => {
      const notifications = targetUsers.map((userId) => ({
        user_id: userId,
        notification_type: type,
        title,
        body,
        related_id: relatedId || null,
        related_type: relatedType || null,
        scheduled_for: scheduledFor,
        status: 'pending',
        channel: 'both',
      }));

      const { data, error } = await (supabase as any)
        .from('academic_notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: `${data.length} reminders scheduled` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Generate assignment due reminders for all enrolled students
export const useGenerateAssignmentReminders = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      daysBeforeDue = 3,
    }: {
      assignmentId: string;
      daysBeforeDue?: number;
    }) => {
      // Get assignment details
      const { data: assignment } = await (supabase as any)
        .from('assignments')
        .select('*, courses(title)')
        .eq('id', assignmentId)
        .single();

      if (!assignment) throw new Error('Assignment not found');

      // Get enrolled students
      const { data: enrollments } = await (supabase as any)
        .from('enrollments')
        .select('user_id')
        .eq('course_id', assignment.course_id);

      if (!enrollments?.length) return [];

      const dueDate = new Date(assignment.due_at);
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - daysBeforeDue);

      const notifications = enrollments.map((e: any) => ({
        user_id: e.user_id,
        notification_type: 'assignment_due_soon',
        title: `Assignment Due Soon: ${assignment.title}`,
        body: `Your assignment "${assignment.title}" for ${assignment.courses?.title} is due in ${daysBeforeDue} days.`,
        related_id: assignmentId,
        related_type: 'assignment',
        scheduled_for: reminderDate.toISOString(),
        status: 'pending',
        channel: 'both',
        metadata: {
          course_id: assignment.course_id,
          due_at: assignment.due_at,
        },
      }));

      const { data, error } = await (supabase as any)
        .from('academic_notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: `${data.length} reminders scheduled` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};

// Generate semester start notifications
export const useGenerateSemesterNotifications = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      semesterId,
      notificationType,
    }: {
      semesterId: string;
      notificationType: 'semester_starting' | 'registration_open' | 'semester_ending';
    }) => {
      // Get semester details
      const { data: semester } = await (supabase as any)
        .from('semesters')
        .select('*')
        .eq('id', semesterId)
        .single();

      if (!semester) throw new Error('Semester not found');

      // Get all active students
      const { data: profiles } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (!profiles?.length) return [];

      let title: string;
      let body: string;
      let scheduledFor: string;

      switch (notificationType) {
        case 'semester_starting':
          title = `${semester.name} Starting Soon`;
          body = `The ${semester.name} begins on ${new Date(semester.start_date).toLocaleDateString()}. Get ready for an amazing semester!`;
          const startDate = new Date(semester.start_date);
          startDate.setDate(startDate.getDate() - 7);
          scheduledFor = startDate.toISOString();
          break;
        case 'registration_open':
          title = `Registration Open for ${semester.name}`;
          body = `Course registration is now open. Register before ${new Date(semester.registration_end).toLocaleDateString()}.`;
          scheduledFor = semester.registration_start;
          break;
        case 'semester_ending':
          title = `${semester.name} Ending Soon`;
          body = `Finals begin on ${new Date(semester.finals_start).toLocaleDateString()}. Good luck with your exams!`;
          const finalsStart = new Date(semester.finals_start);
          finalsStart.setDate(finalsStart.getDate() - 14);
          scheduledFor = finalsStart.toISOString();
          break;
        default:
          throw new Error('Invalid notification type');
      }

      const notifications = profiles.map((p: any) => ({
        user_id: p.id,
        notification_type: notificationType,
        title,
        body,
        related_id: semesterId,
        related_type: 'semester',
        scheduled_for: scheduledFor,
        status: 'pending',
        channel: 'both',
      }));

      const { data, error } = await (supabase as any)
        .from('academic_notifications')
        .insert(notifications)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: `${data.length} notifications scheduled` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
};
