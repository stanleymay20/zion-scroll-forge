/**
 * Course Recommendations Carousel Component
 * Displays personalized course recommendations based on user's interests and progress
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Clock, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface CourseRecommendationsProps {
  currentCourseId?: string;
  limit?: number;
}

export function CourseRecommendations({ currentCourseId, limit = 6 }: CourseRecommendationsProps) {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['course-recommendations', user?.id, currentCourseId],
    queryFn: async () => {
      // Get user's enrollments to understand their interests
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, courses(faculty)')
        .eq('user_id', user!.id);

      // Get faculties user is interested in
      const interestedFaculties = enrollments?.map((e: any) => e.courses?.faculty).filter(Boolean) || [];

      // Get recommended courses
      let query = supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .limit(limit);

      // Exclude current course if provided
      if (currentCourseId) {
        query = query.neq('id', currentCourseId);
      }

      // Filter by interested faculties if available
      if (interestedFaculties.length > 0) {
        query = query.in('faculty', interestedFaculties);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  const handleNext = () => {
    if (recommendations) {
      setCurrentIndex((prev) => 
        Math.min(recommendations.length - itemsPerPage, prev + itemsPerPage)
      );
    }
  };

  if (isLoading || !recommendations || recommendations.length === 0) {
    return null;
  }

  const visibleCourses = recommendations.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex + itemsPerPage < recommendations.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Courses tailored to your learning journey
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={!canGoNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleCourses.map((course: any) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <Badge className="w-fit mb-2">{course.faculty}</Badge>
                <CardTitle className="text-base line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating || 5.0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{course.students_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{course.duration || '8 weeks'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{course.level}</Badge>
                  <span className="text-sm font-bold text-primary">
                    {Math.round((course.price_cents || 0) / 100)} SC
                  </span>
                </div>
                <Link to={`/courses/${course.id}`}>
                  <Button className="w-full" size="sm">
                    View Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
