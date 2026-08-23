import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMemo } from 'react';

import Stack from '@mui/material/Stack';

import { KanbanColumn } from './kanban-column';
import { STATUS_ACCENTS, STATUS_OPTIONS } from 'src/features/optimize/constants';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import type { Recommendation, RecommendationStatus } from 'src/shared/types/api';

export function KanbanBoard({
    items,
    isLoading,
    onStatusChange,
}: {
    items: Recommendation[];
    isLoading: boolean;
    onStatusChange: (id: number, status: RecommendationStatus) => void;
}) {
    // Un seuil de déplacement avant de déclencher le drag : sans ça, un simple clic sur
    // la carte (pour ouvrir la vue Optimisation) serait toujours interprété comme un
    // début de glisser-déposer.
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const itemsByStatus = useMemo(() => {
        const groups: Record<RecommendationStatus, Recommendation[]> = {
            OPEN: [],
            ACKNOWLEDGED: [],
            APPLIED: [],
            DISMISSED: [],
        };
        for (const item of items) {
            groups[item.status].push(item);
        }
        return groups;
    }, [items]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;
        const nextStatus = over.id as RecommendationStatus;
        const item = items.find((candidate) => candidate.id === active.id);
        if (item && item.status !== nextStatus) {
            onStatusChange(item.id, nextStatus);
        }
    }

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'flex-start', width: 1, overflowX: 'auto', pb: 1 }}
            >
                {STATUS_OPTIONS.map((option) => (
                    <KanbanColumn
                        key={option.value}
                        status={option.value}
                        label={option.label}
                        items={itemsByStatus[option.value]}
                        accent={STATUS_ACCENTS[option.value]}
                    />
                ))}
            </Stack>
        </DndContext>
    );
}
