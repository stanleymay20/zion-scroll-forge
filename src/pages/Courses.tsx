import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, Star, Users, Clock, TrendingUp, 
  Search, Filter, BookMarked, Grid, List, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnrollInCourse, useUserEnrollments } from "@/hooks/useCourses";
import { useFaculties } from "@/hooks/useFaculties";

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  
  const { data: faculties } = useFaculties();

  useEffect(() => {
    const faculty = searchParams.get("faculty");
    if (faculty) {
      setSelectedFaculty(faculty);
    }
  }, [searchParams]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedFaculty, selectedLevel],
    queryFn: async () => {
      let query = supabase.from('courses').select('*');
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (selectedFaculty !== 'all') {
        query = query.eq('faculty', selectedFaculty);
      }
      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useUserEnrollments();
  const enrollMutation = useEnrollInCourse();

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e: any) => e.course_id === courseId);
  };

  const handleEnroll = async (courseId: string) => {
    await enrollMutation.mutateAsync(courseId);
  };

  return (
    <PageTemplate 
      title="Course Catalog"
      description="Explore courses across the 12 Supreme Scroll Faculties"
      actions={
        <div className="flex space-x-2">
          <Link to="/dashboard">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              My Courses
            </Button>
          </Link>
        </div>
      }
    >
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Courses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="search" 
                    placeholder="Search by title, faculty, or topic..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-48">
                <Label>Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculties</SelectItem>
                    {faculties?.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.name}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Label>Level</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">
            <Link to="/dashboard">My Courses</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge>{course.faculty}</Badge>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{course.rating ?? 5.0}</span>
                      </div>
                    </div>
                    <CardTitle className="mt-2">{course.title}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{course.students_count ?? 0} students</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>8 weeks</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{course.level}</Badge>
                      <span className="text-lg font-bold text-primary">
                        {Math.round((course.price_cents ?? 0) / 100)} SC
                      </span>
                    </div>
                    {isEnrolled(course.id) ? (
                      <Link to={`/courses/${course.id}`}>
                        <Button className="w-full" variant="secondary">Continue Learning</Button>
                      </Link>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => handleEnroll(course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        {enrollMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found matching your criteria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
