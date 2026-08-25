import axios, { endpoints } from 'src/shared/utils/axios';
import type { BreakdownItem, EnergyTotals, Granularity, ProjectEnergySeries } from 'src/shared/types/api';

type Fenetre = { hours: number; granularity: Granularity };

export const energyService = {
    totaux: async ({ hours }: Fenetre): Promise<EnergyTotals> => {
        const { data } = await axios.get(endpoints.energy, { params: { hours } });
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
    repartitionParConteneur: async ({ hours }: Fenetre): Promise<BreakdownItem[]> => {
        const { data } = await axios.get(`${endpoints.energy}/breakdown`, {
            params: { hours, by: 'container', limit: 10 },
        });
        return data;
    },
    overhead: async ({ hours }: Fenetre): Promise<EnergyTotals> => {
        const { data } = await axios.get(`${endpoints.energy}/summary`, { params: { hours } });
        return data.overhead;
    },
};
