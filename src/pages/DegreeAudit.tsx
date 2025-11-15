import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInstitution } from "@/contexts/InstitutionContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Lock } from "lucide-react";

console.info("✝️ Degree Audit — Christ governs completion");

export default function DegreeAudit() {
  const { user } = useAuth();
  const { activeInstitution } = useInstitution();

  const { data: degreeProgress } = useQuery({
    queryKey: ["degree-audit", user?.id, activeInstitution?.id],
    queryFn: async () => {
      // Get student's enrolled degree program
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("*, courses(*, faculty)")
        .eq("user_id", user!.id)
        .eq("institution_id", activeInstitution!.id);

      // Get completed courses
      const { data: transcripts } = await supabase
        .from("transcripts")
        .select("*, courses(title, faculty)")
        .eq("student_id", user!.id);

      // Mock degree requirements structure
      return {
        degreeName: "Bachelor of Theology",
        totalCredits: 120,
        earnedCredits: 72,
        gpa: 3.7,
        requirements: [
          {
            category: "Core Theology",
            required: 36,
            completed: 24,
            courses: [
              { title: "Old Testament Survey", credits: 3, status: "completed", grade: "A" },
              { title: "New Testament Survey", credits: 3, status: "completed", grade: "A-" },
              { title: "Systematic Theology I", credits: 3, status: "completed", grade: "B+" },
              { title: "Systematic Theology II", credits: 3, status: "completed", grade: "A" },
              { title: "Church History", credits: 3, status: "completed", grade: "A-" },
              { title: "Biblical Hermeneutics", credits: 3, status: "completed", grade: "A" },
              { title: "Practical Ministry", credits: 3, status: "completed", grade: "B+" },
              { title: "Christian Ethics", credits: 3, status: "completed", grade: "A" },
              { title: "Homiletics", credits: 3, status: "in-progress", grade: null },
              { title: "Pastoral Care", credits: 3, status: "not-started", grade: null },
              { title: "Missiology", credits: 3, status: "not-started", grade: null },
              { title: "Apologetics", credits: 3, status: "not-started", grade: null },
            ],
          },
          {
            category: "Biblical Languages",
            required: 12,
            completed: 6,
            courses: [
              { title: "Biblical Greek I", credits: 3, status: "completed", grade: "B+" },
              { title: "Biblical Greek II", credits: 3, status: "completed", grade: "A-" },
              { title: "Biblical Hebrew I", credits: 3, status: "in-progress", grade: null },
              { title: "Biblical Hebrew II", credits: 3, status: "not-started", grade: null },
            ],
          },
          {
            category: "Ministry Practicum",
            required: 12,
            completed: 12,
            courses: [
              { title: "Field Experience I", credits: 3, status: "completed", grade: "A" },
              { title: "Field Experience II", credits: 3, status: "completed", grade: "A" },
              { title: "Ministry Internship I", credits: 3, status: "completed", grade: "A" },
              { title: "Ministry Internship II", credits: 3, status: "completed", grade: "A" },
            ],
          },
          {
            category: "General Education",
            required: 30,
            completed: 30,
            courses: [
              { title: "English Composition", credits: 3, status: "completed", grade: "A" },
              { title: "World History", credits: 3, status: "completed", grade: "B+" },
              { title: "Philosophy", credits: 3, status: "completed", grade: "A-" },
              { title: "Psychology", credits: 3, status: "completed", grade: "A" },
              { title: "Sociology", credits: 3, status: "completed", grade: "B+" },
              { title: "Public Speaking", credits: 3, status: "completed", grade: "A" },
              { title: "Mathematics", credits: 3, status: "completed", grade: "B" },
              { title: "Natural Science", credits: 3, status: "completed", grade: "A-" },
              { title: "Literature", credits: 3, status: "completed", grade: "A" },
              { title: "Art History", credits: 3, status: "completed", grade: "B+" },
            ],
          },
          {
            category: "Electives",
            required: 30,
            completed: 0,
            courses: [
              { title: "Spiritual Formation", credits: 3, status: "not-started", grade: null },
              { title: "Christian Counseling", credits: 3, status: "not-started", grade: null },
              { title: "Church Administration", credits: 3, status: "not-started", grade: null },
              { title: "Worship & Music Ministry", credits: 3, status: "not-started", grade: null },
            ],
          },
        ],
        estimatedGraduation: "Spring 2026",
        isEligibleForGraduation: false,
      };
    },
    enabled: !!user && !!activeInstitution,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />;
      default:
        return <Lock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case "in-progress":
        return <Badge variant="default" className="bg-blue-600">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Not Started</Badge>;
    }
  };

  return (
    <PageTemplate title="Degree Audit" description="Track your progress toward graduation">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Overall Progress */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Degree Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{degreeProgress?.degreeName}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Credits Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {degreeProgress?.earnedCredits} / {degreeProgress?.totalCredits}
              </p>
              <Progress value={(degreeProgress?.earnedCredits || 0) / (degreeProgress?.totalCredits || 1) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">GPA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{degreeProgress?.gpa}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Est. Graduation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{degreeProgress?.estimatedGraduation}</p>
              {degreeProgress?.isEligibleForGraduation && (
                <Badge className="mt-2">Eligible</Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Requirements Breakdown */}
        {degreeProgress?.requirements.map((req: any) => (
          <Card key={req.category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{req.category}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {req.completed} / {req.required} credits
                </div>
              </div>
              <Progress value={(req.completed / req.required) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {req.courses.map((course: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(course.status)}
                      <div className="flex-1">
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.credits} credits</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {course.grade && (
                        <Badge variant="outline">{course.grade}</Badge>
                      )}
                      {getStatusBadge(course.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageTemplate>
  );
}
