import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Target, BookOpen } from 'lucide-react';

interface RigorLevel {
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'STRATEGIC';
  description: string;
  characteristics: string[];
  assessmentCriteria: string[];
  benchmarkInstitutions: string[];
}

interface RigorLevelSelectorProps {
  courseId: string;
  currentLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'STRATEGIC';
  onSelect?: (level: string) => void;
  onValidate?: () => void;
}

export const RigorLevelSelector: React.FC<RigorLevelSelectorProps> = ({
  courseId,
  currentLevel = 'INTERMEDIATE',
  onSelect,
  onValidate
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel);
  const [validationResults, setValidationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rigorLevels: RigorLevel[] = [
    {
      level: 'BEGINNER',
      description: 'Foundational concepts and basic vocabulary for newcomers to the field',
      characteristics: [
        'Introduction to core concepts',
        'Basic terminology and definitions',
        'Simple examples and applications',
        'Guided practice with clear instructions',
        'Foundational assessments'
      ],
      assessmentCriteria: [
        'Recall and recognition of key terms',
        'Basic comprehension of concepts',
        'Simple application in guided scenarios',
        'Completion of structured exercises'
      ],
      benchmarkInstitutions: ['Community colleges', 'Introductory university courses']
    },
    {
      level: 'INTERMEDIATE',
      description: 'Applied concepts with technical vocabulary and problem-solving focus',
      characteristics: [
        'Integration of multiple concepts',
        'Technical vocabulary and frameworks',
        'Real-world problem-solving',
        'Independent application',
        'Analytical assessments'
      ],
      assessmentCriteria: [
        'Application of concepts to new situations',
        'Analysis of complex scenarios',
        'Synthesis of multiple ideas',
        'Problem-solving with minimal guidance'
      ],
      benchmarkInstitutions: ['State universities', 'Mid-tier private colleges']
    },
    {
      level: 'ADVANCED',
      description: 'Complex theories with specialized vocabulary and analytical depth',
      characteristics: [
        'Advanced theoretical frameworks',
        'Specialized technical vocabulary',
        'Critical analysis and evaluation',
        'Research-based approaches',
        'Rigorous assessments'
      ],
      assessmentCriteria: [
        'Critical evaluation of theories',
        'Original analysis and insights',
        'Research methodology application',
        'Advanced problem-solving'
      ],
      benchmarkInstitutions: ['Top-tier universities', 'MIT', 'Stanford', 'Oxford']
    },
    {
      level: 'STRATEGIC',
      description: 'Systems thinking with expert vocabulary for governance and leadership',
      characteristics: [
        'Systems-level thinking',
        'Expert-level vocabulary',
        'Strategic decision-making',
        'Governance and leadership focus',
        'Transformational assessments'
      ],
      assessmentCriteria: [
        'Strategic analysis of complex systems',
        'Leadership and governance competence',
        'Transformational impact planning',
        'Expert-level synthesis and innovation'
      ],
      benchmarkInstitutions: ['Executive education programs', 'Graduate-level strategic courses']
    }
  ];

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    onSelect?.(level);
  };

  const runValidation = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation results
      setValidationResults({
        declaredLevel: selectedLevel,
        actualLevel: selectedLevel,
        depthScore: 85,
        vocabularyAppropriate: true,
        assessmentDifficultyMatches: true,
        valid: true,
        issues: [],
        benchmarkComparison: {
          meetsOrExceedsStandards: true,
          comparedInstitutions: ['MIT', 'Stanford', 'Oxford'],
          contentDepthScore: 88,
          assessmentRigorScore: 82
        }
      });
      
      onValidate?.();
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Rigor Level Configuration</CardTitle>
          <CardDescription>
            Select and validate the academic rigor level for your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rigor Level Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rigorLevels.map((level) => {
              const isSelected = selectedLevel === level.level;
              
              return (
                <button
                  key={level.level}
                  onClick={() => handleLevelSelect(level.level)}
                  className={`p-6 border-2 rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold">{level.level}</h3>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                    </div>
                    {isSelected && (
                      <Badge className="bg-blue-600">Selected</Badge>
                    )}
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Characteristics:</h4>
                      <ul className="space-y-1">
                        {level.characteristics.slice(0, 3).map((char, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{char}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Benchmark Institutions:</h4>
                      <div className="flex flex-wrap gap-1">
                        {level.benchmarkInstitutions.map((inst, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {inst}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Level Details */}
          {selectedLevel && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Target className="w-5 h-5 mr-2 text-blue-600" />
                  {selectedLevel} Level Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {rigorLevels.find(l => l.level === selectedLevel)?.characteristics.map((char, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Award className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm">{char}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Validation Button */}
          {!validationResults && (
            <div className="text-center">
              <Button onClick={runValidation} disabled={loading} size="lg">
                {loading ? 'Validating Rigor Level...' : 'Validate Rigor Level'}
              </Button>
            </div>
          )}

          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Validation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded">
                      <div className="text-sm text-gray-600 mb-1">Declared Level</div>
                      <div className="text-xl font-bold">{validationResults.declaredLevel}</div>
                    </div>
                    <div className="p-4 border rounded">
                      <div className="text-sm text-gray-600 mb-1">Actual Level</div>
                      <div className="text-xl font-bold">{validationResults.actualLevel}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Content Depth Score</span>
                        <span className={`text-sm font-bold ${getScoreColor(validationResults.depthScore)}`}>
                          {validationResults.depthScore}%
                        </span>
                      </div>
                      <Progress value={validationResults.depthScore} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Vocabulary Appropriate</span>
                      <Badge variant={validationResults.vocabularyAppropriate ? 'default' : 'destructive'}>
                        {validationResults.vocabularyAppropriate ? 'Yes' : 'No'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded">
                      <span className="text-sm">Assessment Difficulty Matches</span>
                      <Badge variant={validationResults.assessmentDifficultyMatches ? 'default' : 'destructive'}>
                        {validationResults.assessmentDifficultyMatches ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benchmark Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Elite Institution Benchmarking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Content Depth</span>
                        <span className={`text-sm font-bold ${getScoreColor(validationResults.benchmarkComparison.contentDepthScore)}`}>
                          {validationResults.benchmarkComparison.contentDepthScore}%
                        </span>
                      </div>
                      <Progress value={validationResults.benchmarkComparison.contentDepthScore} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Assessment Rigor</span>
                        <span className={`text-sm font-bold ${getScoreColor(validationResults.benchmarkComparison.assessmentRigorScore)}`}>
                          {validationResults.benchmarkComparison.assessmentRigorScore}%
                        </span>
                      </div>
                      <Progress value={validationResults.benchmarkComparison.assessmentRigorScore} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 border rounded bg-green-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meets or Exceeds Elite Standards</span>
                      <Badge className="bg-green-600">
                        {validationResults.benchmarkComparison.meetsOrExceedsStandards ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Compared Against:</h4>
                    <div className="flex flex-wrap gap-2">
                      {validationResults.benchmarkComparison.comparedInstitutions.map((inst: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {inst}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setValidationResults(null)}>
                  Run New Validation
                </Button>
                <Button>
                  Save Configuration
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RigorLevelSelector;
