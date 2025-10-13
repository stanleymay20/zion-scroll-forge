/**
 * Interactive Feature Matrix Tests
 * Tests for task 4.3: Build interactive feature comparison matrix
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InteractiveFeatureMatrix } from '../InteractiveFeatureMatrix';
import { CompetitiveAnalysisMatrixService } from '../../../services/CompetitiveAnalysisMatrixService';
import { FeatureComparisonMatrix } from '../../../types/competitive-analysis';

// Mock the service
jest.mock('../../../services/CompetitiveAnalysisMatrixService');

describe('InteractiveFeatureMatrix', () => {
  let mockMatrix: FeatureComparisonMatrix;
  let mockOnFeatureSelect: jest.Mock;
  let mockOnCategoryFilter: jest.Mock;
  let mockOnAdvantageFilter: jest.Mock;

  beforeEach(() => {
    const service = new CompetitiveAnalysisMatrixService();
    mockMatrix = service.generateFeatureComparisonMatrix();
    
    mockOnFeatureSelect = jest.fn();
    mockOnCategoryFilter = jest.fn();
    mockOnAdvantageFilter = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the interactive feature matrix with all components', () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Check for main title
    expect(screen.getByText('Interactive Feature Comparison Matrix')).toBeInTheDocument();
    
    // Check for overall score display
    expect(screen.getByText(/Overall Score:/)).toBeInTheDocument();
    
    // Check for filter controls
    expect(screen.getByPlaceholderText('Search features...')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Features')).toBeInTheDocument();
  });

  it('displays category overview cards', () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Check for category cards
    expect(screen.getByText('Core Education')).toBeInTheDocument();
    expect(screen.getByText('AI Capabilities')).toBeInTheDocument();
    expect(screen.getByText('Spiritual Formation')).toBeInTheDocument();
  });

  it('displays summary statistics correctly', () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Check for summary stats
    expect(screen.getByText('Total Features')).toBeInTheDocument();
    expect(screen.getByText('ScrollU Advantage')).toBeInTheDocument();
    expect(screen.getByText('LearnTube Advantage')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Spiritual Features')).toBeInTheDocument();
    expect(screen.getByText('Kingdom Impact')).toBeInTheDocument();
  });

  it('handles search filtering correctly', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search features...');
    fireEvent.change(searchInput, { target: { value: 'AI' } });

    await waitFor(() => {
      // Should filter features containing 'AI'
      expect(screen.getByText('AI-Powered Personalized Tutoring')).toBeInTheDocument();
    });
  });

  it('handles advantage filtering correctly', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    const advantageSelect = screen.getByDisplayValue('All Features');
    fireEvent.change(advantageSelect, { target: { value: 'scrolluniversity' } });

    await waitFor(() => {
      expect(mockOnAdvantageFilter).toHaveBeenCalledWith('scrolluniversity');
    });
  });

  it('handles category filtering when clicking category cards', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    const coreEducationCard = screen.getByText('Core Education').closest('div');
    if (coreEducationCard) {
      fireEvent.click(coreEducationCard);
    }

    await waitFor(() => {
      expect(mockOnCategoryFilter).toHaveBeenCalledWith(['core-education']);
    });
  });

  it('switches between view modes correctly', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Switch to cards view
    const cardsButton = screen.getByText('Cards');
    fireEvent.click(cardsButton);

    await waitFor(() => {
      expect(cardsButton).toHaveClass('bg-blue-600');
    });

    // Switch to summary view
    const summaryButton = screen.getByText('Summary');
    fireEvent.click(summaryButton);

    await waitFor(() => {
      expect(summaryButton).toHaveClass('bg-blue-600');
      expect(screen.getByText('Feature Superiority Analysis Report')).toBeInTheDocument();
    });
  });

  it('handles feature selection correctly', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Find and click a feature row
    const featureRow = screen.getByText('AI-Powered Personalized Tutoring').closest('tr');
    if (featureRow) {
      fireEvent.click(featureRow);
    }

    await waitFor(() => {
      expect(mockOnFeatureSelect).toHaveBeenCalled();
    });
  });

  it('displays "show only unique features" filter correctly', () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    const uniqueCheckbox = screen.getByLabelText('Show only unique features');
    expect(uniqueCheckbox).toBeInTheDocument();
    expect(uniqueCheckbox).not.toBeChecked();

    fireEvent.click(uniqueCheckbox);
    expect(uniqueCheckbox).toBeChecked();
  });

  it('clears all filters when clear button is clicked', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Set some filters first
    const searchInput = screen.getByPlaceholderText('Search features...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const uniqueCheckbox = screen.getByLabelText('Show only unique features');
    fireEvent.click(uniqueCheckbox);

    // Clear all filters
    const clearButton = screen.getByText('Clear all filters');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput).toHaveValue('');
      expect(uniqueCheckbox).not.toBeChecked();
    });
  });

  it('displays correct competitive advantage indicators', () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Check for ScrollUniversity advantage indicators
    expect(screen.getByText('✓ ScrollUniversity Advantage')).toBeInTheDocument();
    
    // Check for spiritual and kingdom impact indicators
    expect(screen.getByText('Spiritual')).toBeInTheDocument();
    expect(screen.getByText('Kingdom')).toBeInTheDocument();
  });

  it('handles empty filter results gracefully', async () => {
    render(
      <InteractiveFeatureMatrix
        comparisonMatrix={mockMatrix}
        onFeatureSelect={mockOnFeatureSelect}
        onCategoryFilter={mockOnCategoryFilter}
        onAdvantageFilter={mockOnAdvantageFilter}
      />
    );

    // Search for something that won't match
    const searchInput = screen.getByPlaceholderText('Search features...');
    fireEvent.change(searchInput, { target: { value: 'nonexistentfeature' } });

    await waitFor(() => {
      expect(screen.getByText('No features match the current filters')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
    });
  });
});