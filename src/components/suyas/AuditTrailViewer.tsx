/**
 * SUYAS - Audit Trail Viewer
 * Full audit trail using suyas_audit_logs table (append-only, immutable)
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

console.info("✝️ SUYAS Audit Trail — Maintaining accountability and transparency");

type AuditActionType = 
  | 'status_change' 
  | 'grade_update' 
  | 'hold_placed' 
  | 'hold_removed'
  | 'schedule_modified'
  | 'admin_override'
  | 'enrollment_change'
  | 'quality_scan';

type AuditEntityType = 
  | 'enrollment'
  | 'student'
  | 'course'
  | 'assignment'
  | 'grade'
  | 'hold'
  | 'schedule'
  | 'quality';

interface AuditLog {
  id: string;
  user_id: string | null;
  action_type: AuditActionType;
  entity_type: AuditEntityType;
  entity_id: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const actionTypeConfig: Record<AuditActionType, { label: string; icon: React.ReactNode; color: string }> = {
  status_change: { label: 'Status Change', icon: <User className="h-4 w-4" />, color: 'bg-purple-500' },
  grade_update: { label: 'Grade Update', icon: <FileText className="h-4 w-4" />, color: 'bg-green-500' },
  hold_placed: { label: 'Hold Placed', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
  hold_removed: { label: 'Hold Removed', icon: <Shield className="h-4 w-4" />, color: 'bg-emerald-500' },
  schedule_modified: { label: 'Schedule Changed', icon: <Calendar className="h-4 w-4" />, color: 'bg-amber-500' },
  admin_override: { label: 'Admin Override', icon: <Shield className="h-4 w-4" />, color: 'bg-orange-500' },
  enrollment_change: { label: 'Enrollment', icon: <GraduationCap className="h-4 w-4" />, color: 'bg-blue-500' },
  quality_scan: { label: 'Quality Scan', icon: <Shield className="h-4 w-4" />, color: 'bg-cyan-500' }
};

// Fetch audit logs from the new suyas_audit_logs table
const useAuditLogs = (filters: { actionType?: AuditActionType; dateRange?: string }) => {
  return useQuery({
    queryKey: ['suyas-audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('suyas_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (filters.actionType) {
        query = query.eq('action_type', filters.actionType);
      }

      // Apply date filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (filters.dateRange) {
          case '24h':
            startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default:
            startDate = new Date(0);
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as AuditLog[];
    }
  });
};

export default function AuditTrailViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionTypeFilter, setActionTypeFilter] = useState<AuditActionType | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data: logs, isLoading } = useAuditLogs({
    actionType: actionTypeFilter === 'all' ? undefined : actionTypeFilter,
    dateRange: dateRangeFilter
  });

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = actionTypeFilter === 'all' || log.action_type === actionTypeFilter;
    return matchesSearch && matchesType;
  }) || [];

  const logCounts = logs?.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<AuditActionType, number>) || {};

  const exportLogs = () => {
    const csv = [
      ['ID', 'Action Type', 'Entity Type', 'Entity ID', 'Reason', 'Created At'].join(','),
      ...filteredLogs.map(log => [
        log.id,
        log.action_type,
        log.entity_type,
        log.entity_id,
        log.reason || '',
        log.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            Audit Trail
          </h2>
          <p className="text-muted-foreground">
            Immutable record of all system changes (append-only)
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {filteredLogs.length} records
        </Badge>
      </div>

      {/* Action Type Summary */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {Object.entries(actionTypeConfig).map(([type, config]) => (
          <Card 
            key={type} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              actionTypeFilter === type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setActionTypeFilter(type as AuditActionType)}
          >
            <CardContent className="p-3 text-center">
              <div className={`${config.color} w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-white`}>
                {config.icon}
              </div>
              <p className="text-lg font-bold">{logCounts[type as AuditActionType] || 0}</p>
              <p className="text-[10px] text-muted-foreground truncate">{config.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Log List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
                <CardDescription>
                  Complete, immutable history of system changes
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by entity or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionTypeFilter} onValueChange={(v) => setActionTypeFilter(v as AuditActionType | 'all')}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {Object.entries(actionTypeConfig).map(([type, config]) => (
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

            {/* Log List */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No audit logs found</p>
                    <p className="text-sm">System changes will appear here</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const config = actionTypeConfig[log.action_type] || actionTypeConfig.status_change;
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                          selectedLog?.id === log.id ? 'ring-2 ring-primary bg-muted/50' : ''
                        }`}
                        onClick={() => setSelectedLog(log)}
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
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm font-medium mt-1">
                              {log.entity_type}: {log.entity_id.slice(0, 8)}...
                            </p>
                            {log.reason && (
                              <p className="text-xs text-muted-foreground truncate">
                                {log.reason}
                              </p>
                            )}
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

        {/* Log Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Log Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLog ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Action Type</p>
                  <Badge className={actionTypeConfig[selectedLog.action_type]?.color || 'bg-gray-500'}>
                    {actionTypeConfig[selectedLog.action_type]?.label || selectedLog.action_type}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">
                    {format(new Date(selectedLog.created_at), 'PPpp')}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{selectedLog.user_id || 'System'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedLog.entity_type}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedLog.entity_id}
                  </p>
                </div>
                
                {selectedLog.reason && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reason</p>
                    <p className="text-sm">{selectedLog.reason}</p>
                  </div>
                )}
                
                {selectedLog.old_value && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Old Value</p>
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.old_value, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.new_value && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">New Value</p>
                    <pre className="p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(selectedLog.new_value, null, 2)}
                    </pre>
                  </div>
                )}
                
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">IP Address</p>
                    <p className="font-mono text-sm">{selectedLog.ip_address}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    This record is immutable and cannot be modified or deleted.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a log to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
