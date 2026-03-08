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
import { SkeletonCourseCard } from "@/components/ui/skeleton-card";
import { 
  BookOpen, Star, Users, Clock, 
  Search, Grid, List, X, SlidersHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnrollInCourse, useUserEnrollments } from "@/hooks/useCourses";
import { useFaculties } from "@/hooks/useFaculties";
import { CourseEnrollmentFlow } from "@/components/course/CourseEnrollmentFlow";
import { cn } from "@/lib/utils";

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
    if (faculty) setSelectedFaculty(faculty);
  }, [searchParams]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedFaculty, selectedLevel, priceRange, sortBy],
    queryFn: async () => {
      let query = supabase.from('courses').select('*');
      if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      if (selectedFaculty !== 'all') query = query.eq('faculty', selectedFaculty);
      if (selectedLevel !== 'all') query = query.eq('level', selectedLevel);
      query = query.gte('price_cents', priceRange[0] * 100).lte('price_cents', priceRange[1] * 100);
      
      switch (sortBy) {
        case 'newest': query = query.order('created_at', { ascending: false }); break;
        case 'oldest': query = query.order('created_at', { ascending: true }); break;
        case 'price-low': query = query.order('price_cents', { ascending: true }); break;
        case 'price-high': query = query.order('price_cents', { ascending: false }); break;
        case 'rating': query = query.order('rating', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: enrollments } = useUserEnrollments();
  const enrollMutation = useEnrollInCourse();
  const isEnrolled = (courseId: string) => enrollments?.some((e: any) => e.course_id === courseId);

  const clearFilters = () => {
    setSearchQuery(""); setSelectedFaculty("all"); setSelectedLevel("all");
    setPriceRange([0, 1000]); setSortBy("newest");
  };

  const activeFiltersCount = [
    selectedFaculty !== 'all', selectedLevel !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== 1000,
  ].filter(Boolean).length;

  return (
    <PageTemplate 
      title="Course Catalog"
      description="Explore courses across the 12 Supreme Scroll Faculties"
      actions={
        <Link to="/dashboard">
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            My Courses
          </Button>
        </Link>
      }
    >
      {/* Search & Filters */}
      <Card className="elevation-1">
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search courses..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="destructive" className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-border/50 animate-fade-up">
                <div>
                  <Label className="text-xs text-muted-foreground">Faculty</Label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Faculties</SelectItem>
                      {faculties?.map((f) => (
                        <SelectItem key={f.id} value={f.name}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price-low">Price: Low → High</SelectItem>
                      <SelectItem value="price-high">Price: High → Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Label className="text-xs text-muted-foreground">
                    Price Range: {priceRange[0]} – {priceRange[1]} SC
                  </Label>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={1000} step={10} className="mt-2" />
                </div>
                {activeFiltersCount > 0 && (
                  <div className="md:col-span-3">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                      <X className="h-3.5 w-3.5 mr-1" /> Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${courses?.length || 0} courses found`}
        </p>
        <div className="flex items-center gap-1">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('grid')}>
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="h-8 w-8 p-0" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
        }>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCourseCard key={i} />
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {courses.map((course: any, i: number) => (
            <Card 
              key={course.id} 
              className={cn(
                "card-hover overflow-hidden animate-fade-up",
                viewMode === 'list' && 'flex',
                i < 6 && `animate-fade-up-delay-${Math.min(i + 1, 4)}`
              )}
            >
              {viewMode === 'list' && course.thumbnail_url && (
                <div className="w-48 flex-shrink-0">
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="flex-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px] shrink-0">{course.faculty}</Badge>
                    <div className="flex items-center gap-0.5 text-accent">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-xs font-medium">{course.rating ?? 5.0}</span>
                    </div>
                  </div>
                  <CardTitle className="text-base mt-2 line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {course.students_count ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {course.duration || '8 weeks'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                    <span className="text-sm font-bold text-primary font-mono">
                      {Math.round((course.price_cents ?? 0) / 100)} SC
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/courses/${course.id}`} className="flex-1">
                      <Button className="w-full text-xs" variant="outline" size="sm">Details</Button>
                    </Link>
                    {isEnrolled(course.id) ? (
                      <Link to={`/courses/${course.id}`} className="flex-1">
                        <Button className="w-full text-xs" variant="secondary" size="sm">Continue</Button>
                      </Link>
                    ) : (
                      <Button className="flex-1 text-xs" size="sm" onClick={() => setEnrollingCourse(course)}>
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
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-3">No courses found matching your criteria</p>
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>Clear Filters</Button>
          )}
        </div>
      )}

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
          onSuccess={() => setEnrollingCourse(null)}
        />
      )}
    </PageTemplate>
  );
}
