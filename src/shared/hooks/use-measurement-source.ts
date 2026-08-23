import { useQuery } from '@tanstack/react-query';

import { CONFIG } from 'src/config/env';
import type { PowerSource } from 'src/shared/types/api';
import axios, { endpoints } from 'src/shared/utils/axios';

export const MEASUREMENT_SOURCE_KEY = ['measurement-source'] as const;

async function fetchPowerSource(): Promise<PowerSource | null> {
    const { data } = await axios.get(`${endpoints.energy}/summary`, {
        params: { hours: CONFIG.defaultWindowHours },
    });
    return (data?.current_power_source as PowerSource | null) ?? null;
}

export function useMeasurementSource() {
    const { data, isLoading } = useQuery({
        queryKey: MEASUREMENT_SOURCE_KEY,
        queryFn: fetchPowerSource,
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });

    return { source: data ?? null, loading: isLoading };
}
