import { Icon } from '@iconify/react';
import { useState } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import type { RecommendationPatch } from 'src/shared/types/api';

type Props = {
    patch: RecommendationPatch;
};

type DiffLine = {
    text: string;
    kind: 'added' | 'removed' | 'context' | 'header';
};

function classify(line: string): DiffLine['kind'] {
    if (line.startsWith('+++') || line.startsWith('---') || line.startsWith('@@')) {
        return 'header';
    }
    if (line.startsWith('+')) {
        return 'added';
    }
    if (line.startsWith('-')) {
        return 'removed';
    }
    return 'context';
}

export function PatchDiff({ patch }: Props) {
    const [expanded, setExpanded] = useState(false);
    const lines = patch.unified_diff.split('\n').filter((line, index, all) =>
        index === all.length - 1 ? line.length > 0 : true
    );
    const visible = expanded ? lines : lines.slice(0, 14);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(patch.unified_diff);
            toast.success('Diff copie dans le presse-papier.');
        } catch {
            toast.error('Copie impossible dans ce navigateur.');
        }
    };

    return (
        <Box>
            <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
                <Typography variant="caption" color="text.secondary" noWrap>
                    {patch.file_path}
                    {patch.service ? ` — service ${patch.service}` : ''}
                </Typography>
                <Button
                    size="small"
                    onClick={copy}
                    startIcon={<Icon icon="solar:copy-linear" width={15} />}
                >
                    Copier
                </Button>
            </Stack>

            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    backgroundColor: 'grey.50',
                    overflowX: 'auto',
                    fontSize: '0.75rem',
                    lineHeight: 1.65,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                }}
            >
                {visible.map((line, index) => {
                    const kind = classify(line);
                    return (
                        <Box
                            key={`${index}-${line}`}
                            component="div"
                            sx={{
                                px: 0.75,
                                borderRadius: 0.5,
                                color:
                                    kind === 'added'
                                        ? 'primary.dark'
                                        : kind === 'removed'
                                          ? 'error.dark'
                                          : kind === 'header'
                                            ? 'text.disabled'
                                            : 'text.secondary',
                                backgroundColor: (theme) =>
                                    kind === 'added'
                                        ? alpha(theme.palette.primary.main, 0.09)
                                        : kind === 'removed'
                                          ? alpha(theme.palette.error.main, 0.08)
                                          : 'transparent',
                            }}
                        >
                            {line || ' '}
                        </Box>
                    );
                })}
            </Box>

            {lines.length > 14 && (
                <Button size="small" onClick={() => setExpanded((value) => !value)} sx={{ mt: 0.5 }}>
                    {expanded ? 'Reduire' : `Afficher les ${lines.length - 14} lignes restantes`}
                </Button>
            )}
        </Box>
    );
}
