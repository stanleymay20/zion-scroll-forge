import { useParams, useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, Play, Clock, Users, Star, BookOpen, 
  CheckCircle, Lock, Trophy, Loader2 
} from "lucide-react";
import { useEnrollInCourse, useUserEnrollments } from "@/hooks/useCourses";
import { useMemo } from "react";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const enrollMutation = useEnrollInCourse();
  const { data: enrollments } = useUserEnrollments();

  // Mock course data - in real app would fetch from API
  const course = {
    id: courseId,
    title: "Prophetic Intelligence Fundamentals",
    faculty: "GeoProphetic Intelligence",
    instructor: "Dr. Samuel Scroll",
    duration: "8 weeks",
    students: 2847,
    rating: 4.9,
    level: "Beginner",
    price: 250,
    description: "Master the art of receiving and interpreting divine insights for global transformation. This comprehensive course covers prophetic principles, discernment skills, and practical application.",
    modules: [
      { id: 1, title: "Introduction to Prophetic Intelligence", duration: "45 min", locked: false },
      { id: 2, title: "Hearing God's Voice", duration: "60 min", locked: false },
      { id: 3, title: "Discernment & Interpretation", duration: "75 min", locked: false },
      { id: 4, title: "Prophetic Accuracy & Validation", duration: "90 min", locked: true },
      { id: 5, title: "Corporate Prophetic Ministry", duration: "60 min", locked: true },
    ]
  };

  const enrollment = useMemo(() => 
    enrollments?.find((e: any) => e.course_id === courseId),
    [enrollments, courseId]
  );

  const handleEnroll = async () => {
    await enrollMutation.mutateAsync(courseId!);
  };

  return (
    <PageTemplate
      title={course.title}
      description={course.faculty}
      actions={
        <Button variant="outline" onClick={() => navigate("/courses")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {course.description}
                  </CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="secondary">{course.faculty}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{course.rating}</span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {enrollment && (
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Completion</span>
                    <span>{enrollment.progress}%</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="curriculum" className="w-full">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.modules.map((module) => (
                      <div 
                        key={module.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="p-2 bg-primary/10 rounded-full">
                            {module.locked ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {module.duration}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          disabled={module.locked || !enrollment}
                          variant={module.locked ? "outline" : "default"}
                        >
                          {module.locked ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardHeader>
                  <CardTitle>About the Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{course.instructor}</h3>
                      <p className="text-sm text-muted-foreground">
                        Dean of {course.faculty}
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      Dr. Samuel Scroll is a renowned prophetic teacher with over 20 years of 
                      experience in training believers in prophetic ministry. He has trained 
                      thousands of students globally and has documented accuracy rates of 95%+ 
                      in prophetic ministry.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Reviews coming soon...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold text-primary">{course.price} SC</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>

                {enrollment ? (
                  <Button className="w-full" onClick={() => navigate(`/courses/${courseId}/learn`)}>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Receive and interpret prophetic insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Develop spiritual discernment skills</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Apply prophetic ministry practically</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary mt-0.5" />
                  <span>Validate prophetic accuracy</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
