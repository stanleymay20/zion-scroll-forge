/**
 * Scripture Memory Practice Component
 * Scripture memory practice interface with spaced repetition
 * Requirements: 7.3
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, CheckCircle2, XCircle, Trophy, Target, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MemoryVerse {
  id: string;
  verse_reference: string;
  verse_text: string;
  mastery_level: number;
  review_count: number;
  last_reviewed_at?: string;
}

interface ScriptureMemoryPracticeProps {
  userId: string;
  statistics?: {
    totalVerses: number;
    versesInProgress: number;
    versesMastered: number;
    averageAccuracy: number;
  };
}

export function ScriptureMemoryPractice({
  userId,
  statistics
}: ScriptureMemoryPracticeProps): JSX.Element {
  const [currentVerse, setCurrentVerse] = useState<MemoryVerse | null>(null);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Fetch verses from Supabase directly
  const { data: verses, isLoading } = useQuery({
    queryKey: ['scripture-memory', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scripture_memory')
        .select('*')
        .eq('user_id', userId)
        .order('memorized_at', { ascending: false });

      if (error) throw error;
      return data as MemoryVerse[];
    },
    enabled: !!userId,
  });

  // Calculate stats from verses
  const calculatedStats = {
    totalVerses: verses?.length || 0,
    versesInProgress: verses?.filter(v => v.mastery_level < 3).length || 0,
    versesMastered: verses?.filter(v => v.mastery_level >= 3).length || 0,
    averageAccuracy: verses && verses.length > 0 
      ? Math.round(verses.reduce((sum, v) => sum + (v.mastery_level * 25), 0) / verses.length) 
      : 0,
  };

  const displayStats = statistics || calculatedStats;

  // Mutation to update review
  const reviewMutation = useMutation({
    mutationFn: async ({ verseId, isCorrect }: { verseId: string; isCorrect: boolean }) => {
      const verse = verses?.find(v => v.id === verseId);
      if (!verse) throw new Error('Verse not found');

      const newMastery = isCorrect 
        ? Math.min(verse.mastery_level + 1, 5) 
        : Math.max(verse.mastery_level - 1, 0);

      const { error } = await supabase
        .from('scripture_memory')
        .update({
          mastery_level: newMastery,
          review_count: verse.review_count + 1,
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', verseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scripture-memory', userId] });
      toast({
        title: 'Review recorded',
        description: 'Your progress has been saved.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving review',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const startPractice = (verse: MemoryVerse): void => {
    setCurrentVerse(verse);
    setPracticeMode(true);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleSubmitAnswer = async (correct: boolean): Promise<void> => {
    if (!currentVerse) return;

    await reviewMutation.mutateAsync({
      verseId: currentVerse.id,
      isCorrect: correct,
    });

    setPracticeMode(false);
    setCurrentVerse(null);
  };

  if (practiceMode && currentVerse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice: {currentVerse.verse_reference}</CardTitle>
          <CardDescription>Try to recall the verse from memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">{currentVerse.verse_reference}</p>
          </div>

          {!showAnswer ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Type the verse from memory:
                </label>
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type the verse..."
                  className="mb-4"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAnswer(true)} className="flex-1">
                  Show Answer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPracticeMode(false);
                    setCurrentVerse(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 dark:bg-blue-950 p-6 rounded-lg">
                <p className="text-lg italic">"{currentVerse.verse_text}"</p>
              </div>

              {userAnswer && (
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Your Answer:</p>
                  <p className="text-sm">{userAnswer}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-3">How well did you remember it?</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleSubmitAnswer(false)}
                    className="flex-1"
                    disabled={reviewMutation.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={() => handleSubmitAnswer(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={reviewMutation.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Correct
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verses</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.totalVerses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.versesInProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.versesMastered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayStats.averageAccuracy}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Verses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Verses</CardTitle>
              <CardDescription>Practice verses to improve your mastery</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Verse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading verses...</p>
            </div>
          ) : !verses || verses.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No verses yet. Add some verses to start memorizing!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {verses.map((verse) => (
                <Card key={verse.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{verse.verse_reference}</CardTitle>
                        <CardDescription>
                          Reviewed {verse.review_count} times
                        </CardDescription>
                      </div>
                      <Badge variant={verse.mastery_level >= 3 ? 'default' : 'outline'}>
                        Level {verse.mastery_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4 line-clamp-2 italic">"{verse.verse_text}"</p>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Mastery Progress</span>
                        <span className="font-medium">{verse.mastery_level * 20}%</span>
                      </div>
                      <Progress value={verse.mastery_level * 20} />
                    </div>

                    <Button
                      onClick={() => startPractice(verse)}
                      size="sm"
                      className="w-full"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Practice Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
