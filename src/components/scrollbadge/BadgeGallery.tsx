/**
 * Badge Gallery Component
 * "By the Spirit of Excellence, we display verifiable credentials"
 * 
 * Main component for displaying user's badge collection in a grid layout
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Search, Filter, Grid, List, TrendingUp } from 'lucide-react';
import { ScrollBadge, BadgeCredentialType, BadgeFilter } from '@/types/scrollbadge';
import { BadgeCard } from './BadgeCard';
import { BadgeDetailModal } from './BadgeDetailModal';
import { BadgeFilters } from './BadgeFilters';
import { BadgeStats } from './BadgeStats';

interface BadgeGalleryProps {
  userId: string;
  isOwnProfile?: boolean;
}

export const BadgeGallery: React.FC<BadgeGalleryProps> = ({ userId, isOwnProfile = false }) => {
  const [badges, setBadges] = useState<ScrollBadge[]>([]);
  const [filteredBadges, setFilteredBadges] = useState<ScrollBadge[]>([]);
  const [selectedBadge, setSelectedBadge] = useState<ScrollBadge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BadgeFilter>({});
  const [sortBy, setSortBy] = useState<'completionDate' | 'grade'>('completionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [badges, searchQuery, filters, sortBy, sortOrder]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scrollbadge/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...badges];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(badge =>
        badge.courseName.toLowerCase().includes(query) ||
        badge.credentialType.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.credentialType) {
      filtered = filtered.filter(badge => badge.credentialType === filters.credentialType);
    }

    if (filters.courseId) {
      filtered = filtered.filter(badge => badge.courseId === filters.courseId);
    }

    if (filters.minGrade !== undefined) {
      filtered = filtered.filter(badge => badge.grade >= filters.minGrade!);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'completionDate') {
        comparison = new Date(a.completionDate).getTime() - new Date(b.completionDate).getTime();
      } else if (sortBy === 'grade') {
        comparison = a.grade - b.grade;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredBadges(filtered);
  };

  const handleBadgeClick = (badge: ScrollBadge) => {
    setSelectedBadge(badge);
    setIsModalOpen(true);
  };

  const handleFilterChange = (newFilters: BadgeFilter) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getCredentialTypeColor = (type: BadgeCredentialType): string => {
    const colors: Record<BadgeCredentialType, string> = {
      [BadgeCredentialType.COURSE_COMPLETION]: 'bg-blue-500',
      [BadgeCredentialType.SKILL_MASTERY]: 'bg-purple-500',
      [BadgeCredentialType.DEGREE_COMPLETION]: 'bg-gold-500',
      [BadgeCredentialType.CERTIFICATE]: 'bg-green-500',
      [BadgeCredentialType.SPECIALIZATION]: 'bg-indigo-500',
      [BadgeCredentialType.ACHIEVEMENT]: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Award className="h-12 w-12 animate-pulse text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Badge Collection
          </h2>
          <p className="text-muted-foreground mt-1">
            {filteredBadges.length} of {badges.length} badges
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <BadgeStats badges={badges} />

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search badges by course name or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completionDate">Date</SelectItem>
                  <SelectItem value="grade">Grade</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest</SelectItem>
                  <SelectItem value="asc">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filters */}
            <BadgeFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>
        </CardContent>
      </Card>

      {/* Badge Grid/List */}
      {filteredBadges.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No badges found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? 'Try adjusting your search or filters'
                  : 'Complete courses to earn your first badge!'}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button onClick={handleClearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              viewMode={viewMode}
              onClick={() => handleBadgeClick(badge)}
              isOwnProfile={isOwnProfile}
            />
          ))}
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBadge(null);
          }}
          isOwnProfile={isOwnProfile}
          onBadgeUpdated={fetchBadges}
        />
      )}
    </div>
  );
};
