/**
 * Semester Planning UI Component
 * Interface for generating and managing semesters
 * 
 * Requirements: 1.1, 1.2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Plus, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import academicCalendarService from '@/services/academicCalendarService';
import type { AcademicYear, Semester } from '@/types/academic-calendar';

interface SemesterPlanningUIProps {
  academicYear: AcademicYear;
  onSemestersUpdated: () => void;
}

export const SemesterPlanningUI: React.FC<SemesterPlanningUIProps> = ({
  academicYear,
  onSemestersUpdated,
}) => {
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSemesters();
  }, [academicYear.id]);

  const loadSemesters = async () => {
    try {
      setLoading(true);
      const data = await academicCalendarService.getSemestersByAcademicYear(academicYear.id);
      setSemesters(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load semesters');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSemesters = async () => {
    try {
      setGenerating(true);
      setError(null);
      
      await academicCalendarService.generateSemesterSchedule(
        academicYear.id,
        academicYear.calendarType
      );
      
      await loadSemesters();
      onSemestersUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate semesters');
    } finally {
      setGenerating(false);
    }
  };

  const getSemesterTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      fall: 'Fall',
      spring: 'Spring',
      summer: 'Summer',
      winter: 'Winter',
      term1: 'Term 1',
      term2: 'Term 2',
      term3: 'Term 3',
      term4: 'Term 4',
      custom: 'Custom',
    };
    return labels[type] || type;
  };

  const getSemesterTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      fall: 'bg-orange-100 text-orange-800',
      spring: 'bg-green-100 text-green-800',
      summer: 'bg-yellow-100 text-yellow-800',
      winter: 'bg-blue-100 text-blue-800',
      term1: 'bg-purple-100 text-purple-800',
      term2: 'bg-pink-100 text-pink-800',
      term3: 'bg-indigo-100 text-indigo-800',
      term4: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semester Planning</CardTitle>
              <CardDescription>
                {academicYear.name} - {academicYear.calendarType} system
              </CardDescription>
            </div>
            {semesters.length === 0 && (
              <Button onClick={handleGenerateSemesters} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Semesters
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Semesters List */}
      {semesters.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {semesters.map((semester) => (
            <Card key={semester.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{semester.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getSemesterTypeColor(semester.semesterType)}>
                      {getSemesterTypeLabel(semester.semesterType)}
                    </Badge>
                    {semester.isActive && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Semester Dates */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Semester Period</span>
                    <span className="font-medium">
                      {format(new Date(semester.startDate), 'MMM d, yyyy')} - {format(new Date(semester.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>

                {/* Registration Window */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-sm font-semibold">Registration Window</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Opens:</span>
                      <span>{format(new Date(semester.registrationStart), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Closes:</span>
                      <span>{format(new Date(semester.registrationEnd), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Key Deadlines */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-sm font-semibold">Key Deadlines</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add/Drop:</span>
                      <span>{format(new Date(semester.addDropDeadline), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Withdrawal:</span>
                      <span>{format(new Date(semester.withdrawalDeadline), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>

                {/* Exams & Grading */}
                <div className="space-y-2 border-t pt-3">
                  <h4 className="text-sm font-semibold">Exams & Grading</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Final Exams:</span>
                      <span>
                        {format(new Date(semester.finalExamsStart), 'MMM d')} - {format(new Date(semester.finalExamsEnd), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Grades Due:</span>
                      <span>{format(new Date(semester.gradesDue), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Semesters Generated</h3>
            <p className="text-muted-foreground mb-4">
              Generate semesters automatically based on the {academicYear.calendarType} calendar type
            </p>
            <Button onClick={handleGenerateSemesters} disabled={generating}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Semesters
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
