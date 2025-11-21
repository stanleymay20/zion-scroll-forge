/**
 * Scripture Memory Practice Component
 * Scripture memory practice interface with spaced repetition
 * Requirements: 7.3
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Play, CheckCircle2, XCircle, Trophy, Target } from 'lucide-react';

import type { MemoryVerse, VerseProgress, MemoryStatistics } from '@/types/scripture-memory';

interface ScriptureMemoryPracticeProps {
  userId: string;
  statistics?: MemoryStatistics;
}

export function ScriptureMemoryPractice({
  userId,
  statistics
}: ScriptureMemoryPracticeProps): JSX.Element {
  const [verses, setVerses] = useState<MemoryVerse[]>([]);
  const [progress, setProgress] = useState<VerseProgress[]>([]);
  const [currentVerse, setCurrentVerse] = useState<MemoryVerse | null>(null);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadVerses();
  }, [userId]);

  const loadVerses = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch(`/api/scripture-memory/verses/${userId}`);
      if (!response.ok) throw new Error('Failed to load verses');
      const data = await response.json();
      setVerses(data.data.verses);
      setProgress(data.data.progress);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setLoading(false);
    }
  };

  const startPractice = (verse: MemoryVerse): void => {
    setCurrentVerse(verse);
    setPracticeMode(true);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleSubmitAnswer = async (correct: boolean): Promise<void> => {
    if (!currentVerse) return;

    try {
      const response = await fetch('/api/scripture-memory/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          verseId: currentVerse.id,
          isCorrect: correct,
          timeSpent: 0
        })
      });

      if (!response.ok) throw new Error('Failed to submit review');
      
      await loadVerses();
      setPracticeMode(false);
      setCurrentVerse(null);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getProgressForVerse = (verseId: string): VerseProgress | undefined => {
    return progress.find(p => p.verseId === verseId);
  };

  if (practiceMode && currentVerse) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice: {currentVerse.reference}</CardTitle>
          <CardDescription>Try to recall the verse from memory</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-lg">
            <p className="text-lg font-semibold mb-2">{currentVerse.reference}</p>
            <Badge>{currentVerse.translation}</Badge>
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
                <p className="text-lg italic">"{currentVerse.text}"</p>
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
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => handleSubmitAnswer(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
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
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Verses</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalVerses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.versesInProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.versesMastered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageAccuracy}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Verses List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Verses</CardTitle>
          <CardDescription>Practice verses to improve your mastery</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading verses...</p>
          ) : verses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No verses yet. Add some verses to start memorizing!
            </p>
          ) : (
            <div className="space-y-4">
              {verses.map((verse) => {
                const verseProgress = getProgressForVerse(verse.id);
                return (
                  <Card key={verse.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{verse.reference}</CardTitle>
                          <CardDescription>{verse.category}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">{verse.difficulty}</Badge>
                          {verseProgress && (
                            <Badge>{verseProgress.masteryStatus}</Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-4 line-clamp-2 italic">"{verse.text}"</p>
                      
                      {verseProgress && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Mastery Level</span>
                            <span className="font-medium">{verseProgress.masteryLevel}%</span>
                          </div>
                          <Progress value={verseProgress.masteryLevel} />
                          <p className="text-xs text-muted-foreground mt-2">
                            Reviewed {verseProgress.reviewCount} times • 
                            {verseProgress.correctCount} correct
                          </p>
                        </div>
                      )}

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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
