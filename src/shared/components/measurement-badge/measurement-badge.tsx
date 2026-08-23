import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useMeasurementSource } from 'src/shared/hooks/use-measurement-source';
import type { PowerSource } from 'src/shared/types/api';
import { accents } from 'src/styles/theme/tokens';

type Scope = 'host' | 'container';

type Props = {
    scope?: Scope;
    source?: PowerSource | null;
    size?: 'small' | 'medium';
};

const CHAINES: Record<PowerSource, string> = {
    BMC: "Consommation du châssis entier lue sur le contrôleur d'administration du serveur (Redfish).",
    BATTERY:
        'Consommation de la machine entière lue sur le contrôleur de batterie, pendant la décharge.',
    HWMON: "Consommation lue sur un capteur de puissance de la carte mère ou de l'alimentation.",
    RAPL: "Consommation du processeur et de sa mémoire lue sur les compteurs RAPL, majorée pour le reste de la machine.",
    MODEL: "Aucun capteur matériel n'est accessible sur cette machine : la valeur provient du modèle énergétique de la plateforme.",
};

const REPARTITION =
    "La part attribuée au conteneur est répartie au prorata des ressources qu'il consomme.";

export function MeasurementBadge({ scope = 'host', source, size = 'small' }: Props) {
    const { source: sourceActive } = useMeasurementSource();
    const effective: PowerSource = source ?? sourceActive ?? 'MODEL';
    const mesuree = effective !== 'MODEL';

    const libelle = mesuree ? 'mesuré' : 'estimé';
    const texte = scope === 'container' ? `${libelle} · réparti` : libelle;
    const infobulle =
        scope === 'container' ? `${CHAINES[effective]} ${REPARTITION}` : CHAINES[effective];

    const teinte = mesuree ? accents.energy : accents.overhead;

    return (
        <Tooltip title={infobulle} arrow placement="top">
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.375,
                    px: 0.75,
                    py: 0.125,
                    borderRadius: 1,
                    color: teinte.main,
                    backgroundColor: teinte.soft,
                    border: `1px solid ${alpha(teinte.main, 0.16)}`,
                    cursor: 'help',
                }}
            >
                <Icon
                    icon={mesuree ? 'solar:bolt-circle-bold' : 'solar:calculator-minimalistic-bold'}
                    width={size === 'medium' ? 14 : 12}
                />
                <Typography
                    variant="caption"
                    component="span"
                    sx={{
                        fontWeight: 600,
                        fontSize: size === 'medium' ? '0.75rem' : '0.6875rem',
                        lineHeight: 1.4,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {texte}
                </Typography>
            </Box>
        </Tooltip>
    );
}
