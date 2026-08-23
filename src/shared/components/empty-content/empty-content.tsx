import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
    title: string;
    description?: string;
    icon?: string;
    height?: number;
};

export function EmptyContent({
    title,
    description,
    icon = 'solar:inbox-linear',
    height = 220,
}: Props) {
    return (
        <Box
            sx={{
                height,
                px: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'text.secondary',
            }}
        >
            <Icon icon={icon} width={36} />
            <Typography variant="subtitle1" sx={{ mt: 1.5, color: 'text.primary' }}>
                {title}
            </Typography>
            {description && (
                <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 460 }}>
                    {description}
                </Typography>
            )}
        </Box>
    );
}
