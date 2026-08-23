import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import { AuthProvider } from './auth/auth-provider';
import { QueryProvider } from './query/query-provider';
import { createAppTheme } from 'src/styles/theme/create-theme';

const theme = createAppTheme();

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <QueryProvider>
                <AuthProvider>
                    {children}
                    <Toaster position="top-right" richColors closeButton />
                </AuthProvider>
            </QueryProvider>
        </ThemeProvider>
    );
}
