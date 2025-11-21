/**
 * Settings and Preferences Types
 * "Set your minds on things above, not on earthly things" - Colossians 3:2
 */

export interface UserSettings {
  userId: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'system';
  colorScheme?: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Language & Localization
  language: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  
  // Notifications
  emailNotifications: EmailNotificationPreferences;
  pushNotifications: PushNotificationPreferences;
  smsNotifications: SmsNotificationPreferences;
  
  // Privacy
  profileVisibility: 'public' | 'private' | 'friends_only';
  showEmail: boolean;
  showPhoneNumber: boolean;
  showLocation: boolean;
  allowMessagesFrom: 'everyone' | 'connections' | 'nobody';
  
  // Learning Preferences
  autoPlayVideos: boolean;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  closedCaptionsEnabled: boolean;
  
  // Accessibility
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  keyboardNavigationEnabled: boolean;
  
  updatedAt: Date;
}

export interface EmailNotificationPreferences {
  enabled: boolean;
  courseUpdates: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  communityActivity: boolean;
  spiritualFormation: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}

export interface PushNotificationPreferences {
  enabled: boolean;
  courseUpdates: boolean;
  assignmentReminders: boolean;
  gradeNotifications: boolean;
  messages: boolean;
  communityActivity: boolean;
  spiritualFormation: boolean;
}

export interface SmsNotificationPreferences {
  enabled: boolean;
  urgentOnly: boolean;
  assignmentDeadlines: boolean;
  systemAlerts: boolean;
}

export interface PrivacySettings {
  userId: string;
  
  // Profile Visibility
  profileVisibility: 'public' | 'private' | 'friends_only';
  showEmail: boolean;
  showPhoneNumber: boolean;
  showLocation: boolean;
  showDateOfBirth: boolean;
  
  // Activity Visibility
  showCourseProgress: boolean;
  showAchievements: boolean;
  showScrollCoinBalance: boolean;
  showSpiritualGrowth: boolean;
  
  // Communication
  allowMessagesFrom: 'everyone' | 'connections' | 'nobody';
  allowFriendRequests: boolean;
  allowStudyGroupInvites: boolean;
  
  // Data Sharing
  allowDataAnalytics: boolean;
  allowPersonalization: boolean;
  allowThirdPartySharing: boolean;
  
  // Search & Discovery
  appearInSearch: boolean;
  showInLeaderboards: boolean;
  
  updatedAt: Date;
}

export interface SecuritySettings {
  userId: string;
  
  // Two-Factor Authentication
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'authenticator';
  
  // Session Management
  activeSessions: ActiveSession[];
  
  // Login Security
  passwordLastChanged: Date;
  
  updatedAt: Date;
}

export interface ActiveSession {
  sessionId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  location?: string;
  loginAt: Date;
  lastActivityAt: Date;
  isCurrent: boolean;
}

export interface DeviceInfo {
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
}

export interface TwoFactorSetupRequest {
  method: 'sms' | 'email' | 'authenticator';
  phoneNumber?: string;
  email?: string;
}

export interface TwoFactorSetupResponse {
  method: string;
  secret?: string;
  qrCode?: string;
  backupCodes: string[];
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastMode: boolean;
  keyboardNavigationEnabled: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusIndicators: boolean;
}
