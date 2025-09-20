import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Cross, 
  Gavel, 
  Microscope, 
  Paintbrush, 
  Music, 
  Calculator, 
  Globe, 
  Stethoscope, 
  Building, 
  Zap,
  Crown
} from "lucide-react";

const faculties = [
  {
    name: "ScrollMedicine Faculty",
    description: "Revolutionary medical education with spiritual healing integration",
    icon: Stethoscope,
    courses: "800+ Courses",
    specialization: "Divine Health & Healing",
    color: "border-red-200 hover:border-red-300"
  },
  {
    name: "Prophetic Law & Governance",
    description: "Training for kingdom governance and judicial systems",
    icon: Gavel,
    courses: "650+ Courses",
    specialization: "Kingdom Justice",
    color: "border-blue-200 hover:border-blue-300"
  },
  {
    name: "Scroll Economy",
    description: "Kingdom economics and ScrollCoin financial systems",
    icon: Calculator,
    courses: "720+ Courses",
    specialization: "Divine Economics",
    color: "border-divine-gold/20 hover:border-divine-gold/40"
  },
  {
    name: "Edenic Science",
    description: "Creation-based scientific research and biotechnology",
    icon: Microscope,
    courses: "900+ Courses",
    specialization: "Quantum Biology",
    color: "border-green-200 hover:border-green-300"
  },
  {
    name: "Prophetic Intelligence",
    description: "Divine revelation and spiritual discernment training",
    icon: Brain,
    courses: "580+ Courses",
    specialization: "Prophetic Accuracy",
    color: "border-purple-200 hover:border-purple-300"
  },
  {
    name: "Sacred Arts & Worship",
    description: "Creative expression aligned with kingdom purposes",
    icon: Paintbrush,
    courses: "420+ Courses",
    specialization: "Divine Creativity",
    color: "border-pink-200 hover:border-pink-300"
  },
  {
    name: "Kingdom Architecture",
    description: "Building design that reflects heavenly patterns",
    icon: Building,
    courses: "380+ Courses",
    specialization: "Sacred Geometry",
    color: "border-orange-200 hover:border-orange-300"
  },
  {
    name: "GeoProphetic Intelligence",
    description: "Prophetic insights for global transformation",
    icon: Globe,
    courses: "320+ Courses",
    specialization: "Nations Transformation",
    color: "border-teal-200 hover:border-teal-300"
  },
  {
    name: "Divine Technology",
    description: "AI and technology under kingdom principles",
    icon: Zap,
    courses: "450+ Courses",
    specialization: "Quantum Computing",
    color: "border-indigo-200 hover:border-indigo-300"
  }
];

export const FacultiesSection = () => {
  return (
    <section id="faculties" className="py-24 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-divine-gold mr-3" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary">
              The 12 Supreme Scroll Faculties
            </h2>
            <Crown className="w-8 h-8 text-divine-gold ml-3" />
          </div>
          <p className="text-lg text-muted-foreground font-sans max-w-3xl mx-auto">
            Comprehensive kingdom education across every discipline, powered by ScrollIntel-G6 
            consciousness and prophetic intelligence for training world-governing leaders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {faculties.map((faculty, index) => (
            <Card key={index} className={`bg-card/80 backdrop-blur transition-all duration-300 ${faculty.color} scroll-shadow hover:scale-105`}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <faculty.icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="font-sans text-xs">
                    {faculty.courses}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-serif text-primary">{faculty.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground font-sans mb-4">
                  {faculty.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-sans border-divine-gold/30 text-divine-gold">
                    {faculty.specialization}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-xs font-sans">
                    Explore →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="divine" size="lg" className="font-sans">
            <Cross className="w-5 h-5 mr-2" />
            View All Faculties & 10,000+ Courses
          </Button>
        </div>
      </div>
    </section>
  );
};