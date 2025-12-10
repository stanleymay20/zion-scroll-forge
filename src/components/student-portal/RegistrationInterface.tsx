/**
 * Registration Interface Component
 * "Commit to the Lord whatever you do, and he will establish your plans." - Proverbs 16:3
 * 
 * Course registration interface with real-time validation
 * Requirements: 2.2, 2.3
 */

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle, Clock, Users, BookOpen, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { studentPortalService } from '@/services/studentPortalService';
import type { CourseOffering, EnrollmentValidation, RegistrationResult } from '@/types/student-portal';

interface RegistrationInterfaceProps {
  studentId: string;
  semesterId: string;
}

export const RegistrationInterface: React.FC<RegistrationInterfaceProps> = ({
  studentId,
  semesterId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [validations, setValidations] = useState<Map<string, EnrollmentValidation>>(new Map());
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationResults, setRegistrationResults] = useState<RegistrationResult[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load available courses
  useEffect(() => {
    loadCourses();
  }, [semesterId]);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const response = await studentPortalService.searchCourses(semesterId, {
        searchTerm,
        hasAvailableSeats: true
      });

      if (response.success && response.data) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadCourses();
  };

  const validateCourse = async (courseId: string) => {
    try {
      const response = await studentPortalService.validateRegistration(
        studentId,
        courseId,
        semesterId
      );

      if (response.success && response.data) {
        setValidations(prev => new Map(prev).set(courseId, response.data!));
      }
    } catch (error) {
      console.error('Error validating course:', error);
    }
  };

  const toggleCourseSelection = async (courseId: string) => {
    const newSelected = new Set(selectedCourses);
    
    if (newSelected.has(courseId)) {
      newSelected.delete(courseId);
    } else {
      newSelected.add(courseId);
      // Validate when selecting
      await validateCourse(courseId);
    }
    
    setSelectedCourses(newSelected);
  };

  const handleRegister = async () => {
    if (selectedCourses.size === 0) return;

    setRegistering(true);
    try {
      const response = await studentPortalService.registerForCourses(
        studentId,
        Array.from(selectedCourses),
        semesterId
      );

      if (response.success && response.data) {
        setRegistrationResults(response.data);
        // Clear selections for successful registrations
        const successfulIds = response.data
          .filter(r => r.status === 'enrolled')
          .map(r => r.enrollmentId)
          .filter(Boolean);
        
        if (successfulIds.length > 0) {
          setSelectedCourses(new Set());
          loadCourses(); // Refresh course list
        }
      }
    } catch (error) {
      console.error('Error registering for courses:', error);
    } finally {
      setRegistering(false);
    }
  };

  const getValidationIcon = (validation?: EnrollmentValidation) => {
    if (!validation) return null;
    
    if (validation.eligible) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-500" />;
  };

  const getAvailabilityBadge = (course: CourseOffering) => {
    if (course.availableSeats > 10) {
      return <Badge variant="default" className="bg-green-500">Available</Badge>;
    } else if (course.availableSeats > 0) {
      return <Badge variant="default" className="bg-yellow-500">Limited</Badge>;
    } else if (course.waitlistCount > 0) {
      return <Badge variant="secondary">Waitlist</Badge>;
    }
    return <Badge variant="destructive">Full</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Course Registration
          </CardTitle>
          <CardDescription>
            "Trust in the Lord with all your heart" - Proverbs 3:5
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search courses by code, title, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Selected Courses Summary */}
      {selectedCourses.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {selectedCourses.size} course{selectedCourses.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-gray-600">
                  Review validation status before registering
                </p>
              </div>
              <Button
                onClick={handleRegister}
                disabled={registering}
                size="lg"
              >
                {registering ? 'Registering...' : 'Register for Selected Courses'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Registration Results */}
      {registrationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Registration Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrationResults.map((result, index) => (
                <Alert
                  key={index}
                  variant={result.status === 'enrolled' ? 'default' : 'destructive'}
                >
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {result.status === 'enrolled' && '✓ Enrolled'}
                          {result.status === 'waitlisted' && `⏳ Waitlisted (Position ${result.position})`}
                          {result.status === 'rejected' && '✗ Registration Failed'}
                        </p>
                        <p className="text-sm mt-1">{result.reason}</p>
                        {result.nextSteps.length > 0 && (
                          <ul className="text-sm mt-2 list-disc list-inside">
                            {result.nextSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Loading courses...</p>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                No courses found. Try adjusting your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          courses.map((course) => {
            const validation = validations.get(course.courseId);
            const isSelected = selectedCourses.has(course.courseId);

            return (
              <Card
                key={course.id}
                className={`cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                }`}
                onClick={() => toggleCourseSelection(course.courseId)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {course.courseCode} - {course.courseTitle}
                        </h3>
                        {getAvailabilityBadge(course)}
                        {isSelected && getValidationIcon(validation)}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {course.description || 'No description available'}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.credits} credits</span>
                        </div>
                        {course.instructor && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{course.instructor}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>
                            {course.currentEnrollment}/{course.maxEnrollment} enrolled
                          </span>
                        </div>
                        {course.waitlistCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.waitlistCount} on waitlist</span>
                          </div>
                        )}
                      </div>

                      {course.prerequisites && course.prerequisites.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold">Prerequisites:</p>
                          <p className="text-sm text-gray-600">
                            {course.prerequisites.join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Validation Messages */}
                      {isSelected && validation && !validation.eligible && (
                        <Alert variant="destructive" className="mt-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <p className="font-semibold">{validation.reason}</p>
                            {validation.missingPrerequisites.length > 0 && (
                              <p className="text-sm mt-1">
                                Missing prerequisites: {validation.missingPrerequisites.join(', ')}
                              </p>
                            )}
                            {validation.hasFinancialHold && (
                              <p className="text-sm mt-1">Financial hold on account</p>
                            )}
                            {validation.hasAcademicHold && (
                              <p className="text-sm mt-1">Academic hold on account</p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}

                      {isSelected && validation && validation.eligible && (
                        <Alert className="mt-3 border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription className="text-green-700">
                            Eligible for registration
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Spiritual Formation Prompt */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <p className="text-sm text-purple-900">
            <strong>Prayer Prompt:</strong> As you select your courses, pray for wisdom and guidance.
            Ask the Lord to direct your academic path according to His perfect plan for your life.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationInterface;
