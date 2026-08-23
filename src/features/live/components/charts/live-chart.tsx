import type { ApexOptions } from 'apexcharts';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';

import { Chart } from 'src/shared/components/chart/chart';
import { mergeChartOptions } from 'src/shared/components/chart/use-chart';
import type { LiveMetric } from 'src/features/live/components/views/live-view';
import type { LiveSeries } from 'src/shared/types/api';
import {
    CARBON_UNIT,
    decimalesUtiles,
    echelleCarbone,
    echelleEnergie,
    ENERGY_UNIT,
    formatBytes,
    POWER_UNIT,
    type Echelle,
} from 'src/shared/utils/format';
import { accents, chartInk } from 'src/styles/theme/tokens';

type Props = {
    series: LiveSeries[];
    metric: LiveMetric;
    loading?: boolean;
};

type MetricSpec = {
    label: string;
    unit: string;
    cumulative: boolean;
    echelle?: (maximum: number) => Echelle;
    value: (point: LiveSeries['points'][number]) => number;
    format: (value: number) => string;
};

const SPECS: Record<LiveMetric, MetricSpec> = {
    energy_cumulative: {
        label: 'Énergie cumulée',
        unit: ENERGY_UNIT,
        cumulative: true,
        echelle: echelleEnergie,
        value: (point) => point.energy_wh_cumulative / 1000,
        format: (value) => `${value} ${ENERGY_UNIT}`,
    },
    co2_cumulative: {
        label: 'CO2 cumulé',
        unit: CARBON_UNIT,
        cumulative: true,
        echelle: echelleCarbone,
        value: (point) => point.co2_g_cumulative,
        format: (value) => `${value} ${CARBON_UNIT}`,
    },
    power: {
        label: 'Puissance instantanée',
        unit: POWER_UNIT,
        cumulative: false,
        value: (point) => point.power_watts,
        format: (value) => `${value.toFixed(3)} ${POWER_UNIT}`,
    },
    cpu: {
        label: 'CPU',
        unit: "% de l'hôte",
        cumulative: false,
        value: (point) => point.cpu_percent_of_host,
        format: (value) => `${value.toFixed(3)} %`,
    },
    memory: {
        label: 'Mémoire',
        unit: 'octets',
        cumulative: false,
        value: (point) => point.memory_bytes,
        format: (value) => {
            const formatted = formatBytes(value);
            return `${formatted.value} ${formatted.unit}`;
        },
    },
};

export function LiveChart({ series, metric, loading }: Props) {
    const spec = SPECS[metric];
    const isEmpty = series.every((item) => item.points.length === 0);
    const maximum = Math.max(
        0,
        ...series.flatMap((item) => item.points.map((point) => spec.value(point)))
    );
    const echelle: Echelle = spec.echelle
        ? spec.echelle(maximum)
        : { unite: spec.unit, facteur: 1, decimales: decimalesUtiles(maximum) };
    const decimalesAxe = maximum * echelle.facteur >= 10 ? 0 : echelle.decimales;

    const options: ApexOptions = mergeChartOptions({
        colors: [accents.alert.main, accents.energy.main],
        chart: { type: 'line', animations: { enabled: false } },
        stroke: { width: 2.5, curve: 'monotoneCubic', lineCap: 'round' },
        markers: { size: 0, hover: { size: 5 } },
        legend: { show: series.length > 1, position: 'top', horizontalAlign: 'right' },
        xaxis: {
            type: 'datetime',
            labels: { datetimeUTC: false, format: 'HH:mm:ss' },
            crosshairs: {
                show: true,
                stroke: { color: chartInk.axis, width: 1, dashArray: 3 },
            },
        },
        yaxis: {
            labels: {
                formatter: (value: number) =>
                    metric === 'memory'
                        ? `${formatBytes(value).value} ${formatBytes(value).unit}`
                        : value.toFixed(decimalesAxe),
            },
            title: { text: echelle.unite, style: { fontSize: '11px', fontWeight: 500 } },
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: { format: 'HH:mm:ss' },
            y: {
                formatter: (value: number) =>
                    spec.echelle
                        ? `${value.toFixed(echelle.decimales + 2)} ${echelle.unite}`
                        : spec.format(value),
            },
        },
    });

    const chartSeries = series.map((item) => ({
        name: item.project_name,
        data: item.points.map((point) => ({
            x: new Date(point.timestamp).getTime(),
            y: Number((spec.value(point) * echelle.facteur).toFixed(10)),
        })),
    }));

    return (
        <Card>
            <CardHeader
                title={spec.label}
                subheader={
                    spec.cumulative
                        ? "Cumul depuis le début de la fenêtre, une mesure par seconde. L'écart entre les deux courbes se creuse en continu."
                        : 'Valeur instantanée, une mesure par seconde'
                }
            />
            <CardContent>
                <Chart
                    type="line"
                    series={chartSeries}
                    options={options}
                    height={400}
                    loading={loading}
                    isEmpty={isEmpty}
                    emptyMessage="Aucune mesure temps réel. Vérifiez que le collecteur tourne et que les projets ont des conteneurs actifs."
                />
            </CardContent>
        </Card>
    );
}
