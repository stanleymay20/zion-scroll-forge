import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
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
  Award, 
  Trophy, 
  Star, 
  Heart, 
  Users, 
  BookOpen,
  Search,
  Pin,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Achievement } from '@/types/student-profile';

interface AchievementShowcaseProps {
  studentId: string;
  isOwnProfile: boolean;
}

const AchievementShowcase: React.FC<AchievementShowcaseProps> = ({ 
  studentId, 
  isOwnProfile 
}) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, [studentId]);

  useEffect(() => {
    filterAchievements();
  }, [achievements, searchTerm, categoryFilter]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/${studentId}/achievements`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load achievements');
      
      const data = await response.json();
      setAchievements(data.data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAchievements = () => {
    let filtered = [...achievements];

    if (searchTerm) {
      filtered = filtered.filter(achievement =>
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(achievement => achievement.type === categoryFilter);
    }

    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime();
    });

    setFilteredAchievements(filtered);
  };

  const handleTogglePin = async (achievementId: string, isPinned: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');
      
      const response = await fetch(`/api/profile/${studentId}/achievements/${achievementId}/pin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ isPinned: !isPinned })
      });
      
      if (!response.ok) throw new Error('Failed to update achievement');
      
      setAchievements(achievements.map(a => 
        a.id === achievementId ? { ...a, isPinned: !isPinned } : a
      ));
    } catch (error) {
      console.error('Error updating achievement:', error);
    }
  };

  const getAchievementIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      academic: <BookOpen className="h-6 w-6" />,
      spiritual: <Heart className="h-6 w-6" />,
      leadership: <Users className="h-6 w-6" />,
      service: <Star className="h-6 w-6" />,
      research: <Award className="h-6 w-6" />,
      scrollbadge: <Trophy className="h-6 w-6" />,
      scrollcoin: <Trophy className="h-6 w-6" />,
    };
    return icons[type] || <Award className="h-6 w-6" />;
  };

  const getAchievementColor = (type: string) => {
    const colors: Record<string, string> = {
      academic: 'from-blue-500 to-blue-600',
      spiritual: 'from-purple-500 to-purple-600',
      leadership: 'from-green-500 to-green-600',
      service: 'from-yellow-500 to-yellow-600',
      research: 'from-red-500 to-red-600',
      scrollbadge: 'from-indigo-500 to-indigo-600',
      scrollcoin: 'from-amber-500 to-amber-600',
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
        <p className="text-muted-foreground">
          Achievements will appear here as you progress through your studies.
        </p>
      </Card>
    );
  }

  const stats = {
    total: achievements.length,
    academic: achievements.filter(a => a.type === 'academic').length,
    spiritual: achievements.filter(a => a.type === 'spiritual').length,
    leadership: achievements.filter(a => a.type === 'leadership').length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Academic</p>
          <p className="text-2xl font-bold">{stats.academic}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Spiritual</p>
          <p className="text-2xl font-bold">{stats.spiritual}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Leadership</p>
          <p className="text-2xl font-bold">{stats.leadership}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search achievements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="spiritual">Spiritual</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="scrollbadge">ScrollBadge</SelectItem>
              <SelectItem value="scrollcoin">ScrollCoin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`relative overflow-hidden ${
              achievement.isPinned ? 'ring-2 ring-primary' : ''
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getAchievementColor(achievement.type)} opacity-10`} />
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${getAchievementColor(achievement.type)} text-white`}>
                  {getAchievementIcon(achievement.type)}
                </div>
                {isOwnProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(achievement.id, achievement.isPinned)}
                    className={achievement.isPinned ? 'text-primary' : ''}
                  >
                    <Pin className={`h-4 w-4 ${achievement.isPinned ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>

              {/* Achievement Info */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">{achievement.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {achievement.description}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {achievement.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">
                    {achievement.category}
                  </Badge>
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-muted-foreground mb-3">
                Earned: {new Date(achievement.dateEarned).toLocaleDateString()}
              </p>

              {/* Verification */}
              {achievement.verificationUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(achievement.verificationUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Verify Achievement
                </Button>
              )}

              {/* Pinned Badge */}
              {achievement.isPinned && (
                <div className="absolute top-2 right-2">
                  <Badge variant="default" className="text-xs">
                    <Pin className="h-3 w-3 mr-1 fill-current" />
                    Pinned
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No achievements match your search criteria.
          </p>
        </Card>
      )}
    </div>
  );
};

export default AchievementShowcase;
