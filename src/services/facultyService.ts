/**
 * Faculty Service
 * Frontend service for faculty dashboard - using Supabase directly
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  FacultyDashboardData,
  FacultyCourse,
  CourseManagementFilters,
  BulkGradingRequest,
  StudentRosterEntry,
  CommunicationMessage,
  StudentCommunicationHistory,
  AssignmentManagement,
  AssignmentSubmission,
  InstructorCourseAnalytics,
  OfficeHours,
  OfficeHoursAppointment,
  OfficeHoursSchedule,
  FacultyResource,
  ResourceCategory,
} from '@/types/faculty';

// Simple gradebook entry for internal use
interface SimpleGradebookEntry {
  assignment_id: string;
  assignment_title: string;
  course_id: string;
  feedback: string;
  graded_at: string;
  score: number;
  student_user_id: string;
  total_points: number;
}

class FacultyService {
  // ============================================================================
  // Dashboard
  // ============================================================================

  async getDashboardData(): Promise<FacultyDashboardData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get teaching assignments
    const { data: teachingAssignments } = await supabase
      .from('teaching_assignments')
      .select('course_id, courses(*)')
      .eq('faculty_user_id', user.id);

    const courses: FacultyCourse[] = (teachingAssignments || []).map((ta: any) => ({
      id: ta.courses?.id || '',
      title: ta.courses?.title || 'Untitled Course',
      description: ta.courses?.description || '',
      faculty: ta.courses?.faculty || '',
      level: ta.courses?.level || '',
      duration: ta.courses?.duration || '',
      price: ta.courses?.price || 0,
      rating: ta.courses?.rating || 5,
      students: ta.courses?.students || 0,
      tags: ta.courses?.tags || [],
      xr_enabled: ta.courses?.xr_enabled || false,
      enrollmentCount: ta.courses?.students || 0,
      activeStudents: ta.courses?.students || 0,
      completionRate: 75,
      averageGrade: 85,
      pendingSubmissions: 0,
      unreadDiscussions: 0,
      lastUpdated: new Date(),
    }));

    // Get pending grading count
    const { count: pendingGrading } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // Get unread messages count
    const { count: unreadMessages } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return {
      courses,
      upcomingDeadlines: [],
      pendingGrading: pendingGrading || 0,
      unreadMessages: unreadMessages || 0,
      officeHoursToday: [],
      recentActivity: [],
    };
  }

  // ============================================================================
  // Course Management
  // ============================================================================

  async getCourses(filters?: CourseManagementFilters): Promise<FacultyCourse[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: teachingAssignments } = await supabase
      .from('teaching_assignments')
      .select('course_id, courses(*)')
      .eq('faculty_user_id', user.id);

    return (teachingAssignments || []).map((ta: any) => ({
      id: ta.courses?.id || '',
      title: ta.courses?.title || 'Untitled Course',
      description: ta.courses?.description || '',
      faculty: ta.courses?.faculty || '',
      level: ta.courses?.level || '',
      duration: ta.courses?.duration || '',
      price: ta.courses?.price || 0,
      rating: ta.courses?.rating || 5,
      students: ta.courses?.students || 0,
      tags: ta.courses?.tags || [],
      xr_enabled: ta.courses?.xr_enabled || false,
      enrollmentCount: ta.courses?.students || 0,
      activeStudents: ta.courses?.students || 0,
      completionRate: 75,
      averageGrade: 85,
      pendingSubmissions: 0,
      unreadDiscussions: 0,
      lastUpdated: new Date(),
    }));
  }

  async getCourseDetails(courseId: string): Promise<FacultyCourse> {
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;

    return {
      id: course.id,
      title: course.title,
      description: course.description || '',
      faculty: course.faculty || '',
      level: course.level || '',
      duration: course.duration || '',
      price: course.price || 0,
      rating: course.rating || 5,
      students: course.students || 0,
      tags: course.tags || [],
      xr_enabled: course.xr_enabled || false,
      enrollmentCount: course.students || 0,
      activeStudents: course.students || 0,
      completionRate: 75,
      averageGrade: 85,
      pendingSubmissions: 0,
      unreadDiscussions: 0,
      lastUpdated: new Date(),
    };
  }

  async updateCourse(courseId: string, updates: Partial<FacultyCourse>): Promise<FacultyCourse> {
    const { error } = await supabase
      .from('courses')
      .update({
        title: updates.title,
        description: updates.description,
      })
      .eq('id', courseId);

    if (error) throw error;

    return this.getCourseDetails(courseId);
  }

  // ============================================================================
  // Gradebook
  // ============================================================================

  async getGradebook(courseId: string): Promise<SimpleGradebookEntry[]> {
    const { data, error } = await supabase
      .from('v_course_gradebook')
      .select('*')
      .eq('course_id', courseId);

    if (error) throw error;
    return data || [];
  }

  async updateGrade(
    courseId: string,
    studentId: string,
    assignmentId: string,
    grade: {
      score: number;
      feedback?: string;
      rubricScores?: Record<string, number>;
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('grades')
      .insert({
        submission_id: assignmentId,
        grader_user_id: user.id,
        score: grade.score,
        feedback: grade.feedback,
      });

    if (error) throw error;
  }

  async bulkGrade(
    courseId: string,
    request: BulkGradingRequest
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const submissionId of request.submissionIds) {
      try {
        await this.updateGrade(courseId, '', submissionId, {
          score: request.score || 0,
          feedback: request.feedback,
        });
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  async exportGradebook(courseId: string, format: 'csv' | 'excel'): Promise<Blob> {
    const gradebook = await this.getGradebook(courseId);
    const csv = gradebook.map((entry) => 
      `${entry.student_user_id},${entry.assignment_title},${entry.score}`
    ).join('\n');
    
    return new Blob([csv], { type: 'text/csv' });
  }

  // ============================================================================
  // Student Roster
  // ============================================================================

  async getStudentRoster(courseId: string): Promise<StudentRosterEntry[]> {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*, profiles:user_id(email)')
      .eq('course_id', courseId);

    if (error) throw error;

    return (data || []).map((enrollment: any) => ({
      id: enrollment.user_id,
      name: enrollment.profiles?.email || 'Unknown',
      email: enrollment.profiles?.email || '',
      enrollmentDate: new Date(enrollment.created_at),
      progress: enrollment.progress || 0,
      overallGrade: 0,
      letterGrade: 'N/A',
      attendance: 100,
      participation: 100,
      lastActive: new Date(enrollment.updated_at),
      status: 'active' as const,
      spiritualGrowth: {
        devotionCompletion: 0,
        prayerJournalEntries: 0,
        scriptureMemoryProgress: 0,
        propheticCheckIns: 0,
        overallScore: 0,
      },
      communicationPreferences: {
        email: true,
        sms: false,
        inApp: true,
      },
    }));
  }

  async getStudentDetails(courseId: string, studentId: string): Promise<StudentRosterEntry> {
    const roster = await this.getStudentRoster(courseId);
    const student = roster.find(s => s.id === studentId);
    if (!student) throw new Error('Student not found');
    return student;
  }

  async sendMessage(courseId: string, message: CommunicationMessage): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    for (const recipientId of message.recipients) {
      await supabase.from('notifications').insert({
        user_id: recipientId,
        title: message.subject,
        body: message.message,
        type: 'message',
      });
    }
  }

  async getCommunicationHistory(
    courseId: string,
    studentId: string
  ): Promise<StudentCommunicationHistory[]> {
    return [];
  }

  // ============================================================================
  // Assignment Management
  // ============================================================================

  async getAssignments(courseId: string): Promise<AssignmentManagement[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((assignment: any) => ({
      id: assignment.id,
      title: assignment.title || 'Untitled',
      description: assignment.description || '',
      courseId: assignment.course_id,
      moduleId: assignment.module_id || '',
      type: assignment.type || 'essay',
      maxScore: assignment.total_points || 100,
      dueDate: assignment.due_at ? new Date(assignment.due_at) : new Date(),
      allowLateSubmissions: true,
      instructions: assignment.description || '',
      resources: [],
      submissions: {
        total: 0,
        submitted: 0,
        graded: 0,
        pending: 0,
        late: 0,
        missing: 0,
      },
      status: assignment.published ? 'published' : 'draft',
      createdAt: new Date(assignment.created_at),
      updatedAt: new Date(assignment.created_at),
    }));
  }

  async createAssignment(
    courseId: string,
    assignment: Partial<AssignmentManagement>
  ): Promise<AssignmentManagement> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('assignments')
      .insert({
        course_id: courseId,
        title: assignment.title,
        description: assignment.description,
        total_points: assignment.maxScore,
        due_at: assignment.dueDate?.toISOString(),
        type: assignment.type,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    return this.getAssignments(courseId).then(a => a[0]);
  }

  async updateAssignment(
    courseId: string,
    assignmentId: string,
    updates: Partial<AssignmentManagement>
  ): Promise<AssignmentManagement> {
    const { error } = await supabase
      .from('assignments')
      .update({
        title: updates.title,
        description: updates.description,
        total_points: updates.maxScore,
        due_at: updates.dueDate?.toISOString(),
      })
      .eq('id', assignmentId);

    if (error) throw error;

    const assignments = await this.getAssignments(courseId);
    return assignments.find(a => a.id === assignmentId) || assignments[0];
  }

  async deleteAssignment(courseId: string, assignmentId: string): Promise<void> {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
  }

  async getSubmissions(
    courseId: string,
    assignmentId: string
  ): Promise<AssignmentSubmission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, profiles:user_id(email)')
      .eq('assignment_id', assignmentId);

    if (error) throw error;

    return (data || []).map((sub: any) => ({
      id: sub.id,
      assignmentId: sub.assignment_id,
      studentId: sub.user_id,
      studentName: sub.profiles?.email || 'Unknown',
      studentEmail: sub.profiles?.email || '',
      submittedAt: new Date(sub.submitted_at),
      status: sub.status,
      content: {
        text: sub.answers?.text,
        files: sub.file_url ? [{ id: '1', name: 'Submission', type: 'file', size: 0, url: sub.file_url, uploadedAt: new Date() }] : [],
      },
      maxScore: 100,
      isLate: false,
      revisionCount: 0,
    }));
  }

  async gradeSubmission(
    courseId: string,
    submissionId: string,
    grading: {
      score: number;
      feedback: string;
      rubricScores?: Record<string, number>;
    }
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('grades')
      .insert({
        submission_id: submissionId,
        grader_user_id: user.id,
        score: grading.score,
        feedback: grading.feedback,
      });

    if (error) throw error;

    await supabase
      .from('submissions')
      .update({ status: 'graded' })
      .eq('id', submissionId);
  }

  // ============================================================================
  // Course Analytics
  // ============================================================================

  async getCourseAnalytics(
    courseId: string,
    timeRange?: { startDate: Date; endDate: Date }
  ): Promise<InstructorCourseAnalytics> {
    const course = await this.getCourseDetails(courseId);

    return {
      courseId,
      courseTitle: course.title,
      timeRange: {
        startDate: timeRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: timeRange?.endDate || new Date(),
      },
      enrollment: {
        total: course.enrollmentCount,
        active: course.activeStudents,
        completed: 0,
        dropped: 0,
        trend: 5,
      },
      performance: {
        averageGrade: course.averageGrade,
        medianGrade: course.averageGrade,
        passRate: 85,
        gradeDistribution: { A: 30, B: 40, C: 20, D: 8, F: 2 },
        topPerformers: [],
        strugglingStudents: [],
      },
      engagement: {
        averageLoginFrequency: 5,
        averageTimeSpent: 120,
        videoCompletionRate: 75,
        forumParticipation: 60,
        assignmentSubmissionRate: 90,
        assessmentCompletionRate: 85,
      },
      content: {
        mostEngagingModules: [],
        leastEngagingModules: [],
        dropOffPoints: [],
        popularResources: [],
      },
      spiritual: {
        devotionCompletionRate: 70,
        prayerJournalActivity: 60,
        scriptureMemoryProgress: 55,
        propheticCheckInParticipation: 45,
        overallSpiritualGrowth: 60,
      },
    };
  }

  // ============================================================================
  // Office Hours
  // ============================================================================

  async getOfficeHours(): Promise<OfficeHours[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('office_hours_slots')
      .select('*');

    if (error) throw error;

    return (data || []).map((slot: any) => ({
      id: slot.id,
      facultyId: user.id,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(slot.day_of_week),
      startTime: slot.start_time,
      endTime: slot.end_time,
      location: 'online' as const,
      maxStudents: slot.max_students,
      recurring: true,
      active: true,
    }));
  }

  async createOfficeHours(officeHours: Partial<OfficeHours>): Promise<OfficeHours> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const { data, error } = await supabase
      .from('office_hours_slots')
      .insert({
        tutor_name: 'Faculty',
        tutor_specialty: 'General',
        day_of_week: days[officeHours.dayOfWeek || 0],
        start_time: officeHours.startTime,
        end_time: officeHours.endTime,
        max_students: officeHours.maxStudents || 5,
      })
      .select()
      .single();

    if (error) throw error;

    const hours = await this.getOfficeHours();
    return hours.find(h => h.id === data.id) || hours[0];
  }

  async updateOfficeHours(
    officeHoursId: string,
    updates: Partial<OfficeHours>
  ): Promise<OfficeHours> {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const { error } = await supabase
      .from('office_hours_slots')
      .update({
        day_of_week: updates.dayOfWeek !== undefined ? days[updates.dayOfWeek] : undefined,
        start_time: updates.startTime,
        end_time: updates.endTime,
        max_students: updates.maxStudents,
      })
      .eq('id', officeHoursId);

    if (error) throw error;

    const hours = await this.getOfficeHours();
    return hours.find(h => h.id === officeHoursId) || hours[0];
  }

  async deleteOfficeHours(officeHoursId: string): Promise<void> {
    const { error } = await supabase
      .from('office_hours_slots')
      .delete()
      .eq('id', officeHoursId);

    if (error) throw error;
  }

  async getAppointments(date?: Date): Promise<OfficeHoursAppointment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('office_hours_bookings')
      .select('*, office_hours_slots(*), profiles:user_id(email)');

    if (error) throw error;

    return (data || []).map((booking: any) => ({
      id: booking.id,
      officeHoursId: booking.slot_id,
      studentId: booking.user_id,
      studentName: booking.profiles?.email || 'Unknown',
      studentEmail: booking.profiles?.email || '',
      date: new Date(booking.booked_at),
      startTime: booking.office_hours_slots?.start_time || '',
      endTime: booking.office_hours_slots?.end_time || '',
      topic: booking.notes || 'General',
      status: booking.status,
      createdAt: new Date(booking.booked_at),
      updatedAt: new Date(booking.booked_at),
    }));
  }

  async getSchedule(startDate: Date, endDate: Date): Promise<OfficeHoursSchedule[]> {
    return [];
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: OfficeHoursAppointment['status']
  ): Promise<void> {
    const { error } = await supabase
      .from('office_hours_bookings')
      .update({ status })
      .eq('id', appointmentId);

    if (error) throw error;
  }

  // ============================================================================
  // Faculty Resources
  // ============================================================================

  async getResources(category?: string): Promise<FacultyResource[]> {
    return [
      {
        id: '1',
        title: 'Teaching Best Practices Guide',
        description: 'Comprehensive guide for effective teaching in higher education',
        category: 'teaching',
        type: 'document',
        tags: ['teaching', 'pedagogy', 'best-practices'],
        featured: true,
        downloads: 150,
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Grading Rubric Templates',
        description: 'Standard rubric templates for various assignment types',
        category: 'grading',
        type: 'template',
        tags: ['grading', 'rubrics', 'assessment'],
        featured: false,
        downloads: 200,
        rating: 4.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  async getResourceCategories(): Promise<ResourceCategory[]> {
    return [
      { id: '1', name: 'Teaching', description: 'Resources for effective teaching', icon: 'book', resourceCount: 10 },
      { id: '2', name: 'Grading', description: 'Grading tools and templates', icon: 'check', resourceCount: 8 },
      { id: '3', name: 'Spiritual', description: 'Spiritual formation resources', icon: 'heart', resourceCount: 5 },
    ];
  }

  async downloadResource(resourceId: string): Promise<Blob> {
    // Return a placeholder blob for now
    console.log('Resource downloaded:', resourceId);
    return new Blob(['Resource content placeholder'], { type: 'text/plain' });
  }
}

export default new FacultyService();
