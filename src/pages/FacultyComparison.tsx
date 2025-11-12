import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, BookOpen, Brain, Cross, 
  ChevronRight, Check, X 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FacultyComparison = () => {
  const navigate = useNavigate();
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);

  const { data: faculties, isLoading } = useQuery({
    queryKey: ['all-faculties-comparison'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faculties')
        .select(`
          *,
          ai_tutors(*),
          courses(
            id,
            title,
            description,
            level,
            duration,
            course_modules(id)
          )
        `)
        .order('created_at');
      if (error) throw error;
      return data;
    },
  });

  const toggleFaculty = (facultyId: string) => {
    setSelectedFaculties(prev => 
      prev.includes(facultyId)
        ? prev.filter(id => id !== facultyId)
        : prev.length < 4
        ? [...prev, facultyId]
        : prev
    );
  };

  const selectedFacultiesData = faculties?.filter(f => selectedFaculties.includes(f.id));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold mb-2">Faculty Comparison</h1>
        <p className="text-muted-foreground">
          Compare multiple faculties side-by-side to find the perfect fit for your calling
        </p>
      </div>

      {/* Faculty Selection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Faculties to Compare (Max 4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faculties?.map((faculty) => (
              <div
                key={faculty.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedFaculties.includes(faculty.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => toggleFaculty(faculty.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedFaculties.includes(faculty.id)}
                    disabled={!selectedFaculties.includes(faculty.id) && selectedFaculties.length >= 4}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {faculty.emblem_url && (
                        <img
                          src={faculty.emblem_url}
                          alt={faculty.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <h3 className="font-semibold">{faculty.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {faculty.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      {selectedFacultiesData && selectedFacultiesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold w-48">Attribute</th>
                    {selectedFacultiesData.map((faculty) => (
                      <th key={faculty.id} className="text-center p-4 min-w-64">
                        <div className="flex flex-col items-center gap-2">
                          {faculty.emblem_url && (
                            <img
                              src={faculty.emblem_url}
                              alt={faculty.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="font-semibold text-sm">{faculty.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {faculty.faculty_code}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Description */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">Description</td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-sm text-center">
                        {faculty.description}
                      </td>
                    ))}
                  </tr>

                  {/* Courses */}
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Total Courses
                      </div>
                    </td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-center">
                        <Badge variant="secondary" className="text-lg">
                          {faculty.courses?.length || 0}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Modules */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Total Modules
                      </div>
                    </td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-center">
                        <Badge variant="outline" className="text-lg">
                          {faculty.courses?.reduce((sum, c) => sum + (c.course_modules?.length || 0), 0) || 0}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* AI Tutor */}
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Tutor
                      </div>
                    </td>
                    {selectedFacultiesData.map((faculty) => {
                      const tutor = faculty.ai_tutors?.[0];
                      return (
                        <td key={faculty.id} className="p-4">
                          {tutor ? (
                            <div className="flex flex-col items-center gap-2">
                              {tutor.avatar_image_url && (
                                <img
                                  src={tutor.avatar_image_url}
                                  alt={tutor.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              )}
                              <div className="text-sm font-medium">{tutor.name}</div>
                              <div className="text-xs text-muted-foreground">{tutor.specialty}</div>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <X className="h-6 w-6 mx-auto" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Scripture Anchor */}
                  <tr className="border-b">
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Cross className="h-4 w-4" />
                        Scripture Anchor
                      </div>
                    </td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-sm text-center italic">
                        {faculty.key_scripture || '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Mission */}
                  <tr className="border-b bg-muted/30">
                    <td className="p-4 font-medium">Mission</td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-sm text-center">
                        {faculty.mission}
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4 font-medium">Explore</td>
                    {selectedFacultiesData.map((faculty) => (
                      <td key={faculty.id} className="p-4 text-center">
                        <Button
                          onClick={() => navigate(`/faculties/${faculty.id}`)}
                          size="sm"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedFacultiesData && selectedFacultiesData.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Select Faculties to Compare</h3>
            <p className="text-muted-foreground">
              Choose 2-4 faculties above to see a detailed comparison
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FacultyComparison;
