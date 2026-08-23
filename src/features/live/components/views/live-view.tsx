import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { LiveChart } from '../charts/live-chart';
import { liveService } from 'src/features/live/api/live-service';
import { projectService } from 'src/features/projects/api/project-service';
import { EmptyContent } from 'src/shared/components/empty-content/empty-content';
import { MeasurementBadge } from 'src/shared/components/measurement-badge/measurement-badge';
import { MiniBar } from 'src/shared/components/mini-bar/mini-bar';
import { Page } from 'src/shared/components/page/page';
import type { LiveSeries } from 'src/shared/types/api';
import { formatCarbon, formatEnergy, formatGain, formatWatts } from 'src/shared/utils/format';
import { accents, surface } from 'src/styles/theme/tokens';

export type LiveMetric = 'energy_cumulative' | 'co2_cumulative' | 'power' | 'cpu' | 'memory';

const METRICS: { value: LiveMetric; label: string }[] = [
    { value: 'energy_cumulative', label: 'Énergie cumulée' },
    { value: 'co2_cumulative', label: 'CO2 cumulé' },
    { value: 'power', label: 'Puissance' },
    { value: 'cpu', label: 'CPU' },
    { value: 'memory', label: 'Mémoire' },
];

const COULEUR_A = accents.alert;
const COULEUR_B = accents.energy;

const ENTETE_SX = {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    whiteSpace: 'nowrap',
} as const;

const WINDOWS = [
    { value: 120, label: '2 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' },
];

function ComparisonRow({ label, a, b, format }: {
    label: string;
    a: number;
    b: number;
    format: (value: number) => string;
}) {
    const gain = a === 0 ? null : ((a - b) / a) * 100;
    const improved = (gain ?? 0) > 0;

    return (
        <TableRow>
            <TableCell>
                <Typography variant="subtitle2">{label}</Typography>
            </TableCell>
            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {format(a)}
            </TableCell>
            <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {format(b)}
            </TableCell>
            <TableCell align="right">
                <Box
                    component="span"
                    sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1.5,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: gain === null ? 'text.secondary' : improved ? 'primary.dark' : 'error.dark',
                        backgroundColor:
                            gain === null
                                ? accents.overhead.soft
                                : improved
                                  ? accents.energy.soft
                                  : accents.saturation.soft,
                    }}
                >
                    {formatGain(gain)}
                </Box>
            </TableCell>
        </TableRow>
    );
}

function CoteDuDuel({
    serie,
    teinte,
    aligne,
    part,
}: {
    serie: LiveSeries;
    teinte: { main: string; soft: string };
    aligne: 'flex-start' | 'flex-end';
    part: number;
}) {
    const puissance = formatWatts(serie.average_power_watts);
    const energie = formatEnergy(serie.energy_wh_total / 1000);

    return (
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                px: 2.5,
                py: 2,
                borderRadius: 2,
                backgroundColor: teinte.soft,
                border: `1px solid ${alpha(teinte.main, 0.18)}`,
            }}
        >
            <Stack spacing={1} sx={{ alignItems: aligne, minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: teinte.main,
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="subtitle1" noWrap>
                        {serie.project_name}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '2rem',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            color: teinte.main,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {puissance.value}
                    </Typography>
                    <Typography component="span" variant="body2" color="text.secondary">
                        {puissance.unit}
                    </Typography>
                </Stack>

                <Box sx={{ width: 1 }}>
                    <MiniBar value={part} color={teinte.main} height={6} />
                </Box>

                <Typography variant="caption" color="text.secondary" noWrap>
                    {energie.value} {energie.unit} sur la fenêtre · {serie.container_count}{' '}
                    conteneur(s)
                </Typography>
            </Stack>
        </Box>
    );
}

function DuelBanner({ sideA, sideB }: { sideA?: LiveSeries; sideB?: LiveSeries }) {
    if (!sideA) {
        return null;
    }

    const puissanceA = sideA.average_power_watts;
    const puissanceB = sideB?.average_power_watts ?? 0;
    const maximum = Math.max(puissanceA, puissanceB) || 1;
    const ecart = sideB && puissanceA > 0 ? ((puissanceA - puissanceB) / puissanceA) * 100 : null;
    const favorable = (ecart ?? 0) > 0;
    const teinteEcart =
        ecart === null ? accents.overhead : favorable ? accents.energy : accents.saturation;

    return (
        <Card sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 2, md: 2.5 }}
                sx={{ alignItems: 'stretch' }}
            >
                <CoteDuDuel
                    serie={sideA}
                    teinte={COULEUR_A}
                    aligne="flex-start"
                    part={(puissanceA / maximum) * 100}
                />

                <Stack
                    spacing={0.5}
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        px: { md: 3 },
                        py: { xs: 2, md: 0 },
                        minWidth: { md: 210 },
                        borderRadius: 2,
                        backgroundColor: surface.recess,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: 'text.secondary',
                        }}
                    >
                        Écart mesuré
                    </Typography>

                    <Typography
                        component="span"
                        sx={{
                            fontSize: { xs: '2.5rem', md: '3.25rem' },
                            fontWeight: 700,
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                            color: teinteEcart.main,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {ecart === null ? '—' : formatGain(ecart)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" align="center">
                        {ecart === null
                            ? 'Sélectionnez un projet B pour comparer'
                            : 'énergie et CO2, identiques par construction'}
                    </Typography>
                </Stack>

                {sideB ? (
                    <CoteDuDuel
                        serie={sideB}
                        teinte={COULEUR_B}
                        aligne="flex-end"
                        part={(puissanceB / maximum) * 100}
                    />
                ) : (
                    <Box sx={{ flex: 1 }} />
                )}
            </Stack>
        </Card>
    );
}

export function LiveView() {
    const [metric, setMetric] = useState<LiveMetric>('energy_cumulative');
    const [seconds, setSeconds] = useState(300);
    const [projectA, setProjectA] = useState<number | ''>('');
    const [projectB, setProjectB] = useState<number | ''>('');

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(24),
        refetchInterval: 10000,
    });

    const selectable = useMemo(
        () => (projects ?? []).filter((item) => item.has_live_data || item.running_count > 0),
        [projects]
    );

    useEffect(() => {
        if (selectable.length === 0) {
            return;
        }
        if (projectA === '') {
            const before = selectable.find((item) => item.project.name.includes('before'));
            setProjectA((before ?? selectable[0]).project.id);
        }
        if (projectB === '' && selectable.length > 1) {
            const after = selectable.find((item) => item.project.name.includes('after'));
            setProjectB((after ?? selectable[1]).project.id);
        }
    }, [selectable, projectA, projectB]);

    const identifiers = [projectA, projectB].filter(
        (value): value is number => typeof value === 'number'
    );

    const { data, isLoading } = useQuery({
        queryKey: ['live', identifiers, seconds],
        queryFn: () => liveService.get(identifiers, seconds),
        enabled: identifiers.length > 0,
        refetchInterval: 1000,
        refetchIntervalInBackground: false,
    });

    const series: LiveSeries[] = data?.series ?? [];
    const [sideA, sideB] = series;

    if (selectable.length === 0) {
        return (
            <Page title="Comparaison">
                <Card>
                    <EmptyContent
                        icon="solar:chart-square-linear"
                        title="Aucun projet actif"
                        description="Démarrez au moins un projet Docker pour suivre sa consommation en temps réel."
                    />
                </Card>
            </Page>
        );
    }

    return (
        <Page
            title="Comparaison"
            subtitle="Une mesure par seconde poussée par Docker, deux projets côte à côte, l'écart se creuse en continu"
            action={<MeasurementBadge scope="container" size="medium" />}
        >
            <Grid container spacing={2.5}>
                <Grid size={12}>
                    <Card sx={{ px: 2, py: 1.5 }}>
                        <Stack
                            direction={{ xs: 'column', lg: 'row' }}
                            spacing={1.5}
                            sx={{ alignItems: { lg: 'center' } }}
                        >
                                <TextField
                                    select
                                    size="small"
                                    label="Projet A"
                                    value={projectA}
                                    onChange={(event) => setProjectA(Number(event.target.value))}
                                    sx={{ minWidth: 220 }}
                                >
                                    {selectable.map((item) => (
                                        <MenuItem key={item.project.id} value={item.project.id}>
                                            {item.project.display_name ?? item.project.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    size="small"
                                    label="Projet B"
                                    value={projectB}
                                    onChange={(event) => setProjectB(Number(event.target.value))}
                                    sx={{ minWidth: 220 }}
                                >
                                    <MenuItem value="">Aucun</MenuItem>
                                    {selectable.map((item) => (
                                        <MenuItem key={item.project.id} value={item.project.id}>
                                            {item.project.display_name ?? item.project.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    select
                                    size="small"
                                    label="Fenêtre"
                                    value={seconds}
                                    onChange={(event) => setSeconds(Number(event.target.value))}
                                    sx={{ minWidth: 150 }}
                                >
                                    {WINDOWS.map((item) => (
                                        <MenuItem key={item.value} value={item.value}>
                                            {item.label}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <Box sx={{ flexGrow: 1 }} />

                                <ToggleButtonGroup
                                    size="small"
                                    exclusive
                                    value={metric}
                                    onChange={(_, value) => value && setMetric(value)}
                                >
                                    {METRICS.map((item) => (
                                        <ToggleButton key={item.value} value={item.value}>
                                            {item.label}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                        </Stack>
                    </Card>
                </Grid>

                <Grid size={12}>
                    <DuelBanner sideA={sideA} sideB={sideB} />
                </Grid>

                <Grid size={12}>
                    <LiveChart series={series} metric={metric} loading={isLoading && !data} />
                </Grid>

                {sideA && sideB && sideA.points.length > 0 && sideB.points.length > 0 && (
                    <Grid size={12}>
                        <Card>
                            <CardContent sx={{ p: 0 }}>
                                <Box sx={{ px: 2.5, pt: 2.5 }}>
                                    <Typography variant="h5">Écart mesuré sur la fenêtre</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Calculé par la plateforme à partir des mesures à la seconde
                                    </Typography>
                                </Box>
                                <Table sx={{ mt: 1.5 }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={ENTETE_SX}>Indicateur</TableCell>
                                            <TableCell align="right" sx={ENTETE_SX}>
                                                {sideA.project_name}
                                            </TableCell>
                                            <TableCell align="right" sx={ENTETE_SX}>
                                                {sideB.project_name}
                                            </TableCell>
                                            <TableCell align="right" sx={ENTETE_SX}>
                                                Évolution
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <ComparisonRow
                                            label="Puissance moyenne"
                                            a={sideA.average_power_watts}
                                            b={sideB.average_power_watts}
                                            format={(value) => {
                                                const formatted = formatWatts(value);
                                                return `${formatted.value} ${formatted.unit}`;
                                            }}
                                        />
                                        <ComparisonRow
                                            label="Énergie cumulée"
                                            a={sideA.energy_wh_total}
                                            b={sideB.energy_wh_total}
                                            format={(value) => {
                                                const formatted = formatEnergy(value / 1000);
                                                return `${formatted.value} ${formatted.unit}`;
                                            }}
                                        />
                                        <ComparisonRow
                                            label="CO2 cumulé"
                                            a={sideA.co2_g_total}
                                            b={sideB.co2_g_total}
                                            format={(value) => {
                                                const formatted = formatCarbon(value / 1000);
                                                return `${formatted.value} ${formatted.unit}`;
                                            }}
                                        />
                                        <ComparisonRow
                                            label="Conteneurs mesurés"
                                            a={sideA.container_count}
                                            b={sideB.container_count}
                                            format={(value) => String(Math.round(value))}
                                        />
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
        </Page>
    );
}
