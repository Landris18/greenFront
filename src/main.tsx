import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { AppProvider } from 'src/app/providers';
import { routes } from 'src/app/router/routes';
import 'src/styles/global.css';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <AppProvider>
            <RouterProvider router={router} />
        </AppProvider>
    </StrictMode>
);
