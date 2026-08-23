import { createContext } from 'react';

import type { User, UserRole } from 'src/shared/types/api';

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    hasRole: (...roles: UserRole[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
