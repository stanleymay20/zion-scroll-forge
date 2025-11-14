import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

console.info("✝️ ScrollUniversity Events — Christ gathers His people");

// Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'prayer' | 'study' | 'worship' | 'academic' | 'ministry';
  start_time: string;
  end_time: string;
  location?: string;
  is_virtual: boolean;
  meeting_url?: string;
  max_attendees?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  attendee_count?: number;
  is_attending?: boolean;
}

// Fetchers
export async function getEvents() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await (supabase as any)
    .from("events")
    .select(`
      *,
      attendee_count:event_attendees(count)
    `)
    .gte("end_time", new Date().toISOString())
    .order("start_time", { ascending: true });

  if (error) throw error;

  // Check if user is attending each event
  if (user) {
    const { data: attendances } = await (supabase as any)
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", user.id);

    const attendingIds = new Set(attendances?.map((a: any) => a.event_id) || []);
    
    return (data || []).map((event: any) => ({
      ...event,
      attendee_count: event.attendee_count?.[0]?.count || 0,
      is_attending: attendingIds.has(event.id)
    })) as Event[];
  }

  return (data || []).map((event: any) => ({
    ...event,
    attendee_count: event.attendee_count?.[0]?.count || 0
  })) as Event[];
}

export async function getEvent(id: string) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await (supabase as any)
    .from("events")
    .select(`
      *,
      attendees:event_attendees(
        *,
        user:profiles(full_name, avatar_url)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  let is_attending = false;
  if (user) {
    const { data: attendance } = await (supabase as any)
      .from("event_attendees")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    
    is_attending = !!attendance;
  }

  return { ...data, is_attending } as Event & { attendees: any[] };
}

export async function createEvent(event: Partial<Event>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("events")
    .insert({ created_by: user.id, ...event })
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(id: string, updates: Partial<Event>) {
  const { data, error } = await (supabase as any)
    .from("events")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Event;
}

export async function deleteEvent(id: string) {
  const { error } = await (supabase as any)
    .from("events")
    .delete()
    .eq("id", id);

  if (error) throw error;
  return { success: true };
}

export async function registerForEvent(eventId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await (supabase as any)
    .from("event_attendees")
    .insert({ event_id: eventId, user_id: user.id, status: "registered" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unregisterFromEvent(eventId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await (supabase as any)
    .from("event_attendees")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) throw error;
  return { success: true };
}

// Hooks
export const useEvents = () =>
  useQuery({ queryKey: ["events"], queryFn: getEvents });

export const useEvent = (id: string) =>
  useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: !!id
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast({ title: "✝️ Event created — Gathering the Body of Christ" });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => toast({
      title: "Failed to create event",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useUpdateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) =>
      updateEvent(id, updates),
    onSuccess: () => {
      toast({ title: "✅ Event updated" });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (e: any) => toast({
      title: "Failed to update event",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useDeleteEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast({ title: "✅ Event deleted" });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => toast({
      title: "Failed to delete event",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useRegisterForEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerForEvent,
    onSuccess: () => {
      toast({ title: "✅ Registered for event" });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (e: any) => toast({
      title: "Failed to register",
      description: e.message,
      variant: "destructive"
    })
  });
};

export const useUnregisterFromEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unregisterFromEvent,
    onSuccess: () => {
      toast({ title: "✅ Unregistered from event" });
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
    onError: (e: any) => toast({
      title: "Failed to unregister",
      description: e.message,
      variant: "destructive"
    })
  });
};
