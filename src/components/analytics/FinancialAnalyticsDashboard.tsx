/**
 * Financial Analytics Dashboard Component
 * Revenue tracking and financial projections
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingUp, Coins, Award, PieChart } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { EngagementChart } from './EngagementChart';
import analyticsService from '@/services/analyticsService';
import type { FinancialAnalytics, TimeRange, ChartData, RevenueForecast } from '@/types/analytics';
import { useToast } from '@/hooks/use-toast';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export const FinancialAnalyticsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
  const [forecast, setForecast] = useState<RevenueForecast | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);

  useEffect(() => {
    fetchFinancialAnalytics();
    fetchRevenueForecast();
  }, [timeRange]);

  const fetchFinancialAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getFinancialAnalytics(timeRange);
      setAnalytics(data);
      generateRevenueData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load financial analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueForecast = async () => {
    try {
      const data = await analyticsService.getRevenueForecast(3);
      setForecast(data);
    } catch (error) {
      console.error('Error fetching forecast:', error);
    }
  };

  const generateRevenueData = (data: FinancialAnalytics) => {
    // Mock data - replace with actual data transformation
    setRevenueData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Total Revenue',
          data: [45000, 52000, 48000, 61000, 58000, 67000],
          borderColor: '#8b5cf6',
          backgroundColor: '#8b5cf6',
        },
      ],
    });
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Prepare pie chart data
  const revenueBySourceData = Object.entries(analytics.revenueMetrics.revenueBySource).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Analytics</h2>
          <p className="text-muted-foreground">
            Revenue tracking and financial projections
          </p>
        </div>
        <Select defaultValue="90">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          metric={{
            name: 'Total Revenue',
            value: analytics.revenueMetrics.totalRevenue,
            change: analytics.revenueMetrics.revenueGrowth,
            trend: analytics.revenueMetrics.revenueGrowth > 0 ? 'up' : 'down',
            unit: '$',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Avg Transaction',
            value: analytics.revenueMetrics.averageTransactionValue,
            change: 5.2,
            trend: 'up',
            unit: '$',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'ScrollCoin Volume',
            value: analytics.scrollCoinMetrics.transactionVolume,
            change: 18.3,
            trend: 'up',
            unit: '',
            timestamp: new Date(),
          }}
        />
        <MetricCard
          metric={{
            name: 'Scholarships Awarded',
            value: analytics.scholarshipMetrics.totalAwarded,
            change: 12.1,
            trend: 'up',
            unit: '$',
            timestamp: new Date(),
          }}
        />
      </div>

      {/* Revenue Chart */}
      {revenueData && (
        <EngagementChart
          title="Revenue Trends"
          description="Monthly revenue over time"
          data={revenueData}
          type="area"
          height={350}
        />
      )}

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={revenueBySourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueBySourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Legend />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              ScrollCoin Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Minted</p>
                <p className="text-2xl font-bold">
                  {analytics.scrollCoinMetrics.totalMinted.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Burned</p>
                <p className="text-2xl font-bold">
                  {analytics.scrollCoinMetrics.totalBurned.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Circulating Supply</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.scrollCoinMetrics.circulatingSupply.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Balance</p>
                <p className="text-2xl font-bold">
                  {analytics.scrollCoinMetrics.averageBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Enrollment Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Course Enrollments</p>
              <p className="text-2xl font-bold">
                ${analytics.enrollmentRevenue.courseEnrollments.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Subscriptions</p>
              <p className="text-2xl font-bold text-blue-600">
                ${analytics.enrollmentRevenue.subscriptionRevenue.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">One-Time Payments</p>
              <p className="text-2xl font-bold text-green-600">
                ${analytics.enrollmentRevenue.oneTimePayments.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scholarship Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Scholarship Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Awarded</p>
              <p className="text-2xl font-bold">
                ${analytics.scholarshipMetrics.totalAwarded.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Disbursed</p>
              <p className="text-2xl font-bold text-green-600">
                ${analytics.scholarshipMetrics.totalDisbursed.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Remaining Budget</p>
              <p className="text-2xl font-bold text-blue-600">
                ${analytics.scholarshipMetrics.remainingBudget.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Utilization Rate</p>
              <p className="text-2xl font-bold">
                {analytics.scholarshipMetrics.utilizationRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Forecast */}
      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Forecast
            </CardTitle>
            <CardDescription>
              AI-powered revenue predictions (Confidence: {(forecast.confidence * 100).toFixed(0)}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Month</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${forecast.nextMonth.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Quarter</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${forecast.nextQuarter.toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Next Year</p>
                <p className="text-2xl font-bold text-green-600">
                  ${forecast.nextYear.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
