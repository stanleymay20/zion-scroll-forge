# Analytics Dashboard Components

Comprehensive analytics dashboard components for ScrollUniversity platform.

## Components

### MetricCard
Displays a single metric with trend indicator and percentage change.

**Props:**
- `metric`: AnalyticsMetric object containing name, value, change, trend, and unit
- `className`: Optional CSS classes

**Usage:**
```tsx
<MetricCard
  metric={{
    name: 'Total Enrollments',
    value: 1250,
    change: 12.5,
    trend: 'up',
    unit: '',
    timestamp: new Date(),
  }}
/>
```

### EngagementChart
Displays engagement metrics over time using various chart types (line, area, bar).

**Props:**
- `title`: Chart title
- `description`: Optional chart description
- `data`: ChartData object with labels and datasets
- `type`: Chart type ('line' | 'area' | 'bar')
- `height`: Chart height in pixels (default: 300)
- `className`: Optional CSS classes

**Usage:**
```tsx
<EngagementChart
  title="Enrollment Trends"
  description="New enrollments over time"
  data={chartData}
  type="line"
/>
```

### AdminAnalyticsDashboard
Comprehensive analytics dashboard for administrators with real-time metrics, enrollment trends, revenue tracking, and engagement analysis.

**Features:**
- Real-time metrics with auto-refresh
- Multiple tabs for different analytics views
- Date range selection
- Data export functionality
- Customizable refresh intervals

**Usage:**
```tsx
<AdminAnalyticsDashboard />
```

### CourseAnalyticsDashboard
Detailed analytics for individual courses including enrollment metrics, performance data, engagement trends, and student feedback.

**Props:**
- `courseId`: ID of the course to analyze

**Features:**
- Course performance metrics
- Engagement trends
- Content performance analysis
- Student feedback display
- Drop-off point identification

**Usage:**
```tsx
<CourseAnalyticsDashboard courseId="course-123" />
```

### StudentAnalyticsDashboard
Learning patterns and performance analytics for individual students with predictive insights.

**Props:**
- `studentId`: ID of the student to analyze

**Features:**
- Student performance metrics
- Learning pattern analysis
- Engagement tracking
- Risk level assessment
- AI-powered success predictions

**Usage:**
```tsx
<StudentAnalyticsDashboard studentId="student-456" />
```

### FinancialAnalyticsDashboard
Revenue tracking and financial projections with ScrollCoin metrics and scholarship data.

**Features:**
- Revenue metrics and trends
- Revenue breakdown by source
- ScrollCoin economy metrics
- Scholarship program tracking
- AI-powered revenue forecasting

**Usage:**
```tsx
<FinancialAnalyticsDashboard />
```

### ReportBuilder
Custom report configuration and generation with flexible metrics selection.

**Features:**
- Multiple report types
- Custom metric selection
- Date range configuration
- Multiple export formats (PDF, CSV, Excel, JSON)
- Report scheduling (future enhancement)

**Usage:**
```tsx
<ReportBuilder />
```

### DataExport
Export analytics data in various formats for external analysis.

**Features:**
- Multiple data type selection
- Format options (CSV, Excel, JSON, PDF)
- Date range filtering
- Recent exports tracking
- Download management

**Usage:**
```tsx
<DataExport />
```

## Data Flow

1. **Service Layer**: `analyticsService.ts` handles all API interactions
2. **Type Definitions**: `types/analytics.ts` defines all TypeScript interfaces
3. **Components**: Use hooks and state management to fetch and display data
4. **Real-time Updates**: Auto-refresh functionality for live metrics

## API Integration

All components integrate with the backend analytics API:

- `GET /api/analytics/real-time` - Real-time metrics
- `GET /api/analytics/student/:id` - Student analytics
- `GET /api/analytics/course/:id` - Course analytics
- `GET /api/analytics/financial` - Financial analytics
- `POST /api/analytics/reports/generate` - Generate reports
- `POST /api/analytics/export` - Export data

## Styling

Components use:
- Shadcn UI components for consistent design
- Tailwind CSS for styling
- Recharts for data visualization
- Lucide React for icons

## Spiritual Integration

Analytics dashboards include spiritual formation metrics:
- Daily devotion completion rates
- Prayer journal activity
- Scripture memory progress
- Spiritual growth tracking

## Performance Considerations

- Lazy loading for chart components
- Debounced API calls for real-time updates
- Memoization for expensive calculations
- Pagination for large datasets

## Future Enhancements

- [ ] Custom dashboard layouts
- [ ] Saved report templates
- [ ] Scheduled report delivery
- [ ] Advanced filtering options
- [ ] Comparative analytics
- [ ] Predictive modeling improvements
- [ ] Mobile-optimized views
- [ ] Collaborative analytics sharing
