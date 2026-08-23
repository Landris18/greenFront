import { Icon } from '@iconify/react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NavLink } from 'react-router-dom';

import { navItems } from './nav-config';
import { CONFIG } from 'src/config/env';
import { useAuth } from 'src/features/auth/hooks/use-auth';
import { initiales } from 'src/shared/utils/format';
import { layout, sidebar } from 'src/styles/theme/tokens';

type Props = {
    open: boolean;
    onClose: () => void;
};

function NavContent() {
    const { hasRole, user } = useAuth();

    return (
        <Box
            sx={{
                height: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: sidebar.background,
            }}
        >
            <Stack
                direction="row"
                spacing={1.25}
                sx={{ alignItems: 'center', px: 2.5, height: layout.headerHeight, flexShrink: 0 }}
            >
                <Box
                    sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        color: '#062012',
                        backgroundColor: sidebar.accent,
                    }}
                >
                    <Icon icon="solar:leaf-bold" width={19} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ lineHeight: 1.1, color: sidebar.textStrong }}>
                        {CONFIG.appName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: sidebar.textMuted }}>
                        Pilotage Green IT
                    </Typography>
                </Box>
            </Stack>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, pb: 2 }}>
                <Typography
                    variant="caption"
                    sx={{
                        px: 1.5,
                        mb: 1,
                        mt: 1,
                        display: 'block',
                        color: sidebar.textMuted,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        fontSize: '0.6875rem',
                    }}
                >
                    Navigation
                </Typography>

                <Stack spacing={0.4}>
                    {navItems
                        .filter((item) => !item.roles || hasRole(...item.roles))
                        .map((item) => (
                            <Box
                                key={item.path}
                                component={NavLink}
                                to={item.path}
                                end={item.path === '/'}
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.25,
                                    px: 1.5,
                                    py: 1.15,
                                    borderRadius: 1.5,
                                    color: sidebar.text,
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    transition: 'background-color 140ms, color 140ms',
                                    '&:hover': {
                                        backgroundColor: sidebar.hover,
                                        color: sidebar.textStrong,
                                    },
                                    '&.active': {
                                        color: sidebar.activeText,
                                        fontWeight: 600,
                                        backgroundColor: sidebar.activeBackground,
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: 10,
                                            bottom: 10,
                                            width: 3,
                                            borderRadius: 3,
                                            backgroundColor: sidebar.activeText,
                                        },
                                    },
                                }}
                            >
                                <Icon icon={item.icon} width={20} />
                                {item.title}
                            </Box>
                        ))}
                </Stack>
            </Box>

            {user && (
                <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{
                        px: 2,
                        py: 2,
                        alignItems: 'center',
                        borderTop: 1,
                        borderColor: sidebar.border,
                        flexShrink: 0,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            backgroundColor: sidebar.surface,
                            color: sidebar.activeText,
                        }}
                    >
                        {initiales(user.full_name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap sx={{ color: sidebar.textStrong }}>
                            {user.full_name}
                        </Typography>
                        <Typography variant="caption" noWrap sx={{ color: sidebar.textMuted }}>
                            {user.email}
                        </Typography>
                    </Box>
                </Stack>
            )}
        </Box>
    );
}

export function Nav({ open, onClose }: Props) {
    return (
        <>
            <Box
                component="nav"
                sx={{
                    width: layout.navWidth,
                    flexShrink: 0,
                    display: { xs: 'none', lg: 'block' },
                    position: 'fixed',
                    top: 0,
                    bottom: 0,
                    left: 0,
                }}
            >
                <NavContent />
            </Box>

            <Drawer
                open={open}
                onClose={onClose}
                sx={{ display: { lg: 'none' } }}
                PaperProps={{ sx: { width: layout.navWidth, border: 0 } }}
            >
                <NavContent />
            </Drawer>
        </>
    );
}
