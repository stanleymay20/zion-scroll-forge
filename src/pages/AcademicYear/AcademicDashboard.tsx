import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp,
  Settings,
  Plus,
  Zap
} from 'lucide-react';
import { useAcademicYears, useActiveSemester, useSemesters } from '@/hooks/useAcademicYear';
import { AcademicCalendar } from '@/components/AcademicYear/AcademicCalendar';
import { SemesterCard } from '@/components/AcademicYear/SemesterCard';
import { DeadlineList } from '@/components/AcademicYear/DeadlineList';
import { AutomationStatusCard } from '@/components/AcademicYear/AutomationStatusCard';
import { useUserRoles } from '@/hooks/useUserRoles';

const AcademicDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isFaculty } = useUserRoles();
  const { data: academicYears = [], isLoading: yearsLoading } = useAcademicYears();
  const { data: activeSemester } = useActiveSemester();
  const { data: semesters = [] } = useSemesters(academicYears[0]?.id);

  const activeYear = academicYears.find((y) => y.is_active) || academicYears[0];

  const stats = [
    {
      label: 'Active Year',
      value: activeYear?.name || 'Not Set',
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Current Semester',
      value: activeSemester?.name || 'Not Set',
      icon: BookOpen,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Semesters',
      value: semesters.length.toString(),
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Academic Years',
      value: academicYears.length.toString(),
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Academic Year Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage academic calendars, schedules, and automation
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/academic-year/create')}>
              <Plus className="h-4 w-4 mr-2" />
              New Year
            </Button>
            <Button onClick={() => navigate('/academic-year/scheduling')}>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="semesters" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Semesters</span>
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Deadlines</span>
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Automation</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="calendar">
          <AcademicCalendar academicYearId={activeYear?.id} />
        </TabsContent>

        <TabsContent value="semesters">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {semesters.map((semester) => (
              <SemesterCard key={semester.id} semester={semester} />
            ))}
            {semesters.length === 0 && (
              <Card className="col-span-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">No Semesters Created</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an academic year first to add semesters
                  </p>
                  {isAdmin && (
                    <Button onClick={() => navigate('/academic-year/create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Academic Year
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="deadlines">
          <DeadlineList semesterId={activeSemester?.id} limit={20} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="automation">
            <AutomationStatusCard />
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Actions for Admin/Faculty */}
      {(isAdmin || isFaculty) && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/academic-year/scheduling')}>
                <Calendar className="h-6 w-6" />
                <span>Schedule Classes</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/academic-year/graduation')}>
                <GraduationCap className="h-6 w-6" />
                <span>Graduation</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/academic-year/students')}>
                <Users className="h-6 w-6" />
                <span>Student Progress</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => navigate('/academic-year/notifications')}>
                <Zap className="h-6 w-6" />
                <span>Notifications</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicDashboard;
