/**
 * Badge Statistics Component
 * "By the Spirit of Excellence, we measure achievement"
 * 
 * Component for displaying badge collection statistics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, TrendingUp, Target, Star } from 'lucide-react';
import { ScrollBadge, BadgeCredentialType } from '@/types/scrollbadge';

interface BadgeStatsProps {
  badges: ScrollBadge[];
}

export const BadgeStats: React.FC<BadgeStatsProps> = ({ badges }) => {
  const calculateStats = () => {
    const totalBadges = badges.length;
    const averageGrade = badges.length > 0
      ? badges.reduce((sum, badge) => sum + badge.grade, 0) / badges.length
      : 0;

    const badgesByType = badges.reduce((acc, badge) => {
      acc[badge.credentialType] = (acc[badge.credentialType] || 0) + 1;
      return acc;
    }, {} as Record<BadgeCredentialType, number>);

    const highestGrade = badges.length > 0
      ? Math.max(...badges.map(b => b.grade))
      : 0;

    const recentBadges = badges
      .sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime())
      .slice(0, 5);

    return {
      totalBadges,
      averageGrade,
      badgesByType,
      highestGrade,
      recentBadges
    };
  };

  const stats = calculateStats();

  const getCredentialTypeLabel = (type: BadgeCredentialType): string => {
    const labels: Record<BadgeCredentialType, string> = {
      [BadgeCredentialType.COURSE_COMPLETION]: 'Courses',
      [BadgeCredentialType.SKILL_MASTERY]: 'Skills',
      [BadgeCredentialType.DEGREE_COMPLETION]: 'Degrees',
      [BadgeCredentialType.CERTIFICATE]: 'Certificates',
      [BadgeCredentialType.SPECIALIZATION]: 'Specializations',
      [BadgeCredentialType.ACHIEVEMENT]: 'Achievements'
    };
    return labels[type] || type;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Badges */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBadges}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Earned credentials
          </p>
        </CardContent>
      </Card>

      {/* Average Grade */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageGrade.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all badges
          </p>
        </CardContent>
      </Card>

      {/* Highest Grade */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Highest Grade</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.highestGrade}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            Best performance
          </p>
        </CardContent>
      </Card>

      {/* Badge Types */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Badge Types</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {Object.keys(stats.badgesByType).length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Different types earned
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
