/**
 * ScrollGold Section Component
 * Landing page section showcasing the ScrollGold economy
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Gift, Award } from "lucide-react";
import { Link } from "react-router-dom";

export const ScrollGoldSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-amber-900 dark:text-amber-100">
            ScrollGold Economy
          </h2>
          <p className="text-lg text-amber-700 dark:text-amber-300 max-w-2xl mx-auto">
            Earn rewards for your learning journey. ScrollGold is the divine currency 
            of knowledge and spiritual growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Earn Gold</h3>
              <p className="text-sm text-muted-foreground">
                Complete courses, pass quizzes, and engage with the community
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your earnings and spending in real-time
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Redeem Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Unlock premium courses, certificates, and resources
              </p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-white/80 dark:bg-amber-950/30">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-2">Achieve Badges</h3>
              <p className="text-sm text-muted-foreground">
                Earn blockchain-verified credentials and badges
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/scrollgold-wallet">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Coins className="h-5 w-5 mr-2" />
              Explore ScrollGold
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Re-export for backwards compatibility
export const ScrollCoinSection = ScrollGoldSection;
