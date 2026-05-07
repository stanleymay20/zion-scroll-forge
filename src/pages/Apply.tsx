import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateApplication, useUploadDocument, useStudentProfile } from '@/hooks/useStudents';
import { useDegreePrograms } from '@/hooks/useDegreePrograms';
import { useCohortStatus } from '@/hooks/useLaunchOps';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, Check, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Apply() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const { data: programs = [] } = useDegreePrograms();
  const { data: cohort, isLoading: cohortLoading } = useCohortStatus();
  const createApplication = useCreateApplication();
  const uploadDocument = useUploadDocument();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    country: '',
    address: '',
    degree_program_id: '',
    motivation_statement: '',
  });

  const [files, setFiles] = useState<{ id?: File; transcript?: File }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.degree_program_id) {
      toast.error('Please select a program');
      return;
    }
    if ((formData.motivation_statement?.trim().length ?? 0) < 80) {
      toast.error('Motivation statement must be at least 80 characters');
      return;
    }
    try {
      const student: any = await createApplication.mutateAsync(formData as any);
      if (files.id) {
        await uploadDocument.mutateAsync({ studentId: student.id, docType: 'ID Card', file: files.id });
      }
      if (files.transcript) {
        await uploadDocument.mutateAsync({ studentId: student.id, docType: 'Transcript', file: files.transcript });
      }
      toast.success('Application submitted — review in progress');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to submit application');
    }
  };

  // Already accepted
  if (profile?.application_status === 'accepted') {
    return (
      <PageTemplate title="Application Status" description="You've been admitted">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              Welcome to ScrollUniversity
            </CardTitle>
            <CardDescription>Your dashboard is ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(profile as any)?.student_id_code && (
              <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                <div><span className="text-muted-foreground">Student ID:</span> <span className="font-mono font-semibold">{(profile as any).student_id_code}</span></div>
                <div><span className="text-muted-foreground">Institutional Email:</span> <span className="font-mono">{(profile as any).institutional_email}</span></div>
                {(profile as any).cohort_number && (
                  <div><span className="text-muted-foreground">Cohort #:</span> {(profile as any).cohort_number}</div>
                )}
              </div>
            )}
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (profile?.application_status === 'submitted') {
    return (
      <PageTemplate title="Application Status" description="Under review">
        <Card>
          <CardHeader>
            <CardTitle>Application Under Review</CardTitle>
            <CardDescription>You'll be notified by email once a decision is made.</CardDescription>
          </CardHeader>
        </Card>
      </PageTemplate>
    );
  }

  if (profile?.application_status === 'waitlisted') {
    return (
      <PageTemplate title="Waitlisted" description="You're on the cohort waitlist">
        <Card>
          <CardHeader>
            <CardTitle>You're on the Waitlist</CardTitle>
            <CardDescription>
              We'll notify you the moment a seat opens. No further action is needed.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageTemplate>
    );
  }

  if (profile?.application_status === 'rejected') {
    return (
      <PageTemplate title="Application Decision" description="Decision recorded">
        <Card>
          <CardHeader>
            <CardTitle>Application Not Advanced</CardTitle>
            <CardDescription>
              {(profile as any)?.rejection_reason || 'Thank you for applying. You may apply again in a future cohort.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </PageTemplate>
    );
  }

  // Cohort cap reached
  if (cohort && !cohort.is_open) {
    return (
      <PageTemplate title="Cohort Closed" description="Beta cohort is currently full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-muted-foreground" />
              {cohort.cohort_label} is full
            </CardTitle>
            <CardDescription>
              All {cohort.cohort_cap} seats have been filled. Join the waitlist for the next cohort.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => navigate('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  const filled = cohort ? cohort.admitted : 0;
  const cap = cohort?.cohort_cap ?? 50;
  const pct = Math.min(100, Math.round((filled / cap) * 100));

  return (
    <PageTemplate title="Apply to ScrollUniversity" description="Begin your transformative learning journey">
      {!cohortLoading && cohort && (
        <Card className="mb-4 border-primary/30">
          <CardContent className="py-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">{cohort.cohort_label}</span>
              <span className="text-muted-foreground">
                {filled} / {cap} admitted • {cohort.seats_remaining} seats left
              </span>
            </div>
            <Progress value={pct} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Student Application</CardTitle>
          <CardDescription>
            Submit your application to join ScrollUniversity's community of faith-driven scholars
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="program">Program of Interest *</Label>
              <Select
                value={formData.degree_program_id}
                onValueChange={(v) => setFormData({ ...formData, degree_program_id: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select a degree program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}{p.level ? ` — ${p.level}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" required value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" required value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" required value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input id="dob" type="date" required value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender}
                  onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input id="country" required value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea id="address" required value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Motivation Statement * <span className="text-xs text-muted-foreground">(min 80 chars)</span>
              </Label>
              <Textarea
                id="motivation"
                required
                rows={5}
                minLength={80}
                maxLength={2000}
                placeholder="Why this program? What do you bring? What do you hope to do?"
                value={formData.motivation_statement}
                onChange={(e) => setFormData({ ...formData, motivation_statement: e.target.value })}
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.motivation_statement.length} / 2000
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Supporting Documents (optional)</h3>
              <div className="space-y-2">
                <Label htmlFor="id-upload">ID / Passport</Label>
                <div className="flex items-center gap-2">
                  <Input id="id-upload" type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFiles({ ...files, id: e.target.files?.[0] })} />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transcript-upload">Academic Transcript</Label>
                <div className="flex items-center gap-2">
                  <Input id="transcript-upload" type="file" accept=".pdf"
                    onChange={(e) => setFiles({ ...files, transcript: e.target.files?.[0] })} />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={createApplication.isPending}>
              {createApplication.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
