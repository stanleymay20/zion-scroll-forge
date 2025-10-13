/**
 * Guest Lecturer Scheduling Service
 * Handles scheduling and content delivery for guest lecturers from partner institutions
 * Requirement 5.2: Guest lecturer scheduling and content delivery
 */

import {
  GuestLecturer,
  LectureSession,
  SessionStatus,
  LectureFormat,
  LecturerStatus,
  TimeSlot,
  LectureMaterial,
  MaterialType,
  SpiritualAlignment
} from '../types/partner-integration';

export class GuestLecturerSchedulingService {
  private lecturers: Map<string, GuestLecturer> = new Map();
  private sessions: Map<string, LectureSession> = new Map();
  private scheduleConflicts: Map<string, Date[]> = new Map();

  constructor() {
    this.initializeSampleLecturers();
  }

  /**
   * Initialize sample guest lecturers from partner institutions
   */
  private initializeSampleLecturers(): void {
    // MIT CSAIL Lecturer
    this.lecturers.set('mit-prof-johnson', {
      id: 'mit-prof-johnson',
      partnerId: 'mit-csail',
      name: 'Dr. Sarah Johnson',
      title: 'Professor of Artificial Intelligence',
      expertise: ['Artificial Intelligence', 'Machine Learning', 'Ethics in AI', 'Sacred Technology'],
      bio: 'Dr. Johnson is a leading researcher in AI ethics with a focus on integrating spiritual principles into technology development.',
      availability: {
        timezone: 'EST',
        availableSlots: [
          { dayOfWeek: 2, startTime: '14:00', endTime: '16:00' }, // Tuesday 2-4 PM
          { dayOfWeek: 4, startTime: '10:00', endTime: '12:00' }, // Thursday 10-12 PM
          { dayOfWeek: 5, startTime: '15:00', endTime: '17:00' }  // Friday 3-5 PM
        ],
        blackoutDates: [],
        preferredFormats: [LectureFormat.LIVE_VIRTUAL, LectureFormat.XR_IMMERSIVE]
      },
      rates: {
        currency: 'USD',
        hourlyRate: 500,
        sessionRate: 1000,
        travelExpenses: false,
        paymentTerms: 'Net 30'
      },
      spiritualAlignment: {
        christianWorldview: true,
        scrollPrinciplesAlignment: 9,
        kingdomFocus: true,
        propheticGifting: false,
        verifiedBy: 'ScrollWitness Elder Council',
        verificationDate: new Date('2024-01-15')
      },
      status: LecturerStatus.AVAILABLE
    });

    // Oxford Lecturer
    this.lecturers.set('oxford-dr-chen', {
      id: 'oxford-dr-chen',
      partnerId: 'oxford-university',
      name: 'Dr. Michael Chen',
      title: 'Professor of International Relations',
      expertise: ['Diplomacy', 'Global Governance', 'Prophetic Leadership', 'Peacebuilding'],
      bio: 'Dr. Chen specializes in prophetic approaches to international diplomacy and kingdom-centered governance.',
      availability: {
        timezone: 'GMT',
        availableSlots: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '11:00' }, // Monday 9-11 AM
          { dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }, // Wednesday 2-4 PM
          { dayOfWeek: 5, startTime: '10:00', endTime: '12:00' }  // Friday 10-12 AM
        ],
        blackoutDates: [new Date('2024-12-20'), new Date('2024-12-27')],
        preferredFormats: [LectureFormat.LIVE_VIRTUAL, LectureFormat.HYBRID]
      },
      rates: {
        currency: 'GBP',
        hourlyRate: 400,
        sessionRate: 800,
        travelExpenses: true,
        paymentTerms: 'Net 15'
      },
      spiritualAlignment: {
        christianWorldview: true,
        scrollPrinciplesAlignment: 8,
        kingdomFocus: true,
        propheticGifting: true,
        verifiedBy: 'ScrollWitness Elder Council',
        verificationDate: new Date('2024-02-10')
      },
      status: LecturerStatus.AVAILABLE
    });

    // Ghana Tech Alliance Expert
    this.lecturers.set('ghana-tech-okafor', {
      id: 'ghana-tech-okafor',
      partnerId: 'ghana-tech-alliance',
      name: 'Dr. Amara Okafor',
      title: 'Senior Technology Strategist',
      expertise: ['Blockchain Technology', 'Fintech', 'Sacred Economics', 'African Innovation'],
      bio: 'Dr. Okafor is a pioneer in blockchain applications for economic empowerment in Africa, with deep understanding of sacred economic principles.',
      availability: {
        timezone: 'WAT',
        availableSlots: [
          { dayOfWeek: 2, startTime: '16:00', endTime: '18:00' }, // Tuesday 4-6 PM
          { dayOfWeek: 4, startTime: '14:00', endTime: '16:00' }, // Thursday 2-4 PM
          { dayOfWeek: 6, startTime: '10:00', endTime: '12:00' }  // Saturday 10-12 AM
        ],
        blackoutDates: [],
        preferredFormats: [LectureFormat.LIVE_VIRTUAL, LectureFormat.RECORDED]
      },
      rates: {
        currency: 'USD',
        hourlyRate: 300,
        sessionRate: 600,
        travelExpenses: false,
        paymentTerms: 'Net 30'
      },
      spiritualAlignment: {
        christianWorldview: true,
        scrollPrinciplesAlignment: 9,
        kingdomFocus: true,
        propheticGifting: true,
        verifiedBy: 'ScrollWitness Elder Council',
        verificationDate: new Date('2024-03-05')
      },
      status: LecturerStatus.AVAILABLE
    });
  }

  /**
   * Get available guest lecturers
   */
  getAvailableLecturers(filters?: {
    partnerId?: string;
    expertise?: string[];
    availability?: Date;
    spiritualAlignment?: boolean;
    format?: LectureFormat;
  }): GuestLecturer[] {
    let lecturers = Array.from(this.lecturers.values());

    if (filters?.partnerId) {
      lecturers = lecturers.filter(l => l.partnerId === filters.partnerId);
    }

    if (filters?.expertise) {
      lecturers = lecturers.filter(l => 
        l.expertise.some(exp => filters.expertise!.includes(exp))
      );
    }

    if (filters?.spiritualAlignment) {
      lecturers = lecturers.filter(l => 
        l.spiritualAlignment.christianWorldview && 
        l.spiritualAlignment.scrollPrinciplesAlignment >= 7
      );
    }

    if (filters?.format) {
      lecturers = lecturers.filter(l => 
        l.availability.preferredFormats.includes(filters.format!)
      );
    }

    if (filters?.availability) {
      lecturers = lecturers.filter(l => 
        this.isLecturerAvailable(l.id, filters.availability!)
      );
    }

    return lecturers.filter(l => l.status === LecturerStatus.AVAILABLE);
  }

  /**
   * Get lecturer by ID
   */
  getLecturer(lecturerId: string): GuestLecturer | undefined {
    return this.lecturers.get(lecturerId);
  }

  /**
   * Schedule a guest lecture session
   */
  async scheduleSession(sessionDetails: {
    lecturerId: string;
    courseId: string;
    title: string;
    description: string;
    scheduledDate: Date;
    duration: number;
    format: LectureFormat;
    maxAttendees: number;
  }): Promise<LectureSession> {
    const lecturer = this.lecturers.get(sessionDetails.lecturerId);
    if (!lecturer) {
      throw new Error(`Lecturer not found: ${sessionDetails.lecturerId}`);
    }

    // Check availability
    if (!this.isLecturerAvailable(sessionDetails.lecturerId, sessionDetails.scheduledDate)) {
      throw new Error(`Lecturer is not available at the requested time`);
    }

    // Check format compatibility
    if (!lecturer.availability.preferredFormats.includes(sessionDetails.format)) {
      throw new Error(`Lecturer does not support the requested format: ${sessionDetails.format}`);
    }

    const session: LectureSession = {
      id: this.generateSessionId(),
      lecturerId: sessionDetails.lecturerId,
      courseId: sessionDetails.courseId,
      title: sessionDetails.title,
      description: sessionDetails.description,
      scheduledDate: sessionDetails.scheduledDate,
      duration: sessionDetails.duration,
      format: sessionDetails.format,
      maxAttendees: sessionDetails.maxAttendees,
      registeredStudents: [],
      status: SessionStatus.SCHEDULED,
      materials: []
    };

    this.sessions.set(session.id, session);

    // Block the time slot
    this.blockTimeSlot(sessionDetails.lecturerId, sessionDetails.scheduledDate);

    // Send confirmation to lecturer
    await this.sendLecturerConfirmation(lecturer, session);

    return session;
  }

  /**
   * Register student for a session
   */
  async registerStudentForSession(sessionId: string, studentId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (session.registeredStudents.length >= session.maxAttendees) {
      throw new Error('Session is full');
    }

    if (session.registeredStudents.includes(studentId)) {
      throw new Error('Student is already registered for this session');
    }

    session.registeredStudents.push(studentId);
    this.sessions.set(sessionId, session);

    return true;
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: string, reason: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.status = SessionStatus.CANCELLED;
    this.sessions.set(sessionId, session);

    // Free up the time slot
    this.freeTimeSlot(session.lecturerId, session.scheduledDate);

    // Notify registered students
    await this.notifyStudentsOfCancellation(session, reason);

    // Notify lecturer
    const lecturer = this.lecturers.get(session.lecturerId);
    if (lecturer) {
      await this.notifyLecturerOfCancellation(lecturer, session, reason);
    }
  }

  /**
   * Reschedule a session
   */
  async rescheduleSession(
    sessionId: string,
    newDate: Date,
    reason: string
  ): Promise<LectureSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Check if lecturer is available at new time
    if (!this.isLecturerAvailable(session.lecturerId, newDate)) {
      throw new Error('Lecturer is not available at the new time');
    }

    // Free old time slot
    this.freeTimeSlot(session.lecturerId, session.scheduledDate);

    // Update session
    const oldDate = session.scheduledDate;
    session.scheduledDate = newDate;
    session.status = SessionStatus.RESCHEDULED;
    this.sessions.set(sessionId, session);

    // Block new time slot
    this.blockTimeSlot(session.lecturerId, newDate);

    // Notify all parties
    await this.notifyReschedule(session, oldDate, reason);

    return session;
  }

  /**
   * Add material to a session
   */
  async addSessionMaterial(
    sessionId: string,
    material: Omit<LectureMaterial, 'id' | 'uploadedAt'>
  ): Promise<LectureMaterial> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const newMaterial: LectureMaterial = {
      id: this.generateMaterialId(),
      ...material,
      uploadedAt: new Date()
    };

    session.materials.push(newMaterial);
    this.sessions.set(sessionId, session);

    return newMaterial;
  }

  /**
   * Get sessions for a lecturer
   */
  getLecturerSessions(lecturerId: string): LectureSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.lecturerId === lecturerId);
  }

  /**
   * Get sessions for a course
   */
  getCourseSessions(courseId: string): LectureSession[] {
    return Array.from(this.sessions.values())
      .filter(session => session.courseId === courseId);
  }

  /**
   * Get upcoming sessions
   */
  getUpcomingSessions(days: number = 7): LectureSession[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return Array.from(this.sessions.values())
      .filter(session => 
        session.scheduledDate >= now && 
        session.scheduledDate <= futureDate &&
        session.status === SessionStatus.SCHEDULED
      )
      .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  /**
   * Get session analytics
   */
  getSessionAnalytics(): {
    totalSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    averageAttendance: number;
    topLecturers: { lecturerId: string; sessionCount: number }[];
    formatDistribution: Record<LectureFormat, number>;
  } {
    const sessions = Array.from(this.sessions.values());
    
    const formatDistribution = sessions.reduce((acc, session) => {
      acc[session.format] = (acc[session.format] || 0) + 1;
      return acc;
    }, {} as Record<LectureFormat, number>);

    const lecturerCounts = sessions.reduce((acc, session) => {
      acc[session.lecturerId] = (acc[session.lecturerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLecturers = Object.entries(lecturerCounts)
      .map(([lecturerId, sessionCount]) => ({ lecturerId, sessionCount }))
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 5);

    const completedSessions = sessions.filter(s => s.status === SessionStatus.COMPLETED);
    const averageAttendance = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + s.registeredStudents.length, 0) / completedSessions.length
      : 0;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      cancelledSessions: sessions.filter(s => s.status === SessionStatus.CANCELLED).length,
      averageAttendance,
      topLecturers,
      formatDistribution
    };
  }

  /**
   * Check if lecturer is available at a specific time
   */
  private isLecturerAvailable(lecturerId: string, date: Date): boolean {
    const lecturer = this.lecturers.get(lecturerId);
    if (!lecturer) return false;

    // Check blackout dates
    const dateString = date.toDateString();
    if (lecturer.availability.blackoutDates.some(blackout => blackout.toDateString() === dateString)) {
      return false;
    }

    // Check day of week and time slots
    const dayOfWeek = date.getDay();
    const timeString = date.toTimeString().substr(0, 5); // HH:mm format

    const availableSlot = lecturer.availability.availableSlots.find(slot => {
      return slot.dayOfWeek === dayOfWeek &&
             timeString >= slot.startTime &&
             timeString <= slot.endTime;
    });

    if (!availableSlot) return false;

    // Check for conflicts
    const conflicts = this.scheduleConflicts.get(lecturerId) || [];
    return !conflicts.some(conflict => 
      Math.abs(conflict.getTime() - date.getTime()) < 60 * 60 * 1000 // 1 hour buffer
    );
  }

  /**
   * Block a time slot for a lecturer
   */
  private blockTimeSlot(lecturerId: string, date: Date): void {
    const conflicts = this.scheduleConflicts.get(lecturerId) || [];
    conflicts.push(date);
    this.scheduleConflicts.set(lecturerId, conflicts);
  }

  /**
   * Free a time slot for a lecturer
   */
  private freeTimeSlot(lecturerId: string, date: Date): void {
    const conflicts = this.scheduleConflicts.get(lecturerId) || [];
    const updatedConflicts = conflicts.filter(conflict => 
      Math.abs(conflict.getTime() - date.getTime()) >= 60 * 60 * 1000
    );
    this.scheduleConflicts.set(lecturerId, updatedConflicts);
  }

  /**
   * Send confirmation to lecturer
   */
  private async sendLecturerConfirmation(lecturer: GuestLecturer, session: LectureSession): Promise<void> {
    console.log(`Sending confirmation to ${lecturer.name} for session: ${session.title}`);
    // In a real implementation, this would send an email or notification
  }

  /**
   * Notify students of cancellation
   */
  private async notifyStudentsOfCancellation(session: LectureSession, reason: string): Promise<void> {
    console.log(`Notifying ${session.registeredStudents.length} students of cancellation: ${reason}`);
    // In a real implementation, this would send notifications to all registered students
  }

  /**
   * Notify lecturer of cancellation
   */
  private async notifyLecturerOfCancellation(
    lecturer: GuestLecturer,
    session: LectureSession,
    reason: string
  ): Promise<void> {
    console.log(`Notifying ${lecturer.name} of session cancellation: ${reason}`);
    // In a real implementation, this would send a notification to the lecturer
  }

  /**
   * Notify all parties of reschedule
   */
  private async notifyReschedule(session: LectureSession, oldDate: Date, reason: string): Promise<void> {
    console.log(`Notifying all parties of reschedule from ${oldDate} to ${session.scheduledDate}: ${reason}`);
    // In a real implementation, this would send notifications to lecturer and students
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique material ID
   */
  private generateMaterialId(): string {
    return `material_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default GuestLecturerSchedulingService;