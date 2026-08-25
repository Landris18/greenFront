import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

import { Chart } from 'src/shared/components/chart/chart';
import { mergeChartOptions } from 'src/shared/components/chart/use-chart';
import { SectionCard } from 'src/shared/components/section-card/section-card';
import type { BreakdownItem } from 'src/shared/types/api';
import { formatEnergy } from 'src/shared/utils/format';
import { accents, chartInk, chartPalette } from 'src/styles/theme/tokens';

type Props = {
    repartition: BreakdownItem[];
    overhead: number;
    loading?: boolean;
    subtitle?: string;
};

const OVERHEAD_LABEL = 'Overhead infrastructure';
const OVERHEAD_EXPLICATION =
    "Overhead infrastructure : la part d'énergie qui ne vient d'aucun conteneur (machine au " +
    'repos, système).';

function libelleEnergie(valeur: number | string): string {
    const formate = formatEnergy(Number(valeur));
    return `${formate.value} ${formate.unit}`;
}

export function ProjectBreakdownDonut({ repartition, overhead, loading, subtitle }: Props) {
    const labels = [...repartition.map((item) => item.label), OVERHEAD_LABEL];
    const valeurs = [...repartition.map((item) => item.energy_kwh), overhead];
    const total = valeurs.reduce((somme, valeur) => somme + valeur, 0);
    const couleurs = [
        ...repartition.map((_, index) => chartPalette[index % chartPalette.length]),
        accents.overhead.main,
    ];

    const options = mergeChartOptions({
        colors: couleurs,
        labels,
        legend: {
            show: true,
            position: 'bottom',
            horizontalAlign: 'center',
            markers: { size: 6, strokeWidth: 0 },
            itemMargin: { horizontal: 8, vertical: 4 },
        },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        tooltip: {
            y: { formatter: (valeur: number) => libelleEnergie(valeur) },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '68%',
                    labels: {
                        show: true,
                        name: {
                            fontSize: '12px',
                            color: chartInk.label,
                        },
                        value: {
                            fontSize: '20px',
                            fontWeight: 700,
                            offsetY: 6,
                            formatter: libelleEnergie,
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '12px',
                            color: chartInk.label,
                            formatter: () => libelleEnergie(total),
                        },
                    },
                },
            },
        },
    });

    return (
        <SectionCard
            title="Répartition par projet"
            subtitle={subtitle}
            action={
                <Tooltip title={OVERHEAD_EXPLICATION}>
                    <Box sx={{ display: 'flex', color: 'text.secondary', cursor: 'help' }}>
                        <Icon icon="solar:question-circle-linear" width={18} />
                    </Box>
                </Tooltip>
            }
        >
            <Chart
                type="donut"
                series={valeurs}
                options={options}
                height={340}
                loading={loading}
                isEmpty={valeurs.every((valeur) => valeur <= 0)}
                emptyMessage="Aucune mesure sur la période sélectionnée."
            />
        </SectionCard>
    );
}
