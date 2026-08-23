import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { PatchDiff } from './patch-diff';
import { DIFFICULTY_LABELS, STATUS_OPTIONS } from 'src/features/optimize/constants';
import { SeverityChip } from 'src/shared/components/status-chip/status-chip';
import type { Recommendation, RecommendationStatus } from 'src/shared/types/api';
import { formatCarbon, formatEnergy, formatRecommendationValue } from 'src/shared/utils/format';

export function RecommendationCard({
    item,
    onStatusChange,
    compact = false,
}: {
    item: Recommendation;
    onStatusChange: (id: number, status: RecommendationStatus) => void;
    compact?: boolean;
}) {
    const energy = formatEnergy(item.estimated_energy_saving_kwh);
    const carbon = formatCarbon(item.estimated_co2_saving_kg);

    return (
        <Card>
            <CardContent>
                <Stack spacing={compact ? 1.25 : 1.75}>
                    <Stack
                        direction={{ xs: 'column', sm: compact ? 'column' : 'row' }}
                        spacing={1.5}
                        sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' } }}
                    >
                        <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }} flexWrap="wrap" useFlexGap>
                                <SeverityChip severity={item.severity} />
                                {!compact && (
                                    <>
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={
                                                item.source === 'CONFIG'
                                                    ? 'Fichier de configuration'
                                                    : "Mesure d'exécution"
                                            }
                                        />
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={DIFFICULTY_LABELS[item.difficulty]}
                                        />
                                    </>
                                )}
                            </Stack>
                            <Typography variant={compact ? 'subtitle2' : 'h5'}>{item.title}</Typography>
                        </Box>

                        {!compact && (
                            <TextField
                                select
                                size="small"
                                value={item.status}
                                onChange={(event) =>
                                    onStatusChange(item.id, event.target.value as RecommendationStatus)
                                }
                                sx={{ minWidth: 185, flexShrink: 0 }}
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={
                            compact
                                ? {
                                      display: '-webkit-box',
                                      WebkitLineClamp: 3,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                  }
                                : undefined
                        }
                    >
                        {item.description}
                    </Typography>

                    {!compact &&
                        (item.patch ? (
                            <PatchDiff patch={item.patch} />
                        ) : (
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Situation actuelle
                                    </Typography>
                                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                        {Object.entries(item.current_value).map(([key, value]) => (
                                            <Typography key={key} variant="body2">
                                                {key} : <strong>{formatRecommendationValue(value)}</strong>
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Action proposée
                                    </Typography>
                                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                        {Object.entries(item.suggested_value).map(([key, value]) => (
                                            <Typography key={key} variant="body2">
                                                {key} : <strong>{formatRecommendationValue(value)}</strong>
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Grid>
                            </Grid>
                        ))}

                    <Divider />

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                            Gain estimé :
                        </Typography>
                        {item.saving_is_computed ? (
                            <Typography variant={compact ? 'caption' : 'subtitle2'} color="primary.dark">
                                {energy.value} {energy.unit} et {carbon.value} {carbon.unit} sur 30 jours
                            </Typography>
                        ) : (
                            <Typography variant={compact ? 'caption' : 'subtitle2'} color="text.secondary">
                                non quantifiable en kWh
                            </Typography>
                        )}
                    </Stack>
                    {!compact && item.saving_note && (
                        <Typography variant="caption" color="text.secondary">
                            {item.saving_note}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
