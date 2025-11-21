import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BookMarked, Plus, CheckCircle, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

console.info("✝️ Scripture Memory — Christ governs Word retention");

export default function ScriptureMemory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newVerse, setNewVerse] = useState({ reference: "", text: "" });

  const { data: verses, isLoading } = useQuery({
    queryKey: ["scripture-memory", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scripture_memory")
        .select("*")
        .eq("user_id", user!.id)
        .order("memorized_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addVerse = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("scripture_memory")
        .insert({
          user_id: user!.id,
          verse_reference: newVerse.reference,
          verse_text: newVerse.text,
        });

      if (error) throw error;

      // Award ScrollCoins
      await supabase.rpc("earn_scrollcoin", {
        p_user_id: user!.id,
        p_amount: 15,
        p_desc: "Scripture memorized",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripture-memory"] });
      setNewVerse({ reference: "", text: "" });
      toast({ title: "✅ Verse added! +15 ScrollCoins" });
    },
  });

  const reviewVerse = useMutation({
    mutationFn: async (verseId: string) => {
      const { error } = await supabase
        .from("scripture_memory")
        .update({
          last_reviewed_at: new Date().toISOString(),
          review_count: (verses?.find((v: any) => v.id === verseId)?.review_count || 0) + 1,
          mastery_level: Math.min(
            (verses?.find((v: any) => v.id === verseId)?.mastery_level || 0) + 10,
            100
          ),
        })
        .eq("id", verseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scripture-memory"] });
      toast({ title: "✅ Review recorded!" });
    },
  });

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 50) return "bg-yellow-500";
    return "bg-gray-500";
  };

  return (
    <PageTemplate title="Scripture Memory" description="Hide God's Word in your heart">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add New Verse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Verse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reference (e.g., John 3:16)</label>
              <Input
                value={newVerse.reference}
                onChange={(e) => setNewVerse({ ...newVerse, reference: e.target.value })}
                placeholder="Book Chapter:Verse"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Verse Text</label>
              <Input
                value={newVerse.text}
                onChange={(e) => setNewVerse({ ...newVerse, text: e.target.value })}
                placeholder="Enter the full verse text..."
              />
            </div>
            <Button
              onClick={() => addVerse.mutate()}
              disabled={!newVerse.reference || !newVerse.text || addVerse.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Verse
            </Button>
          </CardContent>
        </Card>

        {/* Verses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookMarked className="h-5 w-5" />
              My Verses ({verses?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading verses...</p>
              ) : verses?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No verses yet. Add your first one above!</p>
              ) : (
                verses?.map((verse: any) => (
                  <div key={verse.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-primary">{verse.verse_reference}</h4>
                        <p className="text-sm mt-2">{verse.verse_text}</p>
                      </div>
                      <Badge variant="outline" className="ml-2">
                        {verse.review_count} reviews
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Mastery Level</span>
                          <span className="text-xs font-medium">{verse.mastery_level}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getMasteryColor(verse.mastery_level)}`}
                            style={{ width: `${verse.mastery_level}%` }}
                          />
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reviewVerse.mutate(verse.id)}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Review
                      </Button>
                    </div>

                    {verse.last_reviewed_at && (
                      <p className="text-xs text-muted-foreground">
                        Last reviewed {formatDistanceToNow(new Date(verse.last_reviewed_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
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

