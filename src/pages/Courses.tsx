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
import { Slider } from "@/components/ui/slider";
import { 
  BookOpen, Star, Users, Clock, TrendingUp, 
  Search, Filter, BookMarked, Grid, List, Loader2, X, SlidersHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnrollInCourse, useUserEnrollments } from "@/hooks/useCourses";
import { useFaculties } from "@/hooks/useFaculties";
import { CourseEnrollmentFlow } from "@/components/course/CourseEnrollmentFlow";

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [enrollingCourse, setEnrollingCourse] = useState<any>(null);
  
  const { data: faculties } = useFaculties();

  useEffect(() => {
    const faculty = searchParams.get("faculty");
    if (faculty) {
      setSelectedFaculty(faculty);
    }
  }, [searchParams]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedFaculty, selectedLevel, priceRange, sortBy],
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
      
      // Apply price filter
      query = query.gte('price_cents', priceRange[0] * 100);
      query = query.lte('price_cents', priceRange[1] * 100);
      
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'price-low':
          query = query.order('price_cents', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price_cents', { ascending: false });
          break;
        case 'popular':
          query = query.order('students_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useUserEnrollments();
  const enrollMutation = useEnrollInCourse();

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e: any) => e.course_id === courseId);
  };

  const handleEnroll = (course: any) => {
    setEnrollingCourse(course);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("all");
    setSelectedLevel("all");
    setPriceRange([0, 1000]);
    setSortBy("newest");
  };

  const activeFiltersCount = [
    selectedFaculty !== 'all',
    selectedLevel !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== 1000,
  ].filter(Boolean).length;

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
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses by title, description, or topic..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
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

                <div>
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

                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3">
                  <Label>Price Range (ScrollCoin): {priceRange[0]} - {priceRange[1]} SC</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000}
                    step={10}
                    className="mt-2"
                  />
                </div>

                {activeFiltersCount > 0 && (
                  <div className="md:col-span-3">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
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
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {courses?.length || 0} courses found
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses && courses.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
              : 'space-y-4'
            }>
              {courses.map((course: any) => (
                <Card key={course.id} className={viewMode === 'list' ? 'flex' : ''}>
                  {viewMode === 'list' && course.thumbnail_url && (
                    <div className="w-48 flex-shrink-0">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Badge>{course.faculty}</Badge>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="text-sm font-medium">{course.rating ?? 5.0}</span>
                        </div>
                      </div>
                      <CardTitle className="mt-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.students_count ?? 0} students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration || '8 weeks'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{course.level}</Badge>
                        <span className="text-lg font-bold text-primary">
                          {Math.round((course.price_cents ?? 0) / 100)} SC
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/courses/${course.id}`} className="flex-1">
                          <Button className="w-full" variant="outline">
                            View Details
                          </Button>
                        </Link>
                        {isEnrolled(course.id) ? (
                          <Link to={`/courses/${course.id}`} className="flex-1">
                            <Button className="w-full" variant="secondary">
                              Continue
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            className="flex-1" 
                            onClick={() => handleEnroll(course)}
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-4">No courses found matching your criteria</p>
              {activeFiltersCount > 0 && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Enrollment Flow Dialog */}
      {enrollingCourse && (
        <CourseEnrollmentFlow
          course={{
            id: enrollingCourse.id,
            title: enrollingCourse.title,
            price_cents: enrollingCourse.price_cents,
            scrollCoinCost: enrollingCourse.scroll_coin_cost,
            scholarshipEligible: enrollingCourse.scholarship_eligible,
          }}
          isOpen={!!enrollingCourse}
          onClose={() => setEnrollingCourse(null)}
          onSuccess={() => {
            setEnrollingCourse(null);
          }}
        />
      )}
    </PageTemplate>
  );
}
