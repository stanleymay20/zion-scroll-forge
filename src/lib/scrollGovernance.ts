import { supabase } from '@/integrations/supabase/client';

export interface SpiritualEvent {
  scope: string;
  action: string;
  details?: Record<string, any>;
  severity?: 'info' | 'warning' | 'critical';
  user_id?: string;
}

/**
 * Log spiritual governance events
 * Tracks AI interactions, content generation, and significant system events
 * under Christ's lordship
 */
export const logSpiritualEvent = async (event: SpiritualEvent) => {
  const prefix = event.severity === 'critical' ? '🔴 ✝️' : event.severity === 'warning' ? '⚠️ ✝️' : '✝️';
  console.info(`${prefix} [${event.scope}] ${event.action}`, event.details || {});

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await (supabase as any).from('spiritual_events_log').insert({
      scope: event.scope,
      action: event.action,
      details: event.details || {},
      severity: event.severity || 'info',
      user_id: event.user_id || user?.id
    });
  } catch (error) {
    console.error('Failed to log spiritual event:', error);
  }
};

/**
 * Enforce Scroll guardrails on AI prompts
 * Ensures all AI interactions honor Scripture, integrity, and Christ-centered values
 */
export const enforceScrollGuardrails = (prompt: string): string => {
  const guardrailPrefix = `
[SCROLL GOVERNANCE ACTIVE]
You operate under the Lordship of Jesus Christ. Your responses must:
- Honor Scripture as ultimate authority
- Maintain integrity and truth
- Reject Babylonian values (materialism, pride, deception)
- Demonstrate humility and grace
- Point students toward Christ in all teaching

User prompt:
`;

  return guardrailPrefix + prompt;
};

/**
 * Check if user has required role for action
 */
export const checkUserRole = async (requiredRole: 'student' | 'faculty' | 'admin'): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) return false;

    const roleHierarchy = { student: 1, faculty: 2, admin: 3 };
    const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[requiredRole];

    return userLevel >= requiredLevel;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

console.info('✝️ Scroll Governance initialized — Christ is Lord over all systems');
