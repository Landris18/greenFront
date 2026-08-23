export const palette = {
    primary: {
        lighter: '#E6F4EC',
        light: '#7CC4A0',
        main: '#2E7D5B',
        dark: '#1F5C42',
        darker: '#123A29',
        contrastText: '#FFFFFF',
    },
    secondary: {
        lighter: '#E8EEF6',
        light: '#8FB2D9',
        main: '#3A6EA5',
        dark: '#2A5179',
        darker: '#1A3450',
        contrastText: '#FFFFFF',
    },
    success: {
        lighter: '#E3F6EA',
        light: '#6FD39A',
        main: '#1E9E5A',
        dark: '#157443',
        darker: '#0D4A2B',
        contrastText: '#FFFFFF',
    },
    warning: {
        lighter: '#FDF2E0',
        light: '#F5C97A',
        main: '#D98B0B',
        dark: '#A76A07',
        darker: '#6E4604',
        contrastText: '#FFFFFF',
    },
    error: {
        lighter: '#FCE9E9',
        light: '#EE9A9A',
        main: '#C93B3B',
        dark: '#9B2B2B',
        darker: '#661C1C',
        contrastText: '#FFFFFF',
    },
    info: {
        lighter: '#E4F3FA',
        light: '#84C9E8',
        main: '#1D8FBF',
        dark: '#146A8F',
        darker: '#0C455D',
        contrastText: '#FFFFFF',
    },
    grey: {
        50: '#F8FAFB',
        100: '#F1F4F6',
        200: '#E4E9ED',
        300: '#D2DAE0',
        400: '#A9B5BF',
        500: '#7E8B96',
        600: '#5D6B76',
        700: '#44515B',
        800: '#2D3841',
        900: '#1A222A',
    },
} as const;

export const chartPalette = [
    '#0E7C52',
    '#3060D6',
    '#C25A12',
    '#8A3FBF',
    '#BE2470',
    '#7E6B00',
    '#0089A0',
] as const;

export const chartInk = {
    axis: palette.grey[500],
    grid: palette.grey[200],
    label: palette.grey[600],
    surface: '#FFFFFF',
} as const;

export const OVERHEAD_COLOR = '#64748B';

export const sidebar = {
    background: '#151C28',
    surface: '#1B2432',
    border: '#252F3F',
    text: '#94A3B8',
    textStrong: '#E2E8F0',
    textMuted: '#64748B',
    hover: '#1E293B',
    activeText: '#4ADE80',
    activeBackground: 'rgba(74, 222, 128, 0.12)',
    accent: '#22C55E',
} as const;

export const accents = {
    energy: { main: '#0E7C52', soft: '#E3F3EB' },
    carbon: { main: '#4F46E5', soft: '#EAE8FC' },
    containers: { main: '#7C3AED', soft: '#F0E9FD' },
    savings: { main: '#0D9488', soft: '#E0F2F0' },
    alert: { main: '#D97706', soft: '#FDF1E1' },
    saturation: { main: '#DC2626', soft: '#FCEAEA' },
    overhead: { main: '#64748B', soft: '#EEF1F5' },
    power: { main: '#0891B2', soft: '#E1F2F7' },
} as const;

export type AccentName = keyof typeof accents;

export const layout = {
    navWidth: 264,
    navWidthCollapsed: 76,
    headerHeight: 68,
    contentPadding: 24,
    radius: 12,
} as const;

export const surface = {
    canvas: '#EEF4F0',
    card: '#FFFFFF',
    border: '#DCE8E1',
    recess: '#F1F6F3',
} as const;

export const shadows = {
    control: '0 1px 2px rgba(26, 34, 42, 0.05), 0 1px 3px rgba(26, 34, 42, 0.08)',
    popover: '0 8px 24px rgba(26, 34, 42, 0.12)',
} as const;
