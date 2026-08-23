import { Icon } from '@iconify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { ConsumptionHistoryChart } from '../charts/consumption-history-chart';
import { dashboardService } from 'src/features/dashboard/api/dashboard-service';
import { projectService } from 'src/features/projects/api/project-service';
import { EmptyContent } from 'src/shared/components/empty-content/empty-content';
import { KpiCard } from 'src/shared/components/kpi-card/kpi-card';
import { Page } from 'src/shared/components/page/page';
import { SectionCard } from 'src/shared/components/section-card/section-card';
import type { Granularity, Severity } from 'src/shared/types/api';
import { getErrorMessage } from 'src/shared/utils/error-handler';
import { formatCarbon, formatCount, formatEnergy, formatWatts } from 'src/shared/utils/format';
import { accents, chartPalette } from 'src/styles/theme/tokens';

const PERIODES = [
    { value: 24, label: '24 heures', court: '24 h', granularity: 'hour' as Granularity },
    { value: 168, label: '7 jours', court: '7 j', granularity: 'day' as Granularity },
    { value: 720, label: '30 jours', court: '30 j', granularity: 'day' as Granularity },
];

const OVERHEAD_EXPLICATION =
    "Part de la consommation de la machine qui n'est imputable à aucun conteneur : puissance à vide, " +
    "système d'exploitation et processus hors Docker. Elle ne disparaît pas si vous arrêtez un " +
    'conteneur. La somme des projets et de cette part égale exactement la puissance mesurée.';

const COULEUR_SEVERITE: Record<Severity, string> = {
    CRITICAL: accents.saturation.main,
    HIGH: accents.saturation.main,
    MEDIUM: accents.alert.main,
    LOW: accents.overhead.main,
};

const LIBELLE_SEVERITE: Record<Severity, string> = {
    CRITICAL: 'Critique',
    HIGH: 'Élevée',
    MEDIUM: 'Moyenne',
    LOW: 'Faible',
};

function variation(courant: number | undefined, precedent: number | undefined): number | null {
    if (!courant || !precedent) {
        return null;
    }
    return ((courant - precedent) / precedent) * 100;
}

export function DashboardView() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [heures, setHeures] = useState(168);

    const periode = PERIODES.find((item) => item.value === heures) ?? PERIODES[1];
    const fenetre = { hours: heures, granularity: periode.granularity };

    const { data: projets, isLoading: projetsEnCours } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(heures),
        refetchInterval: 5000,
    });

    const { data: totaux } = useQuery({
        queryKey: ['dashboard-totaux', heures],
        queryFn: () => dashboardService.totaux(fenetre),
        refetchInterval: 15000,
    });

    const { data: precedents } = useQuery({
        queryKey: ['dashboard-precedents', heures],
        queryFn: () => dashboardService.totauxPrecedents(fenetre),
        refetchInterval: 60000,
    });

    const { data: historique = [], isLoading: historiqueEnCours } = useQuery({
        queryKey: ['dashboard-historique', heures, periode.granularity],
        queryFn: () => dashboardService.historiqueParProjet(fenetre),
        refetchInterval: 30000,
    });

    const { data: repartition = [] } = useQuery({
        queryKey: ['dashboard-repartition', heures],
        queryFn: () => dashboardService.repartitionParProjet(fenetre),
        refetchInterval: 30000,
    });

    const { data: overhead } = useQuery({
        queryKey: ['dashboard-overhead', heures],
        queryFn: () => dashboardService.overhead(fenetre),
        refetchInterval: 30000,
    });

    const { data: priorites } = useQuery({
        queryKey: ['dashboard-priorites'],
        queryFn: () => dashboardService.priorites(),
        refetchInterval: 15000,
    });

    const { mutate: analyserTout, isPending: analyseEnCours } = useMutation({
        mutationFn: async () => {
            const cibles = (projets ?? []).filter((item) => item.container_count > 0);
            for (const cible of cibles) {
                await projectService.analyze(cible.project.id);
            }
            return cibles.length;
        },
        onSuccess: (nombre) => {
            toast.success(`Analyse terminée sur ${nombre} projet(s).`);
            void queryClient.invalidateQueries({ queryKey: ['dashboard-priorites'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (erreur: unknown) => toast.error(getErrorMessage(erreur)),
    });

    const synthese = useMemo(() => {
        const items = projets ?? [];
        return {
            conteneurs: items.reduce((somme, item) => somme + item.container_count, 0),
            actifs: items.reduce((somme, item) => somme + item.running_count, 0),
            puissance: items.reduce((somme, item) => somme + item.power_watts, 0),
            alertes: items.reduce((somme, item) => somme + item.recommendation_count, 0),
            critiques: items.reduce((somme, item) => somme + item.critical_count, 0),
            projetsActifs: items.filter((item) => item.running_count > 0).length,
        };
    }, [projets]);

    const economie = useMemo(
        () =>
            (priorites?.dataset ?? [])
                .filter((item) => item.saving_is_computed)
                .reduce((somme, item) => somme + (item.estimated_energy_saving_kwh ?? 0), 0),
        [priorites]
    );

    const courbe = useMemo(() => {
        const parInstant = new Map<string, number>();
        for (const serie of historique) {
            for (const point of serie.points) {
                parInstant.set(
                    point.timestamp,
                    (parInstant.get(point.timestamp) ?? 0) + point.energy_kwh
                );
            }
        }
        return [...parInstant.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, valeur]) => valeur);
    }, [historique]);

    const energie = formatEnergy(totaux?.energy_kwh);
    const carbone = formatCarbon(totaux?.co2_kg);
    const puissance = formatWatts(synthese.puissance);
    const gain = formatEnergy(economie);
    const partOverhead = overhead?.energy_kwh ?? 0;
    const totalRepartition =
        repartition.reduce((somme, item) => somme + item.energy_kwh, 0) + partOverhead || 1;
    const evolution = variation(totaux?.energy_kwh, precedents?.energy_kwh);

    if (!projetsEnCours && (projets ?? []).length === 0) {
        return (
            <Page title="Tableau de bord">
                <Card>
                    <EmptyContent
                        icon="solar:widget-5-linear"
                        title="Aucun projet détecté"
                        description="GreenSI interroge Docker en continu. Démarrez un conteneur et il apparaîtra ici automatiquement."
                    />
                </Card>
            </Page>
        );
    }

    return (
        <Page
            title="Tableau de bord"
            subtitle={`${synthese.projetsActifs} projet(s) actif(s) sur la machine, mesure poussée chaque seconde`}
            action={
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={heures}
                        onChange={(_, valeur) => valeur && setHeures(valeur)}
                    >
                        {PERIODES.map((item) => (
                            <ToggleButton key={item.value} value={item.value}>
                                {item.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Button
                        variant="contained"
                        onClick={() => analyserTout()}
                        disabled={analyseEnCours}
                        startIcon={<Icon icon="solar:magnifer-zoom-in-linear" width={17} />}
                    >
                        {analyseEnCours ? 'Analyse...' : 'Analyser tout'}
                    </Button>
                </Stack>
            }
        >
            {analyseEnCours && <LinearProgress sx={{ mb: 2.5, borderRadius: 4 }} />}

            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Énergie consommée"
                        value={energie.value}
                        unit={energie.unit}
                        icon="solar:bolt-bold-duotone"
                        accent="energy"
                        measurement="host"
                        sparkline={courbe}
                        trend={evolution}
                        trendLabel={
                            evolution === null
                                ? `Sur ${periode.label.toLowerCase()}`
                                : `contre ${periode.court} précédents`
                        }
                        onClick={() => navigate('/comparaison')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Empreinte carbone"
                        value={carbone.value}
                        unit={carbone.unit}
                        icon="solar:leaf-bold-duotone"
                        accent="carbon"
                        measurement="host"
                        trend={evolution}
                        trendLabel={`Puissance actuelle : ${puissance.value} ${puissance.unit}`}
                        onClick={() => navigate('/comparaison')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Conteneurs actifs"
                        value={formatCount(synthese.actifs)}
                        unit={`sur ${formatCount(synthese.conteneurs)}`}
                        icon="solar:box-bold-duotone"
                        accent="containers"
                        caption={`${synthese.projetsActifs} projet(s) en fonctionnement`}
                        onClick={() => navigate('/conteneurs')}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Économie calculable"
                        value={gain.value}
                        unit={`${gain.unit} / 30 j`}
                        icon="solar:tag-price-bold-duotone"
                        accent="savings"
                        caption={`${synthese.alertes} recommandation(s), dont ${synthese.critiques} prioritaire(s)`}
                        onClick={() => navigate('/optimiser')}
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <ConsumptionHistoryChart
                        series={historique}
                        loading={historiqueEnCours}
                        subtitle={`Énergie par projet, cumul ${
                            periode.granularity === 'hour' ? 'horaire' : 'journalier'
                        }`}
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <SectionCard
                        title="Priorités"
                        subtitle={`${synthese.critiques} recommandation(s) prioritaire(s)`}
                        action={
                            <Button size="small" onClick={() => navigate('/optimiser')}>
                                Tout voir
                            </Button>
                        }
                    >
                        {(priorites?.dataset ?? []).length === 0 ? (
                            <EmptyContent
                                icon="solar:check-circle-linear"
                                title="Aucune recommandation"
                                description="Lancez une analyse pour détecter les possibilités d'optimisation."
                                height={220}
                            />
                        ) : (
                            <Stack spacing={1}>
                                {(priorites?.dataset ?? []).slice(0, 6).map((item) => {
                                    const couleur = COULEUR_SEVERITE[item.severity];
                                    const economieItem = formatEnergy(
                                        item.estimated_energy_saving_kwh
                                    );

                                    return (
                                        <Stack
                                            key={item.id}
                                            direction="row"
                                            spacing={1.5}
                                            onClick={() => navigate(`/optimiser/${item.project_id}`)}
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: 'grey.50',
                                                transition: 'background-color 140ms',
                                                '&:hover': { backgroundColor: 'grey.100' },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 3,
                                                    alignSelf: 'stretch',
                                                    borderRadius: 3,
                                                    backgroundColor: couleur,
                                                }}
                                            />
                                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {item.title}
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    spacing={0.75}
                                                    sx={{ alignItems: 'center', mt: 0.25 }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: couleur, fontWeight: 700 }}
                                                    >
                                                        {LIBELLE_SEVERITE[item.severity]}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        noWrap
                                                    >
                                                        {item.saving_is_computed
                                                            ? `${economieItem.value} ${economieItem.unit} sur 30 jours`
                                                            : 'gain non quantifiable en kWh'}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            {item.patch && (
                                                <Tooltip title="Une modification est proposée">
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            color: accents.carbon.main,
                                                        }}
                                                    >
                                                        <Icon
                                                            icon="solar:code-square-bold-duotone"
                                                            width={18}
                                                        />
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Stack>
                                    );
                                })}
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 5 }}>
                    <SectionCard
                        title="Répartition par projet"
                        subtitle="Part attribuée à chaque projet, et part non imputable"
                    >
                        {repartition.length === 0 ? (
                            <EmptyContent
                                title="Aucune consommation attribuée"
                                description="Aucune mesure sur la période sélectionnée."
                                height={200}
                            />
                        ) : (
                            <Stack spacing={2.25}>
                                {repartition.map((item, index) => {
                                    const valeur = formatEnergy(item.energy_kwh);
                                    const part = (item.energy_kwh / totalRepartition) * 100;
                                    const couleur = chartPalette[index % chartPalette.length];

                                    return (
                                        <Box key={item.entity_id}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                sx={{ alignItems: 'center', mb: 0.75 }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 9,
                                                        height: 9,
                                                        borderRadius: '50%',
                                                        backgroundColor: couleur,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="subtitle2"
                                                    noWrap
                                                    sx={{ flexGrow: 1 }}
                                                >
                                                    {item.label}
                                                </Typography>
                                                <Typography variant="subtitle2">
                                                    {valeur.value} {valeur.unit}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ width: 42, textAlign: 'right' }}
                                                >
                                                    {part.toFixed(0)} %
                                                </Typography>
                                            </Stack>
                                            <Box
                                                sx={{
                                                    height: 7,
                                                    borderRadius: 4,
                                                    backgroundColor: 'grey.100',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${part}%`,
                                                        height: 1,
                                                        borderRadius: 4,
                                                        backgroundColor: couleur,
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    );
                                })}

                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        sx={{ alignItems: 'center', mb: 0.75 }}
                                    >
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                backgroundColor: accents.overhead.main,
                                                flexShrink: 0,
                                            }}
                                        />
                                        <Tooltip title={OVERHEAD_EXPLICATION}>
                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                sx={{
                                                    alignItems: 'center',
                                                    flexGrow: 1,
                                                    minWidth: 0,
                                                    cursor: 'help',
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    noWrap
                                                    sx={{ color: 'text.secondary' }}
                                                >
                                                    Overhead infrastructure
                                                </Typography>
                                                <Icon
                                                    icon="solar:question-circle-linear"
                                                    width={14}
                                                    color={accents.overhead.main}
                                                />
                                            </Stack>
                                        </Tooltip>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            {formatEnergy(partOverhead).value}{' '}
                                            {formatEnergy(partOverhead).unit}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ width: 42, textAlign: 'right' }}
                                        >
                                            {((partOverhead / totalRepartition) * 100).toFixed(0)} %
                                        </Typography>
                                    </Stack>
                                    <Box
                                        sx={{
                                            height: 7,
                                            borderRadius: 4,
                                            backgroundColor: 'grey.100',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(partOverhead / totalRepartition) * 100}%`,
                                                height: 1,
                                                borderRadius: 4,
                                                backgroundColor: accents.overhead.main,
                                            }}
                                        />
                                    </Box>
                                </Box>
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }}>
                    <SectionCard
                        title="Projets"
                        subtitle="Cliquez sur une ligne pour ouvrir ses recommandations"
                        dense
                    >
                        <Stack spacing={0.5}>
                            {(projets ?? []).map((item, index) => {
                                const w = formatWatts(item.power_watts);
                                const kwh = formatEnergy(item.energy_kwh);
                                const actif = item.running_count > 0;

                                return (
                                    <Stack
                                        key={item.project.id}
                                        direction="row"
                                        spacing={2}
                                        onClick={() => navigate(`/optimiser/${item.project.id}`)}
                                        sx={{
                                            px: 1.5,
                                            py: 1.35,
                                            borderRadius: 2,
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            transition: 'background-color 140ms',
                                            '&:hover': { backgroundColor: 'grey.50' },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                borderRadius: '50%',
                                                flexShrink: 0,
                                                backgroundColor: actif
                                                    ? chartPalette[index % chartPalette.length]
                                                    : 'grey.300',
                                            }}
                                        />
                                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                            <Typography variant="subtitle2" noWrap>
                                                {item.project.display_name ?? item.project.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatCount(item.running_count)} /{' '}
                                                {formatCount(item.container_count)} conteneur(s)
                                            </Typography>
                                        </Box>

                                        <Box sx={{ textAlign: 'right', width: 96 }}>
                                            <Typography variant="subtitle2">
                                                {w.value} {w.unit}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {kwh.value} {kwh.unit}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ width: 52, textAlign: 'right' }}>
                                            {item.recommendation_count === 0 ? (
                                                <Typography variant="caption" color="text.disabled">
                                                    aucune
                                                </Typography>
                                            ) : (
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        px: 1,
                                                        py: 0.3,
                                                        borderRadius: 1.5,
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        color:
                                                            item.critical_count > 0
                                                                ? 'error.dark'
                                                                : 'warning.dark',
                                                        backgroundColor: (theme) =>
                                                            alpha(
                                                                item.critical_count > 0
                                                                    ? theme.palette.error.main
                                                                    : theme.palette.warning.main,
                                                                0.12
                                                            ),
                                                    }}
                                                >
                                                    {item.recommendation_count}
                                                </Box>
                                            )}
                                        </Box>
                                    </Stack>
                                );
                            })}
                        </Stack>
                    </SectionCard>
                </Grid>

            </Grid>
        </Page>
    );
}
