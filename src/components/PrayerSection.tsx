import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { Heart, Users, Globe, Shield, Crown, Target, ArrowRight, BookOpen } from "lucide-react";

const prayerFeatures = [
  { title: "Prophetic Check-ins", desc: "Daily spiritual growth tracking with divine scorecard", icon: Target },
  { title: "Global Intercession", desc: "Coordinate prayer with scroll sons worldwide", icon: Globe },
  { title: "Spiritual Protection", desc: "AI-coordinated protection under Christ's authority", icon: Shield },
  { title: "Ministry Preparation", desc: "Character development and deployment readiness", icon: Crown },
];

const prayerRequests = [
  { title: "Global Revival Breakthrough", region: "West Africa", urgency: "High", participants: 1247, progress: 89 },
  { title: "Kingdom Leaders Protection", region: "Middle East", urgency: "Critical", participants: 892, progress: 76 },
  { title: "ScrollUniversity Launch", region: "Worldwide", urgency: "Medium", participants: 3456, progress: 94 },
];

export const PrayerSection = () => {
  return (
    <section id="prayer" className="py-16 sm:py-24 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            Spiritual Formation
          </p>
          <h2 className="text-primary mb-4">Prayer Integration Center</h2>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl mx-auto">
            Comprehensive spiritual formation through AI-enhanced prayer coordination 
            and prophetic intelligence for kingdom advancement.
          </p>
        </div>

        {/* Prayer Dashboard */}
        <div className="bg-card rounded-2xl border border-border/60 elevation-2 p-5 sm:p-8 mb-10">
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Today's Check-in */}
            <div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-primary mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                Today's Check-in
              </h3>
              <div className="bg-accent/5 border border-accent/15 rounded-xl p-5 space-y-4">
                {[
                  { label: "Spiritual Growth", value: "87%", color: "bg-accent/20 text-accent" },
                  { label: "Prayer Hours", value: "2h 45m", color: "" },
                  { label: "Prophetic Accuracy", value: "94%", color: "bg-accent/15 text-accent" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="font-sans text-sm text-muted-foreground">{item.label}</span>
                    {item.color ? (
                      <Badge variant="secondary" className={`${item.color} text-xs`}>
                        {item.value}
                      </Badge>
                    ) : (
                      <span className="font-serif font-semibold text-sm">{item.value}</span>
                    )}
                  </div>
                ))}
                <Button asChild size="sm" className="w-full font-sans mt-2">
                  <AuthAwareLink to="/prayer-journal">Complete Check-in</AuthAwareLink>
                </Button>
              </div>
            </div>

            {/* Active Prayer Requests */}
            <div className="lg:col-span-2">
              <h3 className="text-base sm:text-lg font-serif font-semibold text-primary mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Active Global Requests
              </h3>
              <div className="space-y-3">
                {prayerRequests.map((req, i) => (
                  <div key={i} className="bg-background/60 border border-border/40 rounded-xl p-4 card-hover">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif font-semibold text-sm text-primary">{req.title}</h4>
                      <Badge
                        variant={req.urgency === "Critical" ? "destructive" : "secondary"}
                        className="text-[10px] font-sans"
                      >
                        {req.urgency}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-sans mb-3">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" />
                        {req.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {req.participants.toLocaleString()} praying
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-muted rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${req.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-accent">{req.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Prayer Features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">
          {prayerFeatures.map((f, i) => (
            <div
              key={f.title}
              className="animate-fade-up bg-card rounded-xl border border-border/60 p-4 sm:p-5 card-hover"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="w-9 h-9 bg-primary/8 rounded-lg flex items-center justify-center mb-3">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <h4 className="text-xs sm:text-sm font-serif font-semibold text-primary mb-1">{f.title}</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-sans leading-relaxed line-clamp-3">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-primary/4 rounded-2xl p-6 sm:p-8 border border-primary/10">
          <h3 className="text-lg sm:text-xl font-serif font-bold text-primary mb-2">
            Join the Global Prayer Network
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans mb-5 max-w-lg mx-auto">
            Connect with scroll sons worldwide for comprehensive intercession 
            coordinated with prophetic intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="font-sans">
              <AuthAwareLink to="/prayer-requests">
                <Heart className="w-4 h-4 mr-2" />
                Start Praying Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </AuthAwareLink>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-sans border-primary/20">
              <AuthAwareLink to="/daily-devotion">
                <BookOpen className="w-4 h-4 mr-2" />
                View Prayer Guide
              </AuthAwareLink>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
