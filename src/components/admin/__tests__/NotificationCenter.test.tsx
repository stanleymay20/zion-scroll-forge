/**
 * Notification Center Tests
 * Tests for notification management functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificationCenter } from '../NotificationCenter';

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

vi.mock('@/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children }: any) => <label data-testid="label">{children}</label>,
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

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>,
}));

describe('NotificationCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification center', () => {
    render(<NotificationCenter />);
    expect(screen.getByText('Notification Center')).toBeInTheDocument();
  });

  it('displays notification statistics', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Sent')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Delivery Rate')).toBeInTheDocument();
    });
  });

  it('displays notification list', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Notifications')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<NotificationCenter />);
    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('renders create notification button', () => {
    render(<NotificationCenter />);
    expect(screen.getByText('Create Notification')).toBeInTheDocument();
  });

  it('renders filter controls', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search notifications...')).toBeInTheDocument();
    });
  });
});
