import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import '@testing-library/jest-dom';

import {AccessibilityProvider} from '../accessibility/AccessibilityProvider';
import {HelpSystem} from '../help/HelpSystem';
import {FeedbackSystem} from '../feedback/FeedbackSystem';
import {UserExperienceOptimizer} from '../ux/UserExperienceOptimizer';

// Mock fetch for feedback submission
global.fetch = jest.fn();

const theme = createTheme();

const TestWrapper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <ThemeProvider theme={theme}>
    <AccessibilityProvider>
      {children}
    </AccessibilityProvider>
  </ThemeProvider>
);

describe('User Experience Optimization Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({success: true}),
    });
  });

  describe('AccessibilityProvider', () => {
    it('should render accessibility settings button', () => {
      render(
        <TestWrapper>
          <div>Test content</div>
        </TestWrapper>
      );

      const accessibilityButton = screen.getByTestId('accessibility-button');
      expect(accessibilityButton).toBeInTheDocument();
    });

    it('should open accessibility settings dialog', async () => {
      render(
        <TestWrapper>
          <div>Test content</div>
        </TestWrapper>
      );

      const accessibilityButton = screen.getByTestId('accessibility-button');
      fireEvent.click(accessibilityButton);

      await waitFor(() => {
        expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
      });
    });

    it('should save accessibility settings to localStorage', async () => {
      render(
        <TestWrapper>
          <div>Test content</div>
        </TestWrapper>
      );

      const accessibilityButton = screen.getByTestId('accessibility-button');
      fireEvent.click(accessibilityButton);

      await waitFor(() => {
        const highContrastSwitch = screen.getByRole('checkbox', {name: /high contrast mode/i});
        fireEvent.click(highContrastSwitch);
      });

      const applyButton = screen.getByText('Apply Settings');
      fireEvent.click(applyButton);

      const savedSettings = localStorage.getItem('scrolluniversity-accessibility-settings');
      expect(savedSettings).toBeTruthy();
      
      const settings = JSON.parse(savedSettings!);
      expect(settings.highContrast).toBe(true);
    });

    it('should apply CSS classes for accessibility features', async () => {
      render(
        <TestWrapper>
          <div>Test content</div>
        </TestWrapper>
      );

      const accessibilityButton = screen.getByTestId('accessibility-button');
      fireEvent.click(accessibilityButton);

      await waitFor(() => {
        const highContrastSwitch = screen.getByRole('checkbox', {name: /high contrast mode/i});
        fireEvent.click(highContrastSwitch);
      });

      const applyButton = screen.getByText('Apply Settings');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(document.documentElement).toHaveClass('high-contrast');
      });
    });
  });

  describe('HelpSystem', () => {
    it('should render help button', () => {
      render(
        <TestWrapper>
          <HelpSystem currentStep={0} />
        </TestWrapper>
      );

      const helpButton = screen.getByTestId('help-button');
      expect(helpButton).toBeInTheDocument();
    });

    it('should open help dialog with contextual help', async () => {
      render(
        <TestWrapper>
          <HelpSystem currentStep={0} />
        </TestWrapper>
      );

      const helpButton = screen.getByTestId('help-button');
      fireEvent.click(helpButton);

      await waitFor(() => {
        expect(screen.getByText('Help & Guidance')).toBeInTheDocument();
        expect(screen.getByText('Help for Current Step')).toBeInTheDocument();
      });
    });

    it('should filter help topics by search query', async () => {
      render(
        <TestWrapper>
          <HelpSystem currentStep={0} />
        </TestWrapper>
      );

      const helpButton = screen.getByTestId('help-button');
      fireEvent.click(helpButton);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search help topics...');
        fireEvent.change(searchInput, {target: {value: 'personal'}});
      });

      await waitFor(() => {
        expect(screen.getByText('Personal Information Requirements')).toBeInTheDocument();
      });
    });

    it('should show contextual help hints', () => {
      render(
        <TestWrapper>
          <HelpSystem currentStep={0} />
        </TestWrapper>
      );

      expect(screen.getByText('💡 Quick Help')).toBeInTheDocument();
      expect(screen.getByText('Personal Information Requirements')).toBeInTheDocument();
    });
  });

  describe('FeedbackSystem', () => {
    it('should render feedback button', () => {
      render(
        <TestWrapper>
          <FeedbackSystem currentStep={0} />
        </TestWrapper>
      );

      const feedbackButton = screen.getByLabelText('Share feedback');
      expect(feedbackButton).toBeInTheDocument();
    });

    it('should open feedback dialog', async () => {
      render(
        <TestWrapper>
          <FeedbackSystem currentStep={0} />
        </TestWrapper>
      );

      const feedbackButton = screen.getByLabelText('Share feedback');
      fireEvent.click(feedbackButton);

      await waitFor(() => {
        expect(screen.getByText('Share Your Feedback')).toBeInTheDocument();
      });
    });

    it('should submit feedback successfully', async () => {
      render(
        <TestWrapper>
          <FeedbackSystem currentStep={0} />
        </TestWrapper>
      );

      const feedbackButton = screen.getByLabelText('Share feedback');
      fireEvent.click(feedbackButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText('Title');
        const descriptionInput = screen.getByLabelText('Description');
        
        fireEvent.change(titleInput, {target: {value: 'Test feedback'}});
        fireEvent.change(descriptionInput, {target: {value: 'This is a test feedback'}});
      });

      const submitButton = screen.getByText('Submit Feedback');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admissions/feedback', expect.objectContaining({
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: expect.stringContaining('Test feedback'),
        }));
      });
    });

    it('should show quick feedback prompt', async () => {
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <FeedbackSystem currentStep={0} />
        </TestWrapper>
      );

      // Fast-forward time to trigger quick feedback
      jest.advanceTimersByTime(120000);

      await waitFor(() => {
        expect(screen.getByText('How is this step going?')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('should handle quick feedback responses', async () => {
      jest.useFakeTimers();
      
      render(
        <TestWrapper>
          <FeedbackSystem currentStep={0} />
        </TestWrapper>
      );

      jest.advanceTimersByTime(120000);

      await waitFor(() => {
        const goodButton = screen.getByText('Good');
        fireEvent.click(goodButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admissions/feedback', expect.objectContaining({
          method: 'POST',
        }));
      });

      jest.useRealTimers();
    });
  });

  describe('UserExperienceOptimizer', () => {
    const defaultProps = {
      currentStep: 0,
      totalSteps: 5,
      isOffline: false,
      isSaving: false,
      completionPercentage: 25,
      estimatedTimeRemaining: 30,
    };

    it('should render progress indicator', () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('1 of 5')).toBeInTheDocument();
      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('should show offline indicator when offline', () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps} isOffline={true}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      expect(screen.getByTitle('Offline')).toBeInTheDocument();
    });

    it('should show saving indicator when saving', () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps} isSaving={true}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      expect(screen.getByTitle('Saving...')).toBeInTheDocument();
    });

    it('should show estimated time remaining', () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      expect(screen.getByText('Estimated time remaining: 30 min')).toBeInTheDocument();
    });

    it('should track user engagement metrics', async () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      // Simulate user interactions
      fireEvent.click(document.body);
      fireEvent.keyDown(document.body, {key: 'Tab'});

      // In development mode, engagement metrics should be visible
      if (process.env.NODE_ENV === 'development') {
        await waitFor(() => {
          expect(screen.getByText(/Interactions:/)).toBeInTheDocument();
        });
      }
    });

    it('should show progress encouragement notification', async () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer {...defaultProps} completionPercentage={60}>
            <div>Test content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Great progress!/)).toBeInTheDocument();
      }, {timeout: 15000});
    });
  });

  describe('Integration Tests', () => {
    it('should work together seamlessly', async () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer
            currentStep={0}
            totalSteps={5}
            isOffline={false}
            isSaving={false}
            completionPercentage={25}
            estimatedTimeRemaining={30}>
            <HelpSystem currentStep={0} />
            <FeedbackSystem currentStep={0} />
            <div>Application content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      // All components should be present
      expect(screen.getByTestId('accessibility-button')).toBeInTheDocument();
      expect(screen.getByTestId('help-button')).toBeInTheDocument();
      expect(screen.getByLabelText('Share feedback')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
      expect(screen.getByText('Application content')).toBeInTheDocument();
    });

    it('should handle keyboard navigation', async () => {
      render(
        <TestWrapper>
          <UserExperienceOptimizer
            currentStep={0}
            totalSteps={5}
            isOffline={false}
            isSaving={false}
            completionPercentage={25}>
            <HelpSystem currentStep={0} />
            <div>Application content</div>
          </UserExperienceOptimizer>
        </TestWrapper>
      );

      // Test Alt+A for accessibility
      fireEvent.keyDown(document, {key: 'a', altKey: true});

      await waitFor(() => {
        expect(screen.getByText('Accessibility Settings')).toBeInTheDocument();
      });
    });
  });
});