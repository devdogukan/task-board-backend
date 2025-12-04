import { useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, getCurrentUser, token } = useAuth();

  useEffect(() => {
    // If we have a token but no user, try to get current user
    if (token && !isAuthenticated && !isLoading) {
      getCurrentUser().catch(() => {
        // If getCurrentUser fails, user will be redirected to login
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}

