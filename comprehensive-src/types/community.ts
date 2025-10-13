export interface CommunityForum {
  id: string;
  title: string;
  description: string;
  category: ForumCategory;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount: number;
  postCount: number;
  tags: string[];
  spiritualAlignment: SpiritualAlignment;
  moderators: string[];
}

export interface DiscussionGroup {
  id: string;
  name: string;
  description: string;
  type: GroupType;
  privacy: PrivacyLevel;
  createdBy: string;
  members: GroupMember[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  maxMembers?: number;
  subject?: string;
  courseId?: string;
  spiritualFocus?: string;
}

export interface ForumPost {
  id: string;
  forumId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: ForumReply[];
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  spiritualInsight?: string;
  scrollCoinReward?: number;
}

export interface ForumReply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  parentReplyId?: string;
  isHelpful: boolean;
  scrollCoinReward?: number;
}

export interface PeerMentorship {
  id: string;
  mentorId: string;
  menteeId: string;
  subject: string;
  status: MentorshipStatus;
  createdAt: Date;
  updatedAt: Date;
  sessions: MentorshipSession[];
  goals: string[];
  progress: MentorshipProgress;
  spiritualGuidance: boolean;
}

export interface MentorshipSession {
  id: string;
  mentorshipId: string;
  scheduledAt: Date;
  duration: number;
  status: SessionStatus;
  notes?: string;
  feedback?: SessionFeedback;
  scrollCoinReward?: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  courseId?: string;
  subject: string;
  createdBy: string;
  members: GroupMember[];
  schedule: StudySchedule[];
  resources: StudyResource[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  maxMembers: number;
  meetingType: MeetingType;
}

export interface CollaborativeProject {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  createdBy: string;
  team: ProjectMember[];
  status: ProjectStatus;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  tasks: ProjectTask[];
  resources: ProjectResource[];
  spiritualPurpose?: string;
  kingdomImpact?: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  scrollCoinReward?: number;
}

export interface GlobalNetworking {
  id: string;
  userId: string;
  connections: NetworkConnection[];
  interests: string[];
  skills: string[];
  location: Location;
  careerTrack: CareerTrack;
  spiritualGifts: string[];
  availableForMentoring: boolean;
  languages: string[];
}

export interface NetworkConnection {
  id: string;
  userId: string;
  connectedUserId: string;
  connectionType: ConnectionType;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  sharedInterests: string[];
  collaborationHistory: string[];
}

// Enums and supporting types
export enum ForumCategory {
  ACADEMIC = 'academic',
  SPIRITUAL = 'spiritual',
  CAREER = 'career',
  TECHNICAL = 'technical',
  GENERAL = 'general',
  PRAYER = 'prayer',
  MISSIONS = 'missions'
}

export enum GroupType {
  STUDY_GROUP = 'study_group',
  DISCUSSION = 'discussion',
  PROJECT_TEAM = 'project_team',
  PRAYER_GROUP = 'prayer_group',
  MENTORSHIP = 'mentorship'
}

export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  COURSE_ONLY = 'course_only',
  INVITE_ONLY = 'invite_only'
}

export enum MentorshipStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum ProjectType {
  ACADEMIC = 'academic',
  RESEARCH = 'research',
  MINISTRY = 'ministry',
  TECHNOLOGY = 'technology',
  COMMUNITY_SERVICE = 'community_service',
  ENTREPRENEURSHIP = 'entrepreneurship'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ConnectionType {
  CLASSMATE = 'classmate',
  STUDY_PARTNER = 'study_partner',
  MENTOR = 'mentor',
  MENTEE = 'mentee',
  PROJECT_COLLABORATOR = 'project_collaborator',
  SPIRITUAL_ACCOUNTABILITY = 'spiritual_accountability',
  CAREER_NETWORK = 'career_network'
}

export enum ConnectionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked'
}

export enum MeetingType {
  VIRTUAL = 'virtual',
  IN_PERSON = 'in_person',
  HYBRID = 'hybrid'
}

export interface GroupMember {
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  isActive: boolean;
  contributions: number;
  scrollCoinEarned: number;
}

export enum MemberRole {
  MEMBER = 'member',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  LEADER = 'leader'
}

export interface SpiritualAlignment {
  biblicalFoundation: boolean;
  propheticInsight: boolean;
  kingdomFocus: boolean;
  christCentered: boolean;
}

export interface MentorshipProgress {
  goalsCompleted: number;
  totalGoals: number;
  skillsImproved: string[];
  spiritualGrowth: string[];
  nextSteps: string[];
}

export interface SessionFeedback {
  rating: number;
  comments: string;
  helpfulness: number;
  spiritualImpact: number;
}

export interface StudySchedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  recurring: boolean;
}

export interface StudyResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export enum ResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  LINK = 'link',
  AUDIO = 'audio',
  IMAGE = 'image',
  SCRIPTURE = 'scripture'
}

export interface ProjectMember {
  userId: string;
  role: ProjectRole;
  joinedAt: Date;
  contributions: string[];
  scrollCoinEarned: number;
}

export enum ProjectRole {
  LEADER = 'leader',
  MEMBER = 'member',
  CONTRIBUTOR = 'contributor',
  ADVISOR = 'advisor'
}

export interface ProjectResource {
  id: string;
  title: string;
  type: ResourceType;
  url?: string;
  content?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface Location {
  country: string;
  region?: string;
  city?: string;
  timezone: string;
}

export enum CareerTrack {
  SCROLL_FOUNDER = 'scroll_founder',
  SCROLL_AMBASSADOR = 'scroll_ambassador',
  SCROLL_PRIEST_SCRIBE = 'scroll_priest_scribe',
  SCROLL_ENGINEER = 'scroll_engineer',
  SCROLL_SCHOLAR = 'scroll_scholar',
  SCROLL_BUILDER = 'scroll_builder'
}