/**
 * Centralized access control client.
 * Always defers to the can_access_course() RPC for the source of truth.
 * UI gating is convenience only — RLS enforces the real rules in the DB.
 */
import { supabase } from "@/integrations/supabase/client";

export type AccessLevel =
  | "none"
  | "preview"
  | "audit"
  | "enrolled"
  | "credit"
  | "faculty"
  | "admin";

export interface CourseAccessResult {
  allowed: boolean;
  access_level: AccessLevel;
  reason: string;
  missing: string[];
}

const FALLBACK: CourseAccessResult = {
  allowed: false,
  access_level: "none",
  reason: "unknown",
  missing: [],
};

export async function canAccessCourse(
  userId: string | null | undefined,
  courseId: string
): Promise<CourseAccessResult> {
  if (!courseId) return FALLBACK;
  try {
    const { data, error } = await supabase.rpc("can_access_course" as any, {
      _user_id: userId ?? null,
      _course_id: courseId,
    });
    if (error || !data) return FALLBACK;
    return data as CourseAccessResult;
  } catch {
    return FALLBACK;
  }
}

export function describeAccessReason(reason: string): string {
  switch (reason) {
    case "public_preview":
    case "public_preview_default":
      return "Open for preview";
    case "authentication_required":
      return "Sign in required to view this course";
    case "admin_only":
      return "Restricted to platform administrators";
    case "role_required":
      return "Restricted to faculty and administrators";
    case "student_hold":
      return "An academic hold is blocking access — please resolve outstanding holds";
    case "not_enrolled":
      return "You are not enrolled in this course";
    case "not_enrolled_preview":
      return "You can preview this course — enroll to unlock the full curriculum";
    case "prerequisites_unmet":
      return "Complete the required prerequisites to unlock this course";
    case "enrolled":
      return "Enrolled — full access granted";
    case "admin_override":
      return "Administrator access";
    case "faculty_role":
      return "Faculty access";
    default:
      return reason;
  }
}
