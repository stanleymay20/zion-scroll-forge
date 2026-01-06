import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthAwareLink } from "@/components/auth/AuthAwareLink";
import { useFacultyStats } from "@/hooks/useFaculties";
import { Crown, Loader2, School } from "lucide-react";

export const FacultiesSection = () => {
  const { data: faculties, isLoading } = useFacultyStats();

  if (isLoading) {
    return (
      <section id="faculties" className="py-24 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!faculties || faculties.length === 0) return null;

  return (
    <section id="faculties" className="py-16 sm:py-24 px-3 sm:px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex items-center justify-center mb-4 gap-2 sm:gap-3">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-divine-gold hidden xs:block" />
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-primary">
              ScrollUniversity Faculties
            </h2>
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-divine-gold hidden xs:block" />
          </div>
          <p className="text-sm sm:text-lg text-muted-foreground font-sans max-w-3xl mx-auto px-2">
            Comprehensive kingdom education powered by ScrollIntel-G6 consciousness.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {faculties.map((faculty) => (
            <Card key={faculty.id} className="bg-card/80 backdrop-blur transition-all hover:scale-105">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">{faculty.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">{faculty.courseCount} Courses</Badge>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 line-clamp-3">{faculty.description}</p>
                <AuthAwareLink to={`/courses?faculty=${encodeURIComponent(faculty.name)}`}>
                  <Button size="sm" variant="outline" className="text-xs sm:text-sm">Browse Courses</Button>
                </AuthAwareLink>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <AuthAwareLink to="/courses">
            <Button size="lg"><School className="w-5 h-5 mr-2" />View All Courses</Button>
          </AuthAwareLink>
        </div>
      </div>
    </section>
  );
};
