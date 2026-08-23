import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from 'src/app/providers/auth/auth-context';

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth doit être utilise a l'interieur de AuthProvider");
    }
    return context;
}
