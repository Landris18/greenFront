import axios, { endpoints } from 'src/shared/utils/axios';
import type { GreenConfig } from 'src/shared/types/api';

export type GreenConfigPayload = Omit<
    GreenConfig,
    | 'id'
    | 'version'
    | 'is_active'
    | 'created_by'
    | 'created_at'
    | 'updated_at'
    | 'calibration_note'
>;

export const settingsService = {
    get: async (): Promise<GreenConfig> => {
        const { data } = await axios.get(endpoints.settings);
        return data;
    },
    update: async (payload: GreenConfigPayload): Promise<GreenConfig> => {
        const { data } = await axios.put(endpoints.settings, payload);
        return data;
    },
};
