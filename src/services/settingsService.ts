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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Get user settings
 */
export async function getUserSettings(): Promise<UserSettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/preferences/${user.id}`, {
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch settings');
  }

  return response.json();
}

/**
 * Update user settings
 */
export async function updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/preferences`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update settings');
  }

  return response.json();
}

/**
 * Get privacy settings
 */
export async function getPrivacySettings(): Promise<PrivacySettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/privacy/${user.id}`, {
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch privacy settings');
  }

  return response.json();
}

/**
 * Update privacy settings
 */
export async function updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/privacy`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update privacy settings');
  }

  return response.json();
}

/**
 * Get security settings
 */
export async function getSecuritySettings(): Promise<SecuritySettings | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/security/${user.id}`, {
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch security settings');
  }

  return response.json();
}

/**
 * Setup two-factor authentication
 */
export async function setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/security/2fa/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error('Failed to setup 2FA');
  }

  return response.json();
}

/**
 * Verify two-factor authentication
 */
export async function verifyTwoFactor(code: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/security/2fa/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    throw new Error('Failed to verify 2FA');
  }

  const result = await response.json();
  return result.verified;
}

/**
 * Disable two-factor authentication
 */
export async function disableTwoFactor(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/security/2fa/disable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to disable 2FA');
  }
}

/**
 * Terminate session
 */
export async function terminateSession(sessionId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/profile/security/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to terminate session');
  }
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
  return Intl.supportedValuesOf('timeZone');
}
