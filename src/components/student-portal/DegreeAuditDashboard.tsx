/**
 * Degree Audit Dashboard Component
 * "For I know the plans I have for you, declares the Lord" - Jeremiah 29:11
 * 
 * Comprehensive degree audit visualization
 * Requirements: 2.5
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, CheckCircle, Clock, AlertCircle, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { studentPortalService } from '@/services/studentPortalService';
import type { DegreeAudit, RequirementFulfillment } from '@/types/student-portal';

interface DegreeAuditDashboardProps {
  studentId: string;
}

export const DegreeAuditDashboard: React.FC<DegreeAuditDashboardProps> = ({ studentId }) => {
  const [audit, setAudit] = useState<DegreeAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDegreeAudit();
  }, [studentId]);

  const loadDegreeAudit = async () => {
    setLoading(true);
    try {
      const response = await studentPortalService.getDegreeAudit(studentId);
      if (response.success && response.data) {
        setAudit(response.data);
      }
    } catch (error) {
      console.error('Error loading degree audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await studentPortalService.refreshDegreeAudit(studentId);
      if (response.success && response.data) {
        setAudit(response.data);
      }
    } catch (error) {
      console.error('Error refreshing degree audit:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getRequirementColor = (requirement: RequirementFulfillment) => {
    if (requirement.isFulfilled) return 'text-green-600';
    if (requirement.inProgressCredits > 0) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getRequirementIcon = (requirement: RequirementFulfillment) => {
    if (requirement.isFulfilled) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (requirement.inProgressCredits > 0) return <Clock className="h-5 w-5 text-blue-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Loading degree audit...</p>
        </CardContent>
      </Card>
    );
  }

  if (!audit) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Unable to load degree audit</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                Degree Audit
              </CardTitle>
              <CardDescription>
                "For I know the plans I have for you, declares the Lord" - Jeremiah 29:11
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Degree Completion</span>
                <span className="text-sm font-bold">
                  {audit.overallCompletionPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={audit.overallCompletionPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {audit.totalCreditsEarned}
                </p>
                <p className="text-sm text-gray-600">Credits Earned</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {audit.totalCreditsInProgress}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {audit.totalCreditsRemaining}
                </p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {audit.totalCreditsRequired}
                </p>
                <p className="text-sm text-gray-600">Total Required</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Current GPA</p>
                <p className="text-2xl font-bold">
                  {audit.currentGPA.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Minimum required: {audit.minimumGPARequired.toFixed(2)}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-gray-600">Graduation Status</p>
                <div className="flex items-center gap-2 mt-1">
                  {audit.isEligibleForGraduation ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-green-600">Eligible</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="font-semibold text-orange-600">In Progress</span>
                    </>
                  )}
                </div>
                {audit.estimatedGraduationDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Est. graduation: {new Date(audit.estimatedGraduationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocking Issues */}
      {audit.blockingIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Graduation Blockers:</p>
            <ul className="list-disc list-inside space-y-1">
              {audit.blockingIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Requirements Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Degree Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({audit.requirementsFulfilled.length + audit.requirementsInProgress.length + audit.requirementsRemaining.length})
              </TabsTrigger>
              <TabsTrigger value="fulfilled">
                Fulfilled ({audit.requirementsFulfilled.length})
              </TabsTrigger>
              <TabsTrigger value="inProgress">
                In Progress ({audit.requirementsInProgress.length})
              </TabsTrigger>
              <TabsTrigger value="remaining">
                Remaining ({audit.requirementsRemaining.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {[...audit.requirementsFulfilled, ...audit.requirementsInProgress, ...audit.requirementsRemaining].map((req) => (
                <RequirementCard key={req.requirementId} requirement={req} />
              ))}
            </TabsContent>

            <TabsContent value="fulfilled" className="space-y-4 mt-4">
              {audit.requirementsFulfilled.map((req) => (
                <RequirementCard key={req.requirementId} requirement={req} />
              ))}
            </TabsContent>

            <TabsContent value="inProgress" className="space-y-4 mt-4">
              {audit.requirementsInProgress.map((req) => (
                <RequirementCard key={req.requirementId} requirement={req} />
              ))}
            </TabsContent>

            <TabsContent value="remaining" className="space-y-4 mt-4">
              {audit.requirementsRemaining.map((req) => (
                <RequirementCard key={req.requirementId} requirement={req} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Spiritual Formation */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-purple-600 mt-1" />
            <div>
              <p className="font-semibold text-purple-900 mb-2">Spiritual Growth Reflection</p>
              <p className="text-sm text-purple-800">
                As you progress toward graduation, remember that academic achievement is part of God's calling on your life.
                Take time to reflect on how your studies are preparing you for kingdom service.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Requirement Card Component
const RequirementCard: React.FC<{ requirement: RequirementFulfillment }> = ({ requirement }) => {
  const getStatusBadge = () => {
    if (requirement.isFulfilled) {
      return <Badge className="bg-green-500">Fulfilled</Badge>;
    }
    if (requirement.inProgressCredits > 0) {
      return <Badge className="bg-blue-500">In Progress</Badge>;
    }
    return <Badge variant="secondary">Not Started</Badge>;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{requirement.requirementName}</h4>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-600">
                {requirement.earnedCredits} of {requirement.requiredCredits} credits completed
                {requirement.inProgressCredits > 0 && ` (${requirement.inProgressCredits} in progress)`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {requirement.completionPercentage.toFixed(0)}%
              </p>
            </div>
          </div>

          <Progress value={requirement.completionPercentage} className="h-2" />

          {requirement.fulfilledCourses.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Completed Courses:</p>
              <div className="space-y-1">
                {requirement.fulfilledCourses.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between text-sm">
                    <span>{course.courseCode} - {course.courseTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{course.credits} credits</span>
                      {course.grade && (
                        <Badge variant="outline">{course.grade}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requirement.inProgressCourses.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">In Progress:</p>
              <div className="space-y-1">
                {requirement.inProgressCourses.map((course) => (
                  <div key={course.courseId} className="flex items-center justify-between text-sm">
                    <span>{course.courseCode} - {course.courseTitle}</span>
                    <span className="text-gray-600">{course.credits} credits</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requirement.remainingCredits > 0 && (
            <Alert>
              <AlertDescription>
                <p className="text-sm">
                  <strong>{requirement.remainingCredits} credits remaining</strong>
                  {requirement.remainingCourses.length > 0 && (
                    <span> - Select from available courses to fulfill this requirement</span>
                  )}
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DegreeAuditDashboard;
