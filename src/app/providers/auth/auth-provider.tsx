import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AuthContext, type AuthContextValue } from './auth-context';
import { authService } from 'src/features/auth/api/auth-service';
import type { User, UserRole } from 'src/shared/types/api';
import { getStoredToken, setSession } from 'src/shared/utils/axios';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = useCallback(async () => {
        if (!getStoredToken()) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            setUser(await authService.me());
        } catch {
            setSession(null, null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void checkSession();
    }, [checkSession]);

    const signIn = useCallback(async (email: string, password: string) => {
        const response = await authService.login({ email, password });
        setSession(response.access_token, response.refresh_token);
        setUser(response.user);
    }, []);

    const signOut = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            setSession(null, null);
        }
        setSession(null, null);
        setUser(null);
    }, []);

    const hasRole = useCallback(
        (...roles: UserRole[]) => (user ? roles.includes(user.role) : false),
        [user]
    );

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            signIn,
            signOut,
            hasRole,
        }),
        [user, loading, signIn, signOut, hasRole]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
