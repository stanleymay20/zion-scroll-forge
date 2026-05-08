import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, BookOpen } from "lucide-react";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";

export const FinalCTASection = () => {
  return (
    <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-3xl text-center relative">
        <p className="text-xs font-sans font-semibold tracking-[0.25em] uppercase text-accent mb-4">
          Your Calling Awaits
        </p>
        <h2 className="font-serif font-bold text-primary mb-5 text-3xl sm:text-4xl md:text-5xl leading-tight">
          Step into a university built for the
          <span className="italic"> Kingdom Era</span>.
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground font-sans mb-10 max-w-xl mx-auto leading-relaxed">
          Join scroll sons and daughters from every continent. Earn a real degree. Become
          a kingdom-grade leader.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth?tab=signup&redirect=/apply">
            <Button
              size="lg"
              className="text-base px-8 py-6 font-sans w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20 hover:shadow-xl transition-all group"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Begin Your Application
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <AuthAwareLink to="/degrees">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 font-sans w-full sm:w-auto border-primary/25 hover:bg-primary/5 hover:border-primary/50"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              View Degree Programs
            </Button>
          </AuthAwareLink>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-accent/30" />
          <p className="text-[10px] sm:text-xs text-muted-foreground font-sans tracking-[0.3em] uppercase">
            Soli Deo Gloria
          </p>
          <div className="h-px w-12 bg-accent/30" />
        </div>
      </div>
    </section>
  );
};
