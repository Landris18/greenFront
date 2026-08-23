import { createTheme, type Theme } from '@mui/material/styles';

import { layout, palette, shadows, surface } from './tokens';

export function createAppTheme(): Theme {
    const theme = createTheme({
        shape: { borderRadius: layout.radius },
        palette: {
            mode: 'light',
            primary: palette.primary,
            secondary: palette.secondary,
            success: palette.success,
            warning: palette.warning,
            error: palette.error,
            info: palette.info,
            grey: palette.grey,
            divider: surface.border,
            text: {
                primary: palette.grey[900],
                secondary: palette.grey[600],
                disabled: palette.grey[400],
            },
            background: {
                default: surface.canvas,
                paper: surface.card,
            },
        },
        typography: {
            fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif',
            h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
            h2: { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.02em' },
            h3: { fontSize: '1.375rem', fontWeight: 600, letterSpacing: '-0.01em' },
            h4: { fontSize: '1.125rem', fontWeight: 600 },
            h5: { fontSize: '1rem', fontWeight: 600 },
            h6: { fontSize: '0.9375rem', fontWeight: 600 },
            subtitle1: { fontSize: '0.9375rem', fontWeight: 500 },
            subtitle2: { fontSize: '0.8125rem', fontWeight: 600 },
            body1: { fontSize: '0.9375rem' },
            body2: { fontSize: '0.8125rem' },
            caption: { fontSize: '0.75rem' },
            button: { fontWeight: 600, textTransform: 'none' },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: { backgroundColor: surface.canvas },
                    '*::-webkit-scrollbar': { width: 8, height: 8 },
                    '*::-webkit-scrollbar-thumb': {
                        backgroundColor: palette.grey[300],
                        borderRadius: 8,
                    },
                },
            },
            MuiPaper: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: { backgroundImage: 'none' },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        border: 'none',
                        borderRadius: layout.radius,
                        boxShadow: 'none',
                    },
                },
            },
            MuiPopover: {
                styleOverrides: {
                    paper: {
                        border: `1px solid ${surface.border}`,
                        borderRadius: layout.radius,
                        boxShadow: shadows.popover,
                    },
                },
            },
            MuiCardHeader: {
                defaultProps: {
                    titleTypographyProps: { variant: 'h5' },
                    subheaderTypographyProps: { variant: 'body2', color: 'text.secondary' },
                },
                styleOverrides: {
                    root: { padding: '20px 20px 8px' },
                },
            },
            MuiCardContent: {
                styleOverrides: {
                    root: { padding: 20, '&:last-child': { paddingBottom: 20 } },
                },
            },
            MuiButton: {
                defaultProps: { disableElevation: true },
                styleOverrides: {
                    root: { borderRadius: 9, paddingInline: 18, fontWeight: 600 },
                    sizeSmall: { paddingInline: 12 },
                    sizeLarge: { height: 46 },
                    outlinedInherit: {
                        borderColor: palette.grey[300],
                        color: palette.grey[700],
                        '&:hover': { backgroundColor: palette.grey[100] },
                    },
                },
            },
            MuiToggleButtonGroup: {
                styleOverrides: {
                    root: {
                        backgroundColor: palette.grey[100],
                        borderRadius: 999,
                        padding: 3,
                        gap: 3,
                    },
                    grouped: {
                        border: 0,
                        borderRadius: '999px !important',
                        paddingInline: 14,
                        whiteSpace: 'nowrap',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        color: palette.grey[600],
                        '&.Mui-selected': {
                            backgroundColor: '#FFFFFF',
                            color: palette.primary.dark,
                            boxShadow: shadows.control,
                            '&:hover': { backgroundColor: '#FFFFFF' },
                        },
                    },
                },
            },
            MuiAvatar: {
                styleOverrides: {
                    root: { fontWeight: 600, fontSize: '0.8125rem' },
                },
            },
            MuiListItemButton: {
                styleOverrides: {
                    root: { borderRadius: 9 },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: { fontWeight: 600, borderRadius: 7 },
                    sizeSmall: { height: 23, fontSize: '0.6875rem' },
                    outlined: {
                        borderColor: palette.grey[300],
                        color: palette.grey[700],
                        backgroundColor: palette.grey[50],
                    },
                },
            },
            MuiTableCell: {
                styleOverrides: {
                    root: { borderBottom: `1px solid ${surface.border}` },
                    head: {
                        backgroundColor: palette.grey[50],
                        color: palette.grey[600],
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        backgroundColor: palette.grey[800],
                        fontSize: '0.75rem',
                        padding: '8px 10px',
                        maxWidth: 320,
                    },
                    arrow: { color: palette.grey[800] },
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: { borderRadius: 8, backgroundColor: '#FFFFFF' },
                },
            },
            MuiLinearProgress: {
                styleOverrides: {
                    root: { borderRadius: 4, backgroundColor: palette.grey[200] },
                    bar: { borderRadius: 4 },
                },
            },
            MuiAlert: {
                styleOverrides: {
                    root: { borderRadius: layout.radius },
                },
            },
        },
    });

    return theme;
}
