/**
 * Analytics Service
 * Frontend service for analytics API interactions
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  AnalyticsMetric,
  TimeRange,
  StudentAnalytics,
  CourseAnalytics,
  FinancialAnalytics,
  RealTimeMetrics,
  ReportConfiguration,
  GeneratedReport,
  DataExportRequest,
  DataExportResult,
  StudentSuccessPrediction,
  RevenueForecast,
} from '@/types/analytics';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class AnalyticsService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analytics/real-time`, {
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch real-time metrics');
    }

    const data = await response.json();
    return data.metrics;
  }

  /**
   * Get student analytics
   */
  async getStudentAnalytics(
    studentId: string,
    timeRange?: TimeRange
  ): Promise<StudentAnalytics> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('startDate', timeRange.startDate.toISOString());
      params.append('endDate', timeRange.endDate.toISOString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/analytics/student/${studentId}?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student analytics');
    }

    const data = await response.json();
    return data.analytics;
  }

  /**
   * Get course analytics
   */
  async getCourseAnalytics(
    courseId: string,
    timeRange?: TimeRange
  ): Promise<CourseAnalytics> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('startDate', timeRange.startDate.toISOString());
      params.append('endDate', timeRange.endDate.toISOString());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/analytics/course/${courseId}?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch course analytics');
    }

    const data = await response.json();
    return data.analytics;
  }

  /**
   * Get financial analytics
   */
  async getFinancialAnalytics(timeRange: TimeRange): Promise<FinancialAnalytics> {
    const headers = await this.getAuthHeaders();
    const params = new URLSearchParams({
      startDate: timeRange.startDate.toISOString(),
      endDate: timeRange.endDate.toISOString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/analytics/financial?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch financial analytics');
    }

    const data = await response.json();
    return data.analytics;
  }

  /**
   * Get multiple metrics
   */
  async getMetrics(
    metrics: string[],
    timeRange: TimeRange,
    groupBy?: 'day' | 'week' | 'month'
  ): Promise<AnalyticsMetric[]> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analytics/metrics`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        metrics,
        timeRange,
        groupBy,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }

    const data = await response.json();
    return data.metrics;
  }

  /**
   * Generate report
   */
  async generateReport(configuration: ReportConfiguration): Promise<GeneratedReport> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analytics/reports/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(configuration),
    });

    if (!response.ok) {
      throw new Error('Failed to generate report');
    }

    const data = await response.json();
    return data.report;
  }

  /**
   * Export data
   */
  async exportData(request: DataExportRequest): Promise<DataExportResult> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/analytics/export`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to export data');
    }

    const data = await response.json();
    return data.export;
  }

  /**
   * Get student success prediction
   */
  async getStudentSuccessPrediction(studentId: string): Promise<StudentSuccessPrediction> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/analytics/predictions/student-success/${studentId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch student success prediction');
    }

    const data = await response.json();
    return data.prediction;
  }

  /**
   * Get revenue forecast
   */
  async getRevenueForecast(months: number = 3): Promise<RevenueForecast> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(
      `${API_BASE_URL}/api/analytics/predictions/revenue-forecast?months=${months}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch revenue forecast');
    }

    const data = await response.json();
    return data.forecast;
  }
}

export default new AnalyticsService();
