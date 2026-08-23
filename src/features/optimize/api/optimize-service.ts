import axios, { endpoints } from 'src/shared/utils/axios';
import type {
    Page,
    Recommendation,
    RecommendationPatch,
    RecommendationStatus,
    Severity,
} from 'src/shared/types/api';

export const optimizeService = {
    list: async (params: {
        project_id?: number | null;
        severity?: Severity | null;
        source?: 'RUNTIME' | 'CONFIG' | null;
        status?: RecommendationStatus;
        perPage?: number;
    }): Promise<Page<Recommendation>> => {
        const { data } = await axios.get(endpoints.recommendations, {
            params: {
                project_id: params.project_id ?? undefined,
                severity: params.severity ?? undefined,
                source: params.source ?? undefined,
                status: params.status ?? 'OPEN',
                per_page: params.perPage ?? 100,
            },
        });
        return data;
    },
    patch: async (id: number): Promise<RecommendationPatch> => {
        const { data } = await axios.get(`${endpoints.recommendations}/${id}/patch`);
        return data;
    },
    updateStatus: async (id: number, status: RecommendationStatus): Promise<Recommendation> => {
        const { data } = await axios.patch(`${endpoints.recommendations}/${id}`, { status });
        return data;
    },
};
