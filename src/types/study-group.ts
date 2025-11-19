/**
 * Study Group Frontend Types
 * "As iron sharpens iron, so one person sharpens another" - Proverbs 27:17
 */

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId?: string;
  creatorId: string;
  isPrivate: boolean;
  maxMembers: number;
  meetingSchedule?: MeetingSchedule;
  tags: string[];
  interests: string[];
  academicLevel?: string;
  status: StudyGroupStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum StudyGroupStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface StudyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupMemberRole;
  joinedAt: Date;
  lastActiveAt?: Date;
  contributionScore: number;
  isActive: boolean;
}

export enum GroupMemberRole {
  OWNER = 'OWNER',
  MODERATOR = 'MODERATOR',
  MEMBER = 'MEMBER'
}

export interface MeetingSchedule {
  frequency: MeetingFrequency;
  dayOfWeek?: number;
  time?: string;
  timezone: string;
  duration: number;
  recurringPattern?: string;
}

export enum MeetingFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM'
}

export interface StudyGroupWithMembers extends StudyGroup {
  members: StudyGroupMemberWithUser[];
  memberCount: number;
  isMember?: boolean;
  userRole?: GroupMemberRole;
}

export interface StudyGroupMemberWithUser extends StudyGroupMember {
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    role: string;
  };
}

export interface GroupAssignment {
  id: string;
  groupId: string;
  title: string;
  description: string;
  dueDate?: Date;
  status: AssignmentStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export interface GroupAssignmentSubmission {
  id: string;
  assignmentId: string;
  groupId: string;
  submittedBy: string;
  content: string;
  attachments: SubmissionAttachment[];
  grade?: number;
  feedback?: string;
  submittedAt: Date;
  gradedAt?: Date;
  gradedBy?: string;
}

export interface SubmissionAttachment {
  id: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
}

export interface CollaborativeDocument {
  id: string;
  groupId: string;
  title: string;
  content: string;
  version: number;
  createdBy: string;
  lastEditedBy: string;
  isLocked: boolean;
  lockedBy?: string;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  eventType: EventType;
  startTime: Date;
  endTime: Date;
  location?: string;
  videoConferenceUrl?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum EventType {
  STUDY_SESSION = 'STUDY_SESSION',
  VIDEO_CALL = 'VIDEO_CALL',
  ASSIGNMENT_DUE = 'ASSIGNMENT_DUE',
  EXAM_PREP = 'EXAM_PREP',
  SOCIAL = 'SOCIAL',
  OTHER = 'OTHER'
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  status: AttendanceStatus;
  joinedAt?: Date;
  leftAt?: Date;
  duration?: number;
}

export enum AttendanceStatus {
  ATTENDING = 'ATTENDING',
  MAYBE = 'MAYBE',
  NOT_ATTENDING = 'NOT_ATTENDING',
  ATTENDED = 'ATTENDED',
  MISSED = 'MISSED'
}

export interface GroupAnalytics {
  groupId: string;
  totalMembers: number;
  activeMembers: number;
  totalMessages: number;
  totalDocuments: number;
  totalAssignments: number;
  completedAssignments: number;
  averageParticipation: number;
  averageResponseTime: number;
  topContributors: {
    userId: string;
    contributionScore: number;
  }[];
  activityByDay: {
    [day: string]: number;
  };
  engagementTrend: {
    date: string;
    score: number;
  }[];
}

export interface VideoConferenceSession {
  id: string;
  groupId: string;
  eventId?: string;
  provider: VideoProvider;
  roomId: string;
  roomUrl: string;
  hostId: string;
  startedAt: Date;
  endedAt?: Date;
  participants: VideoParticipant[];
  recordingUrl?: string;
  duration?: number;
}

export enum VideoProvider {
  JITSI = 'JITSI',
  ZOOM = 'ZOOM',
  GOOGLE_MEET = 'GOOGLE_MEET',
  MICROSOFT_TEAMS = 'MICROSOFT_TEAMS',
  CUSTOM = 'CUSTOM'
}

export interface VideoParticipant {
  userId: string;
  joinedAt: Date;
  leftAt?: Date;
  duration: number;
  isMuted: boolean;
  isVideoOn: boolean;
}
