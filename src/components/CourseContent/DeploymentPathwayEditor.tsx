import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Target, TrendingUp, Users, Award } from 'lucide-react';

interface ImpactMetric {
  name: string;
  target: string;
  measurement: string;
}

interface Competency {
  name: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
}

interface DeploymentPathway {
  moduleId: string;
  conceptId: string;
  description: string;
  realWorldApplication: string;
  systemsToTransform: string[];
  measurableImpact: ImpactMetric[];
  requiredCompetencies: Competency[];
}

interface DeploymentPathwayEditorProps {
  moduleId: string;
  conceptId: string;
  onSave?: (pathway: DeploymentPathway) => void;
  onCancel?: () => void;
}

export const DeploymentPathwayEditor: React.FC<DeploymentPathwayEditorProps> = ({
  moduleId,
  conceptId,
  onSave,
  onCancel
}) => {
  const [pathway, setPathway] = useState<DeploymentPathway>({
    moduleId,
    conceptId,
    description: '',
    realWorldApplication: '',
    systemsToTransform: [''],
    measurableImpact: [{ name: '', target: '', measurement: '' }],
    requiredCompetencies: [{ name: '', level: 'INTERMEDIATE' }]
  });

  const systemTypes = [
    'Government & Public Policy',
    'Business & Commerce',
    'Education & Training',
    'Healthcare & Wellness',
    'Technology & Innovation',
    'Arts & Culture',
    'Community Development',
    'Environmental Stewardship',
    'Justice & Legal Systems',
    'Media & Communications'
  ];

  const addSystem = () => {
    setPathway({
      ...pathway,
      systemsToTransform: [...pathway.systemsToTransform, '']
    });
  };

  const updateSystem = (index: number, value: string) => {
    const updated = [...pathway.systemsToTransform];
    updated[index] = value;
    setPathway({ ...pathway, systemsToTransform: updated });
  };

  const removeSystem = (index: number) => {
    const updated = pathway.systemsToTransform.filter((_, i) => i !== index);
    setPathway({ ...pathway, systemsToTransform: updated });
  };

  const addImpactMetric = () => {
    setPathway({
      ...pathway,
      measurableImpact: [
        ...pathway.measurableImpact,
        { name: '', target: '', measurement: '' }
      ]
    });
  };

  const updateImpactMetric = (index: number, field: keyof ImpactMetric, value: string) => {
    const updated = [...pathway.measurableImpact];
    updated[index] = { ...updated[index], [field]: value };
    setPathway({ ...pathway, measurableImpact: updated });
  };

  const removeImpactMetric = (index: number) => {
    const updated = pathway.measurableImpact.filter((_, i) => i !== index);
    setPathway({ ...pathway, measurableImpact: updated });
  };

  const addCompetency = () => {
    setPathway({
      ...pathway,
      requiredCompetencies: [
        ...pathway.requiredCompetencies,
        { name: '', level: 'INTERMEDIATE' }
      ]
    });
  };

  const updateCompetency = (index: number, field: keyof Competency, value: any) => {
    const updated = [...pathway.requiredCompetencies];
    updated[index] = { ...updated[index], [field]: value };
    setPathway({ ...pathway, requiredCompetencies: updated });
  };

  const removeCompetency = (index: number) => {
    const updated = pathway.requiredCompetencies.filter((_, i) => i !== index);
    setPathway({ ...pathway, requiredCompetencies: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(pathway);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Deployment Pathway Editor</CardTitle>
          <CardDescription>
            Define real-world application pathways for course concepts to prepare students for civilization transformation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Pathway Description *</Label>
                <Textarea
                  id="description"
                  value={pathway.description}
                  onChange={(e) => setPathway({ ...pathway, description: e.target.value })}
                  placeholder="Describe how this concept applies to real-world scenarios..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="application">Real-World Application *</Label>
                <Textarea
                  id="application"
                  value={pathway.realWorldApplication}
                  onChange={(e) => setPathway({ ...pathway, realWorldApplication: e.target.value })}
                  placeholder="Explain specific ways students can apply this concept in their spheres of influence..."
                  rows={4}
                />
              </div>
            </div>

            {/* Systems to Transform */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">Systems to Transform</CardTitle>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSystem}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add System
                  </Button>
                </div>
                <CardDescription>
                  Identify which societal systems this concept can transform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pathway.systemsToTransform.map((system, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={system}
                      onChange={(e) => updateSystem(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                    >
                      <option value="">Select a system...</option>
                      {systemTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {pathway.systemsToTransform.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSystem(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Measurable Impact Metrics */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <CardTitle className="text-lg">Measurable Impact Metrics</CardTitle>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addImpactMetric}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Metric
                  </Button>
                </div>
                <CardDescription>
                  Define how success will be measured in real-world deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pathway.measurableImpact.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={metric.name}
                          onChange={(e) => updateImpactMetric(index, 'name', e.target.value)}
                          placeholder="Metric name (e.g., 'Community members served')"
                        />
                        <Input
                          value={metric.target}
                          onChange={(e) => updateImpactMetric(index, 'target', e.target.value)}
                          placeholder="Target (e.g., '100 people per month')"
                        />
                        <Input
                          value={metric.measurement}
                          onChange={(e) => updateImpactMetric(index, 'measurement', e.target.value)}
                          placeholder="How to measure (e.g., 'Survey responses, attendance records')"
                        />
                      </div>
                      {pathway.measurableImpact.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImpactMetric(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Required Competencies */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-purple-600" />
                    <CardTitle className="text-lg">Required Competencies</CardTitle>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addCompetency}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Competency
                  </Button>
                </div>
                <CardDescription>
                  Skills and knowledge students need for successful deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pathway.requiredCompetencies.map((competency, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      value={competency.name}
                      onChange={(e) => updateCompetency(index, 'name', e.target.value)}
                      placeholder="Competency name"
                      className="flex-1"
                    />
                    <select
                      value={competency.level}
                      onChange={(e) => updateCompetency(index, 'level', e.target.value)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                    {pathway.requiredCompetencies.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompetency(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Deployment Readiness Checklist */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Deployment Readiness Criteria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-600">Required</Badge>
                    <span className="text-sm">Real-world project connection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-600">Required</Badge>
                    <span className="text-sm">Measurable impact criteria defined</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-600">Required</Badge>
                    <span className="text-sm">Portfolio-ready evidence generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-600">Required</Badge>
                    <span className="text-sm">Outcome tracking and feedback loop</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Save Deployment Pathway
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentPathwayEditor;
