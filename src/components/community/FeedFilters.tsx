/**
 * Feed Filters Component
 * Filter controls for community feed
 */

import React from 'react';
import { PostType, FeedSortOption, FeedFilters as FeedFiltersType } from '@/types/community';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface FeedFiltersProps {
  filters: FeedFiltersType;
  onFilterChange: (filters: Partial<FeedFiltersType>) => void;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({ filters, onFilterChange }) => {
  const hasActiveFilters = filters.type || filters.hashtag;

  const clearFilters = () => {
    onFilterChange({ type: undefined, hashtag: undefined });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="w-4 h-4" />
        <span>Filters:</span>
      </div>

      {/* Sort By */}
      <Select
        value={filters.sortBy}
        onValueChange={(value) => onFilterChange({ sortBy: value as FeedSortOption })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FeedSortOption.RECENT}>Most Recent</SelectItem>
          <SelectItem value={FeedSortOption.POPULAR}>Most Popular</SelectItem>
          <SelectItem value={FeedSortOption.TRENDING}>Trending</SelectItem>
        </SelectContent>
      </Select>

      {/* Post Type */}
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => onFilterChange({ type: value === 'all' ? undefined : value as PostType })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Post type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value={PostType.TEXT}>Text</SelectItem>
          <SelectItem value={PostType.QUESTION}>Questions</SelectItem>
          <SelectItem value={PostType.ANNOUNCEMENT}>Announcements</SelectItem>
          <SelectItem value={PostType.TESTIMONY}>Testimonies</SelectItem>
          <SelectItem value={PostType.PRAYER_REQUEST}>Prayer Requests</SelectItem>
          <SelectItem value={PostType.RESOURCE}>Resources</SelectItem>
        </SelectContent>
      </Select>

      {/* Active Hashtag Filter */}
      {filters.hashtag && (
        <Badge variant="secondary" className="flex items-center gap-1">
          #{filters.hashtag}
          <button
            onClick={() => onFilterChange({ hashtag: undefined })}
            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      )}

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-gray-600"
        >
          Clear all
        </Button>
      )}
    </div>
  );
};
