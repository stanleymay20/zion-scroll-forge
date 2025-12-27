/**
 * SUYAS Admin - Scroll University Year Automation System
 * Full academic lifecycle management
 */

import React from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Clock, 
  Users, 
  Briefcase, 
  FileCheck, 
  Shield,
  GraduationCap
} from "lucide-react";
import AcademicYearBuilder from "@/components/suyas/AcademicYearBuilder";
import CourseSchedulingEngine from "@/components/suyas/CourseSchedulingEngine";
import StudentRegistryPortal from "@/components/suyas/StudentRegistryPortal";
import FacultyWorkloadManager from "@/components/suyas/FacultyWorkloadManager";
import DeadlineOrchestrator from "@/components/suyas/DeadlineOrchestrator";
import AuditTrailViewer from "@/components/suyas/AuditTrailViewer";
import QualityGates from "@/components/suyas/QualityGates";

console.info("✝️ SUYAS Admin — Managing the seasons of education with excellence");

export default function SUYASAdmin() {
  return (
    <>
      <Helmet>
        <title>SUYAS Admin - Academic Year System | ScrollUniversity</title>
        <meta name="description" content="Manage the full academic lifecycle: admissions, enrollment, scheduling, assessments, grading, and graduation." />
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            SUYAS — Academic Year Automation
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Scroll University Year Automation System: End-to-end management of academic years, 
            course scheduling, student lifecycle, faculty workload, and graduation requirements.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">2025-26</p>
                  <p className="text-xs text-muted-foreground">Active Year</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">1,247</p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">42</p>
                  <p className="text-xs text-muted-foreground">Pending Deadlines</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-xs text-muted-foreground">Quality Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="academic-year" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2 h-auto p-2">
            <TabsTrigger value="academic-year" className="flex flex-col gap-1 py-2">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Academic Year</span>
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex flex-col gap-1 py-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Scheduling</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex flex-col gap-1 py-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Students</span>
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex flex-col gap-1 py-2">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs">Faculty</span>
            </TabsTrigger>
            <TabsTrigger value="deadlines" className="flex flex-col gap-1 py-2">
              <FileCheck className="h-4 w-4" />
              <span className="text-xs">Deadlines</span>
            </TabsTrigger>
            <TabsTrigger value="quality" className="flex flex-col gap-1 py-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Quality</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex flex-col gap-1 py-2">
              <FileCheck className="h-4 w-4" />
              <span className="text-xs">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="academic-year">
            <AcademicYearBuilder />
          </TabsContent>

          <TabsContent value="scheduling">
            <CourseSchedulingEngine />
          </TabsContent>

          <TabsContent value="students">
            <StudentRegistryPortal />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultyWorkloadManager />
          </TabsContent>

          <TabsContent value="deadlines">
            <DeadlineOrchestrator />
          </TabsContent>

          <TabsContent value="quality">
            <QualityGates />
          </TabsContent>

          <TabsContent value="audit">
            <AuditTrailViewer />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}