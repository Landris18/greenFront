import { Icon } from '@iconify/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { KanbanBoard } from '../board/kanban-board';
import {
    DIFFICULTY_OPTIONS,
    SEVERITY_OPTIONS,
    STATUS_OPTIONS,
} from 'src/features/optimize/constants';
import { optimizeService } from 'src/features/optimize/api/optimize-service';
import { projectService } from 'src/features/projects/api/project-service';
import { LoadingScreen } from 'src/shared/components/loading-screen/loading-screen';
import { Page } from 'src/shared/components/page/page';
import type { Difficulty, Recommendation, RecommendationStatus, Severity } from 'src/shared/types/api';
import { getErrorMessage } from 'src/shared/utils/error-handler';
import { accents } from 'src/styles/theme/tokens';

export function KanbanView() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<number | ''>(projectId ? Number(projectId) : '');
    const [search, setSearch] = useState('');
    const [severity, setSeverity] = useState<Severity | ''>('');
    const [difficulty, setDifficulty] = useState<Difficulty | ''>('');

    const { data: projects } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(24),
    });

    useEffect(() => {
        if (selected === '' && projects && projects.length > 0) {
            setSelected(projects[0].project.id);
        }
    }, [projects, selected]);

    useEffect(() => {
        if (typeof selected === 'number' && String(selected) !== projectId) {
            navigate(`/kanban/${selected}`, { replace: true });
        }
    }, [selected, projectId, navigate]);

    const { data: items, isLoading } = useQuery({
        queryKey: ['recommendations', selected, 'board'],
        queryFn: async () => {
            const pages = await Promise.all(
                STATUS_OPTIONS.map((option) =>
                    optimizeService.list({
                        project_id: selected as number,
                        status: option.value,
                        perPage: 200,
                    })
                )
            );
            return pages.flatMap((page) => page.dataset);
        },
        enabled: typeof selected === 'number',
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: ({ id, next }: { id: number; next: RecommendationStatus }) =>
            optimizeService.updateStatus(id, next),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
            void queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error)),
    });

    const currentSummary = projects?.find((item) => item.project.id === selected);
    const currentProject = currentSummary?.project;
    const isProjectActive = (currentSummary?.running_count ?? 0) > 0;

    const filteredItems = useMemo(() => {
        const needle = search.trim().toLowerCase();
        return (items ?? []).filter((item: Recommendation) => {
            if (severity && item.severity !== severity) return false;
            if (difficulty && item.difficulty !== difficulty) return false;
            if (
                needle &&
                !item.title.toLowerCase().includes(needle) &&
                !item.description.toLowerCase().includes(needle)
            ) {
                return false;
            }
            return true;
        });
    }, [items, search, severity, difficulty]);

    if (!projects) {
        return <LoadingScreen />;
    }

    return (
        <Page
            title={`Kanban du projet ${currentProject?.display_name ?? currentProject?.name ?? ''}`}
            titleAdornment={
                currentProject && (
                    <Box
                        sx={{
                            px: 1,
                            py: 0.25,
                            borderRadius: 5,
                            color: isProjectActive ? accents.energy.main : accents.overhead.main,
                            backgroundColor: isProjectActive
                                ? accents.energy.soft
                                : accents.overhead.soft,
                        }}
                    >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {isProjectActive ? 'Actif' : 'Inactif'}
                        </Typography>
                    </Box>
                )
            }
            subtitle="Suivez le traitement des recommandations d'optimisation"
            action={
                <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ justifyContent: 'flex-end' }}
                >
                    <TextField
                        select
                        size="small"
                        value={selected}
                        onChange={(event) => setSelected(Number(event.target.value))}
                        sx={{ minWidth: 200 }}
                    >
                        {projects.map((item) => (
                            <MenuItem key={item.project.id} value={item.project.id}>
                                {item.project.display_name ?? item.project.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        value={severity}
                        onChange={(event) => setSeverity(event.target.value as Severity | '')}
                        sx={{ minWidth: 150 }}
                        slotProps={{ select: { displayEmpty: true } }}
                    >
                        <MenuItem value="">Toute criticité</MenuItem>
                        {SEVERITY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        value={difficulty}
                        onChange={(event) => setDifficulty(event.target.value as Difficulty | '')}
                        sx={{ minWidth: 190 }}
                        slotProps={{ select: { displayEmpty: true } }}
                    >
                        <MenuItem value="">Toute difficulté</MenuItem>
                        {DIFFICULTY_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small"
                        placeholder="Rechercher..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        sx={{ minWidth: 200 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Icon icon="solar:magnifer-linear" width={18} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>
            }
        >
            <KanbanBoard
                items={filteredItems}
                isLoading={isLoading}
                onStatusChange={(id, next) => updateStatus({ id, next })}
            />
        </Page>
    );
}
