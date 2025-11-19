/**
 * ScrollUniversity Protected Route Component
 * "Guard what has been entrusted to your care" - 1 Timothy 6:20
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  redirectTo
}: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Give auth context time to initialize
    const timer = setTimeout(() => {
      setChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [loading]);

  // Show loading state while checking authentication
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-scroll-primary/10 via-background to-scroll-secondary/10">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-scroll-primary mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-scroll-primary">Loading ScrollUniversity...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Preparing your kingdom education experience
            </p>
          </div>
          <div className="p-4 bg-scroll-primary/5 rounded-lg border border-scroll-primary/20 max-w-md mx-auto">
            <p className="text-sm text-center italic text-scroll-primary font-serif">
              "The Lord is my shepherd; I shall not want" - Psalm 23:1
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    // Redirect to login with return URL
    const returnUrl = `${location.pathname}${location.search}`;
    return <Navigate to={`/auth/login?redirect=${encodeURIComponent(returnUrl)}`} replace />;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0 && user) {
    const userRole = (user as any).role || session?.user?.user_metadata?.role;
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to={redirectTo || '/dashboard'} replace />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
}

/**
 * Higher-order component for protecting routes
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

/**
 * Hook for checking if user has specific role
 */
export function useRequireRole(requiredRoles: string[]) {
  const { user, session } = useAuth();
  const userRole = (user as any)?.role || session?.user?.user_metadata?.role;
  
  return {
    hasRole: userRole && requiredRoles.includes(userRole),
    userRole
  };
}

/**
 * Component for role-based rendering
 */
interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasRole } = useRequireRole(roles);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
}
