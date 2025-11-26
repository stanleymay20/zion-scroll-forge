import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, AlertTriangle, Shield, Heart, BookOpen } from 'lucide-react';

interface ValidationError {
  type: 'THEOLOGICAL_DRIFT' | 'TONE_PROBLEM' | 'SPIRITUALIZATION_OF_LAZINESS' | 'BABYLONIAN_FLATTENING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  location: string;
  suggestedCorrection?: string;
}

interface SpiritualValidation {
  contentId: string;
  passed: boolean;
  strictnessProfile: 'STRICT_SPIRITUAL' | 'BALANCED' | 'LIGHT_CHECK';
  errors: ValidationError[];
  warnings: ValidationError[];
  correctionAttempted: boolean;
  correctionSuccessful: boolean;
  christCenteredScore: number;
  scriptureRootedScore: number;
  toneScore: number;
}

interface SpiritualAlignmentDashboardProps {
  courseId: string;
  onValidate?: (results: SpiritualValidation) => void;
}

export const SpiritualAlignmentDashboard: React.FC<SpiritualAlignmentDashboardProps> = ({
  courseId,
  onValidate
}) => {
  const [strictnessProfile, setStrictnessProfile] = useState<'STRICT_SPIRITUAL' | 'BALANCED' | 'LIGHT_CHECK'>('BALANCED');
  const [validation, setValidation] = useState<SpiritualValidation | null>(null);
  const [loading, setLoading] = useState(false);

  const strictnessProfiles = [
    {
      value: 'STRICT_SPIRITUAL',
      label: 'Strict Spiritual',
      description: 'For theology modules and spiritual formation content',
      criteria: [
        'Zero tolerance for theological drift',
        'Christ-centered language required',
        'Scripture-rooted teaching mandatory',
        'No generic spirituality allowed'
      ]
    },
    {
      value: 'BALANCED',
      label: 'Balanced',
      description: 'For technical modules with spiritual integration',
      criteria: [
        'Validate worldview integration',
        'Ensure spiritual enrichment',
        'Check for forced verse decoration',
        'Maintain academic clarity'
      ]
    },
    {
      value: 'LIGHT_CHECK',
      label: 'Light Check',
      description: 'For technical content with minimal spiritual elements',
      criteria: [
        'Validate tone and respect',
        'Check for spiritualization of laziness',
        'Ensure no Babylonian flattening',
        'Basic theological accuracy'
      ]
    }
  ];

  const runValidation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation results
      setValidation({
        contentId: courseId,
        passed: true,
        strictnessProfile,
        errors: [],
        warnings: [
          {
            type: 'TONE_PROBLEM',
            severity: 'LOW',
            message: 'Consider softening language in Module 3, Lesson 2',
            location: 'Module 3, Lesson 2, Paragraph 4',
            suggestedCorrection: 'Replace "you must" with "students are encouraged to"'
          }
        ],
        correctionAttempted: false,
        correctionSuccessful: false,
        christCenteredScore: 92,
        scriptureRootedScore: 88,
        toneScore: 85
      });
      
      onValidate?.(validation!);
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      CRITICAL: 'bg-red-600',
      HIGH: 'bg-orange-600',
      MEDIUM: 'bg-yellow-600',
      LOW: 'bg-blue-600'
    };
    return <Badge className={colors[severity as keyof typeof colors]}>{severity}</Badge>;
  };

  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'THEOLOGICAL_DRIFT':
        return <BookOpen className="w-5 h-5 text-red-600" />;
      case 'TONE_PROBLEM':
        return <Heart className="w-5 h-5 text-yellow-600" />;
      case 'SPIRITUALIZATION_OF_LAZINESS':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'BABYLONIAN_FLATTENING':
        return <Shield className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Spiritual Alignment Dashboard</CardTitle>
          <CardDescription>
            Monitor theological accuracy and Christ-centered tone across all course content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strictness Profile Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validation Strictness Profile</CardTitle>
              <CardDescription>
                Select the appropriate validation intensity for your content type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={strictnessProfile}
                onValueChange={(value: any) => setStrictnessProfile(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strictnessProfiles.map((profile) => (
                    <SelectItem key={profile.value} value={profile.value}>
                      {profile.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {strictnessProfiles.find(p => p.value === strictnessProfile) && (
                <div className="p-4 border rounded bg-blue-50">
                  <h4 className="font-medium mb-2">
                    {strictnessProfiles.find(p => p.value === strictnessProfile)?.label}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {strictnessProfiles.find(p => p.value === strictnessProfile)?.description}
                  </p>
                  <ul className="space-y-1">
                    {strictnessProfiles.find(p => p.value === strictnessProfile)?.criteria.map((criterion, index) => (
                      <li key={index} className="text-sm flex items-start">
                        <span className="mr-2">•</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Run Validation Button */}
          {!validation && (
            <div className="text-center">
              <Button onClick={runValidation} disabled={loading} size="lg">
                {loading ? 'Running Spiritual Alignment Validation...' : 'Run Validation'}
              </Button>
            </div>
          )}

          {/* Validation Results */}
          {validation && (
            <div className="space-y-6">
              {/* Overall Status */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Validation Status</CardTitle>
                    {validation.passed ? (
                      <Badge className="bg-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Passed
                      </Badge>
                    ) : (
                      <Badge className="bg-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Christ-Centered</span>
                        <span className={`text-sm font-bold ${getScoreColor(validation.christCenteredScore)}`}>
                          {validation.christCenteredScore}%
                        </span>
                      </div>
                      <Progress value={validation.christCenteredScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Scripture-Rooted</span>
                        <span className={`text-sm font-bold ${getScoreColor(validation.scriptureRootedScore)}`}>
                          {validation.scriptureRootedScore}%
                        </span>
                      </div>
                      <Progress value={validation.scriptureRootedScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Tone Quality</span>
                        <span className={`text-sm font-bold ${getScoreColor(validation.toneScore)}`}>
                          {validation.toneScore}%
                        </span>
                      </div>
                      <Progress value={validation.toneScore} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Errors */}
              {validation.errors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-red-800">
                      <XCircle className="w-5 h-5 mr-2" />
                      Critical Issues ({validation.errors.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {validation.errors.map((error, index) => (
                        <div key={index} className="p-4 border border-red-300 rounded bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start space-x-2">
                              {getErrorTypeIcon(error.type)}
                              <div>
                                <h4 className="font-medium text-red-800">{error.type.replace(/_/g, ' ')}</h4>
                                <p className="text-sm text-gray-600 mt-1">{error.message}</p>
                              </div>
                            </div>
                            {getSeverityBadge(error.severity)}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Location: {error.location}
                          </div>
                          {error.suggestedCorrection && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-xs font-medium text-blue-800">Suggested Fix:</span>
                              <p className="text-xs text-blue-700 mt-1">{error.suggestedCorrection}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-yellow-800">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Warnings ({validation.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {validation.warnings.map((warning, index) => (
                        <div key={index} className="p-4 border border-yellow-300 rounded bg-white">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-start space-x-2">
                              {getErrorTypeIcon(warning.type)}
                              <div>
                                <h4 className="font-medium text-yellow-800">{warning.type.replace(/_/g, ' ')}</h4>
                                <p className="text-sm text-gray-600 mt-1">{warning.message}</p>
                              </div>
                            </div>
                            {getSeverityBadge(warning.severity)}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            Location: {warning.location}
                          </div>
                          {warning.suggestedCorrection && (
                            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                              <span className="text-xs font-medium text-blue-800">Suggested Fix:</span>
                              <p className="text-xs text-blue-700 mt-1">{warning.suggestedCorrection}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Auto-Correction Status */}
              {validation.correctionAttempted && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Auto-Correction Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Correction Attempted</span>
                      <Badge variant={validation.correctionSuccessful ? 'default' : 'destructive'}>
                        {validation.correctionSuccessful ? 'Successful' : 'Failed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setValidation(null)}>
                  Run New Validation
                </Button>
                {validation.errors.length > 0 && (
                  <Button>
                    Attempt Auto-Correction
                  </Button>
                )}
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

export default SpiritualAlignmentDashboard;
