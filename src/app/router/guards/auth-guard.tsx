import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from 'src/features/auth/hooks/use-auth';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';

export function AuthGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
    }

    return <>{children}</>;
}
