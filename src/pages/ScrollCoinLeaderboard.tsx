import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Award } from "lucide-react";
import { useScrollCoinLeaderboard } from "@/hooks/useScrollCoinTransactions";

console.info("✝️ ScrollCoin Leaderboard — Faithful stewards honored");

export default function ScrollCoinLeaderboard() {
  const { data: leaderboard, isLoading } = useScrollCoinLeaderboard(50);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-[hsl(var(--scroll-gold))]" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Medal className="h-6 w-6 text-amber-700" />;
    return null;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-[hsl(var(--scroll-gold))]">Gold</Badge>;
    if (index === 1) return <Badge variant="secondary">Silver</Badge>;
    if (index === 2) return <Badge variant="outline">Bronze</Badge>;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageTemplate
      title="ScrollCoin Leaderboard"
      description="Celebrating faithful stewards in the Kingdom economy"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[hsl(var(--scroll-gold))]" />
            Top Earners
          </CardTitle>
          <CardDescription>
            Students with the most ScrollCoins earned through faithful service
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!leaderboard || leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No leaderboard data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    index < 3 ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 font-bold text-lg">
                    {getRankIcon(index) || `#${index + 1}`}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {entry.profile?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {entry.profile?.email || "Unknown User"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRankBadge(index)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[hsl(var(--scroll-gold))]">
                      {entry.balance} SC
                    </p>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
