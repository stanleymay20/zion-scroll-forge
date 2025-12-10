/**
 * Academic Calendar Builder Component
 * Main component for creating and managing academic calendars
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4
 * - Calendar creation interface
 * - Semester planning UI
 * - Event scheduling interface
 * - Deadline tracking visualization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { CalendarCreationForm } from './CalendarCreationForm';
import { SemesterPlanningUI } from './SemesterPlanningUI';
import { EventSchedulingInterface } from './EventSchedulingInterface';
import { DeadlineTrackingVisualization } from './DeadlineTrackingVisualization';
import { CalendarOverview } from './CalendarOverview';
import academicCalendarService from '@/services/academicCalendarService';
import type { AcademicYear } from '@/types/academic-calendar';

export const AcademicCalendarBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      const years = await academicCalendarService.getAllAcademicYears();
      setAcademicYears(years);
      
      // Select the active year by default
      const activeYear = years.find(y => y.isActive);
      if (activeYear) {
        setSelectedYear(activeYear);
      } else if (years.length > 0) {
        setSelectedYear(years[0]);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load academic years');
    } finally {
      setLoading(false);
    }
  };

  const handleYearCreated = async (year: AcademicYear) => {
    await loadAcademicYears();
    setSelectedYear(year);
    setActiveTab('semesters');
  };

  const handleYearSelected = (year: AcademicYear) => {
    setSelectedYear(year);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar Builder</h1>
          <p className="text-muted-foreground">
            Create and manage academic years, semesters, events, and deadlines
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Year
          </TabsTrigger>
          <TabsTrigger value="semesters" disabled={!selectedYear}>
            Semesters
          </TabsTrigger>
          <TabsTrigger value="events" disabled={!selectedYear}>
            Events
          </TabsTrigger>
          <TabsTrigger value="deadlines" disabled={!selectedYear} className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Deadlines
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <CalendarOverview
            academicYears={academicYears}
            selectedYear={selectedYear}
            onYearSelected={handleYearSelected}
            onRefresh={loadAcademicYears}
          />
        </TabsContent>

        {/* Create Year Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Academic Year</CardTitle>
              <CardDescription>
                Define a new academic year with configurable calendar type and dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarCreationForm onYearCreated={handleYearCreated} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Semesters Tab */}
        <TabsContent value="semesters" className="space-y-6">
          {selectedYear ? (
            <SemesterPlanningUI
              academicYear={selectedYear}
              onSemestersUpdated={loadAcademicYears}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Please select an academic year to manage semesters
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          {selectedYear ? (
            <EventSchedulingInterface
              academicYear={selectedYear}
              onEventsUpdated={loadAcademicYears}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Please select an academic year to schedule events
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Deadlines Tab */}
        <TabsContent value="deadlines" className="space-y-6">
          {selectedYear ? (
            <DeadlineTrackingVisualization
              academicYear={selectedYear}
            />
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Please select an academic year to view deadlines
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
