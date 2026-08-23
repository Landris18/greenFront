import axios, { endpoints } from 'src/shared/utils/axios';
import type {
    BreakdownItem,
    EnergyTotals,
    Granularity,
    Page,
    ProjectEnergySeries,
    Recommendation,
} from 'src/shared/types/api';

type Fenetre = { hours: number; granularity: Granularity };

function periodePrecedente(hours: number): { from: string; to: string } {
    const fin = new Date(Date.now() - hours * 3600 * 1000);
    const debut = new Date(fin.getTime() - hours * 3600 * 1000);
    return { from: debut.toISOString(), to: fin.toISOString() };
}

export const dashboardService = {
    totaux: async ({ hours }: Fenetre): Promise<EnergyTotals> => {
        const { data } = await axios.get(endpoints.energy, { params: { hours } });
        return data;
    },
    totauxPrecedents: async ({ hours }: Fenetre): Promise<EnergyTotals> => {
        const { data } = await axios.get(endpoints.energy, { params: periodePrecedente(hours) });
        return data;
    },
    historiqueParProjet: async ({ hours, granularity }: Fenetre): Promise<ProjectEnergySeries[]> => {
        const { data } = await axios.get(`${endpoints.energy}/history/projects`, {
            params: { hours, granularity },
        });
        return data;
    },
    repartitionParProjet: async ({ hours }: Fenetre): Promise<BreakdownItem[]> => {
        const { data } = await axios.get(`${endpoints.energy}/breakdown`, {
            params: { hours, by: 'project', limit: 10 },
        });
        return data;
    },
    overhead: async ({ hours }: Fenetre): Promise<EnergyTotals> => {
        const { data } = await axios.get(`${endpoints.energy}/summary`, { params: { hours } });
        return data.overhead;
    },
    priorites: async (): Promise<Page<Recommendation>> => {
        const { data } = await axios.get(endpoints.recommendations, {
            params: { status: 'OPEN', per_page: 8 },
        });
        return data;
    },
};
