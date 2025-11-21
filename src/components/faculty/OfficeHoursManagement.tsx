/**
 * Office Hours Management Component
 * Manage office hours and appointments
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Plus,
  Calendar,
  Clock,
  MapPin,
  Video,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import facultyService from '@/services/facultyService';
import type { OfficeHours, OfficeHoursAppointment } from '@/types/faculty';

const OfficeHoursManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeHours, setOfficeHours] = useState<OfficeHours[]>([]);
  const [appointments, setAppointments] = useState<OfficeHoursAppointment[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<OfficeHours>>({
    location: 'online',
    recurring: true,
    active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [hoursData, appointmentsData] = await Promise.all([
        facultyService.getOfficeHours(),
        facultyService.getAppointments(),
      ]);
      setOfficeHours(hoursData);
      setAppointments(appointmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load office hours');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await facultyService.createOfficeHours(formData);
      setShowCreateDialog(false);
      setFormData({ location: 'online', recurring: true, active: true });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create office hours');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete these office hours?')) return;

    try {
      await facultyService.deleteOfficeHours(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete office hours');
    }
  };

  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    status: 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  ) => {
    try {
      await facultyService.updateAppointmentStatus(appointmentId, status);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const getAppointmentStatusBadge = (status: OfficeHoursAppointment['status']) => {
    const variants = {
      scheduled: 'secondary',
      confirmed: 'default',
      completed: 'outline',
      cancelled: 'destructive',
      no_show: 'destructive',
    } as const;

    return <Badge variant={variants[status]}>{status.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading office hours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Office Hours Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Office Hours Schedule</CardTitle>
              <CardDescription>
                Manage your weekly office hours availability
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Office Hours
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {officeHours.map((hours) => (
              <div
                key={hours.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{getDayName(hours.dayOfWeek)}</span>
                      <Badge variant={hours.active ? 'default' : 'secondary'}>
                        {hours.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {hours.startTime} - {hours.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {hours.location === 'online' ? (
                          <Video className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="capitalize">{hours.location}</span>
                      </div>
                      {hours.maxStudents && (
                        <div className="text-muted-foreground">
                          Max: {hours.maxStudents} students
                        </div>
                      )}
                    </div>

                    {hours.notes && (
                      <p className="text-sm text-muted-foreground mt-2">{hours.notes}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(hours.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {officeHours.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No office hours scheduled</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Add Your First Office Hours
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            Scheduled student appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{appointment.studentName}</h3>
                      {getAppointmentStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {appointment.studentEmail}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(appointment.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {appointment.startTime} - {appointment.endTime}
                    </span>
                  </div>
                </div>

                <div className="bg-accent p-3 rounded-lg mb-3">
                  <div className="text-sm font-medium mb-1">Topic</div>
                  <p className="text-sm">{appointment.topic}</p>
                  {appointment.notes && (
                    <>
                      <div className="text-sm font-medium mt-2 mb-1">Notes</div>
                      <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                    </>
                  )}
                </div>

                {appointment.status === 'scheduled' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateAppointmentStatus(appointment.id, 'confirmed')
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateAppointmentStatus(appointment.id, 'cancelled')
                      }
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}

                {appointment.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateAppointmentStatus(appointment.id, 'completed')
                      }
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateAppointmentStatus(appointment.id, 'no_show')
                      }
                    >
                      No Show
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {appointments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Office Hours</DialogTitle>
            <DialogDescription>
              Set up your weekly office hours availability
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Day of Week</label>
              <Select
                value={formData.dayOfWeek?.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, dayOfWeek: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <Input
                  type="time"
                  value={formData.startTime || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <Input
                  type="time"
                  value={formData.endTime || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select
                value={formData.location}
                onValueChange={(value) =>
                  setFormData({ ...formData, location: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="in_person">In Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.location === 'online' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Meeting Link</label>
                <Input
                  placeholder="https://..."
                  value={formData.meetingLink || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, meetingLink: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, recurring: checked as boolean })
                }
              />
              <label htmlFor="recurring" className="text-sm font-medium">
                Recurring weekly
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Add Office Hours</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficeHoursManagement;
