import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { DIFFICULTY_LABELS } from 'src/features/optimize/constants';
import { SeverityChip } from 'src/shared/components/status-chip/status-chip';
import type { Recommendation } from 'src/shared/types/api';
import { accents } from 'src/styles/theme/tokens';
import { formatCarbon, formatEnergy } from 'src/shared/utils/format';

const SOURCE_ICON: Record<Recommendation['source'], string> = {
    RUNTIME: 'solar:cpu-bolt-linear',
    CONFIG: 'solar:file-text-linear',
};

export function KanbanCard({ item }: { item: Recommendation }) {
    const navigate = useNavigate();
    const energy = formatEnergy(item.estimated_energy_saving_kwh);
    const carbon = formatCarbon(item.estimated_co2_saving_kg);

    return (
        <Card sx={{ '&:hover': { borderColor: alpha(accents.energy.main, 0.35) } }}>
            <CardActionArea
                onClick={() => navigate(`/optimiser/${item.project_id}`)}
                sx={{ '&:hover': { backgroundColor: 'transparent' } }}
            >
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                        >
                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                <SeverityChip severity={item.severity} />
                                <Chip
                                    size="small"
                                    variant="outlined"
                                    label={DIFFICULTY_LABELS[item.difficulty]}
                                />
                            </Stack>
                            <Box sx={{ color: 'text.disabled', display: 'flex', flexShrink: 0 }}>
                                <Icon icon={SOURCE_ICON[item.source]} width={16} />
                            </Box>
                        </Stack>

                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                textAlign: 'left',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {item.title}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                textAlign: 'left',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                            }}
                        >
                            {item.description}
                        </Typography>

                        <Stack direction="row" sx={{ alignItems: 'center', pt: 0.25 }}>
                            {item.saving_is_computed ? (
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{
                                        alignItems: 'center',
                                        px: 0.75,
                                        py: 0.25,
                                        borderRadius: 1,
                                        color: accents.energy.main,
                                        backgroundColor: accents.energy.soft,
                                    }}
                                >
                                    <Icon icon="solar:bolt-bold" width={12} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        Gain : -{energy.value} {energy.unit} · -{carbon.value}{' '}
                                        {carbon.unit}
                                    </Typography>
                                </Stack>
                            ) : (
                                <Typography variant="caption" color="text.disabled">
                                    Gain : Non quantifiable
                                </Typography>
                            )}
                        </Stack>
                    </Stack>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
