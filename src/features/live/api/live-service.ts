import axios, { endpoints } from 'src/shared/utils/axios';
import type { Comparison, ComparisonResult, LiveResponse, Page } from 'src/shared/types/api';

export interface ComparisonPayload {
    name: string;
    project_a_id: number;
    project_b_id: number;
    period_a_start: string;
    period_a_end: string;
    period_b_start: string;
    period_b_end: string;
}

export const liveService = {
    get: async (projectIds: number[], seconds: number): Promise<LiveResponse> => {
        const { data } = await axios.get(endpoints.live, {
            params: { project_ids: projectIds.join(','), seconds },
        });
        return data;
    },
};

export const comparisonService = {
    list: async (): Promise<Page<Comparison>> => {
        const { data } = await axios.get(endpoints.comparisons, { params: { per_page: 50 } });
        return data;
    },
    preview: async (payload: ComparisonPayload): Promise<ComparisonResult> => {
        const { data } = await axios.post(`${endpoints.comparisons}/preview`, payload);
        return data;
    },
    create: async (payload: ComparisonPayload): Promise<Comparison> => {
        const { data } = await axios.post(endpoints.comparisons, payload);
        return data;
    },
};
