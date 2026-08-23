import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { containerService } from 'src/features/containers/api/container-service';
import { Chart } from 'src/shared/components/chart/chart';
import { mergeChartOptions } from 'src/shared/components/chart/use-chart';
import { KpiCard } from 'src/shared/components/kpi-card/kpi-card';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import { Page } from 'src/shared/components/page/page';
import { ContainerStatusChip } from 'src/shared/components/status-chip/status-chip';
import type { MetricKind } from 'src/shared/types/api';
import {
    formatBytes,
    formatCarbon,
    formatCount,
    formatDateTime,
    formatDuration,
    formatEnergy,
    formatPercent,
} from 'src/shared/utils/format';
import { chartPalette } from 'src/styles/theme/tokens';

const TABS: { value: MetricKind; label: string }[] = [
    { value: 'cpu', label: 'CPU' },
    { value: 'memory', label: 'Mémoire' },
    { value: 'network', label: 'Réseau' },
    { value: 'storage', label: 'Disque' },
];

function formatMetricValue(metric: MetricKind, value: number): string {
    if (metric === 'cpu') {
        return `${value.toFixed(3)} %`;
    }
    if (metric === 'memory') {
        const formatted = formatBytes(value);
        return `${formatted.value} ${formatted.unit}`;
    }
    const rate = formatBytes(value);
    return `${rate.value} ${rate.unit}/s`;
}

export function ContainerDetailView() {
    const { containerId } = useParams();
    const navigate = useNavigate();
    const hours = 24;
    const granularity = 'hour' as const;
    const [metric, setMetric] = useState<MetricKind>('cpu');

    const id = Number(containerId);

    const { data: container, isLoading } = useQuery({
        queryKey: ['container', id, hours],
        queryFn: () => containerService.get(id, hours),
        enabled: Number.isFinite(id),
    });

    const { data: series, isLoading: seriesLoading } = useQuery({
        queryKey: ['container-metrics', id, metric, hours, granularity],
        queryFn: () => containerService.metrics(id, metric, hours, granularity),
        enabled: Number.isFinite(id),
    });

    if (isLoading || !container) {
        return <LoadingScreen />;
    }

    const points = series?.points ?? [];
    const hasSecondary = points.some((point) => point.secondary_value !== null);

    const chartSeries = [
        {
            name: series?.label ?? '',
            data: points.map((point) => ({
                x: new Date(point.timestamp).getTime(),
                y: Number(point.value.toFixed(4)),
            })),
        },
    ];

    if (hasSecondary && series?.secondary_label) {
        chartSeries.push({
            name: series.secondary_label,
            data: points.map((point) => ({
                x: new Date(point.timestamp).getTime(),
                y: Number((point.secondary_value ?? 0).toFixed(4)),
            })),
        });
    }

    const options = mergeChartOptions({
        colors: [chartPalette[0], chartPalette[1]],
        chart: { type: 'area' },
        legend: { show: chartSeries.length > 1 },
        fill: { type: 'solid', opacity: 0.1 },
        xaxis: { type: 'datetime' },
        yaxis: {
            labels: {
                formatter: (value: number) =>
                    metric === 'cpu'
                        ? value.toFixed(2)
                        : `${formatBytes(value).value} ${formatBytes(value).unit}`,
            },
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: { format: 'dd MMM yyyy HH:mm' },
            y: { formatter: (value: number) => formatMetricValue(metric, value) },
        },
    });

    const energy = formatEnergy(container.energy_kwh);
    const carbon = formatCarbon(container.co2_kg);
    const memory = formatBytes(container.memory_working_set_bytes);
    const imageSize = formatBytes(container.image_size_bytes);

    return (
        <Page
            title={container.name}
            subtitle={`${container.project_name} - ${container.image_ref}`}
            action={
                <Button
                    variant="outlined"
                    startIcon={<Icon icon="solar:alt-arrow-left-linear" width={18} />}
                    onClick={() => navigate('/')}
                >
                    Retour
                </Button>
            }
        >
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="CPU"
                        value={formatPercent(container.cpu_percent, 3).replace(' %', '')}
                        unit="%"
                        icon="solar:cpu-bolt-bold-duotone"
                        accent="power"
                        caption={
                            container.cpu_limit_cores
                                ? `Limite : ${container.cpu_limit_cores} coeur(s)`
                                : 'Aucune limite définie'
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Mémoire"
                        value={memory.value}
                        unit={memory.unit}
                        icon="solar:ssd-square-bold-duotone"
                        accent="power"
                        caption={
                            container.memory_limit_bytes
                                ? `Limite : ${formatBytes(container.memory_limit_bytes).value} ${
                                      formatBytes(container.memory_limit_bytes).unit
                                  }`
                                : 'Aucune limite définie'
                        }
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Énergie"
                        value={energy.value}
                        unit={energy.unit}
                        icon="solar:bolt-bold-duotone"
                        accent="energy"
                        measurement="container"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <KpiCard
                        title="Empreinte carbone"
                        value={carbon.value}
                        unit={carbon.unit}
                        icon="solar:leaf-bold-duotone"
                        accent="carbon"
                        measurement="container"
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ height: 1 }}>
                        <CardHeader
                            title="Évolution des métriques"
                            subheader="Mesures observées, agrégées sur la période sélectionnée"
                        />
                        <Box sx={{ px: 2 }}>
                            <Tabs
                                value={metric}
                                onChange={(_, value) => setMetric(value as MetricKind)}
                            >
                                {TABS.map((tab) => (
                                    <Tab key={tab.value} value={tab.value} label={tab.label} />
                                ))}
                            </Tabs>
                        </Box>
                        <CardContent>
                            <Chart
                                type="area"
                                series={chartSeries}
                                options={options}
                                height={330}
                                loading={seriesLoading}
                                isEmpty={points.length === 0}
                            />
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: 1 }}>
                        <CardHeader title="Informations" />
                        <CardContent>
                            <Stack spacing={1.75}>
                                <Stack
                                    direction="row"
                                    sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Statut
                                    </Typography>
                                    <ContainerStatusChip status={container.status} />
                                </Stack>

                                {[
                                    ['Identifiant Docker', container.docker_id.slice(0, 12)],
                                    ['Uptime', formatDuration(container.uptime_seconds)],
                                    ['Redemarrages', formatCount(container.restart_count)],
                                    [
                                        "Taille de l'image",
                                        container.image_size_bytes
                                            ? `${imageSize.value} ${imageSize.unit}`
                                            : '-',
                                    ],
                                    ['Première collecte', formatDateTime(container.first_metric_at)],
                                    ['Dernière collecte', formatDateTime(container.last_metric_at)],
                                    ['Echantillons', formatCount(container.sample_count)],
                                ].map(([label, value]) => (
                                    <Stack
                                        key={label}
                                        direction="row"
                                        spacing={2}
                                        sx={{ justifyContent: 'space-between' }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            {label}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ textAlign: 'right' }}>
                                            {value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Page>
    );
}
