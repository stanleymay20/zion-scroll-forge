import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, BookOpen, FileText, ClipboardCheck, Award } from 'lucide-react';

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string;
}

interface ConstitutionValidation {
  structure: {
    moduleCount: number;
    moduleCountValid: boolean;
    lessonsPerModule: number[];
    lessonsValid: boolean;
    overallValid: boolean;
    errors: string[];
  };
  placeholder: {
    hasPlaceholders: boolean;
    placeholderLocations: string[];
    hasTODONotes: boolean;
    hasExampleData: boolean;
    productionReady: boolean;
  };
  components: {
    allComponentsPresent: boolean;
    missingComponents: string[];
  };
  assessment: {
    hasMicroAssessments: boolean;
    hasMidCourseAssessment: boolean;
    hasFinalCapstone: boolean;
    valid: boolean;
  };
  formation: {
    knowledgeDimension: number;
    skillDimension: number;
    characterDimension: number;
    callingDimension: number;
    integratedFormationAchieved: boolean;
    gaps: string[];
  };
}

interface ConstitutionValidatorProps {
  courseId: string;
  onValidate?: (results: ConstitutionValidation) => void;
}

export const ConstitutionValidator: React.FC<ConstitutionValidatorProps> = ({
  courseId,
  onValidate
}) => {
  const [validation, setValidation] = useState<ConstitutionValidation | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationType, setValidationType] = useState<'FULL' | 'STRUCTURE' | 'PLACEHOLDER' | 'COMPONENTS' | 'ASSESSMENT' | 'FORMATION'>('FULL');

  const runValidation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation results
      const mockValidation: ConstitutionValidation = {
        structure: {
          moduleCount: 8,
          moduleCountValid: true,
          lessonsPerModule: [5, 6, 5, 7, 6, 5, 6, 5],
          lessonsValid: true,
          overallValid: true,
          errors: []
        },
        placeholder: {
          hasPlaceholders: false,
          placeholderLocations: [],
          hasTODONotes: false,
          hasExampleData: false,
          productionReady: true
        },
        components: {
          allComponentsPresent: true,
          missingComponents: []
        },
        assessment: {
          hasMicroAssessments: true,
          hasMidCourseAssessment: true,
          hasFinalCapstone: true,
          valid: true
        },
        formation: {
          knowledgeDimension: 90,
          skillDimension: 85,
          characterDimension: 80,
          callingDimension: 75,
          integratedFormationAchieved: true,
          gaps: []
        }
      };

      setValidation(mockValidation);
      onValidate?.(mockValidation);
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getDimensionColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Course Constitution Validator</CardTitle>
          <CardDescription>
            Validate course against ScrollUniversity's Course Content Constitution minimum standards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Validation Type Selection */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={validationType === 'FULL' ? 'default' : 'outline'}
              onClick={() => setValidationType('FULL')}
            >
              Full Validation
            </Button>
            <Button
              variant={validationType === 'STRUCTURE' ? 'default' : 'outline'}
              onClick={() => setValidationType('STRUCTURE')}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Structure
            </Button>
            <Button
              variant={validationType === 'PLACEHOLDER' ? 'default' : 'outline'}
              onClick={() => setValidationType('PLACEHOLDER')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Content Quality
            </Button>
            <Button
              variant={validationType === 'COMPONENTS' ? 'default' : 'outline'}
              onClick={() => setValidationType('COMPONENTS')}
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Components
            </Button>
            <Button
              variant={validationType === 'ASSESSMENT' ? 'default' : 'outline'}
              onClick={() => setValidationType('ASSESSMENT')}
            >
              <Award className="w-4 h-4 mr-2" />
              Assessments
            </Button>
            <Button
              variant={validationType === 'FORMATION' ? 'default' : 'outline'}
              onClick={() => setValidationType('FORMATION')}
            >
              Formation
            </Button>
          </div>

          {/* Run Validation Button */}
          {!validation && (
            <div className="text-center py-12">
              <Button onClick={runValidation} disabled={loading} size="lg">
                {loading ? 'Running Validation...' : 'Run Constitution Validation'}
              </Button>
            </div>
          )}

          {/* Validation Results */}
          {validation && (
            <div className="space-y-6">
              {/* Structure Validation */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Course Structure
                    </CardTitle>
                    {getValidationIcon(validation.structure.overallValid)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Module Count</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={validation.structure.moduleCountValid ? 'default' : 'destructive'}>
                          {validation.structure.moduleCount}
                        </Badge>
                        <span className="text-xs text-gray-500">(4-12 required)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Lessons per Module</span>
                      <div className="flex items-center space-x-2">
                        {getValidationIcon(validation.structure.lessonsValid)}
                        <span className="text-xs text-gray-500">(3-10 required)</span>
                      </div>
                    </div>
                  </div>

                  {validation.structure.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Structure Issues:</h4>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {validation.structure.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Placeholder Content Check */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Production Readiness
                    </CardTitle>
                    {getValidationIcon(validation.placeholder.productionReady)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Placeholder Content</span>
                    {getValidationIcon(!validation.placeholder.hasPlaceholders)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">TODO Notes</span>
                    {getValidationIcon(!validation.placeholder.hasTODONotes)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">Example Data</span>
                    {getValidationIcon(!validation.placeholder.hasExampleData)}
                  </div>

                  {validation.placeholder.placeholderLocations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        Placeholder Content Found:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700">
                        {validation.placeholder.placeholderLocations.map((location, index) => (
                          <li key={index}>{location}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Component Completeness */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <ClipboardCheck className="w-5 h-5 mr-2" />
                      Required Components
                    </CardTitle>
                    {getValidationIcon(validation.components.allComponentsPresent)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Lecture Notes</span>
                      {getValidationIcon(true)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Video Script Outlines</span>
                      {getValidationIcon(true)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Examples & Case Studies</span>
                      {getValidationIcon(true)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Key Scriptures/Frameworks</span>
                      {getValidationIcon(true)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">References & Citations</span>
                      {getValidationIcon(true)}
                    </div>
                  </div>

                  {validation.components.missingComponents.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">Missing Components:</h4>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {validation.components.missingComponents.map((component, index) => (
                          <li key={index}>{component}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Assessment Distribution */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Assessment Distribution
                    </CardTitle>
                    {getValidationIcon(validation.assessment.valid)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Per-Module Micro-Assessments</span>
                      {getValidationIcon(validation.assessment.hasMicroAssessments)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Mid-Course Assessment</span>
                      {getValidationIcon(validation.assessment.hasMidCourseAssessment)}
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Final Capstone Assessment</span>
                      {getValidationIcon(validation.assessment.hasFinalCapstone)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Integrated Formation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Integrated Formation (4 Dimensions)</CardTitle>
                  <CardDescription>
                    Knowledge, Skill, Character, and Calling integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Knowledge</span>
                        <span className={`text-sm font-bold ${getDimensionColor(validation.formation.knowledgeDimension)}`}>
                          {validation.formation.knowledgeDimension}%
                        </span>
                      </div>
                      <Progress value={validation.formation.knowledgeDimension} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Skill</span>
                        <span className={`text-sm font-bold ${getDimensionColor(validation.formation.skillDimension)}`}>
                          {validation.formation.skillDimension}%
                        </span>
                      </div>
                      <Progress value={validation.formation.skillDimension} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Character</span>
                        <span className={`text-sm font-bold ${getDimensionColor(validation.formation.characterDimension)}`}>
                          {validation.formation.characterDimension}%
                        </span>
                      </div>
                      <Progress value={validation.formation.characterDimension} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Calling</span>
                        <span className={`text-sm font-bold ${getDimensionColor(validation.formation.callingDimension)}`}>
                          {validation.formation.callingDimension}%
                        </span>
                      </div>
                      <Progress value={validation.formation.callingDimension} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded bg-blue-50">
                    <span className="text-sm font-medium">Integrated Formation Achieved</span>
                    {getValidationIcon(validation.formation.integratedFormationAchieved)}
                  </div>

                  {validation.formation.gaps.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Formation Gaps:</h4>
                      <ul className="list-disc list-inside text-sm text-yellow-700">
                        {validation.formation.gaps.map((gap, index) => (
                          <li key={index}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setValidation(null)}>
                  Run New Validation
                </Button>
                <Button>
                  Export Report
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstitutionValidator;
