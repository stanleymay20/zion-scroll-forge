import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Clock, Users, Star, Play, Search, 
  Filter, Grid, List, TrendingUp, Award, Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserEnrollments } from '@/hooks/useCourses';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: enrollments } = useUserEnrollments();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', selectedFaculty, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select(`
          *,
          faculties(name, description),
          course_modules(id),
          enrollments(id, progress)
        `)
        .order('created_at', { ascending: false });

      if (selectedFaculty !== 'all') {
        query = query.eq('faculty', selectedFaculty);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const { data: faculties } = useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const enrolledCourseIds = new Set(enrollments?.map((e: any) => e.course_id) || []);

  const featuredCourses = courses?.filter(c => c.rating >= 4.5).slice(0, 3) || [];
  const popularCourses = courses?.filter(c => c.students > 100).slice(0, 6) || [];

  return (
    <PageTemplate
      title="Course Catalog"
      description="Explore our comprehensive collection of AI-powered courses"
      actions={
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Search and Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedFaculty === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFaculty('all')}
                >
                  All Faculties
                </Button>
                {faculties?.slice(0, 3).map((faculty) => (
                  <Button
                    key={faculty.id}
                    variant={selectedFaculty === faculty.name ? 'default' : 'outline'}
                    onClick={() => setSelectedFaculty(faculty.name)}
                  >
                    {faculty.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Courses */}
        {featuredCourses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Featured Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{course.faculty}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                    </div>
                    {course.xr_enabled && (
                      <Badge variant="outline" className="mb-2">
                        <Video className="h-3 w-3 mr-1" />
                        XR Enabled
                      </Badge>
                    )}
                    <Button 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${course.id}`);
                      }}
                    >
                      {enrolledCourseIds.has(course.id) ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-2" />
                          View Course
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Courses */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled">My Courses</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {courses?.map((course) => (
                <Card 
                  key={course.id} 
                  className={`hover:shadow-lg transition-shadow cursor-pointer ${viewMode === 'list' ? 'flex' : ''}`}
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <CardHeader className={viewMode === 'list' ? 'flex-1' : ''}>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{course.faculty}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.course_modules?.length || 0} modules
                      </div>
                    </div>
                    {enrolledCourseIds.has(course.id) && (
                      <Badge variant="default" className="mb-2">
                        <Award className="h-3 w-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enrolled">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {courses?.filter(c => enrolledCourseIds.has(c.id)).map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${course.id}/learn`)}>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{course.enrollments?.[0]?.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${course.enrollments?.[0]?.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <Button className="w-full mt-4">
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular">
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {popularCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{course.faculty}</Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Trending
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students} students
                      </div>
                    </div>
                    <Button className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
