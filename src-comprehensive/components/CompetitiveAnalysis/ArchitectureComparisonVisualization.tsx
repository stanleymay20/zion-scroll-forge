/**
 * Architecture Comparison Visualization Component
 * Task 2.3: Build architecture comparison visualization system
 * Requirements: 1.3, 1.4 - Side-by-side displays and technical superiority reports
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArchitectureVisualization,
  ArchitectureDisplay,
  ArchitectureMetrics,
  TechnicalSuperiorityReport,
  ComponentDisplay,
  ScalabilityIndicator,
  AICapabilityDisplay,
  AccessibilityDisplay,
  SecurityDisplay,
  TechnicalAdvantage
} from '../../types/competitive-analysis';
import { ArchitectureComparisonVisualizationService } from '../../services/ArchitectureComparisonVisualizationService';

interface ArchitectureComparisonVisualizationProps {
  visualizationId?: string;
  comparisonType?: 'side-by-side' | 'overlay' | 'matrix';
  includeSpiritual?: boolean;
  focusAreas?: string[];
  onVisualizationUpdate?: (visualization: ArchitectureVisualization) => void;
}

export const ArchitectureComparisonVisualization: React.FC<ArchitectureComparisonVisualizationProps> = ({
  visualizationId,
  comparisonType = 'side-by-side',
  includeSpiritual = true,
  focusAreas = [],
  onVisualizationUpdate
}) => {
  const [visualization, setVisualization] = useState<ArchitectureVisualization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'superiority' | 'details'>('overview');
  const [selectedPlatform, setSelectedPlatform] = useState<'scrolluniversity' | 'learntube' | 'both'>('both');

  const visualizationService = useMemo(() => new ArchitectureComparisonVisualizationService(), []);

  useEffect(() => {
    if (visualizationId) {
      loadVisualization();
    }
  }, [visualizationId]);

  const loadVisualization = async (): Promise<void> => {
    if (!visualizatlysis = createMockAnalysis();
      
      const viz = await visualizationService.generateArchitectureVisualization(
        mockAnalysis,
        {
          comparisonType,
          includeMetrics: showMetrics,
          includeSuperiorityReport: showSuperiorityReport,
          theme
        }
      );

      setVisualization(viz);
      onVisualizationGenerated?.(viz);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load visualization');
    } finally {
      setLoading(false);
    }
  };

  const createMockAnalysis = () => {
    // Mock analysis data for demonstration
    return {
      id: analysisId,
      analysisDate: new Date(),
      platforms: {
        scrollUniversity: {
          name: 'ScrollUniversity',
          architecture: {
            type: 'blockchain-integrated' as const,
            aiCapabilities: [
              {
                name: 'Prophetic AI Engine',
                type: 'prophetic-ai' as const,
                description: 'AI with spiritual discernment and divine guidance',
                spiritualIntegration: true,
                culturalFluency: true,
                personalizedLearning: true
              }
  