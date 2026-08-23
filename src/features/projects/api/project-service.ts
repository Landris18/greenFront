import axios, { endpoints } from 'src/shared/utils/axios';
import type {
    ConfigFile,
    Project,
    ProjectConfigStatus,
    ProjectSummary,
    ScanResult,
} from 'src/shared/types/api';

export const projectService = {
    list: async (hours = 24): Promise<ProjectSummary[]> => {
        const { data } = await axios.get(endpoints.projects, { params: { hours } });
        return data;
    },
    get: async (id: number, hours = 24): Promise<ProjectSummary> => {
        const { data } = await axios.get(`${endpoints.projects}/${id}`, { params: { hours } });
        return data;
    },
    register: async (id: number): Promise<Project> => {
        const { data } = await axios.post(`${endpoints.projects}/${id}/register`);
        return data;
    },
    config: async (id: number): Promise<ProjectConfigStatus> => {
        const { data } = await axios.get(`${endpoints.projects}/${id}/config`);
        return data;
    },
    uploadConfig: async (
        id: number,
        payload: {
            kind: 'COMPOSE' | 'DOCKERFILE';
            path: string;
            service_name?: string | null;
            content: string;
        }
    ): Promise<ConfigFile> => {
        const { data } = await axios.post(`${endpoints.projects}/${id}/config`, payload);
        return data;
    },
    deleteConfig: async (id: number, fileId: number): Promise<void> => {
        await axios.delete(`${endpoints.projects}/${id}/config/${fileId}`);
    },
    analyze: async (id: number): Promise<ScanResult> => {
        const { data } = await axios.post(`${endpoints.projects}/${id}/analyze`);
        return data;
    },
};
