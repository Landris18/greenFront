import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { useAuth } from 'src/features/auth/hooks/use-auth';
import { projectService } from 'src/features/projects/api/project-service';
import { initiales } from 'src/shared/utils/format';
import { accents, layout } from 'src/styles/theme/tokens';

const ROLE_LABELS: Record<string, string> = {
    ADMIN: 'Administrateur',
    MANAGER: 'Responsable SI',
    TECH: 'Utilisateur technique',
};

export function Header({ onOpenNav }: { onOpenNav: () => void }) {
    const { user, signOut } = useAuth();
    const [anchor, setAnchor] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    const { data } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(24),
        refetchInterval: 5000,
    });

    const projects = data ?? [];
    const running = projects.reduce((sum, item) => sum + item.running_count, 0);
    const handleSignOut = async () => {
        setAnchor(null);
        await signOut();
        navigate('/connexion', { replace: true });
    };

    return (
        <Box
            component="header"
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                height: layout.headerHeight,
                px: { xs: 2, md: 3 },
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
            }}
        >
            <IconButton onClick={onOpenNav} sx={{ display: { lg: 'none' } }}>
                <Icon icon="solar:hamburger-menu-linear" width={22} />
            </IconButton>

            <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexGrow: 1 }}>
                <Tooltip title="Détection automatique des conteneurs actifs">
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: running > 0 ? 'primary.main' : 'grey.400',
                            }}
                        />
                        <Typography variant="body2" color="text.secondary">
                            {running} conteneur(s) actif(s) sur {projects.length} projet(s)
                        </Typography>
                    </Stack>
                </Tooltip>
            </Stack>

            <Button
                onClick={(event) => setAnchor(event.currentTarget)}
                color="inherit"
                sx={{
                    pl: 0.75,
                    pr: { xs: 0.75, sm: 1.5 },
                    py: 0.75,
                    gap: 1.25,
                    borderRadius: 2,
                    fontWeight: 500,
                    '&:hover': { backgroundColor: accents.energy.soft },
                }}
            >
                <Avatar
                    sx={{
                        width: 36,
                        height: 36,
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        color: accents.energy.main,
                        backgroundColor: accents.energy.soft,
                        border: `1px solid ${alpha(accents.energy.main, 0.24)}`,
                    }}
                >
                    {initiales(user?.full_name)}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                    <Typography variant="subtitle2" sx={{ lineHeight: 1.25 }}>
                        {user?.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.25 }}>
                        {user ? ROLE_LABELS[user.role] : ''}
                    </Typography>
                </Box>
                <Icon icon="solar:alt-arrow-down-linear" width={15} />
            </Button>

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2">{user?.full_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                        {user?.email}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                    <ListItemIcon>
                        <Icon icon="solar:logout-2-linear" width={19} />
                    </ListItemIcon>
                    Se déconnecter
                </MenuItem>
            </Menu>
        </Box>
    );
}
