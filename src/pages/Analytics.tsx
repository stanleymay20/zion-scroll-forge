/**
 * Analytics Page
 * Main analytics dashboard with comprehensive metrics and reports
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminAnalyticsDashboard } from '@/components/analytics/AdminAnalyticsDashboard';
import { CourseAnalyticsDashboard } from '@/components/analytics/CourseAnalyticsDashboard';
import { StudentAnalyticsDashboard } from '@/components/analytics/StudentAnalyticsDashboard';
import { FinancialAnalyticsDashboard } from '@/components/analytics/FinancialAnalyticsDashboard';
import { ReportBuilder } from '@/components/analytics/ReportBuilder';
import { DataExport } from '@/components/analytics/DataExport';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Check if user has access to analytics
  const hasAdminAccess = user?.role === 'ADMIN';
  const hasFacultyAccess = user?.role === 'FACULTY' || hasAdminAccess;

  if (!hasFacultyAccess) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access analytics. This feature is only available to faculty and administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          {hasAdminAccess && <TabsTrigger value="financial">Financial</TabsTrigger>}
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdminAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="courses">
          {selectedCourseId ? (
            <CourseAnalyticsDashboard courseId={selectedCourseId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a course to view detailed analytics
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="students">
          {selectedStudentId ? (
            <StudentAnalyticsDashboard studentId={selectedStudentId} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Select a student to view detailed analytics
              </p>
            </div>
          )}
        </TabsContent>

        {hasAdminAccess && (
          <TabsContent value="financial">
            <FinancialAnalyticsDashboard />
          </TabsContent>
        )}

        <TabsContent value="reports">
          <ReportBuilder />
        </TabsContent>

        <TabsContent value="export">
          <DataExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
