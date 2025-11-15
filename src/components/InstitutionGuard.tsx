import { ReactNode } from 'react';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InstitutionGuardProps {
  children: ReactNode;
}

export function InstitutionGuard({ children }: InstitutionGuardProps) {
  const { activeInstitution, loading } = useInstitution();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading institution data...</p>
        </div>
      </div>
    );
  }

  if (!activeInstitution) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h2 className="text-lg font-semibold mb-2">No Institution Found</h2>
              <p className="text-sm text-muted-foreground">
                You don't have access to any institution. Please contact your administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
