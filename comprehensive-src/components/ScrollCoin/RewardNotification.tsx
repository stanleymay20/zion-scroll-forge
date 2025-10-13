/**
 * Reward Notification Component
 * "Let every righteous deed be celebrated with divine recognition"
 * 
 * Component for displaying ScrollCoin reward notifications and achievements
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Award, 
  Star, 
  Trophy, 
  Gift,
  Sparkles,
  X,
  CheckCircle
} from 'lucide-react';

interface RewardNotification {
  id: string;
  type: 'EARNED' | 'BONUS' | 'MILESTONE' | 'ACHIEVEMENT';
  amount: number;
  title: string;
  description: string;
  activityType?: string;
  timestamp: Date;
  isNew: boolean;
}

interface RewardNotificationProps {
  notifications: RewardNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  notifications,
  onDismiss,
  onDismissAll
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState<RewardNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications.filter(n => n.isNew));
  }, [notifications]);

  const getRewardIcon = (type: string, activityType?: string) => {
    switch (type) {
      case 'BONUS':
        return <Sparkles className="h-6 w-6 text-yellow-500" />;
      case 'MILESTONE':
        return <Trophy className="h-6 w-6 text-purple-500" />;
      case 'ACHIEVEMENT':
        return <Award className="h-6 w-6 text-blue-500" />;
      default:
        if (activityType === 'COURSE_COMPLETION') {
          return <CheckCircle className="h-6 w-6 text-green-500" />;
        }
        return <Coins className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'BONUS':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'MILESTONE':
        return 'from-purple-50 to-purple-100 border-purple-200';
      case 'ACHIEVEMENT':
        return 'from-blue-50 to-blue-100 border-blue-200';
      default:
        return 'from-green-50 to-green-100 border-green-200';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {/* Dismiss All Button */}
      {visibleNotifications.length > 1 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onDismissAll}
            className="text-xs"
          >
            Dismiss All
          </Button>
        </div>
      )}

      {/* Notification Cards */}
      {visibleNotifications.map((notification) => (
        <Card
          key={notification.id}
          className={`bg-gradient-to-r ${getRewardColor(notification.type)} shadow-lg animate-in slide-in-from-right duration-300`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getRewardIcon(notification.type, notification.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      +{notification.amount} SC
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                    {notification.activityType && (
                      <Badge variant="outline" className="text-xs">
                        {notification.activityType.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(notification.id)}
                className="h-6 w-6 p-0 hover:bg-white/50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Hook for managing reward notifications
export const useRewardNotifications = () => {
  const [notifications, setNotifications] = useState<RewardNotification[]>([]);

  const addNotification = (notification: Omit<RewardNotification, 'id' | 'isNew' | 'timestamp'>) => {
    const newNotification: RewardNotification = {
      ...notification,
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isNew: true,
      timestamp: new Date()
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep max 10 notifications

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isNew: false } : n)
    );
  };

  const dismissAllNotifications = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isNew: false }))
    );
  };

  const showCourseCompletionReward = (courseName: string, amount: number) => {
    addNotification({
      type: 'EARNED',
      amount,
      title: 'Course Completed!',
      description: `Congratulations on completing "${courseName}"`,
      activityType: 'COURSE_COMPLETION'
    });
  };

  const showPeerAssistanceReward = (amount: number) => {
    addNotification({
      type: 'EARNED',
      amount,
      title: 'Peer Assistance Reward',
      description: 'Thank you for helping a fellow student!',
      activityType: 'PEER_ASSISTANCE'
    });
  };

  const showDailyStreakBonus = (streakDays: number, amount: number) => {
    addNotification({
      type: 'BONUS',
      amount,
      title: `${streakDays} Day Streak!`,
      description: 'Your consistent learning has been rewarded',
      activityType: 'DAILY_STREAK'
    });
  };

  const showMilestoneReward = (milestone: string, amount: number) => {
    addNotification({
      type: 'MILESTONE',
      amount,
      title: 'Milestone Achieved!',
      description: milestone,
      activityType: 'MILESTONE'
    });
  };

  const showAchievementReward = (achievement: string, amount: number) => {
    addNotification({
      type: 'ACHIEVEMENT',
      amount,
      title: 'Achievement Unlocked!',
      description: achievement,
      activityType: 'ACHIEVEMENT'
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications,
    showCourseCompletionReward,
    showPeerAssistanceReward,
    showDailyStreakBonus,
    showMilestoneReward,
    showAchievementReward
  };
};

// Reward notification container component
export const RewardNotificationContainer: React.FC = () => {
  const {
    notifications,
    dismissNotification,
    dismissAllNotifications
  } = useRewardNotifications();

  return (
    <RewardNotification
      notifications={notifications}
      onDismiss={dismissNotification}
      onDismissAll={dismissAllNotifications}
    />
  );
};

export default RewardNotification;