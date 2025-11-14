import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
    <section id="faculties" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-divine-gold mr-3" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">
              ScrollUniversity Faculties
            </h2>
            <Crown className="w-8 h-8 text-divine-gold ml-3" />
          </div>
          <p className="text-lg text-muted-foreground font-sans max-w-3xl mx-auto">
            Comprehensive kingdom education powered by ScrollIntel-G6 consciousness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculties.map((faculty) => (
            <Card key={faculty.id} className="bg-card/80 backdrop-blur transition-all hover:scale-105">
              <CardHeader>
                <CardTitle className="text-lg">{faculty.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">{faculty.courseCount} Courses</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{faculty.description}</p>
                <Link to={`/courses?faculty=${encodeURIComponent(faculty.name)}`}>
                  <Button size="sm" variant="outline">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/courses">
            <Button size="lg"><School className="w-5 h-5 mr-2" />View All Courses</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
