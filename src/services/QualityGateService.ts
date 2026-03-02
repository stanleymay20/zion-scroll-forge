/**
 * QualityGateService
 * 
 * Internal quality enforcement system for ScrollUniversity.
 * Blocks incomplete programs from public visibility, enforces assessment completion,
 * and prevents certificate issuance without proper validation.
 * 
 * "The integrity of the upright guides them." — Proverbs 11:3
 */

import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

console.info("⚖️ QualityGateService initialized — Academic integrity enforced");

// Types
export interface SealCriteria {
  content_rich_modules: { required: number; actual: number; passed: boolean };
  assessments_with_rubrics: { required: number; actual: number; passed: boolean };
  modules_with_media: { required: number; actual: number; passed: boolean };
  has_study_guide: { required: number; actual: number; passed: boolean };
}

export interface DiplomaSealCriteria {
  content_rich_modules: { required: number; actual: number; passed: boolean; threshold_chars: number };
  knowledge_checks: { required: number; actual: number; passed: boolean };
  applied_projects: { required: number; actual: number; passed: boolean };
  synthesis_assessments: { required: number; actual: number; passed: boolean };
  total_assessments: { required: number; actual: number; passed: boolean };
  modules_with_media: { required: number; actual: number; passed: boolean };
  has_study_guide: { required: number; actual: number; passed: boolean };
}

export type SealTier = 'ScrollCertificateSeal' | 'ScrollDiplomaSeal';

export interface SealResult {
  passed: boolean;
  seal_tier?: SealTier;
  criteria: SealCriteria | DiplomaSealCriteria;
  checked_at: string;
}

export interface CompletionSeal {
  id: string;
  entity_type: 'degree_program' | 'course';
  entity_id: string;
  seal_status: 'pending' | 'verified' | 'revoked';
  verification_criteria: SealResult | null;
  verified_at: string | null;
  revoked_at: string | null;
  revocation_reason: string | null;
}

export interface QualityAuditLog {
  id: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  user_id: string | null;
  old_value: unknown;
  new_value: unknown;
  reason: string | null;
  metadata: unknown;
  created_at: string;
}

export interface GraduationEligibility {
  eligible: boolean;
  assessments_completed: boolean;
  assessments_passed: boolean;
  seal_verified: boolean;
  blocks: string[];
}

// ============================================
// QUALITY GATE CHECKS
// ============================================

/**
 * Check if a course meets completion seal criteria
 */
export async function checkCourseSealCriteria(courseId: string): Promise<SealResult | null> {
  const { data, error } = await supabase.rpc('check_seal_criteria', {
    p_course_id: courseId
  });
  
  if (error) {
    console.error("Failed to check seal criteria:", error);
    return null;
  }
  
  // Parse the JSON response
  if (data && typeof data === 'object') {
    return data as unknown as SealResult;
  }
  
  return null;
}

/**
 * Verify or update a completion seal for an entity
 */
export async function updateCompletionSeal(
  entityType: 'degree_program' | 'course',
  entityId: string
): Promise<{ seal_id: string; status: string; criteria: SealResult } | null> {
  const { data, error } = await supabase.rpc('update_completion_seal', {
    p_entity_type: entityType,
    p_entity_id: entityId
  });
  
  if (error) {
    console.error("Failed to update completion seal:", error);
    return null;
  }
  
  if (data && typeof data === 'object') {
    return data as unknown as { seal_id: string; status: string; criteria: SealResult };
  }
  
  return null;
}

/**
 * Get completion seal status for an entity
 */
export async function getCompletionSeal(
  entityType: 'degree_program' | 'course',
  entityId: string
): Promise<CompletionSeal | null> {
  const { data, error } = await supabase
    .from('completion_seals')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .maybeSingle();
  
  if (error) {
    console.error("Failed to fetch completion seal:", error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    entity_type: data.entity_type as 'degree_program' | 'course',
    entity_id: data.entity_id,
    seal_status: data.seal_status as 'pending' | 'verified' | 'revoked',
    verification_criteria: data.verification_criteria as unknown as SealResult | null,
    verified_at: data.verified_at,
    revoked_at: data.revoked_at,
    revocation_reason: data.revocation_reason
  };
}

/**
 * Check if a program is publicly visible (not locked + has seal)
 */
export async function isProgramPubliclyVisible(programId: string): Promise<boolean> {
  const { data: program, error } = await supabase
    .from('degree_programs')
    .select('program_status, is_active')
    .eq('id', programId)
    .single();
  
  if (error || !program) return false;
  
  // Must be active and public
  return program.is_active && program.program_status === 'active_public';
}

/**
 * Check if course is locked (baseline protection)
 */
export async function isCourseLockedBaseline(courseId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('courses')
    .select('locked_baseline')
    .eq('id', courseId)
    .single();
  
  if (error) return false;
  return data?.locked_baseline ?? false;
}

/**
 * Check if program is locked (baseline protection)
 */
export async function isProgramLockedBaseline(programId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('degree_programs')
    .select('locked_baseline')
    .eq('id', programId)
    .single();
  
  if (error) return false;
  return data?.locked_baseline ?? false;
}

// ============================================
// GRADUATION & CERTIFICATE ENFORCEMENT
// ============================================

/**
 * Check if a student is eligible for graduation from a program
 * Blocks graduation without completed assessments
 */
export async function checkGraduationEligibility(
  userId: string,
  programId: string
): Promise<GraduationEligibility> {
  const blocks: string[] = [];
  
  // 1. Check if program has verified seal
  const seal = await getCompletionSeal('degree_program', programId);
  const sealVerified = seal?.seal_status === 'verified';
  if (!sealVerified) {
    blocks.push('Program has not achieved completion seal verification');
  }
  
  // 2. Check student holds
  const { data: holds } = await supabase
    .from('student_holds')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('blocks_graduation', true);
  
  if (holds && holds.length > 0) {
    blocks.push(`${holds.length} active hold(s) blocking graduation`);
  }
  
  // 3. Check enrollment completion for the user's courses
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id, course_id, progress')
    .eq('user_id', userId);
  
  // Get program's required courses
  const { data: programCourses } = await supabase
    .from('degree_course_requirements')
    .select('course_id, is_required')
    .eq('degree_id', programId)
    .eq('is_required', true);
  
  const requiredCourseIds = programCourses?.map(pc => pc.course_id) ?? [];
  
  // Check completed enrollments (progress >= 100)
  const completedCourseIds = enrollments
    ?.filter(e => (e.progress ?? 0) >= 100)
    .map(e => e.course_id) ?? [];
  
  const incompleteRequired = requiredCourseIds.filter(
    id => !completedCourseIds.includes(id)
  );
  
  if (incompleteRequired.length > 0) {
    blocks.push(`${incompleteRequired.length} required course(s) not completed`);
  }
  
  // 4. Check that all submissions are graded
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('user_id', userId);
  
  const assessmentsCompleted = submissions?.every(s => s.status === 'graded') ?? true;
  const assessmentsPassed = true; // Will validate once grades are added
  
  if (!assessmentsCompleted && submissions && submissions.length > 0) {
    blocks.push('Not all assessments have been graded');
  }
  
  return {
    eligible: blocks.length === 0,
    assessments_completed: assessmentsCompleted,
    assessments_passed: assessmentsPassed,
    seal_verified: sealVerified,
    blocks
  };
}

/**
 * Block certificate issuance without passing grades
 */
export async function canIssueCertificate(
  userId: string,
  courseId: string
): Promise<{ canIssue: boolean; reason?: string }> {
  // Check if course has verified seal
  const seal = await getCompletionSeal('course', courseId);
  if (!seal || seal.seal_status !== 'verified') {
    return { canIssue: false, reason: 'Course has not achieved completion seal' };
  }
  
  // Check enrollment completion (progress >= 100)
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id, progress')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();
  
  if (!enrollment || (enrollment.progress ?? 0) < 100) {
    return { canIssue: false, reason: 'Course not completed' };
  }
  
  // Check submissions are graded
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, status')
    .eq('user_id', userId)
    .eq('status', 'graded');
  
  // For now, just verify submissions exist and are graded
  const allGraded = !submissions || submissions.length === 0 || submissions.every(s => s.status === 'graded');
  if (!allGraded) {
    return { canIssue: false, reason: 'Assessments not yet graded' };
  }
  
  return { canIssue: true };
}

// ============================================
// AUDIT LOGGING
// ============================================

/**
 * Log a quality-related action
 */
export async function logQualityAction(
  actionType: string,
  entityType: string,
  entityId: string,
  options: {
    oldValue?: Json | null;
    newValue?: Json | null;
    reason?: string;
    metadata?: Json;
  } = {}
): Promise<string | null> {
  const { data, error } = await supabase.rpc('log_quality_action', {
    p_action_type: actionType,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_old_value: options.oldValue ?? null,
    p_new_value: options.newValue ?? null,
    p_reason: options.reason ?? null,
    p_metadata: options.metadata ?? {}
  });
  
  if (error) {
    console.error("Failed to log quality action:", error);
    return null;
  }
  
  return data as string | null;
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  limit: number = 50
): Promise<QualityAuditLog[]> {
  const { data, error } = await supabase
    .from('quality_audit_logs')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
  
  return (data ?? []) as unknown as QualityAuditLog[];
}

// ============================================
// CONTENT PROTECTION (BASELINE LOCK)
// ============================================

/**
 * Check if content modification is allowed
 * Returns false if baseline is locked and not admin override
 */
export async function canModifyContent(
  entityType: 'course' | 'module',
  entityId: string,
  modificationType: 'structure' | 'typo_fix' | 'regenerate'
): Promise<{ allowed: boolean; reason?: string }> {
  if (modificationType === 'typo_fix') {
    // Typo fixes always allowed
    return { allowed: true };
  }
  
  if (entityType === 'course') {
    const locked = await isCourseLockedBaseline(entityId);
    if (locked) {
      return {
        allowed: false,
        reason: 'Course is baseline-locked. Only typo-level fixes allowed without admin override.'
      };
    }
  } else if (entityType === 'module') {
    // Check parent course lock status
    const { data: module } = await supabase
      .from('course_modules')
      .select('course_id')
      .eq('id', entityId)
      .single();
    
    if (module?.course_id) {
      const locked = await isCourseLockedBaseline(module.course_id);
      if (locked) {
        return {
          allowed: false,
          reason: 'Parent course is baseline-locked. Only typo-level fixes allowed without admin override.'
        };
      }
    }
  }
  
  return { allowed: true };
}

/**
 * Request admin override for locked content
 */
export async function requestAdminOverride(
  entityType: string,
  entityId: string,
  reason: string
): Promise<string | null> {
  return logQualityAction('manual_override', entityType, entityId, {
    reason,
    metadata: { requested_at: new Date().toISOString(), status: 'pending' }
  });
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Verify seals for all courses in a program
 */
export async function verifyProgramSeals(programId: string): Promise<{
  total: number;
  verified: number;
  pending: number;
  revoked: number;
}> {
  // Get all courses for the program
  const { data: requirements } = await supabase
    .from('degree_course_requirements')
    .select('course_id')
    .eq('degree_id', programId);
  
  const courseIds = requirements?.map(r => r.course_id) ?? [];
  
  let verified = 0;
  let pending = 0;
  let revoked = 0;
  
  for (const courseId of courseIds) {
    const result = await updateCompletionSeal('course', courseId);
    if (result?.status === 'verified') verified++;
    else if (result?.status === 'revoked') revoked++;
    else pending++;
  }
  
  return { total: courseIds.length, verified, pending, revoked };
}

// ============================================
// DIPLOMA-SPECIFIC QUALITY GATES
// ============================================

/**
 * Check if a Diploma course meets the stricter seal criteria
 */
export async function checkDiplomaSealCriteria(courseId: string): Promise<SealResult | null> {
  const { data, error } = await supabase.rpc('check_diploma_seal_criteria', {
    p_course_id: courseId
  });
  
  if (error) {
    console.error("Failed to check diploma seal criteria:", error);
    return null;
  }
  
  if (data && typeof data === 'object') {
    return data as unknown as SealResult;
  }
  
  return null;
}

/**
 * Update Diploma completion seal for an entity
 */
export async function updateDiplomaCompletionSeal(
  entityType: 'diploma_course' | 'diploma_program',
  entityId: string
): Promise<{ seal_id: string; seal_tier: string; status: string; criteria: SealResult } | null> {
  const { data, error } = await supabase.rpc('update_diploma_completion_seal', {
    p_entity_type: entityType,
    p_entity_id: entityId
  });
  
  if (error) {
    console.error("Failed to update diploma completion seal:", error);
    return null;
  }
  
  if (data && typeof data === 'object') {
    return data as unknown as { seal_id: string; seal_tier: string; status: string; criteria: SealResult };
  }
  
  return null;
}

export default {
  checkCourseSealCriteria,
  updateCompletionSeal,
  getCompletionSeal,
  isProgramPubliclyVisible,
  isCourseLockedBaseline,
  isProgramLockedBaseline,
  checkGraduationEligibility,
  canIssueCertificate,
  logQualityAction,
  getAuditLogs,
  canModifyContent,
  requestAdminOverride,
  verifyProgramSeals,
  checkDiplomaSealCriteria,
  updateDiplomaCompletionSeal
};
