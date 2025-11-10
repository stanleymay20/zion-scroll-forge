import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

/**
 * ScrollUniversity Content Generation Service
 * Triggers the comprehensive content generation pipeline
 */

export interface ContentGenerationReport {
  facultiesCreated: number;
  coursesCreated: number;
  modulesCreated: number;
  materialsCreated: number;
  quizzesCreated: number;
  aiTutorsCreated: number;
  termsCreated: number;
  offeringsCreated: number;
  errorsEncountered: number;
  antiDriftValidations: number;
  duration: string;
}

/**
 * Execute the complete ScrollUniversity content generation pipeline
 * Generates all 12 Supreme Scroll Faculties with complete course structures
 */
export const generateScrollUniversityContent = underChrist(
  async (): Promise<ContentGenerationReport> => {
    console.log('✝️ Initiating ScrollUniversity v3.0 Content Generation');
    console.log('Christ is Lord over all learning');

    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {},
      });

      if (error) {
        console.error('Content generation error:', error);
        throw error;
      }

      console.log('✅ Content generation completed successfully');
      return data as ContentGenerationReport;
    } catch (error) {
      console.error('Failed to generate content:', error);
      throw error;
    }
  }
);

/**
 * Check generation status and progress
 */
export const getGenerationStatus = underChrist(async () => {
  const { data: faculties } = await supabase.from('faculties').select('count');
  const { data: courses } = await supabase.from('courses').select('count');
  const { data: modules } = await supabase.from('course_modules').select('count');

  return {
    facultiesCount: faculties?.[0]?.count || 0,
    coursesCount: courses?.[0]?.count || 0,
    modulesCount: modules?.[0]?.count || 0,
    isComplete: (faculties?.[0]?.count || 0) >= 12,
  };
});

/**
 * Get all faculties with statistics
 */
export const getAllFaculties = underChrist(async () => {
  const { data, error } = await supabase
    .from('faculties')
    .select(`
      *,
      courses:courses(count)
    `)
    .order('created_at');

  if (error) throw error;
  return data;
});

/**
 * Get faculty details with courses
 */
export const getFacultyDetails = underChrist(async (facultyId: string) => {
  const { data, error } = await supabase
    .from('faculties')
    .select(`
      *,
      courses:courses(
        *,
        modules:course_modules(count)
      )
    `)
    .eq('id', facultyId)
    .single();

  if (error) throw error;
  return data;
});
