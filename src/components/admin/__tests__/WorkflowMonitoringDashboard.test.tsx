/**
 * Workflow Monitoring Dashboard Tests
 * Tests for workflow monitoring functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { WorkflowMonitoringDashboard } from '../WorkflowMonitoringDashboard';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange }: any) => (
    <div data-testid="select" onClick={() => onValueChange?.('all')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
}));

describe('WorkflowMonitoringDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workflow monitoring dashboard', () => {
    render(<WorkflowMonitoringDashboard />);
    expect(screen.getByText('Workflow Monitoring')).toBeInTheDocument();
  });

  it('displays workflow statistics', async () => {
    render(<WorkflowMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Workflows')).toBeInTheDocument();
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });
  });

  it('displays workflow list', async () => {
    render(<WorkflowMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Workflows')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<WorkflowMonitoringDashboard />);
    expect(screen.getByText('Loading workflows...')).toBeInTheDocument();
  });

  it('renders filter controls', async () => {
    render(<WorkflowMonitoringDashboard />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search workflows...')).toBeInTheDocument();
    });
  });
});
