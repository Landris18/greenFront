import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

type Props = {
    value: number;
    color: string;
    width?: number | string;
    height?: number;
};

export function MiniBar({ value, color, width = 1, height = 4 }: Props) {
    const remplissage = Math.max(0, Math.min(100, value));

    return (
        <Box
            sx={{
                width,
                height,
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: alpha(color, 0.14),
            }}
        >
            <Box
                sx={{
                    width: `${remplissage}%`,
                    height: 1,
                    borderRadius: 4,
                    backgroundColor: color,
                    transition: 'width 320ms ease',
                }}
            />
        </Box>
    );
}
