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

