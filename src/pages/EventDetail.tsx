import { useParams, useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Calendar, MapPin, Users, Video, ArrowLeft } from "lucide-react";
import { useEvent, useRegisterForEvent, useUnregisterFromEvent, useDeleteEvent } from "@/hooks/useEvents";
import { format } from "date-fns";

console.info("✝️ Event Detail — Community in Christ");

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEvent(id!);
  const register = useRegisterForEvent();
  const unregister = useUnregisterFromEvent();
  const deleteEvent = useDeleteEvent();

  const handleToggleAttendance = async () => {
    if (!id) return;
    if (event?.is_attending) {
      await unregister.mutateAsync(id);
    } else {
      await register.mutateAsync(id);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Are you sure you want to delete this event?")) {
      await deleteEvent.mutateAsync(id);
      navigate("/events");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <PageTemplate title="Event Not Found">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Event not found</p>
            <Button onClick={() => navigate("/events")} className="mt-4">
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title={event.title}
      description={`${event.event_type} event`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/events")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant={event.is_attending ? "outline" : "default"}
            onClick={handleToggleAttendance}
          >
            {event.is_attending ? "Leave Event" : "Attend Event"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{event.description}</p>
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Start Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), "PPPp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">End Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.end_time), "PPPp")}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-center gap-3">
                    {event.is_virtual ? (
                      <Video className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}
                {event.meeting_url && (
                  <div className="pt-4">
                    <Button asChild className="w-full">
                      <a href={event.meeting_url} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Join Virtual Meeting
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendees ({(event as any).attendees?.length || 0})
              </CardTitle>
              <CardDescription>
                {event.max_attendees && `Max ${event.max_attendees} attendees`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(event as any).attendees?.slice(0, 10).map((attendee: any) => (
                  <div key={attendee.id} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {attendee.user?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {attendee.user?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {attendee.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTemplate>
  );
}
