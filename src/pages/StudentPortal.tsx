/**
 * Student Portal Page
 * "Trust in the Lord with all your heart" - Proverbs 3:5
 * 
 * Main student portal page integrating registration, degree audit, and graduation planning
 */

import React, { useState } from 'react';
import { BookOpen, GraduationCap, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationInterface } from '@/components/student-portal/RegistrationInterface';
import { DegreeAuditDashboard } from '@/components/student-portal/DegreeAuditDashboard';
import { GraduationPlanningView } from '@/components/student-portal/GraduationPlanningView';

const StudentPortal: React.FC = () => {
  // In production, get these from auth context
  const studentId = 'current-student-id'; // Replace with actual student ID from auth
  const semesterId = 'current-semester-id'; // Replace with actual semester ID

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Student Portal</h1>
        <p className="text-gray-600">
          "Trust in the Lord with all your heart and lean not on your own understanding" - Proverbs 3:5
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="registration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registration" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Course Registration</span>
            <span className="sm:hidden">Register</span>
          </TabsTrigger>
          <TabsTrigger value="degree-audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Degree Audit</span>
            <span className="sm:hidden">Audit</span>
          </TabsTrigger>
          <TabsTrigger value="graduation" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Graduation Planning</span>
            <span className="sm:hidden">Graduate</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registration">
          <RegistrationInterface studentId={studentId} semesterId={semesterId} />
        </TabsContent>

        <TabsContent value="degree-audit">
          <DegreeAuditDashboard studentId={studentId} />
        </TabsContent>

        <TabsContent value="graduation">
          <GraduationPlanningView studentId={studentId} />
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Helpful resources for students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/academic-calendar"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold mb-1">Academic Calendar</h4>
              <p className="text-sm text-gray-600">View important dates and deadlines</p>
            </a>
            <a
              href="/courses"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold mb-1">Course Catalog</h4>
              <p className="text-sm text-gray-600">Browse available courses</p>
            </a>
            <a
              href="/student-profile"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold mb-1">My Profile</h4>
              <p className="text-sm text-gray-600">View and update your information</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPortal;
