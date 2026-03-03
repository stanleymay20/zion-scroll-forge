/**
 * ScrollGold Section — Landing page economy showcase
 */

import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Gift, Award, ArrowRight } from "lucide-react";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";

const features = [
  {
    icon: Coins,
    title: "Earn Gold",
    desc: "Complete courses, pass quizzes, and engage with the community to earn ScrollGold.",
  },
  {
    icon: TrendingUp,
    title: "Track Progress",
    desc: "Monitor your earnings and learning milestones in real-time.",
  },
  {
    icon: Gift,
    title: "Redeem Rewards",
    desc: "Unlock premium courses, certificates, and exclusive resources.",
  },
  {
    icon: Award,
    title: "Earn Badges",
    desc: "Earn verified credentials and badges for your achievements.",
  },
];

export const ScrollGoldSection = () => {
  return (
    <section id="scrollcoin" className="py-16 sm:py-24 bg-secondary/40">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            Reward System
          </p>
          <h2 className="text-primary mb-4">ScrollGold Economy</h2>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-lg mx-auto">
            Earn rewards for your learning journey. ScrollGold is the divine currency 
            of knowledge and spiritual growth.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10 sm:mb-14">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-fade-up bg-card rounded-xl border border-border/60 p-4 sm:p-5 text-center card-hover"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-serif font-semibold text-sm mb-1.5 text-primary">{feature.title}</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <AuthAwareLink to="/scrollgold-wallet">
            <Button size="lg" className="font-sans bg-accent hover:bg-accent/90 text-accent-foreground shadow-md">
              <Coins className="h-4 w-4 mr-2" />
              Explore ScrollGold
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </AuthAwareLink>
        </div>
      </div>
    </section>
  );
};

export const ScrollCoinSection = ScrollGoldSection;
