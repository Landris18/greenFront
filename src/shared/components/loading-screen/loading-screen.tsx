import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

export function LoadingScreen() {
    return (
        <Box
            sx={{
                minHeight: '60vh',
                display: 'grid',
                placeItems: 'center',
                px: 3,
            }}
        >
            <LinearProgress sx={{ width: 1, maxWidth: 360 }} />
        </Box>
    );
}
