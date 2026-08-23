import { Icon } from '@iconify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RecommendationCard } from '../cards/recommendation-card';
import { STATUS_OPTIONS } from 'src/features/optimize/constants';
import { optimizeService } from 'src/features/optimize/api/optimize-service';
import { projectService } from 'src/features/projects/api/project-service';
import { EmptyContent } from 'src/shared/components/empty-content/empty-content';
import { KpiCard } from 'src/shared/components/kpi-card/kpi-card';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import { Page } from 'src/shared/components/page/page';
import type { Recommendation, RecommendationStatus } from 'src/shared/types/api';
import { getErrorMessage } from 'src/shared/utils/error-handler';
import { formatCount, formatEnergy } from 'src/shared/utils/format';

export function OptimizeView() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<number | ''>(projectId ? Number(projectId) : '');
    const [status, setStatus] = useState<RecommendationStatus>('OPEN');
    const [search, setSearch] = useState('');

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(24),
    });

    useEffect(() => {
        if (selected === '' && projects && projects.length > 0) {
            setSelected(projects[0].project.id);
        }
    }, [projects, selected]);

    useEffect(() => {
        if (typeof selected === 'number' && String(selected) !== projectId) {
            navigate(`/optimiser/${selected}`, { replace: true });
        }
    }, [selected, projectId, navigate]);

    const { data: config } = useQuery({
        queryKey: ['project-config', selected],
        queryFn: () => projectService.config(selected as number),
        enabled: typeof selected === 'number',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['recommendations', selected, status],
        queryFn: () => optimizeService.list({ project_id: selected as number, status }),
        enabled: typeof selected === 'number',
    });

    const { mutate: register, isPending: isRegistering } = useMutation({
        mutationFn: () => projectService.register(selected as number),
        onSuccess: () => {
            toast.success(
                'Projet suivi. Le collecteur lira ses fichiers de configuration au prochain cycle.'
            );
            void queryClient.invalidateQueries({ queryKey: ['project-config'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    });

    const { mutate: analyze, isPending: isAnalyzing } = useMutation({
        mutationFn: () => projectService.analyze(selected as number),
        onSuccess: (result) => {
            toast.success(
                `Analyse terminée : ${result.open_total} recommandation(s) sur ${result.analysed_containers} conteneur(s) et ${result.analysed_services} service(s).`
            );
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: ({ id, next }: { id: number; next: RecommendationStatus }) =>
            optimizeService.updateStatus(id, next),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    });

    const filteredItems = useMemo(() => {
        const items = data?.dataset ?? [];
        const needle = search.trim().toLowerCase();
        if (!needle) return items;
        return items.filter(
            (item: Recommendation) =>
                item.title.toLowerCase().includes(needle) ||
                item.description.toLowerCase().includes(needle)
        );
    }, [data, search]);

    if (!projects) {
        return <LoadingScreen />;
    }

    const computed = filteredItems.filter((item) => item.saving_is_computed);
    const withPatch = filteredItems.filter((item) => item.patch);
    const savingEnergy = formatEnergy(
        computed.reduce((sum, item) => sum + (item.estimated_energy_saving_kwh ?? 0), 0)
    );

    return (
        <Page
            title="Optimisation"
            subtitle="Analyse croisée des mesures d'exécution et des fichiers de configuration"
            action={
                <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ justifyContent: 'flex-end' }}
                >
                    <TextField
                        select
                        size="small"
                        value={selected}
                        onChange={(event) => setSelected(Number(event.target.value))}
                        sx={{ minWidth: 200 }}
                    >
                        {projects.map((item) => (
                            <MenuItem key={item.project.id} value={item.project.id}>
                                {item.project.display_name ?? item.project.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        value={status}
                        onChange={(event) => setStatus(event.target.value as RecommendationStatus)}
                        sx={{ minWidth: 165 }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ minWidth: 200 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon icon="solar:magnifer-linear" width={18} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={() => analyze()}
                        disabled={isAnalyzing}
                        startIcon={<Icon icon="solar:magnifer-zoom-in-linear" width={18} />}
                    >
                        {isAnalyzing ? 'Analyse...' : 'Analyser'}
                    </Button>
                </Stack>
            }
        >
            <Grid container spacing={2.5}>
                <Grid size={12}>
                    <Card>
                        <CardContent>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={2}
                                sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
                            >
                                <Box>
                                    <Typography variant="subtitle2">
                                        Fichiers de configuration
                                    </Typography>
                                    {config?.is_registered ? (
                                        config.files.length > 0 ? (
                                            <Stack
                                                direction="row"
                                                spacing={0.75}
                                                flexWrap="wrap"
                                                useFlexGap
                                                sx={{ mt: 0.75 }}
                                            >
                                                {config.files.map((file) => (
                                                    <Chip
                                                        key={file.id}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        label={`${file.kind === 'COMPOSE' ? 'compose' : 'Dockerfile'}${
                                                            file.service_name
                                                                ? ` (${file.service_name})`
                                                                : ''
                                                        }`}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Lecture en cours au prochain cycle du collecteur.
                                            </Typography>
                                        )
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Ce projet n&apos;est pas encore suivi.
                                            L&apos;enregistrer permet à GreenSI de lire son
                                            docker-compose.yml et ses Dockerfile pour proposer des
                                            modifications concrètes.
                                        </Typography>
                                    )}
                                </Box>

                                {!config?.is_registered && (
                                    <Button
                                        variant="outlined"
                                        onClick={() => register()}
                                        disabled={isRegistering}
                                        startIcon={<Icon icon="solar:folder-check-linear" width={18} />}
                                    >
                                        Suivre ce projet
                                    </Button>
                                )}
                            </Stack>

                            {config?.config_error && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    {config.config_error}
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title="Recommandations"
                        value={formatCount(filteredItems.length)}
                        icon="solar:lightbulb-bold-duotone"
                        accent="alert"
                        loading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title="Modifications proposées"
                        value={formatCount(withPatch.length)}
                        unit="diff prêts"
                        icon="solar:code-square-bold-duotone"
                        accent="carbon"
                        caption="Applicables manuellement puis à relancer"
                        loading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title="Économie calculable"
                        value={savingEnergy.value}
                        unit={`${savingEnergy.unit} / 30 j`}
                        icon="solar:bolt-bold-duotone"
                        accent="energy"
                        caption={`${computed.length} recommandation(s) chiffrable(s)`}
                        loading={isLoading}
                    />
                </Grid>

                <Grid size={12}>
                    <Alert severity="info" icon={false}>
                        GreenSI ne modifie jamais vos fichiers. Il propose un diff que vous appliquez
                        vous-même avant de relancer le projet, puis la vue Comparaison mesure
                        l&apos;écart. Seules les recommandations portant un gain calculé sont
                        additionnées.
                    </Alert>
                </Grid>

                <Grid size={12}>
                    {isLoading ? (
                        <LoadingScreen />
                    ) : filteredItems.length === 0 ? (
                        <Card>
                            <EmptyContent
                                icon="solar:check-circle-linear"
                                title="Aucune recommandation"
                                description="Lancez une analyse pour croiser les mesures d'exécution et les fichiers de configuration."
                            />
                        </Card>
                    ) : (
                        <Stack spacing={2}>
                            {filteredItems.map((item) => (
                                <RecommendationCard
                                    key={item.id}
                                    item={item}
                                    onStatusChange={(id, next) => updateStatus({ id, next })}
                                />
                            ))}
                        </Stack>
                    )}
                </Grid>
            </Grid>
        </Page>
    );
}
