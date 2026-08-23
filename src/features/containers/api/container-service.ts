import axios, { endpoints } from 'src/shared/utils/axios';
import type {
    Container,
    ContainerDetail,
    Granularity,
    MetricKind,
    MetricSeries,
    Page,
} from 'src/shared/types/api';

export const containerService = {
    list: async (params: {
        project_id?: number | null;
        hours: number;
        page_no?: number;
        per_page?: number;
        include_absent?: boolean;
    }): Promise<Page<Container>> => {
        const { data } = await axios.get(endpoints.containers, {
            params: {
                project_id: params.project_id ?? undefined,
                hours: params.hours,
                page_no: params.page_no ?? 1,
                per_page: params.per_page ?? 50,
                include_absent: params.include_absent ? true : undefined,
            },
        });
        return data;
    },
    get: async (id: number, hours: number): Promise<ContainerDetail> => {
        const { data } = await axios.get(`${endpoints.containers}/${id}`, { params: { hours } });
        return data;
    },
    metrics: async (
        id: number,
        metric: MetricKind,
        hours: number,
        granularity: Granularity
    ): Promise<MetricSeries> => {
        const { data } = await axios.get(`${endpoints.containers}/${id}/metrics`, {
            params: { metric, hours, granularity },
        });
        return data;
    },
};
