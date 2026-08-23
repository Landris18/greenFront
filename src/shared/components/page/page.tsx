import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CONFIG } from 'src/config/env';

type Props = {
    title: string;
    titleAdornment?: ReactNode;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
};

export function Page({ title, titleAdornment, subtitle, action, children }: Props) {
    return (
        <Box>
            <title>{`${title} | ${CONFIG.appName}`}</title>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
            >
                <Box>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                        <Typography variant="h3">{title}</Typography>
                        {titleAdornment}
                    </Stack>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
            </Stack>

            {children}
        </Box>
    );
}
