import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function FacultyGradebookIndex() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['faculty-courses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          students,
          faculty
        `)
        .limit(20);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  console.info('✝️ ScrollUniversity: Faculty Gradebook Index — Christ is Lord over education');

  return (
    <PageTemplate
      title="Faculty Gradebook"
      description="Select a course to view and manage student grades"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/faculty/gradebook/${course.id}`)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.students || 0} students</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("This action is launching with the next release.")}>
                    View Grades <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">
              You don't have any courses assigned yet.
            </p>
          </CardContent>
        </Card>
      )}
    </PageTemplate>
  );
}
