import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useCreateAcademicYear, useAutoGenerateSemesters } from '@/hooks/useAcademicYear';
import { useInstitution } from '@/contexts/InstitutionContext';

const CreateAcademicYear = () => {
  const navigate = useNavigate();
  const { activeInstitution } = useInstitution();
  const createYear = useCreateAcademicYear();
  const generateSemesters = useAutoGenerateSemesters();

  const [step, setStep] = useState(1);
  const [yearData, setYearData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    year_type: 'semester' as 'semester' | 'trimester' | 'quarter',
    is_active: false,
  });
  const [createdYearId, setCreatedYearId] = useState<string | null>(null);
  const [autoGenerateSemesters, setAutoGenerateSemesters] = useState(true);

  const handleCreateYear = async () => {
    const result = await createYear.mutateAsync({
      ...yearData,
      institution_id: activeInstitution?.id,
    });
    setCreatedYearId(result.id);
    
    if (autoGenerateSemesters) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleGenerateSemesters = async () => {
    if (!createdYearId) return;
    
    await generateSemesters.mutateAsync({
      academicYearId: createdYearId,
      yearType: yearData.year_type,
    });
    setStep(3);
  };

  const yearTypeLabels = {
    semester: '2 Semesters (Fall & Spring)',
    trimester: '3 Trimesters',
    quarter: '4 Quarters',
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => navigate('/academic-year')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-16 sm:w-24 h-1 mx-2 ${
                step > s ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Create Academic Year</CardTitle>
                <CardDescription>Set up a new academic year with dates and structure</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Academic Year Name</Label>
              <Input
                id="name"
                placeholder="e.g., 2024-2025 Academic Year"
                value={yearData.name}
                onChange={(e) => setYearData({ ...yearData, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={yearData.start_date}
                  onChange={(e) => setYearData({ ...yearData, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={yearData.end_date}
                  onChange={(e) => setYearData({ ...yearData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_type">Academic Structure</Label>
              <Select
                value={yearData.year_type}
                onValueChange={(v) => setYearData({ ...yearData, year_type: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semester">{yearTypeLabels.semester}</SelectItem>
                  <SelectItem value="trimester">{yearTypeLabels.trimester}</SelectItem>
                  <SelectItem value="quarter">{yearTypeLabels.quarter}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Set as Active Year</p>
                <p className="text-sm text-muted-foreground">Make this the current academic year</p>
              </div>
              <Switch
                checked={yearData.is_active}
                onCheckedChange={(checked) => setYearData({ ...yearData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Auto-Generate Semesters</p>
                <p className="text-sm text-muted-foreground">Automatically create semesters based on structure</p>
              </div>
              <Switch
                checked={autoGenerateSemesters}
                onCheckedChange={setAutoGenerateSemesters}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleCreateYear}
              disabled={!yearData.name || !yearData.start_date || !yearData.end_date || createYear.isPending}
            >
              {createYear.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Generate Semesters */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Semesters</CardTitle>
            <CardDescription>
              We'll automatically create {yearData.year_type === 'semester' ? '2 semesters' : 
              yearData.year_type === 'trimester' ? '3 trimesters' : '4 quarters'} for {yearData.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-lg bg-primary/5 border border-primary/20 text-center">
              <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Ready to Generate</p>
              <p className="text-sm text-muted-foreground mt-2">
                This will create {yearData.year_type === 'semester' ? 'Fall and Spring semesters' : 
                yearData.year_type === 'trimester' ? 'Fall, Winter, and Spring trimesters' : 
                'Fall, Winter, Spring, and Summer quarters'} with appropriate dates.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Skip
              </Button>
              <Button
                className="flex-1"
                onClick={handleGenerateSemesters}
                disabled={generateSemesters.isPending}
              >
                {generateSemesters.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Generate Semesters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Academic Year Created!</h2>
            <p className="text-muted-foreground mb-6">
              {yearData.name} has been successfully created
              {autoGenerateSemesters && ' with auto-generated semesters'}.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/academic-year')}>
                Back to Dashboard
              </Button>
              <Button onClick={() => navigate('/academic-year/scheduling')}>
                Configure Scheduling
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateAcademicYear;
