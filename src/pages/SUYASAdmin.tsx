/**
 * SUYAS Administration Page
 * Scroll University Year Automation System - Admin Dashboard
 */

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  BookOpen, 
  Users, 
  GraduationCap,
  BarChart3,
  Settings,
  Bell,
  Shield
} from "lucide-react";
import AcademicYearBuilder from "@/components/suyas/AcademicYearBuilder";
import CourseSchedulingEngine from "@/components/suyas/CourseSchedulingEngine";
import StudentRegistryPortal from "@/components/suyas/StudentRegistryPortal";

console.info("✝️ SUYAS Admin — Orchestrating academic excellence");

export default function SUYASAdmin() {
  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            SUYAS Administration
          </h1>
          <p className="text-muted-foreground mt-1">
            Scroll University Year Automation System
          </p>
        </div>
        <Badge className="bg-green-500 text-white">
          System Active
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Active Year</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Course Offerings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">248</p>
                <p className="text-sm text-muted-foreground">Enrolled Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">18</p>
                <p className="text-sm text-muted-foreground">Graduation Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="academic-year" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full">
          <TabsTrigger value="academic-year" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Academic Year</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden md:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="academic-year" className="mt-6">
          <AcademicYearBuilder />
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6">
          <CourseSchedulingEngine />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentRegistryPortal />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Academic Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive analytics and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Advanced analytics dashboard coming soon</p>
                <p className="text-sm mt-2">
                  Track enrollment trends, completion rates, and student success metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Management
              </CardTitle>
              <CardDescription>
                Configure automated reminders and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Deadline Reminders</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automated reminders for assignment due dates
                    </p>
                    <Badge variant="outline">Configured</Badge>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Registration Alerts</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Notifications for registration periods
                    </p>
                    <Badge variant="outline">Configured</Badge>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Grade Release</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Notify students when grades are posted
                    </p>
                    <Badge variant="outline">Configured</Badge>
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Term Rollover</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automated term transition notifications
                    </p>
                    <Badge variant="outline">Configured</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                SUYAS Configuration
              </CardTitle>
              <CardDescription>
                System settings and audit controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Audit Trail</p>
                      <p className="text-sm text-muted-foreground">
                        Track all changes to academic records
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Role-Based Access</p>
                      <p className="text-sm text-muted-foreground">
                        Admin, Registrar, Faculty, Student roles
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">Background Jobs</p>
                      <p className="text-sm text-muted-foreground">
                        Automated deadline reminders, term rollovers
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Running</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
