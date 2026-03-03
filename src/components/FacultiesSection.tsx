import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { useFacultyStats } from "@/hooks/useFaculties";
import { Loader2, School, ArrowRight, BookOpen, Scale, Stethoscope, Landmark, Coins, GraduationCap, Cpu, Wheat, Palette, FlaskConical, Globe, Gavel, Zap } from "lucide-react";

const facultyIcons: Record<string, any> = {
  "Scroll Theology": BookOpen,
  "Scroll Medicine": Stethoscope,
  "Scroll Governance": Landmark,
  "Scroll Economy": Coins,
  "Scroll Education": GraduationCap,
  "Scroll Technology": Cpu,
  "Scroll Agriculture": Wheat,
  "Scroll Arts": Palette,
  "Scroll Science": FlaskConical,
  "Scroll Diplomacy": Globe,
  "Scroll Justice": Gavel,
  "Scroll Energy": Zap,
};

export const FacultiesSection = () => {
  const { data: faculties, isLoading } = useFacultyStats();

  if (isLoading) {
    return (
      <section id="faculties" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
        </div>
      </section>
    );
  }

  if (!faculties || faculties.length === 0) return null;

  // Prioritize the original 12 Supreme Scroll Faculties
  const original12 = [
    "Scroll Theology", "Scroll Medicine", "Scroll Governance", "Scroll Economy",
    "Scroll Education", "Scroll Technology", "Scroll Agriculture", "Scroll Arts",
    "Scroll Science", "Scroll Diplomacy", "Scroll Justice", "Scroll Energy",
  ];
  
  const sorted = [...faculties].sort((a, b) => {
    const ai = original12.indexOf(a.name);
    const bi = original12.indexOf(b.name);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return (b.courseCount || 0) - (a.courseCount || 0);
  });

  // Show original 12 only
  const displayed = sorted.filter(f => original12.includes(f.name));

  return (
    <section id="faculties" className="py-16 sm:py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-accent mb-3">
            12 Supreme Scroll Faculties
          </p>
          <h2 className="text-primary mb-4">Academic Departments</h2>
          <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-xl mx-auto">
            Comprehensive kingdom education spanning theology, science, governance, and the arts.
          </p>
        </div>

        {/* Faculty Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayed.map((faculty, i) => {
            const Icon = facultyIcons[faculty.name] || BookOpen;
            return (
              <AuthAwareLink
                key={faculty.id}
                to={`/courses?faculty=${encodeURIComponent(faculty.name)}`}
                className={`animate-fade-up group`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="h-full bg-card rounded-xl border border-border/60 p-4 sm:p-5 card-hover">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary/8 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/12 transition-colors">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-serif font-semibold text-primary mb-1 leading-snug">
                    {faculty.name.replace("Scroll ", "")}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground font-sans line-clamp-2 mb-2.5 leading-relaxed">
                    {faculty.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-sans">
                      {faculty.courseCount} courses
                    </Badge>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </AuthAwareLink>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 sm:mt-14">
          <AuthAwareLink to="/courses">
            <Button size="lg" variant="outline" className="font-sans border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <School className="w-4 h-4 mr-2" />
              View All Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </AuthAwareLink>
        </div>
      </div>
    </section>
  );
};
