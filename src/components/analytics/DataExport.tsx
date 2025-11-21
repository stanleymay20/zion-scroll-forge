/**
 * Data Export Component
 * Export analytics data in various formats
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { format as formatDate } from 'date-fns';
import analyticsService from '@/services/analyticsService';
import type { DataExportRequest, DataExportResult, TimeRange } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';

export const DataExport: React.FC = () => {
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [dataType, setDataType] = useState<DataExportRequest['dataType']>('analytics');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'CSV' | 'EXCEL' | 'JSON'>('CSV');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [recentExports, setRecentExports] = useState<DataExportResult[]>([]);

  const dataTypes: { value: DataExportRequest['dataType']; label: string }[] = [
    { value: 'students', label: 'Student Data' },
    { value: 'courses', label: 'Course Data' },
    { value: 'enrollments', label: 'Enrollment Data' },
    { value: 'assignments', label: 'Assignment Data' },
    { value: 'payments', label: 'Payment Data' },
    { value: 'analytics', label: 'Analytics Data' },
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const request: DataExportRequest = {
        dataType,
        format: exportFormat,
        timeRange,
      };

      const result = await analyticsService.exportData(request);
      
      setRecentExports((prev) => [result, ...prev.slice(0, 4)]);

      if (result.status === 'completed' && result.fileUrl) {
        window.open(result.fileUrl, '_blank');
        toast({
          title: 'Export Successful',
          description: `${result.recordCount} records exported as ${exportFormat}`,
        });
      } else if (result.status === 'processing') {
        toast({
          title: 'Export Processing',
          description: 'Your export is being processed. You will be notified when it\'s ready.',
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusIcon = (status: DataExportResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export data in various formats for external analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Data Type</label>
            <Select value={dataType} onValueChange={(value) => setDataType(value as DataExportRequest['dataType'])}>
              <SelectTrigger>
                <SelectValue placeholder="Select data type" />
              </SelectTrigger>
              <SelectContent>
                {dataTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as typeof exportFormat)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CSV">CSV (Comma Separated)</SelectItem>
                <SelectItem value="EXCEL">Excel Spreadsheet</SelectItem>
                <SelectItem value="JSON">JSON (Raw Data)</SelectItem>
                <SelectItem value="PDF">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Range</label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(timeRange.startDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={timeRange.startDate}
                    onSelect={(date) => date && setTimeRange({ ...timeRange, startDate: date })}
                  />
                </PopoverContent>
              </Popover>
              <span className="flex items-center">to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDate(timeRange.endDate, 'MMM dd, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={timeRange.endDate}
                    onSelect={(date) => date && setTimeRange({ ...timeRange, endDate: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full"
          >
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting Data...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Exports */}
      {recentExports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>
              Your recent data exports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentExports.map((exportResult) => (
                <div
                  key={exportResult.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(exportResult.status)}
                    <div>
                      <p className="text-sm font-medium">
                        {exportResult.request.dataType} - {exportResult.request.format}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exportResult.recordCount?.toLocaleString()} records
                        {exportResult.fileSize && ` • ${formatFileSize(exportResult.fileSize)}`}
                      </p>
                    </div>
                  </div>
                  {exportResult.status === 'completed' && exportResult.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(exportResult.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
