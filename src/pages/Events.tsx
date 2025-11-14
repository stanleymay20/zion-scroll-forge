import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Calendar, MapPin, Users, Video } from "lucide-react";
import { useEvents, useCreateEvent, useRegisterForEvent, useUnregisterFromEvent } from "@/hooks/useEvents";
import { format } from "date-fns";

console.info("✝️ Events — Christ gathers His people");

export default function Events() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const register = useRegisterForEvent();
  const unregister = useUnregisterFromEvent();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "academic" as any,
    start_time: "",
    end_time: "",
    location: "",
    is_virtual: false,
    meeting_url: "",
    max_attendees: 50
  });

  const handleCreate = async () => {
    await createEvent.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData({
      title: "",
      description: "",
      event_type: "academic",
      start_time: "",
      end_time: "",
      location: "",
      is_virtual: false,
      meeting_url: "",
      max_attendees: 50
    });
  };

  const handleToggleAttendance = async (eventId: string, isAttending: boolean) => {
    if (isAttending) {
      await unregister.mutateAsync(eventId);
    } else {
      await register.mutateAsync(eventId);
    }
  };

  const filteredEvents = selectedType
    ? events?.filter((e) => e.event_type === selectedType)
    : events;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="Events"
      description="Join our community gatherings and academic sessions"
      actions={
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Schedule a gathering for the ScrollUniversity community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
              <Select
                value={formData.event_type}
                onValueChange={(value) => setFormData({ ...formData, event_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prayer">Prayer</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                  <SelectItem value="worship">Worship</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="ministry">Ministry</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">End Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <Input
                placeholder="Meeting URL (if virtual)"
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Max Attendees"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: parseInt(e.target.value) })}
              />
              <Button onClick={handleCreate} disabled={createEvent.isPending} className="w-full">
                {createEvent.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            onClick={() => setSelectedType(null)}
          >
            All Events
          </Button>
          {["prayer", "study", "worship", "academic", "ministry"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type}
            </Button>
          ))}
        </div>

        {!filteredEvents || filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No upcoming events</p>
              <p className="text-sm text-muted-foreground mt-2">Create an event to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{event.title}</CardTitle>
                      <CardDescription className="mt-2">
                        <Badge variant="secondary" className="capitalize">
                          {event.event_type}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(event.start_time), "PPp")}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {event.is_virtual ? (
                          <Video className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.attendee_count || 0} attending</span>
                    </div>
                  </div>
                  <Button
                    variant={event.is_attending ? "outline" : "default"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAttendance(event.id, event.is_attending || false);
                    }}
                  >
                    {event.is_attending ? "Leave Event" : "Attend Event"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
