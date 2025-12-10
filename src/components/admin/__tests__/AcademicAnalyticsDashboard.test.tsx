/**
 * Academic Analytics Dashboard Tests
 * Tests for academic analytics functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AcademicAnalyticsDashboard } from '../AcademicAnalyticsDashboard';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: any) => <div data-testid="tabs-trigger">{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('30d')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
}));

describe('AcademicAnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders academic analytics dashboard', () => {
    render(<AcademicAnalyticsDashboard />);
    expect(screen.getByText('Academic Analytics')).toBeInTheDocument();
  });

  it('displays system health metrics', async () => {
    render(<AcademicAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Uptime')).toBeInTheDocument();
      expect(screen.getByText('Avg Response Time')).toBeInTheDocument();
      expect(screen.getByText('Error Rate')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<AcademicAnalyticsDashboard />);
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders analytics tabs', async () => {
    render(<AcademicAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Enrollment')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Workflows')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });

  it('renders time range selector', async () => {
    render(<AcademicAnalyticsDashboard />);
    
    await waitFor(() => {
      const selects = screen.getAllByTestId('select');
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  it('displays charts after loading', async () => {
    render(<AcademicAnalyticsDashboard />);
    
    await waitFor(() => {
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });
  });
});
