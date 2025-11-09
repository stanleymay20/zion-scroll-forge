import { PageTemplate } from '@/components/layout/PageTemplate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGraduations } from '@/hooks/useStudents';
import { Award, Download, ExternalLink } from 'lucide-react';

export default function AlumniPortal() {
  const { data: graduations } = useGraduations();

  return (
    <PageTemplate
      title="Alumni Portal"
      description="Verified graduates and certificate verification"
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Certificate Verification</CardTitle>
          <CardDescription>
            All certificates are verifiable on-chain and publicly accessible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ScrollUniversity graduates receive blockchain-verified credentials that can be 
            independently verified by employers and institutions worldwide.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified Graduates</CardTitle>
          <CardDescription>
            Our distinguished alumni who have completed their programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {graduations && graduations.length > 0 ? (
            <div className="space-y-4">
              {graduations.map((grad: any) => (
                <div
                  key={grad.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{grad.students?.full_name}</h3>
                      {grad.honors && (
                        <Badge variant="secondary">{grad.honors}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Graduated: {new Date(grad.ceremony_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {grad.certificate_url && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No graduates yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Be the first to complete a program!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Alumni Community</CardTitle>
          <CardDescription>Stay connected with fellow graduates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Join our alumni network to stay connected, access exclusive resources, 
            and continue your professional development.
          </p>
          <Button>
            Join Alumni Network
          </Button>
        </CardContent>
      </Card>
    </PageTemplate>
  );
}
