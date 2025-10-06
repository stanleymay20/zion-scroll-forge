import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

export interface Course {
  id: string;
  title: string;
  description: string | null;
  faculty: string | null;
  level: string | null;
  price: number;
  rating: number;
  students: number;
  duration: string | null;
  tags: string[];
  xr_enabled: boolean;
}

export const listCourses = underChrist(async (params: {
  search?: string;
  faculty?: string;
  level?: string;
} = {}) => {
  let query = supabase.from('courses').select('*');

  if (params.search) {
    query = query.ilike('title', `%${params.search}%`);
  }

  if (params.faculty && params.faculty !== 'All Faculties') {
    query = query.eq('faculty', params.faculty);
  }

  if (params.level && params.level !== 'All Levels') {
    query = query.eq('level', params.level);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Course[];
});

export const enrollInCourse = underChrist(async (userId: string, courseId: string) => {
  const { error } = await supabase
    .from('enrollments')
    .insert({ user_id: userId, course_id: courseId, progress: 0 });

  if (error) throw error;
  return { success: true };
});

export const getUserEnrollments = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
});
