import { Icon } from '@iconify/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { MeasurementBadge } from 'src/shared/components/measurement-badge/measurement-badge';
import { accents, type AccentName } from 'src/styles/theme/tokens';

type Props = {
    title: string;
    value: string;
    unit?: string;
    icon: string;
    accent?: AccentName;
    caption?: string;
    trend?: number | null;
    trendLabel?: string;
    sparkline?: number[];
    measurement?: 'host' | 'container';
    loading?: boolean;
    onClick?: () => void;
};

const SPARK_WIDTH = 260;
const SPARK_HEIGHT = 52;

function tracerCourbeLisse(coordonnees: readonly (readonly [number, number])[]): string {
    const [premier, ...reste] = coordonnees;
    if (reste.length === 0) {
        return '';
    }

    let chemin = `M${premier[0].toFixed(1)},${premier[1].toFixed(1)}`;

    for (let index = 1; index < coordonnees.length - 1; index += 1) {
        const [x, y] = coordonnees[index];
        const [xSuivant, ySuivant] = coordonnees[index + 1];
        const milieuX = (x + xSuivant) / 2;
        const milieuY = (y + ySuivant) / 2;
        chemin += ` Q${x.toFixed(1)},${y.toFixed(1)} ${milieuX.toFixed(1)},${milieuY.toFixed(1)}`;
    }

    const dernier = coordonnees[coordonnees.length - 1];
    return `${chemin} L${dernier[0].toFixed(1)},${dernier[1].toFixed(1)}`;
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
    if (points.length < 2) {
        return null;
    }

    const maximum = Math.max(...points);
    const minimum = Math.min(...points);
    const amplitude = maximum - minimum || 1;

    const coordonnees = points.map((valeur, index) => {
        const x = (index / (points.length - 1)) * SPARK_WIDTH;
        const y = SPARK_HEIGHT - ((valeur - minimum) / amplitude) * (SPARK_HEIGHT - 6) - 3;
        return [x, y] as const;
    });

    const ligne = tracerCourbeLisse(coordonnees);
    const aire = `${ligne} L${SPARK_WIDTH},${SPARK_HEIGHT} L0,${SPARK_HEIGHT} Z`;

    return (
        <Box
            component="svg"
            viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
            preserveAspectRatio="none"
            sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                width: 1,
                height: SPARK_HEIGHT,
                pointerEvents: 'none',
            }}
        >
            <path d={aire} fill={alpha(color, 0.12)} stroke="none" />
            <path
                d={ligne}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </Box>
    );
}

export function KpiCard({
    title,
    value,
    unit,
    icon,
    accent = 'energy',
    caption,
    trend,
    trendLabel,
    sparkline,
    measurement,
    loading = false,
    onClick,
}: Props) {
    const teinte = accents[accent];
    const enHausse = (trend ?? 0) > 0;
    const avecCourbe = Boolean(sparkline && sparkline.length > 1);

    return (
        <Card
            onClick={onClick}
            sx={{
                position: 'relative',
                height: 1,
                overflow: 'hidden',
                px: 2.5,
                pt: 2.5,
                pb: avecCourbe ? 7.5 : 2.5,
                transition: 'transform 160ms, background-color 160ms, border-color 160ms',
                ...(onClick && {
                    cursor: 'pointer',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: alpha(teinte.main, 0.35),
                        backgroundColor: teinte.soft,
                    },
                }),
            }}
        >
            <Stack
                direction="row"
                sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.75 }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        pr: 1,
                    }}
                >
                    {title}
                </Typography>

                <Box
                    sx={{
                        flexShrink: 0,
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        color: teinte.main,
                        backgroundColor: teinte.soft,
                    }}
                >
                    <Icon icon={icon} width={20} />
                </Box>
            </Stack>

            {loading ? (
                <Skeleton width={150} height={46} />
            ) : (
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'baseline' }}>
                    <Typography
                        component="span"
                        sx={{
                            fontSize: '2.125rem',
                            fontWeight: 700,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            color: 'text.primary',
                        }}
                    >
                        {value}
                    </Typography>
                    {unit && (
                        <Typography
                            component="span"
                            sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.secondary' }}
                        >
                            {unit}
                        </Typography>
                    )}
                </Stack>
            )}

            <Stack
                direction="row"
                spacing={0.75}
                sx={{ mt: 1.25, alignItems: 'center', flexWrap: 'wrap', rowGap: 0.75 }}
            >
                {measurement && <MeasurementBadge scope={measurement} />}
                {trend !== undefined && trend !== null && (
                    <Stack
                        direction="row"
                        spacing={0.25}
                        sx={{
                            alignItems: 'center',
                            px: 0.85,
                            py: 0.2,
                            borderRadius: 1.5,
                            color: enHausse ? 'error.dark' : 'primary.dark',
                            backgroundColor: enHausse ? accents.saturation.soft : accents.energy.soft,
                        }}
                    >
                        <Icon
                            icon={enHausse ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                            width={12}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {Math.abs(trend).toFixed(1)} %
                        </Typography>
                    </Stack>
                )}
                {(trendLabel || caption) && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {trendLabel ?? caption}
                    </Typography>
                )}
            </Stack>

            {avecCourbe && <Sparkline points={sparkline as number[]} color={teinte.main} />}
        </Card>
    );
}
