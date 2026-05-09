/**
 * Reusable route guard components.
 *
 * - PublicRoute            : always renders (used for clarity in the route table).
 * - AuthenticatedRoute     : requires a logged-in user; redirects to /auth/login.
 * - RoleRoute              : requires the user to hold one of allowedRoles.
 * - StudentStatusRoute     : requires profile.lifecycle_status to match.
 * - CourseAccessRoute      : defers to can_access_course RPC for the courseId param.
 *
 * UI guarding is convenience. RLS in the DB is the actual enforcement.
 */
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, type AppRole } from "@/hooks/useUserRoles";
import { supabase } from "@/integrations/supabase/client";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { LockedCourseCard } from "@/components/access/LockedCourseCard";

const FullPageSpinner = ({ label }: { label?: string }) => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-sm text-muted-foreground">{label || "Verifying access…"}</p>
    </div>
  </div>
);

// ──────────────────────────────────────────────────────────────────────────
export const PublicRoute = ({ children }: { children: ReactNode }) => <>{children}</>;

// ──────────────────────────────────────────────────────────────────────────
export const AuthenticatedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageSpinner />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
};

// ──────────────────────────────────────────────────────────────────────────
interface RoleRouteProps {
  allowedRoles: AppRole[];
  children: ReactNode;
  fallback?: string;
}
export const RoleRoute = ({ allowedRoles, children, fallback = "/dashboard" }: RoleRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { roles, loading: rolesLoading, hasRole } = useUserRoles();
  const location = useLocation();

  if (authLoading || rolesLoading) return <FullPageSpinner />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }
  const ok = allowedRoles.some((r) => hasRole(r));
  if (!ok) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <h2 className="font-serif text-2xl">Access denied</h2>
          <p className="text-muted-foreground">
            This area is reserved for: {allowedRoles.join(", ")}. Your roles:{" "}
            {roles.join(", ") || "none"}.
          </p>
          <a href={fallback} className="text-primary underline">
            Return to dashboard
          </a>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

// ──────────────────────────────────────────────────────────────────────────
type LifecycleStatus =
  | "applicant"
  | "admitted"
  | "enrolled"
  | "active"
  | "on_leave"
  | "graduated"
  | "alumni"
  | "withdrawn";

interface StudentStatusRouteProps {
  allowedStatuses: LifecycleStatus[];
  children: ReactNode;
}
export const StudentStatusRoute = ({
  allowedStatuses,
  children,
}: StudentStatusRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<LifecycleStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setLoading(false);
      return;
    }
    supabase
      .from("profiles")
      .select("lifecycle_status")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setStatus((data?.lifecycle_status as LifecycleStatus) ?? null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (authLoading || loading) return <FullPageSpinner />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }
  if (!status || !allowedStatuses.includes(status)) {
    // Smart redirects per current status
    if (status === "applicant") return <Navigate to="/apply" replace />;
    if (status === "admitted" || status === "enrolled")
      return <Navigate to="/orientation" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// ──────────────────────────────────────────────────────────────────────────
interface CourseAccessRouteProps {
  accessLevel?: "preview" | "enrolled" | "admin";
  children: ReactNode;
}
export const CourseAccessRoute = ({
  accessLevel = "enrolled",
  children,
}: CourseAccessRouteProps) => {
  const params = useParams();
  const courseId = params.courseId || params.id || "";
  const { access, loading } = useCourseAccess(courseId);

  // No courseId in URL (e.g. quiz/:quizId) — defer to underlying RLS + page-level checks.
  if (!courseId) return <>{children}</>;
  if (loading) return <FullPageSpinner label="Checking course access…" />;
  if (!access) return <FullPageSpinner label="Checking course access…" />;

  const tierRank: Record<string, number> = {
    none: 0,
    preview: 1,
    audit: 2,
    enrolled: 3,
    credit: 4,
    faculty: 5,
    admin: 6,
  };
  const required = tierRank[accessLevel] ?? 3;
  const got = tierRank[access.access_level] ?? 0;

  if (got < required) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-2xl">
        <LockedCourseCard
          courseTitle="This course"
          courseId={courseId}
          access={access}
        />
      </div>
    );
  }
  return <>{children}</>;
};
