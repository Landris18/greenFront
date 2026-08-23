import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const CLE_RECHARGEMENT = 'greensi:rechargement-chunk';

function estErreurDeChunkPerime(erreur: unknown): boolean {
    const message = erreur instanceof Error ? erreur.message : String(erreur);
    return /dynamically imported module|failed to fetch dynamically imported module|importing a module script failed/i.test(
        message
    );
}

export function RouteErrorBoundary() {
    const erreur = useRouteError();
    const reponseRoute = isRouteErrorResponse(erreur);

    useEffect(() => {
        if (reponseRoute) {
            return;
        }
        if (!estErreurDeChunkPerime(erreur)) {
            return;
        }
        // Un nouveau deploiement a change les fichiers hashes pendant que l'onglet etait
        // ouvert avec l'ancien bundle : un seul rechargement complet resout le probleme,
        // au-dela on affiche l'ecran d'erreur pour ne pas boucler indefiniment.
        if (sessionStorage.getItem(CLE_RECHARGEMENT) === 'en-cours') {
            return;
        }
        sessionStorage.setItem(CLE_RECHARGEMENT, 'en-cours');
        window.location.reload();
    }, [erreur, reponseRoute]);

    return (
        <Stack
            spacing={2}
            sx={{
                minHeight: '60vh',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                p: 3,
            }}
        >
            <Typography variant="h5">Une erreur est survenue</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                {reponseRoute
                    ? 'La page demandée est introuvable.'
                    : "L'application a peut-être été mise à jour pendant que cet onglet était ouvert. Recharger la page résout généralement ce problème."}
            </Typography>
            <Button
                variant="contained"
                onClick={() => {
                    sessionStorage.removeItem(CLE_RECHARGEMENT);
                    window.location.reload();
                }}
            >
                Recharger la page
            </Button>
        </Stack>
    );
}
