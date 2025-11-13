import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';

// Learning Profile Types
export interface LearningProfile {
  id: string;
  user_id: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  preferred_pace: 'slow' | 'moderate' | 'fast';
  study_time_preference: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  strengths: string[];
  weaknesses: string[];
  goals: string[];
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  user_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  mastery_level: number;
  time_spent: number;
  attempts: number;
  last_accessed: string;
  completed_at?: string;
}

export interface CourseRecommendation {
  id: string;
  user_id: string;
  course_id: string;
  relevance_score: number;
  reason: string;
  created_at: string;
  course?: any;
}

export interface StudyPlan {
  id: string;
  user_id: string;
  course_id: string;
  target_completion_date: string;
  weekly_hours: number;
  daily_schedule: any;
  milestones: any[];
  created_at: string;
  updated_at: string;
}

export interface LearningGoal {
  id: string;
  user_id: string;
  goal_type: 'course_completion' | 'mastery_level' | 'scrollcoin_earning' | 'study_time';
  target_value: number;
  current_value: number;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  created_at: string;
  completed_at?: string;
}

// Learning Profile Services
export const getLearningProfile = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('student_learning_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as LearningProfile | null;
});

export const createLearningProfile = underChrist(async (profile: Partial<LearningProfile>) => {
  const { data, error } = await supabase
    .from('student_learning_profiles')
    .insert([profile as any])
    .select()
    .single();

  if (error) throw error;
  return data as LearningProfile;
});

export const updateLearningProfile = underChrist(async (userId: string, updates: Partial<LearningProfile>) => {
  const { data, error } = await supabase
    .from('student_learning_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as LearningProfile;
});

// Module Progress Services
export const getModuleProgress = underChrist(async (userId: string, moduleId: string) => {
  const { data, error } = await supabase
    .from('student_module_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('module_id', moduleId)
    .maybeSingle();

  if (error) throw error;
  return data as ModuleProgress | null;
});

export const updateModuleProgress = underChrist(async (
  userId: string,
  moduleId: string,
  progress: Partial<ModuleProgress>
) => {
  const { data, error } = await supabase
    .from('student_module_progress')
    .upsert({
      user_id: userId,
      module_id: moduleId,
      ...progress
    })
    .select()
    .single();

  if (error) throw error;
  return data as ModuleProgress;
});

export const getUserModuleProgress = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('student_module_progress')
    .select('*, course_modules(title, course_id, courses(title, faculty))')
    .eq('user_id', userId)
    .order('last_accessed', { ascending: false });

  if (error) throw error;
  return data;
});

// Course Recommendations Services
export const getCourseRecommendations = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('course_recommendations')
    .select('*, courses(*)')
    .eq('user_id', userId)
    .order('relevance_score', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as CourseRecommendation[];
});

export const generateRecommendations = underChrist(async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('generate-recommendations', {
    body: { userId }
  });

  if (error) throw error;
  return data;
});

// Study Plan Services
export const getStudyPlan = underChrist(async (userId: string, courseId: string) => {
  const { data, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (error) throw error;
  return data as StudyPlan | null;
});

export const createStudyPlan = underChrist(async (plan: Partial<StudyPlan>) => {
  const { data, error } = await supabase
    .from('study_plans')
    .insert([plan as any])
    .select()
    .single();

  if (error) throw error;
  return data as StudyPlan;
});

export const updateStudyPlan = underChrist(async (
  userId: string,
  courseId: string,
  updates: Partial<StudyPlan>
) => {
  const { data, error } = await supabase
    .from('study_plans')
    .update(updates)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .select()
    .single();

  if (error) throw error;
  return data as StudyPlan;
});

export const generateStudyPlan = underChrist(async (userId: string, courseId: string, weeklyHours: number) => {
  const { data, error } = await supabase.functions.invoke('generate-study-plan', {
    body: { userId, courseId, weeklyHours }
  });

  if (error) throw error;
  return data;
});

// Learning Goals Services
export const getLearningGoals = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('learning_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as LearningGoal[];
});

export const createLearningGoal = underChrist(async (goal: Partial<LearningGoal>) => {
  const { data, error } = await supabase
    .from('learning_goals')
    .insert([goal as any])
    .select()
    .single();

  if (error) throw error;
  return data as LearningGoal;
});

export const updateLearningGoal = underChrist(async (goalId: string, updates: Partial<LearningGoal>) => {
  const { data, error } = await supabase
    .from('learning_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data as LearningGoal;
});

// Skills Assessment
export const getSkillsAssessment = underChrist(async (userId: string) => {
  const { data, error } = await supabase.functions.invoke('skills-assessment', {
    body: { userId }
  });

  if (error) throw error;
  return data;
});
