import Box from '@mui/material/Box';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header } from './header';
import { Nav } from './nav';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import { layout } from 'src/styles/theme/tokens';

export function DashboardLayout() {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Nav open={navOpen} onClose={() => setNavOpen(false)} />

            <Box sx={{ ml: { lg: `${layout.navWidth}px` } }}>
                <Header onOpenNav={() => setNavOpen(true)} />
                <Box
                    component="main"
                    sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1520, mx: 'auto' }}
                >
                    <Suspense fallback={<LoadingScreen />}>
                        <Outlet />
                    </Suspense>
                </Box>
            </Box>
        </Box>
    );
}
