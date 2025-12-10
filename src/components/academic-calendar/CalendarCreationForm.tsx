/**
 * Calendar Creation Form Component
 * Form for creating new academic years
 * 
 * Requirements: 1.1, 1.2
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Loader2 } from 'lucide-react';
import academicCalendarService from '@/services/academicCalendarService';
import type { AcademicYear, CalendarType } from '@/types/academic-calendar';

interface CalendarCreationFormProps {
  onYearCreated: (year: AcademicYear) => void;
}

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  calendarType: CalendarType;
  isActive: boolean;
}

export const CalendarCreationForm: React.FC<CalendarCreationFormProps> = ({ onYearCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarType, setCalendarType] = useState<CalendarType>('semester');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      isActive: false,
      calendarType: 'semester',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError(null);

      const year = await academicCalendarService.createAcademicYear({
        name: data.name,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        calendarType: calendarType,
        isActive: data.isActive,
      });

      reset();
      onYearCreated(year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create academic year');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Academic Year Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Academic Year Name *</Label>
        <Input
          id="name"
          placeholder="e.g., 2024-2025 Academic Year"
          {...register('name', {
            required: 'Academic year name is required',
            minLength: { value: 3, message: 'Name must be at least 3 characters' },
            maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
          })}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Calendar Type */}
      <div className="space-y-2">
        <Label htmlFor="calendarType">Calendar Type *</Label>
        <Select value={calendarType} onValueChange={(value) => setCalendarType(value as CalendarType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select calendar type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semester">Semester (2 terms per year)</SelectItem>
            <SelectItem value="trimester">Trimester (3 terms per year)</SelectItem>
            <SelectItem value="quarter">Quarter (4 terms per year)</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          This determines how semesters/terms will be automatically generated
        </p>
      </div>

      {/* Date Range */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            {...register('startDate', {
              required: 'Start date is required',
            })}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            {...register('endDate', {
              required: 'End date is required',
            })}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          {...register('isActive')}
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Set as active academic year
        </Label>
      </div>
      <p className="text-sm text-muted-foreground">
        Only one academic year can be active at a time. Setting this as active will deactivate other years.
      </p>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={loading}
        >
          Reset
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Calendar className="mr-2 h-4 w-4" />
              Create Academic Year
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
