import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookMarked, Check, Plus, Flame } from "lucide-react";

console.info("✝️ Scripture Memory — Christ governs meditation");

const featuredVerses = [
  { reference: "John 3:16", text: "For God so loved the world that He gave His only begotten Son..." },
  { reference: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { reference: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart..." },
  { reference: "Romans 8:28", text: "And we know that all things work together for good..." },
  { reference: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
];

export default function ScriptureMemory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [reviewMode, setReviewMode] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const { data: memoryStats } = useQuery({
    queryKey: ["scripture-memory", user?.id],
    queryFn: async () => {
      // Mock data for now
      return {
        totalVerses: 12,
        masteredVerses: 8,
        streak: 7,
        weeklyGoal: 3,
        weeklyProgress: 2,
      };
    },
    enabled: !!user,
  });

  const addVerse = useMutation({
    mutationFn: async (reference: string) => {
      toast({ title: "📖 Verse added to memory list!" });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripture-memory"] });
    },
  });

  const markReviewed = useMutation({
    mutationFn: async (reference: string) => {
      toast({ title: "✅ Verse reviewed!" });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripture-memory"] });
    },
  });

  return (
    <PageTemplate title="Scripture Memory" description="Hide God's Word in your heart">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Total Verses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{memoryStats?.totalVerses || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Mastered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{memoryStats?.masteredVerses || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">{memoryStats?.streak || 0} days</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weekly Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={((memoryStats?.weeklyProgress || 0) / (memoryStats?.weeklyGoal || 1)) * 100} />
                <p className="text-sm text-muted-foreground">
                  {memoryStats?.weeklyProgress || 0} / {memoryStats?.weeklyGoal || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Review Mode */}
        {reviewMode ? (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Review Session</CardTitle>
                <Badge>{currentVerse + 1} / {featuredVerses.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">{featuredVerses[currentVerse].reference}</h3>
                {revealed ? (
                  <blockquote className="text-lg italic border-l-4 border-primary pl-4">
                    "{featuredVerses[currentVerse].text}"
                  </blockquote>
                ) : (
                  <div className="bg-muted p-8 rounded-lg">
                    <p className="text-muted-foreground">Tap "Reveal" to see the verse</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-center">
                {!revealed ? (
                  <Button onClick={() => setRevealed(true)}>Reveal</Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentVerse < featuredVerses.length - 1) {
                          setCurrentVerse(currentVerse + 1);
                          setRevealed(false);
                        } else {
                          setReviewMode(false);
                          setCurrentVerse(0);
                          setRevealed(false);
                        }
                      }}
                    >
                      {currentVerse < featuredVerses.length - 1 ? "Next" : "Finish"}
                    </Button>
                    <Button onClick={() => markReviewed.mutate(featuredVerses[currentVerse].reference)}>
                      <Check className="mr-2 h-4 w-4" />
                      Mark Reviewed
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Featured Verses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Featured Verses</CardTitle>
                  <Button onClick={() => setReviewMode(true)}>
                    Start Review Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredVerses.map((verse) => (
                  <div key={verse.reference} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">{verse.reference}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{verse.text}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => addVerse.mutate(verse.reference)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageTemplate>
  );
}
