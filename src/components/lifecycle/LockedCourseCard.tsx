import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle } from "lucide-react";

interface LockedCourse {
  course_id: string;
  course_title: string;
  recommended_year: number | null;
  is_required: boolean;
  lock_reason: string | null;
  missing_prereqs: string[] | null;
}

export function LockedCourseCard({ course }: { course: LockedCourse }) {
  return (
    <Card className="p-3 border-muted bg-muted/30">
      <div className="flex items-start gap-2">
        <Lock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-sm truncate">{course.course_title}</p>
            {course.is_required && <Badge variant="outline" className="text-[10px]">Required</Badge>}
            {course.recommended_year && (
              <Badge variant="secondary" className="text-[10px]">Year {course.recommended_year}</Badge>
            )}
          </div>
          {course.lock_reason && (
            <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{course.lock_reason}</span>
            </p>
          )}
          {course.missing_prereqs && course.missing_prereqs.length > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Next action: complete {course.missing_prereqs.length} prerequisite course
              {course.missing_prereqs.length > 1 ? "s" : ""}.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
