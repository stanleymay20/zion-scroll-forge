/**
 * Analytics Dashboard Types
 * Frontend type definitions for analytics features
 */

// ============================================================================
// Core Analytics Types
// ============================================================================

export interface AnalyticsMetric {
  name: string;
  value: number;
  change: number; // percentage change from previous period
  trend: 'up' | 'down' | 'stable';
  unit: string;
  timestamp: Date;
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

// ============================================================================
// Real-time Metrics
// ============================================================================

export interface RealTimeMetrics {
  timestamp: Date;
  activeUsers: number;
  activeSessions: number;
  currentEnrollments: number;
  ongoingAssessments: number;
  systemLoad: {
    cpu: number;
    memory: number;
    database: number;
  };
  apiMetrics: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

// ============================================================================
// Student Analytics
// ============================================================================

export interface StudentAnalytics {
  studentId: string;
  enrollmentMetrics: {
    totalCourses: number;
    activeCourses: number;
    completedCourses: number;
    averageProgress: number;
  };
  performanceMetrics: {
    overallGPA: number;
    averageGrade: number;
    assignmentsCompleted: number;
    assignmentsOnTime: number;
    lateSubmissionRate: number;
  };
  engagementMetrics: {
    loginFrequency: number;
    averageSessionDuration: number;
    forumParticipation: number;
    videoWatchTime: number;
    lastActive: Date;
  };
  learningPatterns: {
    preferredStudyTime: string;
    averageStudyDuration: number;
    strongSubjects: string[];
    strugglingSubjects: string[];
    learningStyle: string;
  };
  predictions: {
    riskLevel: 'low' | 'medium' | 'high';
    completionProbability: number;
    recommendedInterventions: string[];
  };
}

// ============================================================================
// Course Analytics
// ============================================================================

export interface CourseAnalytics {
  courseId: string;
  enrollmentMetrics: {
    totalEnrollments: number;
    activeStudents: number;
    completionRate: number;
    dropoutRate: number;
    averageCompletionTime: number;
  };
  performanceMetrics: {
    averageGrade: number;
    passRate: number;
    averageAssignmentScore: number;
    averageQuizScore: number;
  };
  engagementMetrics: {
    averageVideoWatchTime: number;
    videoCompletionRate: number;
    forumActivity: number;
    resourceDownloads: number;
    averageTimeSpent: number;
  };
  contentMetrics: {
    mostViewedLectures: Array<{ lectureId: string; title: string; views: number }>;
    leastEngagingContent: Array<{ contentId: string; title: string; engagementScore: number }>;
    dropOffPoints: Array<{ moduleId: string; title: string; dropOffRate: number }>;
  };
  satisfactionMetrics: {
    averageRating: number;
    totalReviews: number;
    npsScore: number;
    studentFeedback: Array<{ rating: number; comment: string; date: Date }>;
  };
}

// ============================================================================
// Financial Analytics
// ============================================================================

export interface FinancialAnalytics {
  timeRange: TimeRange;
  revenueMetrics: {
    totalRevenue: number;
    revenueBySource: Record<string, number>;
    revenueGrowth: number;
    averageTransactionValue: number;
  };
  enrollmentRevenue: {
    courseEnrollments: number;
    subscriptionRevenue: number;
    oneTimePayments: number;
  };
  scrollCoinMetrics: {
    totalMinted: number;
    totalBurned: number;
    circulatingSupply: number;
    averageBalance: number;
    transactionVolume: number;
  };
  scholarshipMetrics: {
    totalAwarded: number;
    totalDisbursed: number;
    remainingBudget: number;
    utilizationRate: number;
  };
  projections: {
    nextMonthRevenue: number;
    nextQuarterRevenue: number;
    confidence: number;
  };
}

// ============================================================================
// Report Types
// ============================================================================

export type ReportType =
  | 'student_performance'
  | 'course_effectiveness'
  | 'financial_summary'
  | 'enrollment_trends'
  | 'engagement_analysis'
  | 'spiritual_growth'
  | 'system_health'
  | 'custom';

export type ReportFormat = 'PDF' | 'CSV' | 'EXCEL' | 'JSON';

export interface ReportConfiguration {
  type: ReportType;
  title: string;
  description?: string;
  timeRange: TimeRange;
  filters?: Record<string, any>;
  format: ReportFormat;
}

export interface GeneratedReport {
  id: string;
  configuration: ReportConfiguration;
  generatedAt: Date;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
}

// ============================================================================
// Data Export
// ============================================================================

export interface DataExportRequest {
  dataType: 'students' | 'courses' | 'enrollments' | 'assignments' | 'payments' | 'analytics';
  format: ReportFormat;
  timeRange?: TimeRange;
  filters?: Record<string, any>;
}

export interface DataExportResult {
  id: string;
  request: DataExportRequest;
  status: 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  fileSize?: number;
  recordCount?: number;
  createdAt: Date;
  expiresAt: Date;
  error?: string;
}

// ============================================================================
// Predictive Analytics
// ============================================================================

export interface StudentSuccessPrediction {
  studentId: string;
  completionProbability: number;
  expectedGPA: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeToCompletion: number; // days
  factors: Array<{ factor: string; impact: number }>;
  recommendations: string[];
  timestamp: Date;
}

export interface RevenueForecast {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  breakdown: Record<string, number>;
  confidence: number;
  timestamp: Date;
}
