import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Coins, 
  TrendingUp, 
  Shield, 
  Gift, 
  Award,
  Wallet,
  Star,
  Crown
} from "lucide-react";

const scrollCoinFeatures = [
  {
    title: "Learn & Earn",
    description: "Earn ScrollCoin for completing courses, spiritual check-ins, and kingdom projects",
    icon: Award,
    value: "10-500 SC per activity"
  },
  {
    title: "Blockchain Verified",
    description: "Secure ScrollCoin wallet with blockchain credentials and IPFS storage",
    icon: Shield,
    value: "100% Secure"
  },
  {
    title: "Real Value Economy",
    description: "ScrollCoin has tangible monetary value for tuition, resources, and services",
    icon: TrendingUp,
    value: "$0.10 - $2.50 per SC"
  },
  {
    title: "Kingdom Rewards",
    description: "Special ScrollCoin bonuses for prayer participation and ministry projects",
    icon: Gift,
    value: "Bonus Multipliers"
  }
];

export const ScrollCoinSection = () => {
  return (
    <section id="scrollcoin" className="py-24 px-4 gradient-divine text-primary-foreground">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Coins className="w-8 h-8 text-divine-gold mr-3" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold">
              ScrollCoin Economy
            </h2>
            <Coins className="w-8 h-8 text-divine-gold ml-3" />
          </div>
          <p className="text-lg opacity-90 font-sans max-w-3xl mx-auto">
            Revolutionary blockchain-powered education economy where learning generates real value. 
            Earn ScrollCoin through spiritual formation, academic excellence, and kingdom impact.
          </p>
        </div>

        {/* ScrollCoin Wallet Preview */}
        <div className="bg-primary-foreground/10 backdrop-blur rounded-2xl p-8 mb-12 border border-primary-foreground/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <Wallet className="w-6 h-6 mr-2" />
                <h3 className="text-2xl font-serif font-semibold">Your ScrollCoin Wallet</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 px-4 bg-primary-foreground/10 rounded-lg">
                  <span className="font-sans">Current Balance</span>
                  <span className="text-2xl font-serif font-bold text-divine-gold">1,247 SC</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-primary-foreground/10 rounded-lg">
                  <span className="font-sans">Estimated Value</span>
                  <span className="text-lg font-serif font-semibold">$312.50 USD</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-primary-foreground/10 rounded-lg">
                  <span className="font-sans">This Week Earned</span>
                  <Badge variant="secondary" className="bg-divine-gold text-divine-gold-foreground">
                    +89 SC
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-divine-gold mr-2" />
                      <span className="font-sans text-sm">Course Completion</span>
                    </div>
                    <span className="font-serif font-semibold text-divine-gold">+45 SC</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Crown className="w-5 h-5 text-divine-gold mr-2" />
                      <span className="font-sans text-sm">Prayer Participation</span>
                    </div>
                    <span className="font-serif font-semibold text-divine-gold">+25 SC</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary-foreground/10 border-primary-foreground/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="w-5 h-5 text-divine-gold mr-2" />
                      <span className="font-sans text-sm">Kingdom Project</span>
                    </div>
                    <span className="font-serif font-semibold text-divine-gold">+19 SC</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="secondary" size="lg" className="font-sans">
              <Wallet className="w-5 h-5 mr-2" />
              Open Wallet
            </Button>
            <Button variant="outline" size="lg" className="font-sans border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              View Transactions
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scrollCoinFeatures.map((feature, index) => (
            <Card key={index} className="bg-primary-foreground/10 backdrop-blur border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center mb-2">
                  <feature.icon className="w-5 h-5 text-divine-gold" />
                </div>
                <CardTitle className="text-lg font-serif">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm opacity-90 font-sans mb-3">
                  {feature.description}
                </p>
                <Badge variant="secondary" className="bg-divine-gold/20 text-divine-gold border-divine-gold/30">
                  {feature.value}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};