/**
 * Study Group List Component
 * Displays available study groups with filtering - Using Supabase directly
 */

import React, { useState, useEffect } from 'react';
import { Search, Users, Calendar, Tag, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  maxMembers: number;
  isPrivate: boolean;
  isMember: boolean;
  tags: string[];
  meetingSchedule?: {
    frequency: string;
    dayOfWeek?: number;
    time?: string;
  };
}

interface StudyGroupListProps {
  onSelectGroup?: (group: StudyGroup) => void;
  onCreateGroup?: () => void;
}

export const StudyGroupList: React.FC<StudyGroupListProps> = ({
  onSelectGroup,
  onCreateGroup
}) => {
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchGroups();
  }, [searchQuery, selectedTags, user]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // Study groups - using empty state for now
      console.log('Fetching study groups...');
      
      // Mock data for display
      const mockGroups: StudyGroup[] = [];
      setGroups(mockGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Future: Implement actual Supabase query when study_groups table is available
  const fetchGroupsFromSupabase = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .select('*, study_group_members(*)');

      if (error) {
        console.log('Study groups not available:', error.message);
        setGroups([]);
        return;
      }

      const mappedGroups: StudyGroup[] = (data || []).map((group: any) => ({
        id: group.id,
        name: group.name,
        description: group.description || '',
        memberCount: group.study_group_members?.length || 0,
        maxMembers: group.max_members || 10,
        isPrivate: group.is_private || false,
        isMember: user ? group.study_group_members?.some((m: any) => m.user_id === user.id) : false,
        tags: group.tags || [],
        meetingSchedule: group.meeting_schedule
      }));

      let filteredGroups = mappedGroups;
      if (selectedTags.length > 0) {
        filteredGroups = mappedGroups.filter(g => 
          selectedTags.some(tag => g.tags.includes(tag))
        );
      }

      setGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to join study groups',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'You have joined the study group'
      });

      fetchGroups();
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to join study group',
        variant: 'destructive'
      });
    }
  };

  const formatMeetingSchedule = (schedule: any) => {
    if (!schedule) return 'No scheduled meetings';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = schedule.dayOfWeek !== undefined ? days[schedule.dayOfWeek] : '';
    
    return `${schedule.frequency || 'Weekly'} ${day ? `on ${day}` : ''} ${schedule.time ? `at ${schedule.time}` : ''}`;
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
        {onCreateGroup && (
          <Button onClick={onCreateGroup}>
            <Users className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        )}
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
            onClick={() => onSelectGroup?.(group)}
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
          {!searchQuery && onCreateGroup && (
            <Button onClick={onCreateGroup} className="mt-4">
              Create Study Group
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
