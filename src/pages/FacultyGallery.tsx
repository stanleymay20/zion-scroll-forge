import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFaculties } from '@/hooks/useFaculties';
import { GraduationCap, BookOpen, User, Cross } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyGallery = () => {
  const { data: faculties, isLoading, error } = useFaculties();
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Faculties</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Cross className="h-8 w-8 text-primary" />
            <h1 className="text-5xl font-bold text-foreground font-serif">
              The 12 Supreme Scroll Faculties
            </h1>
            <Cross className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            ✝️ Christ is Lord over all learning — Each faculty represents a divine domain of wisdom,
            governed by Scripture and Spirit-led innovation
          </p>
          {faculties && faculties.length > 0 && (
            <div className="flex items-center justify-center gap-6 pt-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                <GraduationCap className="h-4 w-4 mr-2" />
                {faculties.length} Faculties
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                <BookOpen className="h-4 w-4 mr-2" />
                {faculties.reduce((acc, f) => acc + ((f as any).courseCount || 0), 0)} Courses
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                <User className="h-4 w-4 mr-2" />
                {faculties.filter(f => (f as any).ai_tutors?.length > 0).length} AI Tutors
              </Badge>
            </div>
          )}
        </div>

        {/* Faculty Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : faculties && faculties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {faculties.map((faculty) => {
              const courseCount = (faculty as any).courseCount || 0;
              const aiTutor = (faculty as any).ai_tutors?.[0];

              return (
                <Card
                  key={faculty.id}
                  className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary scroll-shadow"
                  onClick={() => navigate(`/faculties/${faculty.id}`)}
                >
                  {/* Emblem Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
                    {faculty.emblem_url ? (
                      <img
                        src={faculty.emblem_url}
                        alt={`${faculty.name} Emblem`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <GraduationCap className="h-24 w-24 text-primary/20" />
                      </div>
                    )}
                    {/* Overlay with Faculty Code */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground font-mono">
                        {faculty.faculty_code}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-3">
                    <CardTitle className="text-xl font-serif group-hover:text-primary transition-colors">
                      {faculty.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[2.5rem]">
                      {faculty.description || faculty.mission}
                    </CardDescription>

                    {/* Scripture Reference */}
                    {faculty.key_scripture && (
                      <div className="flex items-center gap-2 text-sm text-accent font-medium pt-2 border-t">
                        <Cross className="h-3 w-3" />
                        <span>{faculty.key_scripture}</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* AI Tutor Info */}
                    {aiTutor && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {aiTutor.avatar_image_url ? (
                          <img
                            src={aiTutor.avatar_image_url}
                            alt={aiTutor.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-accent"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-accent" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{aiTutor.name}</p>
                          <p className="text-xs text-muted-foreground">AI Faculty Tutor</p>
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{courseCount} {courseCount === 1 ? 'Course' : 'Courses'}</span>
                      </div>
                      <Badge variant="secondary" className="font-sans">
                        Explore →
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-muted">
            <CardHeader className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Faculties Available</CardTitle>
              <CardDescription>
                Content generation has not been run yet. Visit the Content Generation page to create faculties.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Footer Quote */}
        <div className="text-center pt-8 border-t">
          <p className="text-lg italic text-muted-foreground font-serif max-w-2xl mx-auto">
            "Let Christ be Lord over all learning; wisdom flows from the Spirit, not Babylon"
          </p>
          <p className="text-sm text-muted-foreground mt-2">— ScrollUniversity v3.0 Mission</p>
        </div>
      </div>
    </div>
  );
};

export default FacultyGallery;
