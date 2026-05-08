import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessCourse, type CourseAccessResult } from "@/lib/accessControl";

export function useCourseAccess(courseId?: string) {
  const { user } = useAuth();
  const [access, setAccess] = useState<CourseAccessResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!courseId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    canAccessCourse(user?.id ?? null, courseId).then((res) => {
      if (!cancelled) {
        setAccess(res);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id, courseId]);

  return { access, loading };
}
