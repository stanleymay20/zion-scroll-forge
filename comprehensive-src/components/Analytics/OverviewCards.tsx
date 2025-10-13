import React from 'react';
import { OverviewMetrics } from '../../types/analytics';

interface OverviewCardsProps {
  overview: OverviewMetrics;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: 'Active Students',
      value: overview.totalActiveStudents.toLocaleString(),
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Faculty Members',
      value: overview.totalFaculty.toLocaleString(),
      icon: '👨‍🏫',
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive' as const
    },
    {
      title: 'Courses Offered',
      value: overview.coursesOffered.toLocaleString(),
      icon: '📚',
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'ScrollBadges Issued',
      value: overview.scrollBadgesIssued.toLocaleString(),
      icon: '🏆',
      color: 'bg-yellow-500',
      change: '+25%',
      changeType: 'positive' as const
    },
    {
      title: 'Graduation Rate',
      value: `${(overview.graduationRate * 100).toFixed(1)}%`,
      icon: '🎓',
      color: 'bg-indigo-500',
      change: '+3%',
      changeType: 'positive' as const
    },
    {
      title: 'Global Reach',
      value: `${overview.globalReachCountries} Countries`,
      icon: '🌍',
      color: 'bg-teal-500',
      change: '+2',
      changeType: 'positive' as const
    },
    {
      title: 'Spiritual Growth',
      value: `${(overview.averageSpiritualGrowth * 100).toFixed(1)}%`,
      icon: '✨',
      color: 'bg-pink-500',
      change: '+7%',
      changeType: 'positive' as const
    },
    {
      title: 'ScrollCoin Circulation',
      value: overview.scrollCoinCirculation.toLocaleString(),
      icon: '🪙',
      color: 'bg-orange-500',
      change: '+18%',
      changeType: 'positive' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`${card.color} rounded-lg p-3 mr-4`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <span className={`ml-2 text-sm font-medium ${
                  card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;