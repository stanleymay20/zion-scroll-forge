/**
 * Prayer Journal Component
 * Prayer journal with entry management
 * Requirements: 7.2
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, Plus, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

import type { PrayerEntry, PrayerCategory, PrayerAnalytics } from '@/types/prayer';

interface PrayerJournalProps {
  userId: string;
  initialEntries?: PrayerEntry[];
  analytics?: PrayerAnalytics;
}

export function PrayerJournal({
  userId,
  initialEntries = [],
  analytics
}: PrayerJournalProps): JSX.Element {
  const [entries, setEntries] = useState<PrayerEntry[]>(initialEntries);
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<{
    title: string;
    content: string;
    category: PrayerCategory;
    isPrivate: boolean;
    tags: string[];
  }>({
    title: '',
    content: '',
    category: 'thanksgiving' as PrayerCategory,
    isPrivate: true,
    tags: []
  });

  // Load entries
  useEffect(() => {
    loadEntries();
  }, [userId]);

  const loadEntries = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/prayer/entries/${userId}`);
      if (!response.ok) throw new Error('Failed to load entries');
      const data = await response.json();
      setEntries(data.data);
    } catch (error) {
      console.error('Error loading prayer entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/prayer/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEntry, userId })
      });

      if (!response.ok) throw new Error('Failed to create entry');
      
      await loadEntries();
      setIsDialogOpen(false);
      setNewEntry({
        title: '',
        content: '',
        category: 'thanksgiving' as PrayerCategory,
        isPrivate: true,
        tags: []
      });
    } catch (error) {
      console.error('Error creating prayer entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAnswered = async (entryId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/prayer/entries/${entryId}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answered: true, answeredDate: new Date() })
      });

      if (!response.ok) throw new Error('Failed to mark as answered');
      await loadEntries();
    } catch (error) {
      console.error('Error marking prayer as answered:', error);
    }
  };

  const activeEntries = entries.filter(e => !e.answered);
  const answeredEntries = entries.filter(e => e.answered);

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prayers</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalPrayers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activePrayers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answered</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.answeredPrayers}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.answerRate}% answer rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Longest: {analytics.longestStreak} days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prayer Journal</CardTitle>
              <CardDescription>Record and track your prayers</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Prayer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Prayer Entry</DialogTitle>
                  <DialogDescription>
                    Record a new prayer request or thanksgiving
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder="Prayer title..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newEntry.category}
                      onValueChange={(value) => setNewEntry({ ...newEntry, category: value as PrayerCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="ministry">Ministry</SelectItem>
                        <SelectItem value="healing">Healing</SelectItem>
                        <SelectItem value="guidance">Guidance</SelectItem>
                        <SelectItem value="provision">Provision</SelectItem>
                        <SelectItem value="salvation">Salvation</SelectItem>
                        <SelectItem value="thanksgiving">Thanksgiving</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prayer</label>
                    <Textarea
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      placeholder="Write your prayer..."
                      rows={6}
                    />
                  </div>
                  <Button onClick={handleCreateEntry} disabled={loading} className="w-full">
                    {loading ? 'Saving...' : 'Save Prayer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activeEntries.length})</TabsTrigger>
              <TabsTrigger value="answered">Answered ({answeredEntries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-4">
              {activeEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No active prayers. Click "New Prayer" to add one.
                </p>
              ) : (
                activeEntries.map((entry) => (
                  <Card key={entry.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          <CardDescription>
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge>{entry.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4">{entry.content}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAnswered(entry.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark as Answered
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="answered" className="space-y-4 mt-4">
              {answeredEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No answered prayers yet.
                </p>
              ) : (
                answeredEntries.map((entry) => (
                  <Card key={entry.id} className="bg-green-50 dark:bg-green-950">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{entry.title}</CardTitle>
                          <CardDescription>
                            Answered on {entry.answeredDate && new Date(entry.answeredDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Answered
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{entry.content}</p>
                      {entry.testimony && (
                        <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded">
                          <p className="text-sm font-medium mb-1">Testimony:</p>
                          <p className="text-sm">{entry.testimony}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
