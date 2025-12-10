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
  BookOpen, Star, Users, Clock, 
  Search, Grid, List, Loader2, X, SlidersHorizontal,
  Scroll, BookMarked, GraduationCap, Crown, Award, Sparkles,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserEnrollments } from "@/hooks/useCourses";
import { useFaculties } from "@/hooks/useFaculties";
import { CourseEnrollmentFlow } from "@/components/course/CourseEnrollmentFlow";
import { 
  SCROLL_DEGREE_LEVELS, 
  DEGREE_PROGRESSION,
  type ScrollDegreeLevel 
} from "@/types/scroll-degree-levels";

const ITEMS_PER_PAGE = 12;

const DEGREE_LEVEL_CONFIG: Record<ScrollDegreeLevel, { 
  icon: React.ReactNode; 
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  'ScrollCertificate': { 
    icon: <Scroll className="h-4 w-4" />, 
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  'ScrollDiploma': { 
    icon: <BookMarked className="h-4 w-4" />, 
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  'ScrollBachelor': { 
    icon: <GraduationCap className="h-4 w-4" />, 
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    borderColor: 'border-violet-200 dark:border-violet-800'
  },
  'ScrollMaster': { 
    icon: <Crown className="h-4 w-4" />, 
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800'
  },
  'ScrollDoctorate': { 
    icon: <Award className="h-4 w-4" />, 
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800'
  },
  'ScrollExousia': { 
    icon: <Sparkles className="h-4 w-4" />, 
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  }
};

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('level');
  const [enrollingCourse, setEnrollingCourse] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: faculties } = useFaculties();

  useEffect(() => {
    const faculty = searchParams.get("faculty");
    const level = searchParams.get("level");
    if (faculty) setSelectedFaculty(faculty);
    if (level) setSelectedDegreeLevel(level);
  }, [searchParams]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedFaculty, selectedDegreeLevel, sortBy]);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, selectedFaculty, selectedDegreeLevel, sortBy],
    queryFn: async () => {
      let query = supabase.from('courses').select('*');
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (selectedFaculty !== 'all') {
        query = query.eq('faculty', selectedFaculty);
      }
      if (selectedDegreeLevel !== 'all') {
        query = query.eq('level', selectedDegreeLevel);
      }
      
      // Apply sorting
      switch (sortBy) {
        case 'level':
          // We'll sort client-side for proper degree level order
          query = query.order('created_at', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'popular':
          query = query.order('students', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Sort by degree level order if that's the selected sort
      if (sortBy === 'level' && data) {
        const levelOrder: Record<string, number> = {
          'ScrollCertificate': 1,
          'ScrollDiploma': 2,
          'ScrollBachelor': 3,
          'ScrollMaster': 4,
          'ScrollDoctorate': 5,
          'ScrollExousia': 6
        };
        return data.sort((a, b) => {
          const orderA = levelOrder[a.level || ''] || 99;
          const orderB = levelOrder[b.level || ''] || 99;
          return orderA - orderB;
        });
      }
      
      return data;
    },
  });

  const { data: enrollments } = useUserEnrollments();

  const isEnrolled = (courseId: string) => {
    return enrollments?.some((e: any) => e.course_id === courseId);
  };

  const handleEnroll = (course: any) => {
    setEnrollingCourse(course);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFaculty("all");
    setSelectedDegreeLevel("all");
    setSortBy("level");
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    selectedFaculty !== 'all',
    selectedDegreeLevel !== 'all',
  ].filter(Boolean).length;

  // Pagination
  const totalCourses = courses?.length || 0;
  const totalPages = Math.ceil(totalCourses / ITEMS_PER_PAGE);
  const paginatedCourses = courses?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get course counts by degree level
  const coursesByLevel = DEGREE_PROGRESSION.reduce((acc, level) => {
    acc[level] = courses?.filter(c => c.level === level)?.length || 0;
    return acc;
  }, {} as Record<ScrollDegreeLevel, number>);

  const getDegreeConfig = (level: string) => {
    return DEGREE_LEVEL_CONFIG[level as ScrollDegreeLevel] || DEGREE_LEVEL_CONFIG['ScrollCertificate'];
  };

  const getDegreeInfo = (level: string) => {
    return SCROLL_DEGREE_LEVELS[level as ScrollDegreeLevel];
  };

  return (
    <PageTemplate 
      title="Scroll Degree Course Catalogue"
      description="Explore courses across the 6 Scroll Degree Levels - from Foundation to Divine Authority"
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
      {/* Degree Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {DEGREE_PROGRESSION.map((level) => {
          const config = getDegreeConfig(level);
          const info = getDegreeInfo(level);
          const count = coursesByLevel[level];
          const isSelected = selectedDegreeLevel === level;
          
          return (
            <button
              key={level}
              onClick={() => setSelectedDegreeLevel(isSelected ? 'all' : level)}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                isSelected 
                  ? `${config.bgColor} ${config.borderColor} ring-2 ring-offset-2 ring-primary/50` 
                  : 'bg-card border-border hover:border-primary/30'
              }`}
            >
              <div className={`flex items-center gap-2 ${config.color}`}>
                {config.icon}
                <span className="font-semibold text-xs truncate">
                  {info?.name.replace('Scroll ', '')}
                </span>
              </div>
              <div className="mt-1 text-lg font-bold">{count}</div>
              <div className="text-xs text-muted-foreground">courses</div>
            </button>
          );
        })}
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
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
                  <Label>Degree Level</Label>
                  <Select value={selectedDegreeLevel} onValueChange={setSelectedDegreeLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {DEGREE_PROGRESSION.map((level) => {
                        const info = getDegreeInfo(level);
                        const config = getDegreeConfig(level);
                        return (
                          <SelectItem key={level} value={level}>
                            <div className="flex items-center gap-2">
                              <span className={config.color}>{config.icon}</span>
                              <span>{info?.name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
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
                      <SelectItem value="level">Degree Level</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="title">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>
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

      {/* Selected Degree Level Info */}
      {selectedDegreeLevel !== 'all' && (
        <Card className={`mb-6 ${getDegreeConfig(selectedDegreeLevel).bgColor} ${getDegreeConfig(selectedDegreeLevel).borderColor} border-2`}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getDegreeConfig(selectedDegreeLevel).color} bg-background`}>
                {getDegreeConfig(selectedDegreeLevel).icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {getDegreeInfo(selectedDegreeLevel)?.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {getDegreeInfo(selectedDegreeLevel)?.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline">
                    {getDegreeInfo(selectedDegreeLevel)?.requirements.minCourses} min courses
                  </Badge>
                  <Badge variant="outline">
                    {getDegreeInfo(selectedDegreeLevel)?.requirements.minCredits} credits
                  </Badge>
                  <Badge variant="outline">
                    {getDegreeInfo(selectedDegreeLevel)?.requirements.estimatedDurationMonths} months
                  </Badge>
                  <Badge variant="outline">
                    {getDegreeInfo(selectedDegreeLevel)?.requirements.spiritualFormationHours}h spiritual formation
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalCourses)} of {totalCourses} courses
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

      {/* Course Grid/List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : paginatedCourses && paginatedCourses.length > 0 ? (
        <>
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
            : 'space-y-4'
          }>
            {paginatedCourses.map((course: any) => {
              const levelConfig = getDegreeConfig(course.level);
              const levelInfo = getDegreeInfo(course.level);
              
              return (
                <Card 
                  key={course.id} 
                  className={`${viewMode === 'list' ? 'flex' : ''} overflow-hidden border-2 hover:shadow-lg transition-all ${levelConfig.borderColor}`}
                >
                  {viewMode === 'list' && course.thumbnail_url && (
                    <div className="w-48 flex-shrink-0">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col">
                    {/* Degree Level Banner */}
                    <div className={`px-4 py-2 ${levelConfig.bgColor} border-b ${levelConfig.borderColor}`}>
                      <div className={`flex items-center gap-2 ${levelConfig.color} text-sm font-medium`}>
                        {levelConfig.icon}
                        <span>{levelInfo?.name || course.level}</span>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="text-xs">{course.faculty}</Badge>
                        <div className="flex items-center space-x-1 text-yellow-500">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="text-xs font-medium">{course.rating ?? 5.0}</span>
                        </div>
                      </div>
                      <CardTitle className="text-base mt-2 line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0 mt-auto">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{course.students ?? 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{course.duration || '8 weeks'}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          {Math.round((course.price_cents ?? 0) / 100)} SG
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/courses/${course.id}`} className="flex-1">
                          <Button className="w-full" variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                        {isEnrolled(course.id) ? (
                          <Link to={`/courses/${course.id}`} className="flex-1">
                            <Button className="w-full" variant="secondary" size="sm">
                              Continue
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={() => handleEnroll(course)}
                          >
                            Enroll
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and adjacent pages
                    return page === 1 || 
                           page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, index, arr) => {
                    // Add ellipsis
                    const prevPage = arr[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;
                    
                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
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
