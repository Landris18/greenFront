import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { ConsumptionHistoryChart } from 'src/features/dashboard/components/charts/consumption-history-chart';
import { energyService } from 'src/features/energy/api/energy-service';
import { BreakdownList } from 'src/shared/components/breakdown-list/breakdown-list';
import { KpiCard } from 'src/shared/components/kpi-card/kpi-card';
import { Page } from 'src/shared/components/page/page';
import { SectionCard } from 'src/shared/components/section-card/section-card';
import type { Granularity } from 'src/shared/types/api';
import { formatCarbon, formatEnergy, formatWatts } from 'src/shared/utils/format';

type Metric = 'energy' | 'co2';

const PERIODES = [
    { value: 24, label: '24 heures', court: '24 h', granularity: 'hour' as Granularity },
    { value: 168, label: '7 jours', court: '7 j', granularity: 'day' as Granularity },
    { value: 720, label: '30 jours', court: '30 j', granularity: 'day' as Granularity },
];

const OVERHEAD_TOOLTIP =
    "Part de la consommation de la machine qui n'est imputable à aucun conteneur : puissance à " +
    "vide, système d'exploitation et processus hors Docker. La somme des projets et de cette " +
    'part égale exactement la puissance mesurée.';

export function EnergyCarbonView() {
    const [metric, setMetric] = useState<Metric>('energy');
    const [heures, setHeures] = useState(168);
    const periode = PERIODES.find((item) => item.value === heures) ?? PERIODES[1];
    const fenetre = { hours: heures, granularity: periode.granularity };

    const { data: totaux } = useQuery({
        queryKey: ['energy-view-totaux', heures],
        queryFn: () => energyService.totaux(fenetre),
        refetchInterval: 15000,
    });

    const { data: historique = [], isLoading: historiqueEnCours } = useQuery({
        queryKey: ['energy-view-historique', heures, periode.granularity],
        queryFn: () => energyService.historiqueParProjet(fenetre),
        refetchInterval: 30000,
    });

    const { data: repartitionProjet = [] } = useQuery({
        queryKey: ['energy-view-repartition-projet', heures],
        queryFn: () => energyService.repartitionParProjet(fenetre),
        refetchInterval: 30000,
    });

    const { data: repartitionConteneur = [] } = useQuery({
        queryKey: ['energy-view-repartition-conteneur', heures],
        queryFn: () => energyService.repartitionParConteneur(fenetre),
        refetchInterval: 30000,
    });

    const { data: overhead } = useQuery({
        queryKey: ['energy-view-overhead', heures],
        queryFn: () => energyService.overhead(fenetre),
        refetchInterval: 30000,
    });

    const estCarbone = metric === 'co2';
    const format = estCarbone ? formatCarbon : formatEnergy;
    const valeurDe = (item: { energy_kwh: number; co2_kg: number }) =>
        estCarbone ? item.co2_kg : item.energy_kwh;
    const total = format(estCarbone ? totaux?.co2_kg : totaux?.energy_kwh);
    const partOverhead = valeurDe(overhead ?? { energy_kwh: 0, co2_kg: 0 });

    return (
        <Page
            title="Bilan énergétique"
            subtitle={
                estCarbone
                    ? "Évolution de l'empreinte carbone estimée, tous projets confondus"
                    : "Évolution de la consommation énergétique estimée, tous projets confondus"
            }
            action={
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ justifyContent: 'flex-end' }}>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={metric}
                        onChange={(_, valeur) => valeur && setMetric(valeur)}
                    >
                        <ToggleButton value="energy">Énergie</ToggleButton>
                        <ToggleButton value="co2">Carbone</ToggleButton>
                    </ToggleButtonGroup>
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
                </Stack>
            }
        >
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title={estCarbone ? 'Empreinte carbone' : 'Énergie consommée'}
                        value={total.value}
                        unit={total.unit}
                        icon={estCarbone ? 'solar:leaf-bold-duotone' : 'solar:bolt-bold-duotone'}
                        accent={estCarbone ? 'carbon' : 'energy'}
                        measurement="host"
                        caption={`Sur ${periode.label.toLowerCase()}`}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title="Puissance moyenne"
                        value={formatWatts(totaux?.average_power_watts).value}
                        unit={formatWatts(totaux?.average_power_watts).unit}
                        icon="solar:cpu-bolt-bold-duotone"
                        accent="power"
                        caption="Sur la période sélectionnée"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <KpiCard
                        title="Part non imputable"
                        value={format(partOverhead).value}
                        unit={format(partOverhead).unit}
                        icon="solar:server-bold-duotone"
                        accent="overhead"
                        caption="Puissance à vide et processus hors Docker"
                    />
                </Grid>

                <Grid size={12}>
                    <ConsumptionHistoryChart
                        series={historique}
                        loading={historiqueEnCours}
                        metric={metric}
                        title={estCarbone ? 'Évolution des émissions' : 'Évolution de la consommation'}
                        subtitle={`Par projet, cumul ${
                            periode.granularity === 'hour' ? 'horaire' : 'journalier'
                        }`}
                    />
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <SectionCard
                        title="Répartition par conteneur"
                        subtitle="Les conteneurs les plus consommateurs sur la période"
                    >
                        <BreakdownList
                            items={repartitionConteneur}
                            valueOf={valeurDe}
                            format={format}
                            emptyTitle="Aucune consommation attribuée"
                            emptyDescription="Aucune mesure sur la période sélectionnée."
                        />
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                    <SectionCard
                        title="Répartition par projet"
                        subtitle="Part attribuée à chaque projet, et part non imputable"
                    >
                        <BreakdownList
                            items={repartitionProjet}
                            valueOf={valeurDe}
                            format={format}
                            emptyTitle="Aucune consommation attribuée"
                            emptyDescription="Aucune mesure sur la période sélectionnée."
                            overhead={{
                                value: partOverhead,
                                label: 'Overhead infrastructure',
                                tooltip: OVERHEAD_TOOLTIP,
                            }}
                        />
                    </SectionCard>
                </Grid>
            </Grid>
        </Page>
    );
}
