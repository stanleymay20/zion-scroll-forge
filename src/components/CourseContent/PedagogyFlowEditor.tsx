import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Zap, Download, Eye, Play, MessageCircle, Target } from 'lucide-react';

interface LessonStep {
  name: string;
  description: string;
  icon: any;
  content: string;
  required: boolean;
}

interface PedagogyFlowEditorProps {
  lessonId: string;
  onSave?: (lessonFlow: any) => void;
  onValidate?: () => void;
}

export const PedagogyFlowEditor: React.FC<PedagogyFlowEditorProps> = ({
  lessonId,
  onSave,
  onValidate
}) => {
  const [lessonSteps, setLessonSteps] = useState<LessonStep[]>([
    {
      name: 'Ignition',
      description: 'Hook + Revelation Trigger - A story, question, scripture, or scenario that wakes the mind and spirit',
      icon: Zap,
      content: '',
      required: true
    },
    {
      name: 'Download',
      description: 'Concept Teaching - Clear explanation of key concepts with examples, analogies, and diagrams',
      icon: Download,
      content: '',
      required: true
    },
    {
      name: 'Demonstration',
      description: 'Worked Example - Concrete application showing how to apply the concept',
      icon: Eye,
      content: '',
      required: true
    },
    {
      name: 'Activation',
      description: 'Student Practice - Student does something: solves a problem, designs a system, writes a reflection',
      icon: Play,
      content: '',
      required: true
    },
    {
      name: 'Reflection',
      description: 'Identity & Integration - Questions connecting what they learned, who they are, and what they\'re called to transform',
      icon: MessageCircle,
      content: '',
      required: true
    },
    {
      name: 'Commission',
      description: 'Next Step / Assignment - A clear "go and do" action: complete quiz, ship a feature, apply in workplace',
      icon: Target,
      content: '',
      required: true
    }
  ]);

  const [validationResults, setValidationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updateStepContent = (index: number, content: string) => {
    const updated = [...lessonSteps];
    updated[index].content = content;
    setLessonSteps(updated);
  };

  const runValidation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock validation results
      const results = {
        hasIgnition: lessonSteps[0].content.length > 0,
        hasDownload: lessonSteps[1].content.length > 0,
        hasDemonstration: lessonSteps[2].content.length > 0,
        hasActivation: lessonSteps[3].content.length > 0,
        hasReflection: lessonSteps[4].content.length > 0,
        hasCommission: lessonSteps[5].content.length > 0,
        allStepsPresent: lessonSteps.every(step => step.content.length > 0),
        flowQuality: 85,
        missingSteps: lessonSteps.filter(step => step.content.length === 0).map(step => step.name)
      };

      setValidationResults(results);
      onValidate?.();
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const lessonFlow = {
      lessonId,
      steps: lessonSteps.map(step => ({
        name: step.name,
        content: step.content
      }))
    };
    onSave?.(lessonFlow);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Scroll Pedagogy Flow Editor</CardTitle>
          <CardDescription>
            Design lessons following the 6-step Scroll Pedagogy flow for transformation over information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pedagogy Overview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Scroll Pedagogy Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="font-medium">•</span>
                  <span><strong>Revelation + Reason:</strong> Learning is both spiritual revelation and rational understanding</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">•</span>
                  <span><strong>Transformation over Information:</strong> Measure success by who students become, not just what they know</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">•</span>
                  <span><strong>Progressive Ascension:</strong> Lead students from awareness → understanding → application → governance → impartation</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-medium">•</span>
                  <span><strong>Practice-First:</strong> Every concept must have an exercise, scenario, project, or case</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6-Step Flow */}
          <div className="space-y-4">
            {lessonSteps.map((step, index) => {
              const Icon = step.icon;
              
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            Step {index + 1}: {step.name}
                          </CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {step.description}
                          </CardDescription>
                        </div>
                      </div>
                      {step.required && (
                        <Badge className="bg-blue-600">Required</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={step.content}
                      onChange={(e) => updateStepContent(index, e.target.value)}
                      placeholder={`Enter content for ${step.name} step...`}
                      rows={4}
                      className="w-full"
                    />
                    
                    {/* Step-specific guidance */}
                    <div className="mt-3 p-3 bg-gray-50 border rounded text-sm">
                      <span className="font-medium">Guidance: </span>
                      {index === 0 && 'Start with a compelling story, provocative question, relevant scripture, or real-world scenario'}
                      {index === 1 && 'Provide clear explanations with examples, analogies, and visual aids where appropriate'}
                      {index === 2 && 'Show a concrete example: coding walkthrough, solved equation, business case, or theological exegesis'}
                      {index === 3 && 'Give students something to do: solve a problem, design a system, write a reflection, or pray through a pattern'}
                      {index === 4 && 'Ask questions that connect learning to identity, calling, and transformation goals'}
                      {index === 5 && 'Provide a clear action: complete quiz, ship a feature, apply in workplace, or pray through an area'}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Validation Results */}
          {validationResults && (
            <Card className={validationResults.allStepsPresent ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Validation Results</CardTitle>
                  {validationResults.allStepsPresent ? (
                    <Badge className="bg-green-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      All Steps Present
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-600 flex items-center">
                      <XCircle className="w-4 h-4 mr-2" />
                      Missing Steps
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {lessonSteps.map((step, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded bg-white">
                        <span className="text-sm">{step.name}</span>
                        {validationResults[`has${step.name}`] ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>

                  {validationResults.missingSteps.length > 0 && (
                    <div className="p-3 border border-yellow-300 rounded bg-white">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Missing Steps:</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700">
                        {validationResults.missingSteps.map((step: string, index: number) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 border rounded bg-white">
                    <span className="text-sm font-medium">Flow Quality Score</span>
                    <Badge variant="outline">{validationResults.flowQuality}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Assessment Type Reminder */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">Assessment Distribution Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 border rounded bg-white">
                  <span><strong>Formative:</strong> Low-stakes, frequent feedback</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded bg-white">
                  <span><strong>Summative:</strong> Certify mastery and readiness</span>
                  <Badge variant="outline">Required</Badge>
                </div>
                <div className="flex items-center justify-between p-2 border rounded bg-white">
                  <span><strong>Reflective:</strong> Identity and purpose-based</span>
                  <Badge variant="outline">Required</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progression Level Mapping */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">Revelation Learning Model (5 Levels)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="p-2 border rounded bg-white">
                  <strong>Level 1:</strong> Awareness & Vocabulary
                </div>
                <div className="p-2 border rounded bg-white">
                  <strong>Level 2:</strong> Understanding & Analysis
                </div>
                <div className="p-2 border rounded bg-white">
                  <strong>Level 3:</strong> Application & Problem Solving
                </div>
                <div className="p-2 border rounded bg-white">
                  <strong>Level 4:</strong> System Design & Governance
                </div>
                <div className="p-2 border rounded bg-white">
                  <strong>Level 5:</strong> Multiplication & Teaching Others
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={runValidation} disabled={loading}>
              {loading ? 'Validating...' : 'Validate Flow'}
            </Button>
            <Button onClick={handleSave}>
              Save Lesson Flow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedagogyFlowEditor;
