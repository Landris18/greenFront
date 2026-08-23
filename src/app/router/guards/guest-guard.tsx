import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from 'src/features/auth/hooks/use-auth';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';

export function GuestGuard({ children }: { children: ReactNode }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
