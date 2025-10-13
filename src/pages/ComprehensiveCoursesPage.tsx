/**
 * Comprehensive Courses Page
 * Main page for browsing and managing courses with all required features
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Award, 
  Users, 
  Brain, 
  Heart, 
  Star,
  Grid,
  List,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { 
  ComprehensiveCourse, 
  StudentEnrollment, 
  CourseFilters, 
  ScrollField, 
  DifficultyLevel 
} from '../types/course-comprehensive';
import ComprehensiveCourseService from '../services/ComprehensiveCourseService';
import ComprehensiveCourseCard from '../components/courses/ComprehensiveCourseCard';
import CourseDetailView from '../components/courses/CourseDetailView';

export const ComprehensiveCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<ComprehensiveCourse[]>([]);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CourseFilters>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const courseService = new ComprehensiveCourseService();
  const studentId = 'current-student-id'; // This would come from auth context

  useEffect(() => {
    loadCourses();
  }, [currentPage, filters, searchTerm]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await courseService.getCourses(currentPage, 12, searchFilters);
      setCourses(response.courses);
      setTotalCourses(response.total);
      
      // Load enrollments for current student
      setEnrollments([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      await courseService.enrollStudent(courseId, studentId);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll in course');
    }
  };

  const handleContinue = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleViewDetails = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getEnrollmentForCourse = (courseId: string): StudentEnrollment | undefined => {
    return enrollments.find(e => e.course_id === courseId);
  };

  const scrollFields: ScrollField[] = [
    'ScrollMedicine',
    'ScrollAI', 
    'ScrollGovernance',
    'ScrollBusiness',
    'ScrollEngineering',
    'ScrollTheology',
    'ScrollEconomy',
    'PropheticLaw',
    'EdenicScience',
    'GeoPropheticIntelligence'
  ];

  const difficultyLevels: DifficultyLevel[] = ['basic', 'intermediate', 'advanced'];

  if (selectedCourse) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            onClick={() => setSelectedCourse(null)} 
            variant="outline"
            className="mb-4"
          >
            ← Back to Courses
          </Button>
        </div>
        <CourseDetailView
          courseId={selectedCourse}
          studentId={studentId}
          onEnroll={handleEnroll}
          onStartLecture={(courseId, lectureId) => {
            console.log('Start lecture:', courseId, lectureId);
          }}
          onStartAssessment={(courseId, assessmentId) => {
            console.log('Start assessment:', courseId, assessmentId);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">ScrollUniversity Courses</h1>
        <p className="text-xl text-muted-foreground">
          Comprehensive courses with modules, lectures, notes, videos, assessments, and spiritual formation
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Your Perfect Course
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses by title, description, or objectives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={loadCourses}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select onValueChange={(value) => handleFilterChange('scroll_field', value ? [value as ScrollField] : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Scroll Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Fields</SelectItem>
                {scrollFields.map(field => (
                  <SelectItem key={field} value={field}>{field}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('difficulty_level', value ? [value as DifficultyLevel] : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                {difficultyLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('has_ai_tutor', value === 'true' ? true : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="AI Tutor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="true">With AI Tutor</SelectItem>
                <SelectItem value="false">Without AI Tutor</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => handleFilterChange('spiritual_formation_required', value === 'true' ? true : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Spiritual Formation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="true">With Spiritual Formation</SelectItem>
                <SelectItem value="false">Academic Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {totalCourses} courses found
              </span>
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
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scroll-primary mx-auto"></div>
                <p className="mt-4 text-scroll-primary">Loading courses...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCourses} variant="outline">
                Try Again
              </Button>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {courses.map((course) => (
                <ComprehensiveCourseCard
                  key={course.course_id}
                  course={course}
                  enrollment={getEnrollmentForCourse(course.course_id)}
                  onEnroll={handleEnroll}
                  onContinue={handleContinue}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your Enrolled Courses</h3>
            <p className="text-muted-foreground">
              Courses you're currently taking will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Completed Courses</h3>
            <p className="text-muted-foreground">
              Courses you've successfully completed will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="recommended">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Recommended for You</h3>
            <p className="text-muted-foreground">
              Personalized course recommendations based on your progress and interests
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveCoursesPage;