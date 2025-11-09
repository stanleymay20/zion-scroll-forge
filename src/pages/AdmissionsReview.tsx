import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePendingApplications, useApproveApplication, useRejectApplication } from '@/hooks/useStudents';
import { CheckCircle, XCircle, FileText, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AdmissionsReview() {
  const { data: applications } = usePendingApplications();
  const approveApplication = useApproveApplication();
  const rejectApplication = useRejectApplication();

  console.info('✝️ ScrollUniversity: Admissions data loaded — Christ is Lord over every application');

  const handleApprove = async (studentId: string) => {
    try {
      const result = await approveApplication.mutateAsync(studentId);
      if (result?.html) {
        const win = window.open();
        if (win) {
          win.document.write(result.html);
        }
      }
      toast.success('Application approved and admission letter generated');
    } catch (error) {
      toast.error('Failed to approve application');
    }
  };

  const handleReject = async (studentId: string) => {
    try {
      await rejectApplication.mutateAsync(studentId);
      toast.success('Application rejected');
    } catch (error) {
      toast.error('Failed to reject application');
    }
  };

  return (
    <PageTemplate
      title="Admissions Review"
      description="Review and process student applications"
    >
      <div className="space-y-6">
        {applications && applications.length > 0 ? (
          applications.map((app: any) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {app.full_name}
                    </CardTitle>
                    <CardDescription>{app.email}</CardDescription>
                  </div>
                  <Badge>Pending Review</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{app.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(app.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium capitalize">{app.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Country</p>
                    <p className="font-medium">{app.country}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{app.address}</p>
                  </div>
                </div>

                {app.student_documents && app.student_documents.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {app.student_documents.map((doc: any) => (
                        <Badge key={doc.id} variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {doc.doc_type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(app.id)}
                    disabled={approveApplication.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Generate Letter
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(app.id)}
                    disabled={rejectApplication.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No pending applications</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTemplate>
  );
}
