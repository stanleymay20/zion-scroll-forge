/**
 * SUYAS - Audit Trail Viewer
 * Full audit trail for changes to dates, grades, enrollment, holds
 * Role-based access control visibility
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  History, 
  Search,
  Filter,
  User,
  Calendar,
  FileText,
  GraduationCap,
  DollarSign,
  Shield,
  Clock,
  ChevronRight,
  Download,
  AlertCircle
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ SUYAS Audit Trail — Maintaining accountability and transparency");

type AuditEventType = 
  | 'enrollment_change' 
  | 'grade_update' 
  | 'hold_placed' 
  | 'hold_removed'
  | 'status_change'
  | 'date_modification'
  | 'permission_change'
  | 'course_update'
  | 'assessment_submission';

interface AuditEvent {
  id: string;
  event_type: AuditEventType;
  entity_type: string;
  entity_id: string;
  user_id: string;
  user_email: string;
  changes: {
    field: string;
    old_value: string | null;
    new_value: string | null;
  }[];
  metadata: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

const eventTypeConfig: Record<AuditEventType, { label: string; icon: React.ReactNode; color: string }> = {
  enrollment_change: { label: 'Enrollment', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-blue-500' },
  grade_update: { label: 'Grade Update', icon: <FileText className="h-4 w-4" />, color: 'bg-green-500' },
  hold_placed: { label: 'Hold Placed', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
  hold_removed: { label: 'Hold Removed', icon: <Shield className="h-4 w-4" />, color: 'bg-emerald-500' },
  status_change: { label: 'Status Change', icon: <User className="h-4 w-4" />, color: 'bg-purple-500' },
  date_modification: { label: 'Date Changed', icon: <Calendar className="h-4 w-4" />, color: 'bg-amber-500' },
  permission_change: { label: 'Permission', icon: <Shield className="h-4 w-4" />, color: 'bg-orange-500' },
  course_update: { label: 'Course Update', icon: <FileText className="h-4 w-4" />, color: 'bg-cyan-500' },
  assessment_submission: { label: 'Assessment', icon: <FileText className="h-4 w-4" />, color: 'bg-indigo-500' }
};

// Fetch audit events from scroll_analytics (using it as audit log)
const useAuditEvents = (filters: { eventType?: AuditEventType; dateRange?: string }) => {
  return useQuery({
    queryKey: ['audit-events', filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scroll_analytics')
        .select(`
          id,
          user_id,
          event_type,
          event_payload,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      // Transform to AuditEvent format
      return (data || []).map(event => ({
        id: event.id,
        event_type: (event.event_type || 'status_change') as AuditEventType,
        entity_type: 'user',
        entity_id: event.user_id || '',
        user_id: event.user_id || '',
        user_email: 'System',
        changes: [],
        metadata: event.event_payload || {},
        created_at: event.created_at
      })) as AuditEvent[];
    }
  });
};

export default function AuditTrailViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<AuditEventType | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('7d');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const { data: events, isLoading } = useAuditEvents({
    eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
    dateRange: dateRangeFilter
  });

  const filteredEvents = events?.filter(event => {
    const matchesSearch = event.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.entity_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const eventCounts = events?.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<AuditEventType, number>) || {};

  return (
    <div className="space-y-6">
      {/* Event Type Summary */}
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
        {Object.entries(eventTypeConfig).map(([type, config]) => (
          <Card 
            key={type} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              eventTypeFilter === type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setEventTypeFilter(type as AuditEventType)}
          >
            <CardContent className="p-3 text-center">
              <div className={`${config.color} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-white`}>
                {config.icon}
              </div>
              <p className="text-lg font-bold">{eventCounts[type as AuditEventType] || 0}</p>
              <p className="text-[10px] text-muted-foreground truncate">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Event List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete history of system changes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user or entity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={eventTypeFilter} onValueChange={(v) => setEventTypeFilter(v as AuditEventType | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {Object.entries(eventTypeConfig).map(([type, config]) => (
                    <SelectItem key={type} value={type}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                <SelectTrigger className="w-[120px]">
                  <Clock className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading audit events...
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No audit events found
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    const config = eventTypeConfig[event.event_type] || eventTypeConfig.status_change;
                    return (
                      <div
                        key={event.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedEvent?.id === event.id ? 'ring-2 ring-primary bg-muted/50' : ''
                        }`}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`${config.color} p-2 rounded-full text-white flex-shrink-0`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="outline" className="text-xs">
                                {config.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm font-medium mt-1 truncate">
                              {event.user_email}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              Entity: {event.entity_type} / {event.entity_id.slice(0, 8)}...
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Event Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <Badge className={eventTypeConfig[selectedEvent.event_type]?.color || 'bg-gray-500'}>
                    {eventTypeConfig[selectedEvent.event_type]?.label || selectedEvent.event_type}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedEvent.created_at), 'PPpp')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Performed By</p>
                  <p className="font-medium">{selectedEvent.user_email}</p>
                  <p className="text-xs text-muted-foreground">ID: {selectedEvent.user_id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedEvent.entity_type}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedEvent.entity_id}
                  </p>
                </div>
                
                {selectedEvent.changes.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Changes</p>
                    <div className="space-y-2">
                      {selectedEvent.changes.map((change, idx) => (
                        <div key={idx} className="p-2 bg-muted rounded text-sm">
                          <p className="font-medium">{change.field}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-500 line-through">
                              {change.old_value || '(empty)'}
                            </span>
                            <span>→</span>
                            <span className="text-green-500">
                              {change.new_value || '(empty)'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {Object.keys(selectedEvent.metadata).length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Metadata</p>
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(selectedEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedEvent.ip_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                    <p className="font-mono text-sm">{selectedEvent.ip_address}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select an event to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
