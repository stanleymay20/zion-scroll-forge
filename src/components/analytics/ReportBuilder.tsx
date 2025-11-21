/**
 * Report Builder Component
 * Custom report configuration and generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, FileText, Download, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import analyticsService from '@/services/analyticsService';
import type { ReportConfiguration, ReportType, ReportFormat, TimeRange } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';

export const ReportBuilder: React.FC = () => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('student_performance');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('PDF');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const reportTypes: { value: ReportType; label: string }[] = [
    { value: 'student_performance', label: 'Student Performance' },
    { value: 'course_effectiveness', label: 'Course Effectiveness' },
    { value: 'financial_summary', label: 'Financial Summary' },
    { value: 'enrollment_trends', label: 'Enrollment Trends' },
    { value: 'engagement_analysis', label: 'Engagement Analysis' },
    { value: 'spiritual_growth', label: 'Spiritual Growth' },
    { value: 'system_health', label: 'System Health' },
    { value: 'custom', label: 'Custom Report' },
  ];

  const availableMetrics = [
    'Total Enrollments',
    'Completion Rate',
    'Average Grade',
    'Student Engagement',
    'Revenue',
    'Active Users',
    'Course Ratings',
    'Assignment Completion',
    'Video Watch Time',
    'Forum Activity',
  ];

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  const handleGenerateReport = async () => {
    if (!title) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a report title',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    try {
      const configuration: ReportConfiguration = {
        type: reportType,
        title,
        description,
        timeRange,
        format: reportFormat,
      };

      const report = await analyticsService.generateReport(configuration);

      if (report.status === 'completed' && report.fileUrl) {
        window.open(report.fileUrl, '_blank');
        toast({
          title: 'Report Generated',
          description: 'Your report has been generated successfully',
        });
      } else if (report.status === 'generating') {
        toast({
          title: 'Report Generating',
          description: 'Your report is being generated. You will be notified when it\'s ready.',
        });
      }
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Report Builder
        </CardTitle>
        <CardDescription>
          Create custom reports with specific metrics and time ranges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type */}
        <div className="space-y-2">
          <Label htmlFor="report-type">Report Type</Label>
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger id="report-type">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Report Title</Label>
          <Input
            id="title"
            placeholder="Enter report title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Enter report description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Time Range */}
        <div className="space-y-2">
          <Label>Time Range</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(timeRange.startDate, 'MMM dd, yyyy')}
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
                  {format(timeRange.endDate, 'MMM dd, yyyy')}
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

        {/* Metrics Selection */}
        {reportType === 'custom' && (
          <div className="space-y-2">
            <Label>Select Metrics</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <div key={metric} className="flex items-center space-x-2">
                  <Checkbox
                    id={metric}
                    checked={selectedMetrics.includes(metric)}
                    onCheckedChange={() => handleMetricToggle(metric)}
                  />
                  <label
                    htmlFor={metric}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {metric}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format">Export Format</Label>
          <Select value={reportFormat} onValueChange={(value) => setReportFormat(value as ReportFormat)}>
            <SelectTrigger id="format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="CSV">CSV</SelectItem>
              <SelectItem value="EXCEL">Excel</SelectItem>
              <SelectItem value="JSON">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
