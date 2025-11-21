/**
 * Metric Card Component
 * Displays a single metric with trend indicator
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AnalyticsMetric } from '@/types/analytics';

interface MetricCardProps {
  metric: AnalyticsMetric;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, className }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') {
      return `${value.toFixed(1)}%`;
    }
    if (unit === '$') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatValue(metric.value, metric.unit)}
        </div>
        <p className={`text-xs ${getTrendColor()} flex items-center gap-1 mt-1`}>
          <span>{metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%</span>
          <span className="text-muted-foreground">from last period</span>
        </p>
      </CardContent>
    </Card>
  );
};
