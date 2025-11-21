/**
 * Earning Opportunities Component
 * Displays ways to earn ScrollCoin through various activities
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Heart, 
  UserPlus,
  TrendingUp,
  Clock,
  Award,
  Search
} from 'lucide-react';
import { EarningOpportunity } from '@/types/scrollcoin';

interface EarningOpportunitiesProps {
  currentBalance: number;
}

const EarningOpportunities: React.FC<EarningOpportunitiesProps> = ({ currentBalance }) => {
  const [opportunities, setOpportunities] = useState<EarningOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<EarningOpportunity[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In production, this would fetch from API
    const mockOpportunities: EarningOpportunity[] = [
      {
        id: '1',
        title: 'Complete a Course',
        description: 'Finish any course with a passing grade to earn ScrollCoin rewards',
        rewardAmount: 100,
        category: 'COURSE',
        difficulty: 'MEDIUM',
        estimatedTime: '4-8 weeks',
        requirements: ['Enroll in a course', 'Complete all modules', 'Pass final assessment'],
        icon: 'BookOpen',
        actionUrl: '/courses'
      },
      {
        id: '2',
        title: 'Submit an Assignment',
        description: 'Complete and submit course assignments on time',
        rewardAmount: 25,
        category: 'ASSESSMENT',
        difficulty: 'EASY',
        estimatedTime: '1-3 hours',
        requirements: ['Be enrolled in a course', 'Complete assignment', 'Submit before deadline'],
        icon: 'FileText',
        actionUrl: '/dashboard'
      },
      {
        id: '3',
        title: 'Join a Study Group',
        description: 'Participate actively in study group discussions and activities',
        rewardAmount: 15,
        category: 'COMMUNITY',
        difficulty: 'EASY',
        estimatedTime: '30 minutes',
        requirements: ['Join a study group', 'Participate in discussions', 'Attend meetings'],
        icon: 'Users',
        actionUrl: '/study-groups'
      },
      {
        id: '4',
        title: 'Daily Devotion Streak',
        description: 'Complete daily devotions for 7 consecutive days',
        rewardAmount: 50,
        category: 'SPIRITUAL',
        difficulty: 'MEDIUM',
        estimatedTime: '7 days',
        requirements: ['Complete daily devotion', 'Maintain 7-day streak', 'Reflect and journal'],
        icon: 'Heart',
        actionUrl: '/spiritual-formation'
      },
      {
        id: '5',
        title: 'Refer a Friend',
        description: 'Invite friends to join ScrollUniversity and earn rewards',
        rewardAmount: 200,
        category: 'REFERRAL',
        difficulty: 'EASY',
        estimatedTime: '5 minutes',
        requirements: ['Share referral link', 'Friend signs up', 'Friend completes first course'],
        icon: 'UserPlus',
        actionUrl: '/referrals'
      },
      {
        id: '6',
        title: 'Ace an Assessment',
        description: 'Score 90% or higher on any course assessment',
        rewardAmount: 75,
        category: 'ASSESSMENT',
        difficulty: 'HARD',
        estimatedTime: '2-4 hours',
        requirements: ['Take an assessment', 'Score 90% or higher', 'Submit on first attempt'],
        icon: 'Award',
        actionUrl: '/dashboard'
      },
      {
        id: '7',
        title: 'Help a Peer',
        description: 'Answer questions and help other students in the community',
        rewardAmount: 10,
        category: 'COMMUNITY',
        difficulty: 'EASY',
        estimatedTime: '15 minutes',
        requirements: ['Answer community questions', 'Receive upvotes', 'Provide helpful responses'],
        icon: 'Users',
        actionUrl: '/community'
      },
      {
        id: '8',
        title: 'Complete Scripture Memory',
        description: 'Memorize and recite 10 scripture verses',
        rewardAmount: 40,
        category: 'SPIRITUAL',
        difficulty: 'MEDIUM',
        estimatedTime: '2 weeks',
        requirements: ['Select verses', 'Practice daily', 'Pass recitation quiz'],
        icon: 'Heart',
        actionUrl: '/spiritual-formation'
      }
    ];

    setOpportunities(mockOpportunities);
    setFilteredOpportunities(mockOpportunities);
  }, []);

  useEffect(() => {
    let filtered = opportunities;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(opp => opp.category === categoryFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(opp => opp.difficulty === difficultyFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOpportunities(filtered);
  }, [categoryFilter, difficultyFilter, searchTerm, opportunities]);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      BookOpen: <BookOpen className="h-6 w-6" />,
      FileText: <FileText className="h-6 w-6" />,
      Users: <Users className="h-6 w-6" />,
      Heart: <Heart className="h-6 w-6" />,
      UserPlus: <UserPlus className="h-6 w-6" />,
      Award: <Award className="h-6 w-6" />
    };
    return icons[iconName] || <TrendingUp className="h-6 w-6" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'COURSE':
        return 'bg-blue-100 text-blue-800';
      case 'ASSESSMENT':
        return 'bg-purple-100 text-purple-800';
      case 'COMMUNITY':
        return 'bg-pink-100 text-pink-800';
      case 'SPIRITUAL':
        return 'bg-indigo-100 text-indigo-800';
      case 'REFERRAL':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Earning Opportunities</CardTitle>
          <CardDescription>
            Discover ways to earn ScrollCoin through learning, community engagement, and spiritual growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="COURSE">Courses</SelectItem>
                <SelectItem value="ASSESSMENT">Assessments</SelectItem>
                <SelectItem value="COMMUNITY">Community</SelectItem>
                <SelectItem value="SPIRITUAL">Spiritual</SelectItem>
                <SelectItem value="REFERRAL">Referrals</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {getIcon(opportunity.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{opportunity.title}</h3>
                        <Badge className="bg-green-100 text-green-800 font-bold">
                          +{opportunity.rewardAmount} SC
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {opportunity.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className={getCategoryColor(opportunity.category)}>
                          {opportunity.category}
                        </Badge>
                        <Badge variant="outline" className={getDifficultyColor(opportunity.difficulty)}>
                          {opportunity.difficulty}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {opportunity.estimatedTime}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Requirements:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {opportunity.requirements.map((req, idx) => (
                            <li key={idx}>• {req}</li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => window.location.href = opportunity.actionUrl}
                      >
                        Start Earning
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No opportunities found matching your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EarningOpportunities;
