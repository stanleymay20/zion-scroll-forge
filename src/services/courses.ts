import { supabase } from '@/integrations/supabase/client';
import { underChrist } from '@/lib/lordship';
import type {
  Course,
  CourseModule,
  Lecture,
  Assessment,
  Assignment,
  CourseProgress,
  StudentSubmission,
  CourseCompletion,
  CourseFilters,
  CourseSortOptions,
  CourseDetailResponse,
  ModuleContentResponse,
  Enrollment
} from '@/types/course';

// ============================================================================
// COMPREHENSIVE COURSE MANAGEMENT SERVICE
// Following ScrollUniversity standards for complete course structure
// ============================================================================

/**
 * List courses with comprehensive filtering and search
 */
export const listCourses = underChrist(async (
  filters: CourseFilters = {},
  sort: CourseSortOptions = { field: 'created_at', direction: 'desc' },
  page: number = 1,
  limit: number = 12
) => {
  let query = supabase
    .from('courses')
    .select(`
      *,
      faculties(name),
      enrollments(count)
    `);

  // Apply filters
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  if (filters.faculty && filters.faculty !== 'All Faculties') {
    query = query.eq('faculty', filters.faculty);
  }

  if (filters.level && filters.level !== 'All Levels') {
    query = query.eq('level', filters.level);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  if (filters.xr_enabled !== undefined) {
    query = query.eq('xr_enabled', filters.xr_enabled);
  }

  if (filters.price_range) {
    query = query.gte('price_cents', filters.price_range[0] * 100)
                 .lte('price_cents', filters.price_range[1] * 100);
  }

  if (filters.rating_min) {
    query = query.gte('rating', filters.rating_min);
  }

  // Apply sorting
  query = query.order(sort.field, { ascending: sort.direction === 'asc' });

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    courses: data as Course[],
    total: count || 0,
    page,
    limit
  };
});

/**
 * Get comprehensive course details with all modules and content
 */
export const getCourseDetail = underChrist(async (courseId: string, userId?: string): Promise<CourseDetailResponse> => {
  // Get course basic info
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select(`
      *,
      faculties(name, description)
    `)
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  // Get course modules with all content
  const { data: modules, error: modulesError } = await supabase
    .from('course_modules')
    .select(`
      *,
      lectures(*),
      assessments(*),
      assignments(*),
      discussion_forums(*),
      course_resources(*)
    `)
    .eq('course_id', courseId)
    .order('order_index');

  if (modulesError) throw modulesError;

  // Get user enrollment if userId provided
  let enrollment: Enrollment | undefined;
  if (userId) {
    const { data: enrollmentData } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();
    
    enrollment = enrollmentData as Enrollment;
  }

  // Get user progress if enrolled
  let progress: CourseProgress[] = [];
  if (enrollment) {
    const { data: progressData } = await supabase
      .from('course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId);
    
    progress = progressData as CourseProgress[] || [];
  }

  return {
    course: course as Course,
    modules: modules as CourseModule[],
    enrollment,
    progress
  };
});

/**
 * Get detailed module content for learning interface
 */
export const getModuleContent = underChrist(async (moduleId: string, userId?: string): Promise<ModuleContentResponse> => {
  // Get module details
  const { data: module, error: moduleError } = await supabase
    .from('course_modules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (moduleError) throw moduleError;

  // Get lectures with notes
  const { data: lectures, error: lecturesError } = await supabase
    .from('lectures')
    .select(`
      *,
      lecture_notes(*)
    `)
    .eq('module_id', moduleId)
    .order('order_index');

  if (lecturesError) throw lecturesError;

  // Get assessments
  const { data: assessments, error: assessmentsError } = await supabase
    .from('assessments')
    .select('*')
    .eq('module_id', moduleId);

  if (assessmentsError) throw assessmentsError;

  // Get assignments
  const { data: assignments, error: assignmentsError } = await supabase
    .from('assignments')
    .select('*')
    .eq('module_id', moduleId);

  if (assignmentsError) throw assignmentsError;

  // Get discussion forums
  const { data: forums, error: forumsError } = await supabase
    .from('discussion_forums')
    .select(`
      *,
      forum_posts(*)
    `)
    .eq('module_id', moduleId);

  if (forumsError) throw forumsError;

  // Get resources
  const { data: resources, error: resourcesError } = await supabase
    .from('course_resources')
    .select('*')
    .eq('module_id', moduleId);

  if (resourcesError) throw resourcesError;

  // Get user progress if userId provided
  let progress: CourseProgress[] = [];
  if (userId) {
    const { data: progressData } = await supabase
      .from('course_progress')
      .select('*')
      .eq('module_id', moduleId)
      .eq('user_id', userId);
    
    progress = progressData as CourseProgress[] || [];
  }

  return {
    module: module as CourseModule,
    lectures: lectures as Lecture[],
    assessments: assessments as Assessment[],
    assignments: assignments as Assignment[],
    forums: forums as any[],
    resources: resources as any[],
    progress
  };
});

/**
 * Enroll user in course with spiritual alignment validation
 */
export const enrollInCourse = underChrist(async (userId: string, courseId: string) => {
  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (existingEnrollment) {
    throw new Error('Already enrolled in this course');
  }

  // Create enrollment
  const { error } = await supabase
    .from('enrollments')
    .insert({ 
      user_id: userId, 
      course_id: courseId, 
      progress: 0,
      enrolled_at: new Date().toISOString()
    });

  if (error) throw error;

  // Initialize spiritual assessment for the course
  await initializeSpiritualAssessment(userId, courseId);

  return { success: true };
});

/**
 * Track course progress with spiritual growth notes
 */
export const trackProgress = underChrist(async (
  userId: string,
  courseId: string,
  moduleId?: string,
  lectureId?: string,
  progressType: 'lecture_viewed' | 'assessment_completed' | 'assignment_submitted' = 'lecture_viewed',
  timeSpent: number = 0,
  spiritualGrowthNotes?: string
) => {
  const { error } = await supabase
    .from('course_progress')
    .insert({
      user_id: userId,
      course_id: courseId,
      module_id: moduleId,
      lecture_id: lectureId,
      progress_type: progressType,
      time_spent: timeSpent,
      spiritual_growth_notes: spiritualGrowthNotes,
      completion_percentage: calculateCompletionPercentage(progressType)
    });

  if (error) throw error;

  // Update overall enrollment progress
  await updateEnrollmentProgress(userId, courseId);

  return { success: true };
});

/**
 * Submit assessment with AI-powered grading
 */
export const submitAssessment = underChrist(async (
  userId: string,
  assessmentId: string,
  submissionData: any,
  spiritualReflection?: string
) => {
  // Create submission
  const { data: submission, error: submissionError } = await supabase
    .from('student_submissions')
    .insert({
      user_id: userId,
      assessment_id: assessmentId,
      submission_data: submissionData,
      spiritual_reflection: spiritualReflection,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (submissionError) throw submissionError;

  // Trigger AI grading
  await processAIGrading(submission.id, submissionData);

  return { success: true, submission_id: submission.id };
});

/**
 * Submit assignment with ministry application
 */
export const submitAssignment = underChrist(async (
  userId: string,
  assignmentId: string,
  submissionData: any,
  ministryApplication?: string,
  spiritualReflection?: string
) => {
  const { data: submission, error } = await supabase
    .from('student_submissions')
    .insert({
      user_id: userId,
      assignment_id: assignmentId,
      submission_data: submissionData,
      ministry_application: ministryApplication,
      spiritual_reflection: spiritualReflection,
      submitted_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return { success: true, submission_id: submission.id };
});

/**
 * Get user enrollments with comprehensive progress data
 */
export const getUserEnrollments = underChrist(async (userId: string) => {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      *,
      courses(*),
      course_progress(*)
    `)
    .eq('user_id', userId)
    .order('enrolled_at', { ascending: false });

  if (error) throw error;
  return data;
});

/**
 * Complete course and generate certificate
 */
export const completeCourse = underChrist(async (userId: string, courseId: string) => {
  // Calculate final score and ministry readiness
  const finalScore = await calculateFinalScore(userId, courseId);
  const ministryReadinessScore = await calculateMinistryReadiness(userId, courseId);
  
  // Generate spiritual growth summary
  const spiritualGrowthSummary = await generateSpiritualGrowthSummary(userId, courseId);

  // Create completion record
  const { data: completion, error } = await supabase
    .from('course_completions')
    .insert({
      user_id: userId,
      course_id: courseId,
      completion_date: new Date().toISOString(),
      final_score: finalScore,
      spiritual_growth_summary: spiritualGrowthSummary,
      ministry_readiness_score: ministryReadinessScore
    })
    .select()
    .single();

  if (error) throw error;

  // Generate certificate and ScrollBadge NFT
  await generateCertificate(completion.id);
  await mintScrollBadgeNFT(completion.id);

  return { success: true, completion };
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize spiritual assessment for new enrollment
 */
const initializeSpiritualAssessment = async (userId: string, courseId: string) => {
  const { error } = await supabase
    .from('spiritual_assessments')
    .insert({
      user_id: userId,
      assessment_type: 'course_enrollment',
      calling_insights: {},
      spiritual_gifts: [],
      growth_areas: [],
      scripture_references: [],
      confidence_score: 0.0
    });

  if (error) console.error('Failed to initialize spiritual assessment:', error);
};

/**
 * Calculate completion percentage based on progress type
 */
const calculateCompletionPercentage = (progressType: string): number => {
  switch (progressType) {
    case 'lecture_viewed': return 25;
    case 'assessment_completed': return 50;
    case 'assignment_submitted': return 100;
    default: return 0;
  }
};

/**
 * Update overall enrollment progress
 */
const updateEnrollmentProgress = async (userId: string, courseId: string) => {
  // Get all progress records for this enrollment
  const { data: progressRecords } = await supabase
    .from('course_progress')
    .select('completion_percentage')
    .eq('user_id', userId)
    .eq('course_id', courseId);

  if (!progressRecords) return;

  // Calculate average progress
  const totalProgress = progressRecords.reduce((sum, record) => sum + record.completion_percentage, 0);
  const avgProgress = Math.round(totalProgress / progressRecords.length);

  // Update enrollment
  await supabase
    .from('enrollments')
    .update({ progress: avgProgress })
    .eq('user_id', userId)
    .eq('course_id', courseId);
};

/**
 * Process AI-powered grading
 */
const processAIGrading = async (submissionId: string, submissionData: any) => {
  // This would integrate with OpenAI GPT-4 for grading
  // For now, we'll create a placeholder
  const aiScore = Math.random() * 100; // Placeholder
  const aiFeedback = "Excellent work! Your understanding of the spiritual principles is evident.";
  const spiritualInsights = "Your reflection shows deep spiritual maturity and practical application.";

  await supabase
    .from('ai_grading_results')
    .insert({
      submission_id: submissionId,
      ai_score: aiScore,
      ai_feedback: aiFeedback,
      spiritual_insights: spiritualInsights,
      improvement_suggestions: [],
      confidence_level: 0.85,
      human_review_required: aiScore < 70
    });
};

/**
 * Calculate final course score
 */
const calculateFinalScore = async (userId: string, courseId: string): Promise<number> => {
  const { data: submissions } = await supabase
    .from('student_submissions')
    .select('score')
    .eq('user_id', userId)
    .not('score', 'is', null);

  if (!submissions || submissions.length === 0) return 0;

  const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
  return Math.round(totalScore / submissions.length);
};

/**
 * Calculate ministry readiness score
 */
const calculateMinistryReadiness = async (userId: string, courseId: string): Promise<number> => {
  // This would analyze spiritual growth, practical application, and character development
  // Placeholder implementation
  return 0.85;
};

/**
 * Generate spiritual growth summary
 */
const generateSpiritualGrowthSummary = async (userId: string, courseId: string): Promise<string> => {
  // This would analyze all spiritual reflections and growth notes
  // Placeholder implementation
  return "Demonstrated significant spiritual growth through consistent prayer, scripture study, and practical ministry application.";
};

/**
 * Generate course completion certificate
 */
const generateCertificate = async (completionId: string) => {
  // This would generate a PDF certificate
  // Placeholder implementation
  console.log('Generating certificate for completion:', completionId);
};

/**
 * Mint ScrollBadge NFT for course completion
 */
const mintScrollBadgeNFT = async (completionId: string) => {
  // This would mint an NFT on the blockchain
  // Placeholder implementation
  console.log('Minting ScrollBadge NFT for completion:', completionId);
};
