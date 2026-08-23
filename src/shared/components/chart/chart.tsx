import type { ApexOptions } from 'apexcharts';
import ReactApexChart from 'react-apexcharts';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

type ChartSeries = ApexOptions['series'];

type Props = {
    type: 'line' | 'area' | 'bar' | 'donut';
    series: ChartSeries;
    options: ApexOptions;
    height?: number;
    loading?: boolean;
    isEmpty?: boolean;
    emptyMessage?: string;
};

export function Chart({
    type,
    series,
    options,
    height = 300,
    loading = false,
    isEmpty = false,
    emptyMessage = 'Aucune donnée sur la période sélectionnée.',
}: Props) {
    if (loading) {
        return <Skeleton variant="rounded" height={height} />;
    }

    if (isEmpty) {
        return (
            <Box
                sx={{
                    height,
                    display: 'grid',
                    placeItems: 'center',
                    border: (theme) => `1px dashed ${theme.palette.divider}`,
                    borderRadius: 2,
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    {emptyMessage}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ '& .apexcharts-canvas': { mx: 'auto' } }}>
            <ReactApexChart type={type} series={series} options={options} height={height} />
        </Box>
    );
}
