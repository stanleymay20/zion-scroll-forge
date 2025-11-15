import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Coins, Gift, BookOpen, Trophy, Sparkles } from "lucide-react";

console.info("✝️ Redemption Store — Christ governs rewards");

const storeItems = [
  {
    id: "1",
    name: "Course Discount (10%)",
    description: "Get 10% off any paid course enrollment",
    cost: 500,
    category: "Education",
    icon: BookOpen,
  },
  {
    id: "2",
    name: "Priority AI Tutor Access",
    description: "Skip the queue for AI tutor sessions for 30 days",
    cost: 750,
    category: "Support",
    icon: Sparkles,
  },
  {
    id: "3",
    name: "Custom Certificate Design",
    description: "Personalize your course certificates with premium designs",
    cost: 300,
    category: "Premium",
    icon: Trophy,
  },
  {
    id: "4",
    name: "Course Bundle (3 Courses)",
    description: "Enroll in any 3 courses of your choice",
    cost: 2000,
    category: "Education",
    icon: Gift,
  },
  {
    id: "5",
    name: "Scholarship Application Fee Waiver",
    description: "Apply to any scholarship without the application fee",
    cost: 200,
    category: "Financial",
    icon: Coins,
  },
  {
    id: "6",
    name: "Exclusive Study Materials",
    description: "Access premium study guides and resources",
    cost: 400,
    category: "Education",
    icon: BookOpen,
  },
  {
    id: "7",
    name: "1-on-1 Mentorship Session",
    description: "Schedule a private session with a faculty member",
    cost: 1000,
    category: "Support",
    icon: Sparkles,
  },
  {
    id: "8",
    name: "Premium Profile Badge",
    description: "Display a special badge on your profile for 90 days",
    cost: 150,
    category: "Premium",
    icon: Trophy,
  },
];

export default function RedemptionStore() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: wallet } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const redeemItem = useMutation({
    mutationFn: async (item: typeof storeItems[0]) => {
      if (!wallet || wallet.balance < item.cost) {
        throw new Error("Insufficient ScrollCoin balance");
      }

      const { error } = await supabase.rpc("spend_scrollcoin", {
        p_user_id: user!.id,
        p_amount: item.cost,
        p_desc: `Redeemed: ${item.name}`,
      });

      if (error) throw error;
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast({
        title: "🎁 Item Redeemed!",
        description: `You've successfully redeemed ${item.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = ["All", ...Array.from(new Set(storeItems.map(item => item.category)))];

  const filteredItems = selectedCategory && selectedCategory !== "All"
    ? storeItems.filter(item => item.category === selectedCategory)
    : storeItems;

  return (
    <PageTemplate title="Redemption Store" description="Redeem your ScrollCoins for rewards">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Balance Card */}
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Balance</p>
                  <p className="text-3xl font-bold">{wallet?.balance || 0} ScrollCoins</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => window.location.href = "/scrollcoin"}>
                Earn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category || (!selectedCategory && category === "All") ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category === "All" ? null : category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Store Items */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const canAfford = (wallet?.balance || 0) >= item.cost;

            return (
              <Card key={item.id} className={!canAfford ? "opacity-60" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{item.category}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="font-bold">{item.cost}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => redeemItem.mutate(item)}
                      disabled={!canAfford || redeemItem.isPending}
                    >
                      {canAfford ? "Redeem" : "Not Enough"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageTemplate>
  );
}
