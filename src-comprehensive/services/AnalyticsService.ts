import {
  StudentProgressMetrics,
  FacultyPerformanceMetrics,
  GlobalImpactMetrics,
  InterventionAlert,
  AnalyticsDashboardData,
  OverviewMetrics,
  TrendAnalysis,
  AnalyticsFilters,
  ReportConfiguration,
  CareerTrack,
  TimeSeries,
  CareerPathwayTrend,
  GeographicTrend
} from '../types/analytics';

export class AnalyticsService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get comprehensive dashboard data for administrators
   */
  async getDashboardData(filters?: AnalyticsFilters): Promise<AnalyticsDashboardData> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get student progress tracking with intervention alerts
   */
  async getStudentProgressMetrics(
    studentIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<StudentProgressMetrics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/student-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ studentIds, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch student progress metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  }

  /**
   * Get faculty performance and engagement metrics
   */
  async getFacultyPerformanceMetrics(
    facultyIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<FacultyPerformanceMetrics[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/faculty-performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ facultyIds, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch faculty performance metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching faculty performance:', error);
      throw error;
    }
  }

  /**
   * Get global impact measurement and reporting
   */
  async getGlobalImpactMetrics(filters?: AnalyticsFilters): Promise<GlobalImpactMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/global-impact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch global impact metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching global impact metrics:', error);
      throw error;
    }
  }

  /**
   * Get intervention alerts for students requiring attention
   */
  async getInterventionAlerts(
    severity?: 'low' | 'medium' | 'high' | 'critical',
    status?: 'open' | 'in_progress' | 'resolved'
  ): Promise<InterventionAlert[]> {
    try {
      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      if (status) params.append('status', status);

      const response = await fetch(`${this.baseUrl}/analytics/intervention-alerts?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intervention alerts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching intervention alerts:', error);
      throw error;
    }
  }

  /**
   * Create or update intervention alert
   */
  async updateInterventionAlert(
    alertId: string,
    updates: Partial<InterventionAlert>
  ): Promise<InterventionAlert> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/intervention-alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update intervention alert');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating intervention alert:', error);
      throw error;
    }
  }

  /**
   * Get trend analysis for various metrics
   */
  async getTrendAnalysis(
    metricType: 'enrollment' | 'completion' | 'spiritual_growth' | 'career_pathway' | 'global_expansion',
    filters?: AnalyticsFilters
  ): Promise<TrendAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/trends/${metricType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trend analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trend analysis:', error);
      throw error;
    }
  }

  /**
   * Get career pathway analytics
   */
  async getCareerPathwayAnalytics(
    pathway?: CareerTrack,
    filters?: AnalyticsFilters
  ): Promise<CareerPathwayTrend[]> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/career-pathways`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ pathway, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch career pathway analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching career pathway analytics:', error);
      throw error;
    }
  }

  /**
   * Generate custom report
   */
  async generateReport(config: ReportConfiguration): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Schedule automated report
   */
  async scheduleReport(config: ReportConfiguration): Promise<{ reportId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/reports/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  /**
   * Get spiritual formation analytics
   */
  async getSpiritualFormationAnalytics(
    studentIds?: string[],
    filters?: AnalyticsFilters
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/spiritual-formation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ studentIds, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch spiritual formation analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching spiritual formation analytics:', error);
      throw error;
    }
  }

  /**
   * Get ScrollCoin economy analytics
   */
  async getScrollCoinAnalytics(filters?: AnalyticsFilters): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/scrollcoin-economy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ filters })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ScrollCoin analytics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching ScrollCoin analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics for dashboard
   */
  async getRealTimeMetrics(): Promise<OverviewMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/realtime`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch real-time metrics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportData(
    dataType: 'student_progress' | 'faculty_performance' | 'global_impact',
    format: 'csv' | 'json' | 'xlsx',
    filters?: AnalyticsFilters
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/analytics/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ dataType, format, filters })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }
}

export default AnalyticsService;