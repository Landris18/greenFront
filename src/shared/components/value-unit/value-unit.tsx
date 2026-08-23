import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Props = {
    value: string;
    unit: string;
    size?: 'small' | 'medium' | 'large';
};

const SIZES = {
    small: { value: 'subtitle2', unit: 'caption' },
    medium: { value: 'h4', unit: 'body2' },
    large: { value: 'h2', unit: 'subtitle2' },
} as const;

export function ValueUnit({ value, unit, size = 'medium' }: Props) {
    const tokens = SIZES[size];

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'baseline', gap: 0.75 }}>
            <Typography variant={tokens.value} component="span" sx={{ lineHeight: 1.2 }}>
                {value}
            </Typography>
            <Typography variant={tokens.unit} component="span" color="text.secondary">
                {unit}
            </Typography>
        </Box>
    );
}
