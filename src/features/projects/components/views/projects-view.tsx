import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { containerService } from 'src/features/containers/api/container-service';
import { projectService } from 'src/features/projects/api/project-service';
import { EmptyContent } from 'src/shared/components/empty-content/empty-content';
import { MiniBar } from 'src/shared/components/mini-bar/mini-bar';
import { Page } from 'src/shared/components/page/page';
import { ContainerStatusChip } from 'src/shared/components/status-chip/status-chip';
import type { Container, ProjectSummary } from 'src/shared/types/api';
import {
    formatBytes,
    formatCarbon,
    formatDuration,
    formatEnergy,
    formatNumber,
    formatWatts,
} from 'src/shared/utils/format';
import { surface } from 'src/styles/theme/tokens';

const accents = {
    energy: { main: '#0E7C52', soft: '#E3F3EB' },
    carbon: { main: '#4F46E5', soft: '#EAE8FC' },
    containers: { main: '#7C3AED', soft: '#F0E9FD' },
    savings: { main: '#0D9488', soft: '#E0F2F0' },
    alert: { main: '#D97706', soft: '#FDF1E1' },
    saturation: { main: '#DC2626', soft: '#FCEAEA' },
    overhead: { main: '#64748B', soft: '#EEF1F5' },
    power: { main: '#0891B2', soft: '#E1F2F7' },
} as const;

const REFRESH_MS = 2000;
const SEUIL_SATURATION_CPU = 80;
const SEUIL_SATURATION_MEMOIRE = 85;

type Colonne = 'name' | 'cpu_percent' | 'memory_working_set_bytes' | 'energy_kwh' | 'co2_kg';

const ENTETE_SX = {
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'text.secondary',
    borderBottomColor: 'divider',
    whiteSpace: 'nowrap',
} as const;

const CELLULE_CHIFFREE_SX = { fontVariantNumeric: 'tabular-nums' } as const;

const LARGEUR_MESURE = 104;
const LARGEUR_ACTION = 132;

const LARGEURS_COLONNES = ['26%', '12%', '12%', '13%', '11%', '13%', '13%'] as const;

function Colonnes() {
    return (
        <colgroup>
            {LARGEURS_COLONNES.map((largeur, index) => (
                <col key={index} style={{ width: largeur }} />
            ))}
        </colgroup>
    );
}

function nomAffiche(conteneur: Container): string {
    return conteneur.service_name ?? conteneur.name;
}

function trier(rows: Container[], colonne: Colonne, decroissant: boolean): Container[] {
    const facteur = decroissant ? -1 : 1;
    return [...rows].sort((a, b) => {
        if (colonne === 'name') {
            return nomAffiche(a).localeCompare(nomAffiche(b)) * facteur;
        }
        return ((a[colonne] as number) - (b[colonne] as number)) * facteur;
    });
}

function Mesure({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="caption"
                sx={{
                    display: 'block',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                }}
            >
                {label}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline', minWidth: 0 }}>
                <Typography
                    component="span"
                    noWrap
                    sx={{ fontSize: '1.0625rem', fontWeight: 700, ...CELLULE_CHIFFREE_SX }}
                >
                    {value}
                </Typography>
                <Typography component="span" variant="caption" color="text.secondary" noWrap>
                    {unit}
                </Typography>
            </Stack>
        </Box>
    );
}

function EnteteTriable({
    label,
    cible,
    colonne,
    decroissant,
    onTrier,
}: {
    label: string;
    cible: Colonne;
    colonne: Colonne;
    decroissant: boolean;
    onTrier: (cible: Colonne) => void;
}) {
    const actif = colonne === cible;

    return (
        <TableSortLabel
            active={actif}
            direction={actif && decroissant ? 'desc' : 'asc'}
            onClick={() => onTrier(cible)}
        >
            {label}
        </TableSortLabel>
    );
}

function ChargeCellule({
    valeur,
    unite,
    part,
    seuil,
    couleur,
}: {
    valeur: string;
    unite: string;
    part: number | null;
    seuil: number;
    couleur: string;
}) {
    const sature = part !== null && part > seuil;

    return (
        <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'baseline' }}>
                <Typography variant="subtitle2" sx={CELLULE_CHIFFREE_SX}>
                    {valeur}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {unite}
                </Typography>
            </Stack>
            {part !== null && (
                <Tooltip title={`${formatNumber(part, 1)} % de la limite configurée`}>
                    <Box sx={{ width: 68 }}>
                        <MiniBar
                            value={part}
                            color={sature ? accents.saturation.main : couleur}
                            height={3}
                        />
                    </Box>
                </Tooltip>
            )}
        </Stack>
    );
}

function ValeurChiffree({ value, unit }: { value: string; unit: string }) {
    return (
        <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'baseline', justifyContent: 'flex-end' }}
        >
            <Typography variant="subtitle2" sx={CELLULE_CHIFFREE_SX}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {unit}
            </Typography>
        </Stack>
    );
}

function MarqueEnergivore() {
    return (
        <Tooltip title="Conteneur le plus énergivore de ce projet sur 24 heures">
            <Box
                component="span"
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.375,
                    px: 0.75,
                    py: 0.125,
                    borderRadius: 1,
                    flexShrink: 0,
                    color: accents.alert.main,
                    backgroundColor: accents.alert.soft,
                    border: `1px solid ${alpha(accents.alert.main, 0.16)}`,
                }}
            >
                <Icon icon="solar:fire-bold" width={11} />
                <Typography
                    component="span"
                    variant="caption"
                    sx={{ fontWeight: 600, fontSize: '0.625rem', lineHeight: 1.5 }}
                >
                    Le plus énergivore
                </Typography>
            </Box>
        </Tooltip>
    );
}

function ContainerRows({ rows }: { rows: Container[] }) {
    const navigate = useNavigate();
    const [colonne, setColonne] = useState<Colonne>('energy_kwh');
    const [decroissant, setDecroissant] = useState(true);

    const plusEnergivore = useMemo(() => {
        const maximum = Math.max(0, ...rows.map((row) => row.energy_kwh));
        return maximum > 0 ? rows.find((row) => row.energy_kwh === maximum)?.id : undefined;
    }, [rows]);

    const triees = useMemo(() => trier(rows, colonne, decroissant), [rows, colonne, decroissant]);

    const trierPar = (cible: Colonne) => {
        if (cible === colonne) {
            setDecroissant((valeur) => !valeur);
            return;
        }
        setColonne(cible);
        setDecroissant(cible !== 'name');
    };

    if (rows.length === 0) {
        return (
            <EmptyContent
                title="Aucun conteneur"
                description="Aucun conteneur de ce projet ne correspond à la recherche."
                height={120}
            />
        );
    }

    const proprietesTri = { colonne, decroissant, onTrier: trierPar };

    return (
        <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 940, tableLayout: 'fixed' }}>
                <Colonnes />
                <TableHead>
                    <TableRow>
                        <TableCell sx={ENTETE_SX}>
                            <EnteteTriable label="Conteneur" cible="name" {...proprietesTri} />
                        </TableCell>
                        <TableCell sx={ENTETE_SX}>Statut</TableCell>
                        <TableCell align="right" sx={ENTETE_SX}>
                            <EnteteTriable label="CPU" cible="cpu_percent" {...proprietesTri} />
                        </TableCell>
                        <TableCell align="right" sx={ENTETE_SX}>
                            <EnteteTriable
                                label="Mémoire"
                                cible="memory_working_set_bytes"
                                {...proprietesTri}
                            />
                        </TableCell>
                        <TableCell align="right" sx={ENTETE_SX}>
                            Uptime
                        </TableCell>
                        <TableCell align="right" sx={ENTETE_SX}>
                            <EnteteTriable label="Énergie" cible="energy_kwh" {...proprietesTri} />
                        </TableCell>
                        <TableCell align="right" sx={ENTETE_SX}>
                            <EnteteTriable label="CO2" cible="co2_kg" {...proprietesTri} />
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {triees.map((row) => {
                        const memory = formatBytes(row.memory_working_set_bytes);
                        const energy = formatEnergy(row.energy_kwh);
                        const carbon = formatCarbon(row.co2_kg);

                        return (
                            <TableRow
                                key={row.id}
                                hover
                                sx={{
                                    cursor: 'pointer',
                                    '&:last-of-type td': { borderBottom: 0 },
                                    '&:hover': { backgroundColor: accents.energy.soft },
                                }}
                                onClick={() => navigate(`/conteneurs/${row.id}`)}
                            >
                                <TableCell sx={{ overflow: 'hidden' }}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        useFlexGap
                                        sx={{
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            rowGap: 0.5,
                                            mb: 0.25,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            noWrap
                                            sx={{ maxWidth: 1 }}
                                        >
                                            {nomAffiche(row)}
                                        </Typography>
                                        {row.id === plusEnergivore && <MarqueEnergivore />}
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        noWrap
                                        sx={{ display: 'block' }}
                                    >
                                        {row.image_ref}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <ContainerStatusChip status={row.status} />
                                </TableCell>
                                <TableCell align="right">
                                    <ChargeCellule
                                        valeur={formatNumber(row.cpu_percent, 3)}
                                        unite="%"
                                        part={row.cpu_percent_of_limit}
                                        seuil={SEUIL_SATURATION_CPU}
                                        couleur={accents.power.main}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <ChargeCellule
                                        valeur={memory.value}
                                        unite={memory.unit}
                                        part={row.memory_percent_of_limit}
                                        seuil={SEUIL_SATURATION_MEMOIRE}
                                        couleur={accents.containers.main}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={CELLULE_CHIFFREE_SX}
                                    >
                                        {formatDuration(row.uptime_seconds)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <ValeurChiffree value={energy.value} unit={energy.unit} />
                                </TableCell>
                                <TableCell align="right">
                                    <ValeurChiffree value={carbon.value} unit={carbon.unit} />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </Box>
    );
}

function ProjectCard({
    summary,
    rows,
    ouvert,
    onBasculer,
}: {
    summary: ProjectSummary;
    rows: Container[];
    ouvert: boolean;
    onBasculer: () => void;
}) {
    const navigate = useNavigate();
    const project = summary.project;
    const power = formatWatts(summary.power_watts);
    const energy = formatEnergy(summary.energy_kwh);
    const carbon = formatCarbon(summary.co2_kg);
    const memory = formatBytes(summary.memory_bytes);
    const actif = summary.running_count > 0;
    const partActifs = summary.container_count
        ? (summary.running_count / summary.container_count) * 100
        : 0;

    return (
        <Card sx={{ overflow: 'hidden' }}>
            <Box
                onClick={onBasculer}
                sx={{
                    px: 2.5,
                    py: 2,
                    cursor: 'pointer',
                    transition: 'background-color 160ms',
                    '&:hover': { backgroundColor: surface.recess },
                }}
            >
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={2.5}
                    sx={{ alignItems: { lg: 'center' }, justifyContent: 'space-between' }}
                >
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                flexShrink: 0,
                                borderRadius: 1.5,
                                display: 'grid',
                                placeItems: 'center',
                                color: actif ? accents.energy.main : accents.overhead.main,
                                backgroundColor: actif
                                    ? accents.energy.soft
                                    : accents.overhead.soft,
                            }}
                        >
                            <Icon
                                icon={
                                    ouvert
                                        ? 'solar:alt-arrow-down-linear'
                                        : 'solar:alt-arrow-right-linear'
                                }
                                width={17}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'center', mb: 0.5 }}
                            >
                                <Typography variant="h5" noWrap>
                                    {project.display_name ?? project.name}
                                </Typography>
                                {project.is_registered && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        label="suivi"
                                    />
                                )}
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <MiniBar
                                    value={partActifs}
                                    color={actif ? accents.energy.main : accents.overhead.main}
                                    width={54}
                                    height={4}
                                />
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {summary.running_count} actif(s) sur {summary.container_count}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Box
                        sx={{
                            flexShrink: 0,
                            display: 'grid',
                            alignItems: 'center',
                            columnGap: 2.5,
                            rowGap: 2,
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: `repeat(4, 1fr) ${LARGEUR_ACTION}px`,
                                lg: `repeat(4, ${LARGEUR_MESURE}px) ${LARGEUR_ACTION}px`,
                            },
                        }}
                    >
                        <Mesure label="Puissance" value={power.value} unit={power.unit} />
                        <Mesure label="Mémoire" value={memory.value} unit={memory.unit} />
                        <Mesure label="Énergie 24 h" value={energy.value} unit={energy.unit} />
                        <Mesure label="CO2 24 h" value={carbon.value} unit={carbon.unit} />

                        <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                            <Badge
                                badgeContent={summary.recommendation_count}
                                color={summary.critical_count > 0 ? 'error' : 'warning'}
                                sx={{ display: 'flex', width: 1 }}
                            >
                                <Button
                                    fullWidth
                                    variant={
                                        summary.recommendation_count > 0 ? 'contained' : 'outlined'
                                    }
                                    size="small"
                                    startIcon={
                                        <Icon icon="solar:lightbulb-bold-duotone" width={17} />
                                    }
                                    onClick={(evenement) => {
                                        evenement.stopPropagation();
                                        navigate(`/optimiser/${project.id}`);
                                    }}
                                >
                                    Optimiser
                                </Button>
                            </Badge>
                        </Box>
                    </Box>
                </Stack>
            </Box>

            <Collapse in={ouvert} unmountOnExit>
                <Divider />
                <ContainerRows rows={rows} />
            </Collapse>
        </Card>
    );
}

export function ProjectsView() {
    const [recherche, setRecherche] = useState('');
    const [avecDisparus, setAvecDisparus] = useState(false);
    const [ouverture, setOuverture] = useState<Record<number, boolean>>({});

    const { data: projets, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectService.list(24),
        refetchInterval: REFRESH_MS,
    });

    const { data: conteneurs } = useQuery({
        queryKey: ['containers', 'tous', avecDisparus],
        queryFn: () =>
            containerService.list({
                hours: 24,
                per_page: 200,
                include_absent: avecDisparus,
            } as any),
        refetchInterval: REFRESH_MS,
    });

    const terme = recherche.trim().toLowerCase();

    const parProjet = useMemo(() => {
        const groupes = new Map<number, Container[]>();
        for (const conteneur of conteneurs?.dataset ?? []) {
            if (terme && !nomAffiche(conteneur).toLowerCase().includes(terme)) {
                continue;
            }
            const liste = groupes.get(conteneur.project_id) ?? [];
            liste.push(conteneur);
            groupes.set(conteneur.project_id, liste);
        }
        return groupes;
    }, [conteneurs, terme]);

    const { active, idle, conteneursTotal, actifs } = useMemo(() => {
        const tous = projets ?? [];
        const visibles = tous.filter((item) => {
            if (!terme) {
                return true;
            }
            const nom = (item.project.display_name ?? item.project.name).toLowerCase();
            return nom.includes(terme) || (parProjet.get(item.project.id)?.length ?? 0) > 0;
        });
        return {
            active: visibles.filter((item) => item.running_count > 0),
            idle: visibles.filter((item) => item.running_count === 0 && item.container_count > 0),
            conteneursTotal: tous.reduce((somme, item) => somme + item.container_count, 0),
            actifs: tous.reduce((somme, item) => somme + item.running_count, 0),
        };
    }, [projets, terme, parProjet]);

    const estOuvert = (summary: ProjectSummary) =>
        ouverture[summary.project.id] ?? (summary.running_count > 0 || terme !== '');

    const visibles = [...active, ...idle];
    const toutOuvert = visibles.length > 0 && visibles.every((item) => estOuvert(item));

    const basculerTout = () => {
        const etat: Record<number, boolean> = {};
        for (const item of visibles) {
            etat[item.project.id] = !toutOuvert;
        }
        setOuverture(etat);
    };

    const basculerProjet = (summary: ProjectSummary) => {
        setOuverture((etat) => ({ ...etat, [summary.project.id]: !estOuvert(summary) }));
    };

    if (isLoading && !projets) {
        return (
            <Page title="Conteneurs">
                <LinearProgress />
            </Page>
        );
    }

    if ((projets ?? []).length === 0) {
        return (
            <Page title="Conteneurs">
                <Card>
                    <EmptyContent
                        icon="solar:box-linear"
                        title="Aucun conteneur détecté"
                        description="GreenSI interroge Docker en continu. Démarrez un conteneur et il apparaitra ici automatiquement."
                    />
                </Card>
            </Page>
        );
    }

    return (
        <Page
            title="Conteneurs"
            subtitle="Projets Docker détectés automatiquement sur la machine hôte, sans configuration préalable"
            action={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        border: `1px solid ${alpha(accents.energy.main, 0.2)}`,
                        backgroundColor: accents.energy.soft,
                    }}
                >
                    <Icon icon="solar:box-bold-duotone" width={17} color={accents.energy.main} />
                    <Typography variant="subtitle2" sx={{ color: 'primary.darker' }}>
                        {actifs} actif(s) sur {conteneursTotal}
                    </Typography>
                </Stack>
            }
        >
            <Stack spacing={2}>
                <Card sx={{ px: 2, py: 1.5 }}>
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ alignItems: { sm: 'center' } }}
                    >
                        <TextField
                            size="small"
                            placeholder="Rechercher un projet ou un conteneur"
                            value={recherche}
                            onChange={(evenement) => setRecherche(evenement.target.value)}
                            sx={{ width: { xs: 1, sm: 340 } }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Icon icon="solar:magnifer-linear" width={17} />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />

                        <Box sx={{ flexGrow: 1 }} />

                        <Button
                            size="small"
                            color="inherit"
                            onClick={basculerTout}
                            startIcon={
                                <Icon
                                    icon={
                                        toutOuvert
                                            ? 'solar:minimize-square-linear'
                                            : 'solar:maximize-square-linear'
                                    }
                                    width={16}
                                />
                            }
                            sx={{ color: 'text.secondary', fontWeight: 500 }}
                        >
                            {toutOuvert ? 'Tout replier' : 'Tout déplier'}
                        </Button>

                        <Button
                            size="small"
                            color="inherit"
                            onClick={() => setAvecDisparus((valeur) => !valeur)}
                            startIcon={
                                <Icon
                                    icon={
                                        avecDisparus
                                            ? 'solar:eye-closed-linear'
                                            : 'solar:eye-linear'
                                    }
                                    width={16}
                                />
                            }
                            sx={{ color: 'text.secondary', fontWeight: 500 }}
                        >
                            {avecDisparus ? 'Masquer les disparus' : 'Afficher les disparus'}
                        </Button>
                    </Stack>
                </Card>

                {visibles.length === 0 && (
                    <Card>
                        <EmptyContent
                            icon="solar:magnifer-linear"
                            title="Aucun résultat"
                            description="Aucun projet ni conteneur ne correspond à cette recherche."
                        />
                    </Card>
                )}

                {active.map((summary) => (
                    <ProjectCard
                        key={summary.project.id}
                        summary={summary}
                        rows={parProjet.get(summary.project.id) ?? []}
                        ouvert={estOuvert(summary)}
                        onBasculer={() => basculerProjet(summary)}
                    />
                ))}

                {idle.length > 0 && (
                    <>
                        <Typography
                            variant="caption"
                            sx={{
                                mt: 1,
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                color: 'text.secondary',
                            }}
                        >
                            Projets sans conteneur actif
                        </Typography>
                        {idle.map((summary) => (
                            <ProjectCard
                                key={summary.project.id}
                                summary={summary}
                                rows={parProjet.get(summary.project.id) ?? []}
                                ouvert={estOuvert(summary)}
                                onBasculer={() => basculerProjet(summary)}
                            />
                        ))}
                    </>
                )}
            </Stack>
        </Page>
    );
}
