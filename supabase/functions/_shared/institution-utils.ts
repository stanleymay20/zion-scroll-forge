// ✝️ ScrollUniversity Multi-Tenant Utility — Christ governs all institutions
// Shared utility for resolving institution_id across all edge functions

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Resolves the institution_id for a request.
 * Priority:
 * 1. institution_id in request body
 * 2. profile.current_institution_id from JWT
 * 3. Default to ScrollUniversity institution
 */
export async function resolveInstitutionId(
  req: Request,
  supabase: ReturnType<typeof createClient>,
  bodyData?: any
): Promise<string> {
  try {
    // Priority 1: Check request body
    if (bodyData?.institution_id) {
      console.log('✝️ Using institution_id from request body:', bodyData.institution_id);
      return bodyData.institution_id;
    }

    // Priority 2: Try to get from JWT/profile
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_institution_id')
            .eq('id', user.id)
            .single();
          
          if (profile?.current_institution_id) {
            console.log('✝️ Using institution_id from user profile:', profile.current_institution_id);
            return profile.current_institution_id;
          }
        }
      }
    } catch (authError) {
      console.log('✝️ No authenticated user, continuing to default institution');
    }

    // Priority 3: Default to ScrollUniversity
    const { data: defaultInstitution } = await supabase
      .from('institutions')
      .select('id')
      .eq('slug', 'scrolluniversity')
      .single();
    
    if (defaultInstitution) {
      console.log('✝️ Using default ScrollUniversity institution:', defaultInstitution.id);
      return defaultInstitution.id;
    }

    throw new Error('No institution could be resolved');
  } catch (error) {
    console.error('Error resolving institution:', error);
    throw new Error('Failed to resolve institution_id');
  }
}

/**
 * Gets the default ScrollUniversity institution ID
 */
export async function getDefaultInstitutionId(
  supabase: ReturnType<typeof createClient>
): Promise<string> {
  const { data } = await supabase
    .from('institutions')
    .select('id')
    .eq('slug', 'scrolluniversity')
    .single();
  
  if (!data) {
    throw new Error('Default ScrollUniversity institution not found');
  }
  
  return data.id;
}
