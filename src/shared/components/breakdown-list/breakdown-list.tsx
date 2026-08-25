import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { EmptyContent } from 'src/shared/components/empty-content/empty-content';
import type { BreakdownItem } from 'src/shared/types/api';
import type { FormattedValue } from 'src/shared/utils/format';
import { accents, chartPalette } from 'src/styles/theme/tokens';

type Props = {
    items: BreakdownItem[];
    valueOf: (item: BreakdownItem) => number;
    format: (value: number) => FormattedValue;
    emptyTitle: string;
    emptyDescription: string;
    overhead?: { value: number; label: string; tooltip: string };
};

export function BreakdownList({
    items,
    valueOf,
    format,
    emptyTitle,
    emptyDescription,
    overhead,
}: Props) {
    if (items.length === 0 && !overhead) {
        return (
            <EmptyContent title={emptyTitle} description={emptyDescription} height={200} />
        );
    }

    const total = items.reduce((somme, item) => somme + valeurPositive(valueOf(item)), 0) +
        (overhead ? valeurPositive(overhead.value) : 0) || 1;

    return (
        <Stack spacing={2.25}>
            {items.map((item, index) => {
                const brute = valueOf(item);
                const valeur = format(brute);
                const part = (valeurPositive(brute) / total) * 100;
                const couleur = chartPalette[index % chartPalette.length];

                return (
                    <Ligne
                        key={item.entity_id}
                        couleur={couleur}
                        libelle={item.label}
                        valeur={`${valeur.value} ${valeur.unit}`}
                        part={part}
                    />
                );
            })}

            {overhead && (
                <Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                        <Box
                            sx={{
                                width: 9,
                                height: 9,
                                borderRadius: '50%',
                                backgroundColor: accents.overhead.main,
                                flexShrink: 0,
                            }}
                        />
                        <Tooltip title={overhead.tooltip}>
                            <Stack
                                direction="row"
                                spacing={0.5}
                                sx={{
                                    alignItems: 'center',
                                    flexGrow: 1,
                                    minWidth: 0,
                                    cursor: 'help',
                                }}
                            >
                                <Typography variant="subtitle2" noWrap sx={{ color: 'text.secondary' }}>
                                    {overhead.label}
                                </Typography>
                                <Icon
                                    icon="solar:question-circle-linear"
                                    width={14}
                                    color={accents.overhead.main}
                                />
                            </Stack>
                        </Tooltip>
                        <Typography variant="subtitle2" color="text.secondary">
                            {format(overhead.value).value} {format(overhead.value).unit}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ width: 42, textAlign: 'right' }}
                        >
                            {((valeurPositive(overhead.value) / total) * 100).toFixed(0)} %
                        </Typography>
                    </Stack>
                    <Box sx={{ height: 7, borderRadius: 4, backgroundColor: 'grey.100', overflow: 'hidden' }}>
                        <Box
                            sx={{
                                width: `${(valeurPositive(overhead.value) / total) * 100}%`,
                                height: 1,
                                borderRadius: 4,
                                backgroundColor: accents.overhead.main,
                            }}
                        />
                    </Box>
                </Box>
            )}
        </Stack>
    );
}

function valeurPositive(valeur: number): number {
    return Math.max(0, valeur);
}

function Ligne({
    couleur,
    libelle,
    valeur,
    part,
}: {
    couleur: string;
    libelle: string;
    valeur: string;
    part: number;
}) {
    return (
        <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                <Box
                    sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        backgroundColor: couleur,
                        flexShrink: 0,
                    }}
                />
                <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1 }}>
                    {libelle}
                </Typography>
                <Typography variant="subtitle2">{valeur}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ width: 42, textAlign: 'right' }}>
                    {part.toFixed(0)} %
                </Typography>
            </Stack>
            <Box sx={{ height: 7, borderRadius: 4, backgroundColor: 'grey.100', overflow: 'hidden' }}>
                <Box
                    sx={{
                        width: `${part}%`,
                        height: 1,
                        borderRadius: 4,
                        backgroundColor: couleur,
                    }}
                />
            </Box>
        </Box>
    );
}
