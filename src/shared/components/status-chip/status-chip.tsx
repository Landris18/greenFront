import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import type { ResourceStatus, Severity } from 'src/shared/types/api';
import { accents } from 'src/styles/theme/tokens';

type Teinte = { main: string; soft: string };
type Etat = { label: string; teinte: Teinte };

const RESOURCE_LABELS: Record<ResourceStatus, Etat> = {
    ONLINE: { label: 'En ligne', teinte: accents.energy },
    OFFLINE: { label: 'Hors ligne', teinte: accents.overhead },
    ERROR: { label: 'Erreur', teinte: accents.saturation },
    UNKNOWN: { label: 'Inconnu', teinte: accents.overhead },
};

const CONTAINER_LABELS: Record<string, Etat> = {
    running: { label: 'En cours', teinte: accents.energy },
    exited: { label: 'Arrêté', teinte: accents.overhead },
    paused: { label: 'En pause', teinte: accents.alert },
    restarting: { label: 'Redémarrage', teinte: accents.alert },
    created: { label: 'Créé', teinte: accents.power },
    dead: { label: 'Mort', teinte: accents.saturation },
    removing: { label: 'Suppression', teinte: accents.alert },
    absent: { label: 'Disparu', teinte: accents.overhead },
    unknown: { label: 'Inconnu', teinte: accents.overhead },
};

const SEVERITY_LABELS: Record<Severity, Etat> = {
    CRITICAL: { label: 'Critique', teinte: accents.saturation },
    HIGH: { label: 'Élevée', teinte: accents.saturation },
    MEDIUM: { label: 'Moyenne', teinte: accents.alert },
    LOW: { label: 'Faible', teinte: accents.overhead },
};

function Pastille({ label, teinte, point = true }: Etat & { point?: boolean }) {
    return (
        <Box
            component="span"
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.625,
                px: 0.875,
                py: 0.25,
                borderRadius: 1.5,
                whiteSpace: 'nowrap',
                color: teinte.main,
                backgroundColor: teinte.soft,
                border: `1px solid ${alpha(teinte.main, 0.16)}`,
            }}
        >
            {point && (
                <Box
                    component="span"
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        flexShrink: 0,
                        backgroundColor: teinte.main,
                    }}
                />
            )}
            <Typography
                component="span"
                variant="caption"
                sx={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1.5 }}
            >
                {label}
            </Typography>
        </Box>
    );
}

export function ResourceStatusChip({ status }: { status: ResourceStatus }) {
    const etat = RESOURCE_LABELS[status] ?? RESOURCE_LABELS.UNKNOWN;
    return <Pastille {...etat} />;
}

export function ContainerStatusChip({ status }: { status: string }) {
    const etat = CONTAINER_LABELS[status] ?? CONTAINER_LABELS.unknown;
    return <Pastille {...etat} />;
}

export function SeverityChip({ severity }: { severity: Severity }) {
    const etat = SEVERITY_LABELS[severity] ?? SEVERITY_LABELS.LOW;
    return <Pastille {...etat} point={false} />;
}
