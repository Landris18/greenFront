import { useDroppable } from '@dnd-kit/core';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SortableRecommendationCard } from './sortable-recommendation-card';
import type { Recommendation, RecommendationStatus } from 'src/shared/types/api';
import { surface } from 'src/styles/theme/tokens';

type Accent = { main: string; soft: string };

export function KanbanColumn({
    status,
    label,
    items,
    accent,
}: {
    status: RecommendationStatus;
    label: string;
    items: Recommendation[];
    accent: Accent;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: status });

    return (
        <Stack sx={{ flex: '1 1 0', minWidth: 260 }}>
            <Box sx={{ height: 4, borderRadius: '4px 4px 0 0', backgroundColor: accent.main }} />

            <Stack
                sx={{
                    flex: 1,
                    p: 1.25,
                    borderRadius: '0 0 12px 12px',
                    backgroundColor: surface.recess,
                    border: `1px solid ${surface.border}`,
                    borderTop: 'none',
                }}
                spacing={1.25}
            >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 0.5, pt: 0.25 }}>
                    <Typography variant="subtitle2">{label}</Typography>
                    <Box
                        sx={{
                            minWidth: 22,
                            height: 20,
                            px: 0.5,
                            borderRadius: 5,
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: accent.main,
                            backgroundColor: accent.soft,
                        }}
                    >
                        {items.length}
                    </Box>
                </Stack>

                <Box
                    ref={setNodeRef}
                    sx={{
                        minHeight: 140,
                        borderRadius: 1.5,
                        outline: isOver ? '2px dashed' : 'none',
                        outlineColor: accent.main,
                        outlineOffset: 2,
                    }}
                >
                    <Stack spacing={1}>
                        {items.length === 0 ? (
                            <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{ px: 0.5, py: 1, textAlign: 'center' }}
                            >
                                Aucune recommandation
                            </Typography>
                        ) : (
                            items.map((item) => <SortableRecommendationCard key={item.id} item={item} />)
                        )}
                    </Stack>
                </Box>
            </Stack>
        </Stack>
    );
}
