import type { ApexOptions } from 'apexcharts';
import localeFr from 'apexcharts/dist/locales/fr.json';

import { chartInk, chartPalette } from 'src/styles/theme/tokens';

export function baseChartOptions(): ApexOptions {
    return {
        colors: [...chartPalette],
        chart: {
            toolbar: { show: false },
            zoom: { enabled: false },
            fontFamily: 'Inter, system-ui, sans-serif',
            animations: { enabled: false },
            parentHeightOffset: 0,
            locales: [localeFr as ApexLocale],
            defaultLocale: 'fr',
        },
        states: {
            hover: { filter: { type: 'lighten' } },
            active: { filter: { type: 'none' } },
        },
        dataLabels: { enabled: false },
        stroke: { width: 2, curve: 'smooth', lineCap: 'round' },
        fill: { type: 'solid', opacity: 1 },
        grid: {
            borderColor: chartInk.grid,
            strokeDashArray: 0,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } },
            padding: { top: 4, right: 8, bottom: 0, left: 8 },
        },
        xaxis: {
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: chartInk.label, fontSize: '11px' } },
            tooltip: { enabled: false },
        },
        yaxis: {
            labels: { style: { colors: chartInk.label, fontSize: '11px' } },
        },
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '12px',
            markers: { size: 6, strokeWidth: 0, shape: 'circle' },
            itemMargin: { horizontal: 10, vertical: 4 },
            labels: { colors: chartInk.label },
        },
        tooltip: {
            theme: 'light',
            shared: true,
            intersect: false,
            x: { format: 'dd MMM HH:mm' },
        },
    };
}

export function mergeChartOptions(overrides: ApexOptions): ApexOptions {
    const base = baseChartOptions();
    return {
        ...base,
        ...overrides,
        chart: { ...base.chart, ...overrides.chart },
        grid: { ...base.grid, ...overrides.grid },
        xaxis: { ...base.xaxis, ...overrides.xaxis },
        legend: {
            ...base.legend,
            ...overrides.legend,
            markers: { ...base.legend?.markers, ...overrides.legend?.markers },
        },
        tooltip: { ...base.tooltip, ...overrides.tooltip },
        stroke: { ...base.stroke, ...overrides.stroke },
        fill: { ...base.fill, ...overrides.fill },
        dataLabels: { ...base.dataLabels, ...overrides.dataLabels },
    };
}
