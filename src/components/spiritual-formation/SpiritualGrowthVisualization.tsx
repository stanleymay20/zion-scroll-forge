/**
 * Spiritual Growth Visualization Component
 * Visual representation of spiritual growth metrics
 * Requirements: 7.5
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Target,
  BookOpen,
  Lightbulb
} from 'lucide-react';

import type { SpiritualGrowthTracking } from '@/types/prophetic-checkin';

interface SpiritualGrowthVisualizationProps {
  tracking: SpiritualGrowthTracking;
  userId: string;
}

export function SpiritualGrowthVisualization({
  tracking
}: SpiritualGrowthVisualizationProps): JSX.Element {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'accelerating':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'improving':
      case 'accelerating':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Growth Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall Spiritual Growth</CardTitle>
              <CardDescription>
                Your comprehensive spiritual development score
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{tracking.overallGrowthScore}%</div>
              <Badge className={getTrendColor(tracking.growthTrend)}>
                {getTrendIcon(tracking.growthTrend)}
                <span className="ml-1">{tracking.growthTrend}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={tracking.overallGrowthScore} className="h-3" />
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div>
              <p className="text-muted-foreground">vs Last Month</p>
              <p className={`font-semibold ${tracking.comparedToLastMonth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tracking.comparedToLastMonth > 0 ? '+' : ''}{tracking.comparedToLastMonth}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">vs Last Quarter</p>
              <p className={`font-semibold ${tracking.comparedToLastQuarter >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tracking.comparedToLastQuarter > 0 ? '+' : ''}{tracking.comparedToLastQuarter}%
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">vs Last Year</p>
              <p className={`font-semibold ${tracking.comparedToLastYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tracking.comparedToLastYear > 0 ? '+' : ''}{tracking.comparedToLastYear}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Growth Areas */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Areas</CardTitle>
          <CardDescription>Detailed breakdown by spiritual category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tracking.growthAreas.map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{area.area}</span>
                    {getTrendIcon(area.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {area.previousScore} → {area.currentScore}
                    </span>
                    <Badge className={area.change >= 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                      {area.change > 0 ? '+' : ''}{area.change}
                    </Badge>
                  </div>
                </div>
                <Progress value={area.currentScore} className="h-2" />
                {area.nextSteps.length > 0 && (
                  <div className="text-xs text-muted-foreground pl-4">
                    Next: {area.nextSteps[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <Tabs defaultValue="insights">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spiritual Insights</CardTitle>
              <CardDescription>
                Key observations about your spiritual journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tracking.insights.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Complete more check-ins to receive personalized insights
                </p>
              ) : (
                <ul className="space-y-3">
                  {tracking.insights.map((insight, index) => (
                    <li key={index} className="flex gap-3">
                      <Lightbulb className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>
                Suggested actions to accelerate your growth
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tracking.recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Complete more check-ins to receive personalized recommendations
                </p>
              ) : (
                <ul className="space-y-3">
                  {tracking.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex gap-3">
                      <Target className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{recommendation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Milestones */}
      {tracking.milestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Milestones</CardTitle>
            <CardDescription>Celebrate your spiritual victories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tracking.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex gap-4 p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950"
                >
                  <Award className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold">{milestone.title}</h4>
                      <Badge variant="outline">{milestone.significance}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(milestone.achievedDate).toLocaleDateString()}
                      </span>
                      {milestone.scriptureReference && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {milestone.scriptureReference}
                        </span>
                      )}
                    </div>
                    {milestone.celebration && (
                      <p className="text-sm mt-2 italic">"{milestone.celebration}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicators */}
      {tracking.progressIndicators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Indicators</CardTitle>
            <CardDescription>Visual representation of your growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tracking.progressIndicators.map((indicator, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-base">{indicator.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {indicator.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current</span>
                        <span className="font-semibold">{indicator.data.current}</span>
                      </div>
                      <Progress
                        value={(indicator.data.current / indicator.data.target) * 100}
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Target: {indicator.data.target}</span>
                        <span>
                          {Math.round((indicator.data.current / indicator.data.target) * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
