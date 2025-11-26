import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Users, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface CourseInfo {
  title: string;
  code: string;
  description: string;
  faculty: Array<{ id: string; name: string; role: string }>;
  credits: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'STRATEGIC';
  prerequisites: string[];
}

interface CourseBuilderProps {
  onSave?: (courseInfo: CourseInfo) => void;
  onCancel?: () => void;
}

export const CourseBuilder: React.FC<CourseBuilderProps> = ({ onSave, onCancel }) => {
  const [courseInfo, setCourseInfo] = useState<CourseInfo>({
    title: '',
    code: '',
    description: '',
    faculty: [],
    credits: 3,
    level: 'INTERMEDIATE',
    prerequisites: []
  });

  const [currentPhase, setCurrentPhase] = useState<string>('PLANNING');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const phases = [
    { id: 'PLANNING', name: 'Planning', icon: BookOpen },
    { id: 'CONTENT_DEVELOPMENT', name: 'Content Development', icon: Users },
    { id: 'PRODUCTION', name: 'Production', icon: Award },
    { id: 'QUALITY_REVIEW', name: 'Quality Review', icon: CheckCircle },
    { id: 'PILOT_TESTING', name: 'Pilot Testing', icon: AlertCircle },
    { id: 'LAUNCH', name: 'Launch', icon: CheckCircle }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate course info
    const errors: string[] = [];
    if (!courseInfo.title) errors.push('Course title is required');
    if (!courseInfo.code) errors.push('Course code is required');
    if (!courseInfo.description) errors.push('Course description is required');
    if (courseInfo.faculty.length === 0) errors.push('At least one faculty member is required');
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);
    onSave?.(courseInfo);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Course Builder</CardTitle>
          <CardDescription>
            Create a new course following ScrollUniversity's elite academic standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Phase Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                const isActive = phase.id === currentPhase;
                const isCompleted = phases.findIndex(p => p.id === currentPhase) > index;
                
                return (
                  <div key={phase.id} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isCompleted
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs mt-2 text-center">{phase.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="faculty">Faculty</TabsTrigger>
                <TabsTrigger value="structure">Structure</TabsTrigger>
                <TabsTrigger value="spiritual">Spiritual Integration</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={courseInfo.title}
                      onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
                      placeholder="e.g., Sacred AI Engineering"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Course Code *</Label>
                    <Input
                      id="code"
                      value={courseInfo.code}
                      onChange={(e) => setCourseInfo({ ...courseInfo, code: e.target.value })}
                      placeholder="e.g., COURSE_001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={courseInfo.description}
                    onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
                    placeholder="Provide a comprehensive description of the course..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="level">Rigor Level *</Label>
                    <Select
                      value={courseInfo.level}
                      onValueChange={(value: any) => setCourseInfo({ ...courseInfo, level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="STRATEGIC">Strategic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      value={courseInfo.credits}
                      onChange={(e) => setCourseInfo({ ...courseInfo, credits: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="faculty" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Faculty Members</Label>
                    <Button type="button" variant="outline" size="sm">
                      Add Faculty
                    </Button>
                  </div>
                  
                  {courseInfo.faculty.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No faculty members added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {courseInfo.faculty.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                          <Button type="button" variant="ghost" size="sm">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="structure" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Course Structure</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure modules, lessons, and assessments according to Course Constitution
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Modules</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">4-12</p>
                        <p className="text-xs text-gray-500">Required range</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Lessons per Module</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">3-10</p>
                        <p className="text-xs text-gray-500">Required range</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Assessment Types</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">3</p>
                        <p className="text-xs text-gray-500">Formative, Summative, Reflective</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="spiritual" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Spiritual Integration</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Ensure Christ-centered biblical integration throughout the course
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Biblical Foundation Required</span>
                      <Badge variant="default">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Worldview Integration</span>
                      <Badge variant="default">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Reflection Questions</span>
                      <Badge variant="default">Required</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Theological Validation</span>
                      <Badge variant="default">Required</Badge>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                <ul className="list-disc list-inside text-red-700 text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Create Course Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseBuilder;
