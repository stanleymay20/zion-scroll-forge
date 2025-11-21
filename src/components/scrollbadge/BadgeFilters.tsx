/**
 * Badge Filters Component
 * "By the Spirit of Excellence, we refine our search"
 * 
 * Component for filtering badges by various criteria
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { BadgeFilter, BadgeCredentialType } from '@/types/scrollbadge';

interface BadgeFiltersProps {
  filters: BadgeFilter;
  onFilterChange: (filters: BadgeFilter) => void;
  onClearFilters: () => void;
}

export const BadgeFilters: React.FC<BadgeFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters
}) => {
  const hasActiveFilters = Object.keys(filters).length > 0;

  const handleCredentialTypeChange = (value: string) => {
    if (value === 'all') {
      const { credentialType, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...filters,
        credentialType: value as BadgeCredentialType
      });
    }
  };

  const handleMinGradeChange = (value: number[]) => {
    if (value[0] === 0) {
      const { minGrade, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...filters,
        minGrade: value[0]
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters</span>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credential Type Filter */}
        <div className="space-y-2">
          <Label>Credential Type</Label>
          <Select
            value={filters.credentialType || 'all'}
            onValueChange={handleCredentialTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value={BadgeCredentialType.COURSE_COMPLETION}>
                Course Completion
              </SelectItem>
              <SelectItem value={BadgeCredentialType.SKILL_MASTERY}>
                Skill Mastery
              </SelectItem>
              <SelectItem value={BadgeCredentialType.DEGREE_COMPLETION}>
                Degree
              </SelectItem>
              <SelectItem value={BadgeCredentialType.CERTIFICATE}>
                Certificate
              </SelectItem>
              <SelectItem value={BadgeCredentialType.SPECIALIZATION}>
                Specialization
              </SelectItem>
              <SelectItem value={BadgeCredentialType.ACHIEVEMENT}>
                Achievement
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Grade Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Minimum Grade</Label>
            <span className="text-sm text-muted-foreground">
              {filters.minGrade || 0}%
            </span>
          </div>
          <Slider
            value={[filters.minGrade || 0]}
            onValueChange={handleMinGradeChange}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
