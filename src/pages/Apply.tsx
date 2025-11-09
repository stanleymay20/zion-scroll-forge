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
import { toast } from 'sonner';
import { Upload, Check } from 'lucide-react';

export default function Apply() {
  const navigate = useNavigate();
  const { data: profile } = useStudentProfile();
  const createApplication = useCreateApplication();
  const uploadDocument = useUploadDocument();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    country: '',
    address: ''
  });
  
  const [files, setFiles] = useState<{ id: File; transcript: File } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const student = await createApplication.mutateAsync(formData);
      
      // Upload documents
      if (files?.id) {
        await uploadDocument.mutateAsync({
          studentId: student.id,
          docType: 'ID Card',
          file: files.id
        });
      }
      
      if (files?.transcript) {
        await uploadDocument.mutateAsync({
          studentId: student.id,
          docType: 'Transcript',
          file: files.transcript
        });
      }
      
      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to submit application');
    }
  };

  if (profile?.application_status === 'accepted') {
    return (
      <PageTemplate title="Application Status" description="Your application has been reviewed">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-600" />
              Congratulations! You've been accepted
            </CardTitle>
            <CardDescription>
              You can now enroll in courses and begin your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/courses')}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      </PageTemplate>
    );
  }

  if (profile?.application_status === 'submitted') {
    return (
      <PageTemplate title="Application Status" description="Your application is under review">
        <Card>
          <CardHeader>
            <CardTitle>Application Under Review</CardTitle>
            <CardDescription>
              We're reviewing your application. You'll be notified once a decision is made.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Apply to ScrollUniversity"
      description="Begin your transformative learning journey"
    >
      <Card>
        <CardHeader>
          <CardTitle>Student Application</CardTitle>
          <CardDescription>
            Submit your application to join ScrollUniversity's community of faith-driven scholars
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth *</Label>
                <Input
                  id="dob"
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Required Documents</h3>
              
              <div className="space-y-2">
                <Label htmlFor="id-upload">ID Card / Passport *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="id-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFiles({ ...files, id: e.target.files?.[0]! } as any)}
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transcript-upload">Academic Transcript *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="transcript-upload"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFiles({ ...files, transcript: e.target.files?.[0]! } as any)}
                  />
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
