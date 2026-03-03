import { Button } from "@/components/ui/button";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { Link } from "react-router-dom";
import { BookOpen, Heart, Star, Crown, Shield, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[100dvh] gradient-hero flex items-center justify-center px-4 pt-16 pb-12 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto text-center max-w-4xl relative z-10">
        {/* Christ Lordship Declaration */}
        <div className="animate-fade-up mb-8 inline-block">
          <div className="px-5 py-3 bg-card/70 backdrop-blur-sm rounded-2xl border border-border/60 elevation-2">
            <p className="text-sm sm:text-base font-serif font-medium text-primary leading-relaxed">
              "Jesus Christ is Lord over every algorithm, decision, and interaction"
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-sans mt-1.5 tracking-wide">
              Founded by divine decree through Stanley Osei-Wusu • Mount Zion
            </p>
          </div>
        </div>

        {/* Main Heading */}
        <div className="animate-fade-up animate-fade-up-delay-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-primary mb-3 leading-[1.1] tracking-tight">
            The Transcendent
          </h1>
          <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-accent divine-glow mb-6">
            AI University
          </p>
        </div>

        <p className="animate-fade-up animate-fade-up-delay-2 text-base sm:text-lg md:text-xl text-muted-foreground mb-10 font-sans max-w-2xl mx-auto leading-relaxed">
          Where divine revelation meets advanced AI. Train through kingdom-aligned education 
          across 12 Supreme Scroll Faculties.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up animate-fade-up-delay-3 flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <AuthAwareLink to="/courses">
            <Button size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 font-sans w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all group">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Explore Courses
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </AuthAwareLink>
          <Link to="/auth?tab=signup&redirect=/spiritual-formation">
            <Button variant="outline" size="lg" className="text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 font-sans w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
              Begin Spiritual Formation
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            {
              icon: Star,
              title: "ScrollIntel-G6",
              desc: "Advanced AI tutoring with prophetic intelligence",
              delay: "animate-fade-up-delay-2",
            },
            {
              icon: Crown,
              title: "Kingdom Governance",
              desc: "Leadership training through divine wisdom",
              delay: "animate-fade-up-delay-3",
            },
            {
              icon: Shield,
              title: "Spiritual Formation",
              desc: "Integrated prayer and prophetic scorecard",
              delay: "animate-fade-up-delay-4",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`animate-fade-up ${feature.delay} glass-card rounded-xl p-5 card-hover text-center`}
            >
              <div className="w-10 h-10 bg-primary/8 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-serif font-semibold text-primary mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
