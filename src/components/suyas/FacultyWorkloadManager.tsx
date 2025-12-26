/**
 * SUYAS - Faculty Workload Manager
 * Teaching load rules, overload approvals, substitution management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Calendar,
  UserPlus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ SUYAS Faculty Workload — Balancing teaching responsibilities");

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  department: string;
  maxCourses: number;
  currentCourses: number;
  totalStudents: number;
  hoursPerWeek: number;
  status: 'available' | 'full' | 'overloaded' | 'on_leave';
}

interface WorkloadRule {
  id: string;
  name: string;
  maxCoursesPerTerm: number;
  maxStudentsPerCourse: number;
  maxHoursPerWeek: number;
  requiresApprovalAbove: number;
}

// Default workload rules
const defaultRules: WorkloadRule = {
  id: 'default',
  name: 'Standard Teaching Load',
  maxCoursesPerTerm: 4,
  maxStudentsPerCourse: 30,
  maxHoursPerWeek: 20,
  requiresApprovalAbove: 3
};

// Fetch faculty from profiles with faculty role
const useFaculty = () => {
  return useQuery({
    queryKey: ['faculty-workload'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .in('role', ['faculty', 'admin', 'super_admin']);
      
      if (error) throw error;
      
      // Get course counts per faculty
      const { data: courses } = await supabase
        .from('courses')
        .select('faculty_id, students');
      
      const courseCounts: Record<string, { count: number; students: number }> = {};
      courses?.forEach(course => {
        if (course.faculty_id) {
          if (!courseCounts[course.faculty_id]) {
            courseCounts[course.faculty_id] = { count: 0, students: 0 };
          }
          courseCounts[course.faculty_id].count++;
          courseCounts[course.faculty_id].students += course.students || 0;
        }
      });
      
      return (profiles || []).map(profile => {
        const courseData = courseCounts[profile.id] || { count: 0, students: 0 };
        const hoursPerWeek = courseData.count * 4; // Estimate 4 hours per course per week
        
        let status: FacultyMember['status'] = 'available';
        if (courseData.count >= defaultRules.maxCoursesPerTerm) {
          status = 'full';
        } else if (courseData.count > defaultRules.requiresApprovalAbove) {
          status = 'overloaded';
        }
        
        return {
          id: profile.id,
          name: profile.full_name || profile.email || 'Unknown',
          email: profile.email || '',
          department: 'General Faculty',
          maxCourses: defaultRules.maxCoursesPerTerm,
          currentCourses: courseData.count,
          totalStudents: courseData.students,
          hoursPerWeek,
          status
        } as FacultyMember;
      });
    }
  });
};

const getStatusBadge = (status: FacultyMember['status']) => {
  switch (status) {
    case 'available':
      return <Badge className="bg-green-500">Available</Badge>;
    case 'full':
      return <Badge className="bg-amber-500">At Capacity</Badge>;
    case 'overloaded':
      return <Badge variant="destructive">Overloaded</Badge>;
    case 'on_leave':
      return <Badge variant="secondary">On Leave</Badge>;
  }
};

export default function FacultyWorkloadManager() {
  const [termFilter, setTermFilter] = useState<string>('current');
  const { data: faculty, isLoading } = useFaculty();

  const stats = {
    totalFaculty: faculty?.length || 0,
    available: faculty?.filter(f => f.status === 'available').length || 0,
    atCapacity: faculty?.filter(f => f.status === 'full').length || 0,
    overloaded: faculty?.filter(f => f.status === 'overloaded').length || 0,
    totalCourses: faculty?.reduce((sum, f) => sum + f.currentCourses, 0) || 0,
    totalStudents: faculty?.reduce((sum, f) => sum + f.totalStudents, 0) || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workload Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalFaculty}</p>
            <p className="text-xs text-muted-foreground">Total Faculty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats.available}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-2xl font-bold">{stats.atCapacity}</p>
            <p className="text-xs text-muted-foreground">At Capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats.overloaded}</p>
            <p className="text-xs text-muted-foreground">Overloaded</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats.totalCourses}</p>
            <p className="text-xs text-muted-foreground">Active Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats.totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Students</p>
          </CardContent>
        </Card>
      </div>

      {/* Workload Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Workload Rules
          </CardTitle>
          <CardDescription>
            Current teaching load policies and limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{defaultRules.maxCoursesPerTerm}</p>
              <p className="text-sm text-muted-foreground">Max Courses/Term</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{defaultRules.maxStudentsPerCourse}</p>
              <p className="text-sm text-muted-foreground">Max Students/Course</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{defaultRules.maxHoursPerWeek}</p>
              <p className="text-sm text-muted-foreground">Max Hours/Week</p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-3xl font-bold text-amber-500">{defaultRules.requiresApprovalAbove}+</p>
              <p className="text-sm text-muted-foreground">Courses Need Approval</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Faculty Workload Overview
              </CardTitle>
              <CardDescription>
                Monitor and manage teaching assignments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={termFilter} onValueChange={setTermFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">Current Term</SelectItem>
                  <SelectItem value="next">Next Term</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty Member</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Load</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Hours/Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No faculty members found
                    </TableCell>
                  </TableRow>
                ) : (
                  faculty?.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <span className="font-medium">{member.currentCourses}</span>
                        <span className="text-muted-foreground"> / {member.maxCourses}</span>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress 
                            value={(member.currentCourses / member.maxCourses) * 100} 
                            className={`h-2 ${
                              member.currentCourses > member.maxCourses ? 'bg-red-200' :
                              member.currentCourses === member.maxCourses ? 'bg-amber-200' : ''
                            }`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>{member.totalStudents}</TableCell>
                      <TableCell>{member.hoursPerWeek}h</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
