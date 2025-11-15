import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFaculties } from '@/hooks/useFaculties';
import { useNavigate } from 'react-router-dom';
import { Loader2, GraduationCap, BookOpen, Users } from 'lucide-react';

console.info('✝️ Faculties Page — Christ is Lord over all learning');

export default function Faculties() {
  const { data: faculties, isLoading } = useFaculties();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <PageTemplate title="Faculties" description="Explore our academic faculties">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Academic Faculties"
      description="Explore our diverse range of academic faculties and programs"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {faculties?.map((faculty: any) => (
          <Card key={faculty.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {faculty.emblem_url && (
                <div className="flex justify-center mb-4">
                  <img 
                    src={faculty.emblem_url} 
                    alt={`${faculty.name} emblem`}
                    className="h-20 w-20 object-contain"
                  />
                </div>
              )}
              <CardTitle className="text-lg sm:text-xl">{faculty.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {faculty.description || 'Excellence in education'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {faculty.key_scripture && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs italic text-muted-foreground">{faculty.key_scripture}</p>
                </div>
              )}
              
              {faculty.mission && (
                <p className="text-sm text-muted-foreground line-clamp-3">{faculty.mission}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {faculty.faculty_code && (
                  <Badge variant="outline">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    {faculty.faculty_code}
                  </Badge>
                )}
              </div>

              <Button 
                className="w-full" 
                onClick={() => navigate(`/courses?faculty=${faculty.id}`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Courses
              </Button>
            </CardContent>
          </Card>
        ))}

        {!faculties || faculties.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No faculties available yet.</p>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
