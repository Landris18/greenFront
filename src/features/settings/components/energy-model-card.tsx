import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { GreenConfig } from 'src/shared/types/api';
import { accents } from 'src/styles/theme/tokens';

const SOURCES = [
    {
        rang: 1,
        nom: 'BMC / Redfish',
        portee: 'Châssis entier, alimentations comprises',
        disponible: 'Serveur avec contrôleur d’administration',
    },
    {
        rang: 2,
        nom: 'Batterie',
        portee: 'Machine entière, pendant la décharge',
        disponible: 'Portable, sur batterie',
    },
    {
        rang: 3,
        nom: 'hwmon',
        portee: 'Capteur d’alimentation ou de VRM',
        disponible: 'Carte mère qui l’expose',
    },
    {
        rang: 4,
        nom: 'RAPL',
        portee: 'Processeur et mémoire proche',
        disponible: 'Machine physique Intel ou AMD',
    },
    {
        rang: 5,
        nom: 'Modèle',
        portee: 'Aucune — calcul à partir de l’usage CPU/mémoire',
        disponible: 'Partout, y compris en machine virtuelle',
    },
];

function Formule({ children }: { children: string }) {
    return (
        <Box
            component="pre"
            sx={{
                m: 0,
                p: 1.5,
                borderRadius: 1.5,
                backgroundColor: accents.overhead.soft,
                fontFamily: 'monospace',
                fontSize: '0.8125rem',
                lineHeight: 1.7,
                overflowX: 'auto',
                whiteSpace: 'pre',
            }}
        >
            {children}
        </Box>
    );
}

export function EnergyModelCard({ config }: { config: GreenConfig }) {
    const poidsPourcent = (valeur: number) => `${Math.round(valeur * 100)} %`;

    return (
        <Card>
            <CardHeader
                title="Comment fonctionne le modèle énergétique"
                subheader="Trois étapes : mesurer la machine, répartir entre les conteneurs, convertir en carbone"
            />
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            1. Puissance de la machine
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            À chaque seconde, le collecteur interroge la première source disponible
                            dans cet ordre. Une source mesurée couvre déjà toute la machine ; seule
                            RAPL (processeur uniquement) reçoit une majoration pour approcher la
                            consommation totale.
                        </Typography>
                        <Grid container spacing={1}>
                            {SOURCES.map((source) => (
                                <Grid size={12} key={source.rang}>
                                    <Stack
                                        direction="row"
                                        spacing={1.5}
                                        sx={{ alignItems: 'center', py: 0.5 }}
                                    >
                                        <Chip
                                            size="small"
                                            label={source.rang}
                                            sx={{ minWidth: 28, fontWeight: 700 }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: 600, minWidth: 110 }}
                                        >
                                            {source.nom}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ flex: 1 }}
                                        >
                                            {source.portee}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.disabled"
                                            sx={{ display: { xs: 'none', md: 'block' } }}
                                        >
                                            {source.disponible}
                                        </Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Majoration actuelle appliquée à RAPL uniquement :{' '}
                            <strong>×{(1 + config.non_cpu_overhead_ratio).toFixed(2)}</strong>
                            {config.calibration_note
                                ? ` — ${config.calibration_note}`
                                : ' — valeur par défaut, non recalibrée automatiquement sur cette machine.'}
                        </Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            2. Attribution à chaque conteneur
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            Seule la puissance <strong>dynamique</strong> — au-delà d'une puissance à
                            vide théorique — est répartie. Le reste (<code>Overhead</code>) couvre la
                            puissance à vide et les processus non supervisés ; il n'est attribué à
                            aucun conteneur.
                        </Typography>
                        <Formule>{`P_dynamique = max(0, P_hôte − P_idle)          P_idle = ${config.p_idle_watts} W, P_max = ${config.p_max_watts} W

part_conteneur = ${poidsPourcent(config.weight_cpu)}·(cpu) + ${poidsPourcent(config.weight_memory)}·(mémoire) + ${poidsPourcent(config.weight_io)}·(E/S) + ${poidsPourcent(config.weight_network)}·(réseau)

P_conteneur = P_dynamique × part_conteneur
Overhead    = P_hôte − Σ P_conteneur`}</Formule>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Les proportions cpu/mémoire/E-S/réseau sont calculées par rapport à
                            l'usage réellement mesuré sur l'hôte, pas à sa capacité totale — sinon la
                            charge des processus non supervisés serait injustement redistribuée entre
                            les conteneurs observés. Mémoire estimée à {config.mem_power_w_per_gb} W/Go.
                        </Typography>
                    </Box>

                    <Divider />

                    <Box>
                        <Typography variant="subtitle2" gutterBottom>
                            3. Énergie et empreinte carbone
                        </Typography>
                        <Formule>{`kWh   = W × durée / 3 600 000
gCO2e = kWh × facteur d'émission (${config.emission_factor_g_per_kwh} gCO2e/kWh — ${config.emission_factor_label})`}</Formule>
                    </Box>

                    <Divider />

                    <Typography variant="caption" color="text.secondary">
                        Limite assumée : la part attribuée à un conteneur est une <strong>répartition
                        calculée</strong>, jamais une mesure électrique directe de ce conteneur. Seule
                        la puissance de la machine entière peut être mesurée ; les autres valeurs sont
                        estimées à partir de ce modèle, documenté et reproductible.
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
}
