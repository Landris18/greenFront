import { Icon } from '@iconify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { EnergyModelCard } from '../energy-model-card';
import {
    settingsService,
    type GreenConfigPayload,
} from 'src/features/settings/api/settings-service';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import { Page } from 'src/shared/components/page/page';
import type { GreenConfig } from 'src/shared/types/api';
import { getErrorMessage } from 'src/shared/utils/error-handler';
import { accents } from 'src/styles/theme/tokens';

const MB = 1024 * 1024;

type Seuil = {
    key: keyof GreenConfigPayload;
    label: string;
    unite: string;
    min: number;
    pas?: string;
};

const SEUILS: Seuil[] = [
    {
        key: 'threshold_cpu_high_percent',
        label: 'Saturation CPU',
        unite: '% de la limite',
        min: 1,
        pas: '1',
    },
    {
        key: 'threshold_memory_high_percent',
        label: 'Saturation mémoire',
        unite: '% de la limite',
        min: 1,
        pas: '1',
    },
    {
        key: 'threshold_cpu_underuse_percent',
        label: 'Sous-utilisation CPU',
        unite: '% de la limite',
        min: 1,
        pas: '1',
    },
    {
        key: 'threshold_memory_underuse_percent',
        label: 'Sous-utilisation mémoire',
        unite: '% de la limite',
        min: 1,
        pas: '1',
    },
    { key: 'threshold_idle_cpu_percent', label: 'Inactivité CPU', unite: '%', min: 0, pas: '0.1' },
    {
        key: 'threshold_idle_hours',
        label: "Durée avant inactivité",
        unite: 'heures',
        min: 1,
        pas: '1',
    },
];

function IndicateurEnregistrement({ etat }: { etat: 'repos' | 'envoi' | 'enregistre' }) {
    if (etat === 'repos') {
        return null;
    }

    const enCours = etat === 'envoi';

    return (
        <Stack
            direction="row"
            spacing={0.75}
            sx={{
                alignItems: 'center',
                px: 1.25,
                py: 0.5,
                borderRadius: 2,
                color: enCours ? 'text.secondary' : 'primary.dark',
                backgroundColor: enCours ? accents.overhead.soft : accents.energy.soft,
            }}
        >
            <Icon
                icon={enCours ? 'solar:refresh-linear' : 'solar:check-circle-bold'}
                width={16}
            />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {enCours ? 'Enregistrement...' : 'Enregistré'}
            </Typography>
        </Stack>
    );
}

export function SettingsView() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState<GreenConfigPayload | null>(null);
    const [seuilImageMo, setSeuilImageMo] = useState(1024);
    const [etat, setEtat] = useState<'repos' | 'envoi' | 'enregistre'>('repos');
    const dernierEnvoi = useRef<string>('');

    const { data, isLoading } = useQuery({
        queryKey: ['green-config'],
        queryFn: () => settingsService.get(),
    });

    useEffect(() => {
        if (!data) {
            return;
        }
        const {
            id: _id,
            version: _version,
            is_active: _isActive,
            created_by: _createdBy,
            created_at: _createdAt,
            updated_at: _updatedAt,
            calibration_note: _calibrationNote,
            ...payload
        } = data as GreenConfig;
        setForm(payload);
        setSeuilImageMo(Math.round(payload.threshold_image_size_bytes / MB));
        dernierEnvoi.current = JSON.stringify(payload);
    }, [data]);

    const { mutate: publier } = useMutation({
        mutationFn: (payload: GreenConfigPayload) => settingsService.update(payload),
        onMutate: () => setEtat('envoi'),
        onSuccess: () => {
            setEtat('enregistre');
            void queryClient.invalidateQueries({ queryKey: ['green-config'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (erreur: unknown) => {
            setEtat('repos');
            toast.error(getErrorMessage(erreur));
        },
    });

    if (isLoading || !form) {
        return <LoadingScreen />;
    }

    const modifier = (cle: keyof GreenConfigPayload, valeur: string) => {
        setForm((courant) => (courant ? { ...courant, [cle]: Number(valeur) } : courant));
    };

    const restaurer = () => {
        const dernier = JSON.parse(dernierEnvoi.current) as GreenConfigPayload;
        setForm(dernier);
        setSeuilImageMo(Math.round(dernier.threshold_image_size_bytes / MB));
    };

    const enregistrer = (valeurBrute: string, minimum: number, imageMo = seuilImageMo) => {
        const nombre = Number(valeurBrute);
        if (valeurBrute.trim() === '' || Number.isNaN(nombre) || nombre < minimum) {
            restaurer();
            return;
        }
        const payload = { ...form, threshold_image_size_bytes: imageMo * MB };
        const signature = JSON.stringify(payload);
        if (signature === dernierEnvoi.current) {
            return;
        }
        dernierEnvoi.current = signature;
        publier(payload);
    };

    return (
        <Page
            title="Paramètres Green IT"
            subtitle={`Version active : ${data?.version ?? '-'}. Chaque modification crée une nouvelle version et laisse les mesures passées inchangées.`}
            action={<IndicateurEnregistrement etat={etat} />}
        >
            <Grid container spacing={2.5} alignItems="flex-start">
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card>
                        <CardHeader
                            title="Seuils d'alerte"
                            subheader="Ce qui déclenche une recommandation lors d'une analyse"
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                {SEUILS.map((seuil) => (
                                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={String(seuil.key)}>
                                        <TextField
                                            fullWidth
                                            type="number"
                                            size="small"
                                            label={seuil.label}
                                            value={String(form[seuil.key] ?? '')}
                                            onChange={(evenement) =>
                                                modifier(seuil.key, evenement.target.value)
                                            }
                                            onBlur={(evenement) =>
                                                enregistrer(evenement.target.value, seuil.min)
                                            }
                                            helperText={seuil.unite}
                                            slotProps={{
                                                htmlInput: seuil.pas
                                                    ? { step: seuil.pas }
                                                    : undefined,
                                            }}
                                        />
                                    </Grid>
                                ))}

                                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        size="small"
                                        label="Image volumineuse"
                                        value={seuilImageMo}
                                        onChange={(evenement) =>
                                            setSeuilImageMo(Number(evenement.target.value))
                                        }
                                        onBlur={(evenement) =>
                                            enregistrer(
                                                evenement.target.value,
                                                1,
                                                Number(evenement.target.value)
                                            )
                                        }
                                        helperText="Mo"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card>
                        <CardHeader
                            title="Facteur d'émission"
                            subheader="Convertit l'énergie en empreinte carbone"
                        />
                        <CardContent>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    label="Facteur"
                                    value={String(form.emission_factor_g_per_kwh)}
                                    onChange={(evenement) =>
                                        modifier('emission_factor_g_per_kwh', evenement.target.value)
                                    }
                                    onBlur={(evenement) => enregistrer(evenement.target.value, 0.1)}
                                    helperText="gCO2e par kWh"
                                    slotProps={{ htmlInput: { step: '0.1' } }}
                                />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Source
                                    </Typography>
                                    <Typography variant="subtitle2">
                                        {form.emission_factor_label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Référence citée dans les rapports
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={12}>
                    <EnergyModelCard config={data as GreenConfig} />
                </Grid>
            </Grid>
        </Page>
    );
}
