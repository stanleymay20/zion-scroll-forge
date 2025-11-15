import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useInstitution } from "@/contexts/InstitutionContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, Sparkles } from "lucide-react";

console.info("✝️ Daily Devotion — Christ governs every morning");

const devotions = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    title: "Walk by Faith",
    scripture: "2 Corinthians 5:7",
    verse: "For we walk by faith, not by sight.",
    reflection: "In our academic journey at ScrollUniversity, we often seek visible proof of progress. Yet God calls us to trust Him even when we cannot see the full picture. Today, surrender your studies, your career path, and your future to His sovereign will.",
    prayer: "Lord, help me trust You completely, even when the path ahead is unclear. Guide my steps in both academics and life.",
    application: "Choose one area of uncertainty in your studies today and commit it to prayer before taking action."
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    title: "The Mind of Christ",
    scripture: "Philippians 2:5",
    verse: "Let this mind be in you which was also in Christ Jesus.",
    reflection: "As you engage with knowledge at ScrollUniversity, remember that true wisdom comes from having the mind of Christ. Humility, servanthood, and love should characterize how we learn and interact with others.",
    prayer: "Father, renew my mind daily. Help me think with wisdom, love with compassion, and serve with humility.",
    application: "Practice humility today by helping a fellow student or acknowledging something you don't know."
  },
  {
    id: "3",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    title: "Seek First the Kingdom",
    scripture: "Matthew 6:33",
    verse: "But seek first the kingdom of God and His righteousness, and all these things shall be added to you.",
    reflection: "Your education is important, but it must never take priority over your relationship with God. When we prioritize Him, everything else falls into divine order.",
    prayer: "Lord, help me put You first in all things. Let my studies glorify You and advance Your kingdom.",
    application: "Before starting your coursework today, spend 10 minutes in prayer and Scripture reading."
  }
];

export default function DailyDevotion() {
  const { activeInstitution } = useInstitution();

  return (
    <PageTemplate title="Daily Devotion" description="Start your day with God's Word">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6 mt-6">
            {devotions.slice(0, 1).map((devotion) => (
              <Card key={devotion.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{devotion.title}</CardTitle>
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">{devotion.date}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scripture */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Scripture
                    </h3>
                    <p className="text-sm text-muted-foreground">{devotion.scripture}</p>
                    <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                      "{devotion.verse}"
                    </blockquote>
                  </div>

                  {/* Reflection */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Reflection</h3>
                    <p className="text-muted-foreground leading-relaxed">{devotion.reflection}</p>
                  </div>

                  {/* Prayer */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Prayer
                    </h3>
                    <p className="text-muted-foreground italic">{devotion.prayer}</p>
                  </div>

                  {/* Application */}
                  <div className="space-y-2 bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold">Today's Application</h3>
                    <p className="text-sm">{devotion.application}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="archive" className="space-y-4 mt-6">
            {devotions.slice(1).map((devotion) => (
              <Card key={devotion.id}>
                <CardHeader>
                  <CardTitle>{devotion.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{devotion.date}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{devotion.reflection}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No favorites yet. Tap the heart icon on any devotion to save it here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTemplate>
  );
}
