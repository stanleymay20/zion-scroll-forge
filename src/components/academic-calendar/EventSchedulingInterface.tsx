/**
 * Event Scheduling Interface Component
 * Interface for creating and managing academic events
 * 
 * Requirements: 1.3, 1.4
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, Loader2, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import academicCalendarService from '@/services/academicCalendarService';
import type { AcademicYear, AcademicEvent, Semester } from '@/types/academic-calendar';

interface EventSchedulingInterfaceProps {
  academicYear: AcademicYear;
  onEventsUpdated: () => void;
}

interface EventFormData {
  eventType: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  semesterId?: string;
  isHoliday: boolean;
  affectsClasses: boolean;
}

export const EventSchedulingInterface: React.FC<EventSchedulingInterfaceProps> = ({
  academicYear,
  onEventsUpdated,
}) => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EventFormData>({
    defaultValues: {
      isHoliday: false,
      affectsClasses: false,
    },
  });

  useEffect(() => {
    loadData();
  }, [academicYear.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, semestersData] = await Promise.all([
        academicCalendarService.getEventsByAcademicYear(academicYear.id),
        academicCalendarService.getSemestersByAcademicYear(academicYear.id),
      ]);
      setEvents(eventsData);
      setSemesters(semestersData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      await academicCalendarService.scheduleEvent({
        academicYearId: academicYear.id,
        semesterId: data.semesterId || undefined,
        eventType: data.eventType,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        isHoliday: data.isHoliday,
        affectsClasses: data.affectsClasses,
      });

      reset();
      setDialogOpen(false);
      await loadData();
      onEventsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule event');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      holiday: 'bg-red-100 text-red-800',
      exam: 'bg-purple-100 text-purple-800',
      registration: 'bg-blue-100 text-blue-800',
      orientation: 'bg-green-100 text-green-800',
      graduation: 'bg-yellow-100 text-yellow-800',
      break: 'bg-orange-100 text-orange-800',
    };
    return colors[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
              <CardTitle>Event Scheduling</CardTitle>
              <CardDescription>
                Schedule and manage academic events for {academicYear.name}
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Schedule New Event</DialogTitle>
                  <DialogDescription>
                    Create a new academic event with details and scheduling information
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Event Type */}
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Input
                      id="eventType"
                      placeholder="e.g., Holiday, Exam, Registration"
                      {...register('eventType', { required: 'Event type is required' })}
                    />
                    {errors.eventType && (
                      <p className="text-sm text-destructive">{errors.eventType.message}</p>
                    )}
                  </div>

                  {/* Event Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Spring Break, Final Exams"
                      {...register('name', { required: 'Event name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Event description..."
                      {...register('description')}
                    />
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <Label htmlFor="semesterId">Semester (Optional)</Label>
                    <Select {...register('semesterId')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None (Academic Year Event)</SelectItem>
                        {semesters.map((semester) => (
                          <SelectItem key={semester.id} value={semester.id}>
                            {semester.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...register('startDate', { required: 'Start date is required' })}
                      />
                      {errors.startDate && (
                        <p className="text-sm text-destructive">{errors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...register('endDate')}
                      />
                    </div>
                  </div>

                  {/* Times */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        {...register('startTime')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        {...register('endTime')}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Event location"
                      {...register('location')}
                    />
                  </div>

                  {/* Flags */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="isHoliday" {...register('isHoliday')} />
                      <Label htmlFor="isHoliday" className="cursor-pointer">
                        This is a holiday
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch id="affectsClasses" {...register('affectsClasses')} />
                      <Label htmlFor="affectsClasses" className="cursor-pointer">
                        Affects class schedule
                      </Label>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Event
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
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

      {/* Events List */}
      {events.length > 0 ? (
        <div className="grid gap-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{event.name}</h3>
                      <Badge className={getEventTypeColor(event.eventType)}>
                        {event.eventType}
                      </Badge>
                      {event.isHoliday && (
                        <Badge variant="outline">Holiday</Badge>
                      )}
                      {event.affectsClasses && (
                        <Badge variant="outline">Affects Classes</Badge>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                          {event.endDate && ` - ${format(new Date(event.endDate), 'MMM d, yyyy')}`}
                        </span>
                      </div>

                      {event.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                        </div>
                      )}

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location}</span>
                        </div>
                      )}
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
            <h3 className="text-lg font-semibold mb-2">No Events Scheduled</h3>
            <p className="text-muted-foreground mb-4">
              Schedule academic events like holidays, exams, and registration periods
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
