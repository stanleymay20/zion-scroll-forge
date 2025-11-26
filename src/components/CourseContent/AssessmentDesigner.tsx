import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckSquare, Briefcase, Mic, Users, Plus, Trash2 } from 'lucide-react';

interface RubricCriterion {
  name: string;
  description: string;
  weight: number;
  levels: Array<{
    name: string;
    description: string;
    points: number;
  }>;
}

interface Assessment {
  moduleId: string;
  type: 'QUIZ' | 'ESSAY' | 'PROJECT' | 'ORAL_DEFENSE' | 'PEER_REVIEW';
  title: string;
  description: string;
  points: number;
  learningObjectives: string[];
  questionCount?: number;
  projectRequirements?: {
    realWorldApplication: boolean;
    measurableImpact: boolean;
    deploymentReadiness: boolean;
  };
  rubricCriteria: RubricCriterion[];
}

interface AssessmentDesignerProps {
  moduleId: string;
  onSave?: (assessment: Assessment) => void;
  onCancel?: () => void;
}

export const AssessmentDesigner: React.FC<AssessmentDesignerProps> = ({
  moduleId,
  onSave,
  onCancel
}) => {
  const [assessment, setAssessment] = useState<Assessment>({
    moduleId,
    type: 'QUIZ',
    title: '',
    description: '',
    points: 100,
    learningObjectives: [''],
    rubricCriteria: []
  });

  const assessmentTypes = [
    { value: 'QUIZ', label: 'Quiz', icon: CheckSquare, description: 'Multiple choice, true/false, short answer' },
    { value: 'ESSAY', label: 'Essay', icon: FileText, description: 'Written response, analysis, reflection' },
    { value: 'PROJECT', label: 'Project', icon: Briefcase, description: 'Real-world application, portfolio piece' },
    { value: 'ORAL_DEFENSE', label: 'Oral Defense', icon: Mic, description: 'Presentation, discussion, demonstration' },
    { value: 'PEER_REVIEW', label: 'Peer Review', icon: Users, description: 'Collaborative evaluation, feedback' }
  ];

  const addLearningObjective = () => {
    setAssessment({
      ...assessment,
      learningObjectives: [...assessment.learningObjectives, '']
    });
  };

  const updateLearningObjective = (index: number, value: string) => {
    const updated = [...assessment.learningObjectives];
    updated[index] = value;
    setAssessment({ ...assessment, learningObjectives: updated });
  };

  const removeLearningObjective = (index: number) => {
    const updated = assessment.learningObjectives.filter((_, i) => i !== index);
    setAssessment({ ...assessment, learningObjectives: updated });
  };

  const addRubricCriterion = () => {
    setAssessment({
      ...assessment,
      rubricCriteria: [
        ...assessment.rubricCriteria,
        {
          name: '',
          description: '',
          weight: 25,
          levels: [
            { name: 'Excellent', description: '', points: 100 },
            { name: 'Good', description: '', points: 85 },
            { name: 'Satisfactory', description: '', points: 70 },
            { name: 'Needs Improvement', description: '', points: 50 }
          ]
        }
      ]
    });
  };

  const updateRubricCriterion = (index: number, field: string, value: any) => {
    const updated = [...assessment.rubricCriteria];
    updated[index] = { ...updated[index], [field]: value };
    setAssessment({ ...assessment, rubricCriteria: updated });
  };

  const removeRubricCriterion = (index: number) => {
    const updated = assessment.rubricCriteria.filter((_, i) => i !== index);
    setAssessment({ ...assessment, rubricCriteria: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(assessment);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Assessment Designer</CardTitle>
          <CardDescription>
            Create rigorous assessments aligned with learning objectives and real-world application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Assessment Type Selection */}
            <div className="space-y-4">
              <Label>Assessment Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {assessmentTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = assessment.type === type.value;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setAssessment({ ...assessment, type: type.value as any })}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <h4 className="font-medium text-sm">{type.label}</h4>
                      <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="objectives">Learning Objectives</TabsTrigger>
                <TabsTrigger value="rubric">Rubric</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Assessment Title *</Label>
                  <Input
                    id="title"
                    value={assessment.title}
                    onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                    placeholder="e.g., Module 1 Quiz: Foundations of AI"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={assessment.description}
                    onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                    placeholder="Describe what this assessment evaluates..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Total Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={assessment.points}
                    onChange={(e) => setAssessment({ ...assessment, points: parseInt(e.target.value) })}
                  />
                </div>

                {assessment.type === 'QUIZ' && (
                  <div className="space-y-2">
                    <Label htmlFor="questionCount">Number of Questions</Label>
                    <Input
                      id="questionCount"
                      type="number"
                      min="1"
                      value={assessment.questionCount || 50}
                      onChange={(e) => setAssessment({ 
                        ...assessment, 
                        questionCount: parseInt(e.target.value) 
                      })}
                    />
                    <p className="text-sm text-gray-500">
                      Minimum 50 questions recommended for comprehensive assessment
                    </p>
                  </div>
                )}

                {assessment.type === 'PROJECT' && (
                  <div className="space-y-4">
                    <Label>Project Requirements</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="realWorld"
                          checked={assessment.projectRequirements?.realWorldApplication || false}
                          onChange={(e) => setAssessment({
                            ...assessment,
                            projectRequirements: {
                              ...assessment.projectRequirements,
                              realWorldApplication: e.target.checked,
                              measurableImpact: assessment.projectRequirements?.measurableImpact || false,
                              deploymentReadiness: assessment.projectRequirements?.deploymentReadiness || false
                            }
                          })}
                          className="rounded"
                        />
                        <label htmlFor="realWorld" className="text-sm">
                          Real-world application required
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="measurable"
                          checked={assessment.projectRequirements?.measurableImpact || false}
                          onChange={(e) => setAssessment({
                            ...assessment,
                            projectRequirements: {
                              ...assessment.projectRequirements,
                              realWorldApplication: assessment.projectRequirements?.realWorldApplication || false,
                              measurableImpact: e.target.checked,
                              deploymentReadiness: assessment.projectRequirements?.deploymentReadiness || false
                            }
                          })}
                          className="rounded"
                        />
                        <label htmlFor="measurable" className="text-sm">
                          Measurable impact criteria
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="deployment"
                          checked={assessment.projectRequirements?.deploymentReadiness || false}
                          onChange={(e) => setAssessment({
                            ...assessment,
                            projectRequirements: {
                              ...assessment.projectRequirements,
                              realWorldApplication: assessment.projectRequirements?.realWorldApplication || false,
                              measurableImpact: assessment.projectRequirements?.measurableImpact || false,
                              deploymentReadiness: e.target.checked
                            }
                          })}
                          className="rounded"
                        />
                        <label htmlFor="deployment" className="text-sm">
                          Deployment readiness assessment
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Learning Objectives *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLearningObjective}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Objective
                  </Button>
                </div>

                <div className="space-y-3">
                  {assessment.learningObjectives.map((objective, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Input
                        value={objective}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        placeholder="e.g., Students will be able to..."
                        className="flex-1"
                      />
                      {assessment.learningObjectives.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLearningObjective(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rubric" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Rubric Criteria</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addRubricCriterion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Criterion
                  </Button>
                </div>

                {assessment.rubricCriteria.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No rubric criteria added yet. Click "Add Criterion" to get started.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessment.rubricCriteria.map((criterion, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={criterion.name}
                                onChange={(e) => updateRubricCriterion(index, 'name', e.target.value)}
                                placeholder="Criterion name"
                              />
                              <Textarea
                                value={criterion.description}
                                onChange={(e) => updateRubricCriterion(index, 'description', e.target.value)}
                                placeholder="Criterion description"
                                rows={2}
                              />
                              <div className="flex items-center space-x-2">
                                <Label className="text-sm">Weight:</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={criterion.weight}
                                  onChange={(e) => updateRubricCriterion(index, 'weight', parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRubricCriterion(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-2">
                            {criterion.levels.map((level, levelIndex) => (
                              <div key={levelIndex} className="p-2 border rounded">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{level.name}</span>
                                  <Badge variant="outline">{level.points}%</Badge>
                                </div>
                                <p className="text-xs text-gray-500">{level.description || 'No description'}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Assessment Distribution</Label>
                    <p className="text-sm text-gray-500 mt-1">
                      Ensure balanced distribution across formative, summative, and reflective types
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Formative</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-500">
                          Low-stakes, frequent feedback
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Summative</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-500">
                          Certify mastery and readiness
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Reflective</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-500">
                          Identity and purpose-based
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Create Assessment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentDesigner;
