/**
 * Study Group List Component
 * Displays available study groups with filtering
 */

import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Tag, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StudyGroupWithMembers, StudyGroupStatus } from '@/types/study-group';
import { useToast } from '@/hooks/use-toast';

interface StudyGroupListProps {
  onSelectGroup: (group: StudyGroupWithMembers) => void;
  onCreateGroup: () => void;
}

export const StudyGroupList: React.FC<StudyGroupListProps> = ({
  onSelectGroup,
  onCreateGroup
}) => {
  const [groups, setGroups] = useState<StudyGroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, [searchQuery, selectedTags]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      
      if (selectedTags.length > 0) {
        params.append('tags', selectedTags.join(','));
      }

      const response = await fetch(
        `/api/study-groups${searchQuery ? '/search' : ''}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch study groups');

      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study groups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const response = await fetch(`/api/study-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to join group');

      toast({
        title: 'Success',
        description: 'You have joined the study group'
      });

      fetchGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: 'Failed to join study group',
        variant: 'destructive'
      });
    }
  };

  const formatMeetingSchedule = (schedule: any) => {
    if (!schedule) return 'No scheduled meetings';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = schedule.dayOfWeek !== undefined ? days[schedule.dayOfWeek] : '';
    
    return `${schedule.frequency} ${day ? `on ${day}` : ''} ${schedule.time ? `at ${schedule.time}` : ''}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">
            "As iron sharpens iron, so one person sharpens another" - Proverbs 27:17
          </p>
        </div>
        <Button onClick={onCreateGroup}>
          <Users className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <Card
            key={group.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onSelectGroup(group)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {group.description}
                  </CardDescription>
                </div>
                {group.isPrivate && (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Members */}
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>
                  {group.memberCount} / {group.maxMembers} members
                </span>
              </div>

              {/* Meeting Schedule */}
              {group.meetingSchedule && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{formatMeetingSchedule(group.meetingSchedule)}</span>
                </div>
              )}

              {/* Tags */}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {group.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                  {group.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {group.isMember ? (
                  <Button variant="secondary" className="w-full" size="sm">
                    View Group
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={(e) => handleJoinGroup(group.id, e)}
                    disabled={group.memberCount >= group.maxMembers}
                  >
                    {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No study groups found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Be the first to create a study group!'}
          </p>
          {!searchQuery && (
            <Button onClick={onCreateGroup} className="mt-4">
              Create Study Group
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
