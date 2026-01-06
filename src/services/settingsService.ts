/**
 * Settings Service
 * "In all your ways submit to him, and he will make your paths straight" - Proverbs 3:6
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  UserSettings,
  PrivacySettings,
  SecuritySettings,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  AccessibilitySettings,
} from '@/types/settings';

console.info('✝️ Settings Service — Christ governs all preferences');

/**
 * Get user settings - uses Supabase directly
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await (supabase as any)
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }

  return data;
}

/**
 * Update user settings - uses Supabase directly
 */
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await (supabase as any)
    .from('user_settings')
    .upsert({ user_id: user.id, ...settings })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get privacy settings - uses Supabase directly
 */
export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await (supabase as any)
    .from('privacy_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch privacy settings:', error);
    // Return default privacy settings matching the type
    return {
      userId: user.id,
      profileVisibility: 'private',
      showEmail: false,
      showPhoneNumber: false,
      showLocation: false,
      showDateOfBirth: false,
      showCourseProgress: true,
      showAchievements: true,
      showScrollCoinBalance: false,
      showSpiritualGrowth: true,
      allowMessagesFrom: 'connections',
      allowFriendRequests: true,
      allowStudyGroupInvites: true,
      allowDataAnalytics: true,
      allowPersonalization: true,
      allowThirdPartySharing: false,
      appearInSearch: true,
      showInLeaderboards: true,
      updatedAt: new Date()
    };
  }

  return data;
}

/**
 * Update privacy settings - uses Supabase directly
 */
export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await (supabase as any)
    .from('privacy_settings')
    .upsert({ user_id: user.id, ...settings })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get security settings - returns defaults since advanced security features require backend
 */
export async function getSecuritySettings(): Promise<SecuritySettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Return reasonable defaults - 2FA and session management require backend support
  return {
    userId: user.id,
    twoFactorEnabled: false,
    twoFactorMethod: undefined,
    passwordLastChanged: new Date(),
    activeSessions: [
      {
        sessionId: 'current',
        deviceInfo: {
          browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                   navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                   navigator.userAgent.includes('Safari') ? 'Safari' : 'Browser',
          os: navigator.platform,
          deviceType: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        },
        ipAddress: 'Current Device',
        location: 'Current Location',
        loginAt: new Date(),
        lastActivityAt: new Date(),
        isCurrent: true
      }
    ],
    updatedAt: new Date()
  };
}

/**
 * Setup two-factor authentication - placeholder implementation
 */
export async function setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 2FA setup requires backend implementation
  // Return mock response for now
  return {
    method: request.method,
    backupCodes: ['XXXX-XXXX', 'YYYY-YYYY', 'ZZZZ-ZZZZ'],
    qrCode: undefined,
    secret: undefined
  };
}

/**
 * Verify two-factor authentication - placeholder implementation
 */
export async function verifyTwoFactor(code: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 2FA verification requires backend implementation
  return true;
}

/**
 * Disable two-factor authentication - placeholder implementation
 */
export async function disableTwoFactor(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 2FA disable requires backend implementation
  return;
}

/**
 * Terminate session - uses Supabase signOut for current session
 */
export async function terminateSession(sessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // For current session, sign out
  if (sessionId === 'current') {
    await supabase.auth.signOut();
    return;
  }

  // For other sessions, would need backend implementation
  console.log('Session termination for non-current sessions requires backend implementation');
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Get supported languages
 */
export function getSupportedLanguages() {
  return [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
    { code: 'zh', name: 'Chinese', nativeName: '中文' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  ];
}

/**
 * Get time zones
 */
export function getTimeZones() {
  // Fallback list of common timezones for older browsers
  const fallbackTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
  ];
  
  try {
    // @ts-ignore - supportedValuesOf is available in newer browsers
    if (Intl.supportedValuesOf) {
      // @ts-ignore
      return Intl.supportedValuesOf('timeZone');
    }
  } catch (e) {
    // Fallback for older browsers
  }
  
  return fallbackTimezones;
}
