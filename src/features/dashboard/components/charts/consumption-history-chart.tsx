import { Chart } from 'src/shared/components/chart/chart';
import { mergeChartOptions } from 'src/shared/components/chart/use-chart';
import { SectionCard } from 'src/shared/components/section-card/section-card';
import type { EnergyPoint, ProjectEnergySeries } from 'src/shared/types/api';
import { echelleCarbone, echelleEnergie } from 'src/shared/utils/format';
import { chartPalette, surface } from 'src/styles/theme/tokens';

const GRAMS_PER_KG = 1000;

type Metric = 'energy' | 'co2';

type Props = {
    series: ProjectEnergySeries[];
    loading?: boolean;
    subtitle?: string;
    title?: string;
    metric?: Metric;
};

const MAX_SERIES = 6;
const AUTRES = 'Autres projets';

type Serie = { name: string; data: number[] };

const VALEUR_PAR_METRIQUE: Record<Metric, (point: EnergyPoint) => number> = {
    energy: (point) => point.energy_kwh,
    // co2_kg est en kilogrammes ; on convertit en grammes ici pour que echelleCarbone (qui
    // attend des grammes) et le reste du graphique travaillent dans la meme unite que
    // formatCarbon ailleurs dans l'app.
    co2: (point) => point.co2_kg * GRAMS_PER_KG,
};

function alignerSurLesMemesDates(
    series: ProjectEnergySeries[],
    metric: Metric
): {
    dates: number[];
    series: Serie[];
} {
    const valeurDe = VALEUR_PAR_METRIQUE[metric];
    const dates = [
        ...new Set(
            series.flatMap((item) => item.points.map((point) => new Date(point.timestamp).getTime()))
        ),
    ].sort((a, b) => a - b);

    const alignees = series.map((item) => {
        const parDate = new Map(
            item.points.map((point) => [new Date(point.timestamp).getTime(), valeurDe(point)])
        );
        return { name: item.project_name, data: dates.map((date) => parDate.get(date) ?? 0) };
    });

    return { dates, series: alignees };
}

function replierLaQueue(series: Serie[], dates: number[]): Serie[] {
    if (series.length <= MAX_SERIES) {
        return series;
    }

    const total = (serie: Serie) => serie.data.reduce((somme, valeur) => somme + valeur, 0);
    const triees = [...series].sort((a, b) => total(b) - total(a));
    const gardees = triees.slice(0, MAX_SERIES - 1);
    const queue = triees.slice(MAX_SERIES - 1);

    return [
        ...gardees,
        {
            name: AUTRES,
            data: dates.map((_, index) =>
                queue.reduce((somme, serie) => somme + serie.data[index], 0)
            ),
        },
    ];
}

export function ConsumptionHistoryChart({
    series,
    loading,
    subtitle,
    title = 'Évolution de la consommation',
    metric = 'energy',
}: Props) {
    const { dates, series: alignees } = alignerSurLesMemesDates(series, metric);
    const visibles = replierLaQueue(alignees, dates);

    const totauxParDate = dates.map((_, index) =>
        visibles.reduce((somme, serie) => somme + serie.data[index], 0)
    );
    const maximum = Math.max(0, ...totauxParDate);
    const echelle = metric === 'co2' ? echelleCarbone(maximum) : echelleEnergie(maximum);
    const decimalesAxe = maximum * echelle.facteur >= 10 ? 0 : echelle.decimales;

    const options = mergeChartOptions({
        colors: [...chartPalette],
        chart: { type: 'bar', stacked: true },
        plotOptions: {
            bar: { columnWidth: '58%', borderRadius: 4, borderRadiusApplication: 'end' },
        },
        stroke: { show: true, width: 2, colors: [surface.card] },
        fill: { type: 'solid', opacity: 1 },
        legend: {
            show: visibles.length > 1,
            position: 'top',
            horizontalAlign: 'left',
            offsetY: -6,
            markers: { size: 6, strokeWidth: 0 },
            itemMargin: { horizontal: 12 },
        },
        grid: { borderColor: '#EEF1F5', strokeDashArray: 4, padding: { left: 4, right: 12 } },
        xaxis: {
            type: 'datetime',
            categories: dates,
            labels: { datetimeUTC: false, style: { fontSize: '11px' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                formatter: (valeur: number) => valeur.toFixed(decimalesAxe),
                style: { fontSize: '11px' },
            },
            title: { text: echelle.unite, style: { fontSize: '11px', fontWeight: 600 } },
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: { format: 'dd MMM yyyy' },
            y: {
                formatter: (valeur: number) =>
                    `${valeur.toFixed(echelle.decimales + 1)} ${echelle.unite}`,
            },
        },
    });

    const donnees = visibles.map((serie) => ({
        name: serie.name,
        data: serie.data.map((valeur) => Number((valeur * echelle.facteur).toFixed(9))),
    }));

    return (
        <SectionCard title={title} subtitle={subtitle}>
            <Chart
                type="bar"
                series={donnees}
                options={options}
                height={392}
                loading={loading}
                isEmpty={donnees.length === 0}
                emptyMessage="Aucune mesure sur la période. Vérifiez que le collecteur tourne."
            />
        </SectionCard>
    );
}
