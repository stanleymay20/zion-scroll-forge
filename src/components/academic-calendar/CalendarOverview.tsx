/**
 * Calendar Overview Component
 * Overview of all academic years and quick stats
 * 
 * Requirements: 1.1, 1.2
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import type { AcademicYear } from '@/types/academic-calendar';

interface CalendarOverviewProps {
  academicYears: AcademicYear[];
  selectedYear: AcademicYear | null;
  onYearSelected: (year: AcademicYear) => void;
  onRefresh: () => void;
}

export const CalendarOverview: React.FC<CalendarOverviewProps> = ({
  academicYears,
  selectedYear,
  onYearSelected,
  onRefresh,
}) => {
  const getCalendarTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      semester: 'Semester System',
      trimester: 'Trimester System',
      quarter: 'Quarter System',
      custom: 'Custom System',
    };
    return labels[type] || type;
  };

  const getCalendarTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      semester: 'bg-blue-100 text-blue-800',
      trimester: 'bg-purple-100 text-purple-800',
      quarter: 'bg-green-100 text-green-800',
      custom: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Academic Years Overview</CardTitle>
              <CardDescription>
                Manage and view all academic years in the system
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{academicYears.length}</div>
            <p className="text-sm text-muted-foreground">Total Academic Years</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {academicYears.filter(y => y.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {academicYears.filter(y => new Date(y.endDate) > new Date()).length}
            </div>
            <p className="text-sm text-muted-foreground">Future Years</p>
          </CardContent>
        </Card>
      </div>

      {/* Academic Years List */}
      {academicYears.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {academicYears.map((year) => (
            <Card
              key={year.id}
              className={`cursor-pointer transition-all ${
                selectedYear?.id === year.id
                  ? 'ring-2 ring-primary'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onYearSelected(year)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{year.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getCalendarTypeColor(year.calendarType)}>
                      {getCalendarTypeLabel(year.calendarType)}
                    </Badge>
                    {year.isActive && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Start Date</span>
                    <span className="font-medium">
                      {format(new Date(year.startDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">End Date</span>
                    <span className="font-medium">
                      {format(new Date(year.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {format(new Date(year.createdAt), 'MMM d, yyyy')}
                    </span>
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
            <h3 className="text-lg font-semibold mb-2">No Academic Years</h3>
            <p className="text-muted-foreground mb-4">
              Create your first academic year to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
