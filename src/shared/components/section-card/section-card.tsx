import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type Props = {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    dense?: boolean;
};

export function SectionCard({ title, subtitle, action, children, dense = false }: Props) {
    return (
        <Card sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
            <Stack
                direction="row"
                spacing={2}
                sx={{
                    px: 2.5,
                    pt: 2.5,
                    pb: 2,
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5">{title}</Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
            </Stack>

            <Box sx={{ flexGrow: 1, px: dense ? 1.5 : 2.5, pb: 2.5 }}>{children}</Box>
        </Card>
    );
}
