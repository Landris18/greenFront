import { useDraggable } from '@dnd-kit/core';

import Box from '@mui/material/Box';

import { KanbanCard } from './kanban-card';
import type { Recommendation } from 'src/shared/types/api';

export function SortableRecommendationCard({ item }: { item: Recommendation }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
    });

    return (
        <Box
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            sx={{
                cursor: 'grab',
                opacity: isDragging ? 0.4 : 1,
                transform: transform
                    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                    : undefined,
                touchAction: 'none',
            }}
        >
            <KanbanCard item={item} />
        </Box>
    );
}
