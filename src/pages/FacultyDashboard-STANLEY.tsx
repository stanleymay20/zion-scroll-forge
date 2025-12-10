/**
 * Faculty Dashboard Page
 * Main dashboard for faculty members to manage teaching operations
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeachingLoadManager } from '@/components/faculty-dashboard/TeachingLoadManager';
import { ContentCreationStudio } from '@/components/faculty-dashboard/ContentCreationStudio';
import { GradingInterface } from '@/components/faculty-dashboard/GradingInterface';
import { StudentAnalyticsView } from '@/components/faculty-dashboard/StudentAnalyticsView';
import { BookOpen, FileText, GraduationCap, Users } from 'lucide-react';

export default function FacultyDashboard() {
  const [activeTab, setActiveTab] = useState('teaching-load');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your teaching operations with AI-powered tools
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="teaching-load" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Teaching Load
          </TabsTrigger>
          <TabsTrigger value="content-creation" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content Studio
          </TabsTrigger>
          <TabsTrigger value="grading" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Grading
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Student Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teaching-load" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Teaching Load Management</CardTitle>
              <CardDescription>
                View and manage your course assignments and workload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeachingLoadManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content-creation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Creation Studio</CardTitle>
              <CardDescription>
                Generate lecture plans, assessments, and teaching materials with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContentCreationStudio />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Grading Interface</CardTitle>
              <CardDescription>
                Grade submissions with AI assistance and confidence scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GradingInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Analytics</CardTitle>
              <CardDescription>
                Monitor student performance, engagement, and identify at-risk students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StudentAnalyticsView />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
