import { lazy, Suspense } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { AuthGuard } from './guards/auth-guard';
import { GuestGuard } from './guards/guest-guard';
import { RouteErrorBoundary } from './route-error-boundary';
import { DashboardLayout } from 'src/layouts/dashboard/layout';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';

const LoginPage = lazy(() => import('src/pages/login'));
const DashboardPage = lazy(() => import('src/pages/dashboard'));
const ProjectsPage = lazy(() => import('src/pages/projects'));
const LivePage = lazy(() => import('src/pages/live'));
const BilanPage = lazy(() => import('src/pages/bilan'));
const OptimizePage = lazy(() => import('src/pages/optimize'));
const KanbanPage = lazy(() => import('src/pages/kanban'));
const ContainerDetailPage = lazy(() => import('src/pages/container-detail'));
const SettingsPage = lazy(() => import('src/pages/settings'));

export const routes: RouteObject[] = [
    {
        path: '/connexion',
        element: (
            <GuestGuard>
                <Suspense fallback={<LoadingScreen />}>
                    <LoginPage />
                </Suspense>
            </GuestGuard>
        ),
        errorElement: <RouteErrorBoundary />,
    },
    {
        path: '/',
        element: (
            <AuthGuard>
                <DashboardLayout />
            </AuthGuard>
        ),
        errorElement: <RouteErrorBoundary />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'conteneurs', element: <ProjectsPage /> },
            { path: 'conteneurs/:containerId', element: <ContainerDetailPage /> },
            { path: 'bilan', element: <BilanPage /> },
            { path: 'comparaison', element: <LivePage /> },
            { path: 'optimiser', element: <OptimizePage /> },
            { path: 'optimiser/:projectId', element: <OptimizePage /> },
            { path: 'kanban', element: <KanbanPage /> },
            { path: 'kanban/:projectId', element: <KanbanPage /> },
            { path: 'parametres', element: <SettingsPage /> },
        ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
];
