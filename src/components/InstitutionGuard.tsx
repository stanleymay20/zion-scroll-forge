import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useInstitution } from '@/contexts/InstitutionContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface InstitutionGuardProps {
  children: ReactNode;
  allowWithoutInstitution?: boolean;
}

export function InstitutionGuard({ children, allowWithoutInstitution = false }: InstitutionGuardProps) {
  const { activeInstitution, loading } = useInstitution();
  const location = useLocation();

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

  if (allowWithoutInstitution) {
    return <>{children}</>;
  }

  if (!activeInstitution) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/apply?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
