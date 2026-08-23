import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppProvider } from 'src/app/providers';
import { routes } from 'src/app/router/routes';
import 'src/styles/global.css';

const router = createBrowserRouter(routes);

// Ce chargement a reussi : si un futur deploiement casse un chunk, on doit pouvoir
// retenter un rechargement automatique (voir route-error-boundary.tsx).
sessionStorage.removeItem('greensi:rechargement-chunk');

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    </StrictMode>
);
