import type { Difficulty, RecommendationStatus, Severity } from 'src/shared/types/api';
import { accents } from 'src/styles/theme/tokens';

export const DIFFICULTY_LABELS: Record<string, string> = {
    EASY: 'Mise en œuvre simple',
    MEDIUM: 'Mise en œuvre modérée',
    HARD: 'Mise en œuvre complexe',
};

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
    { value: 'EASY', label: 'Mise en œuvre simple' },
    { value: 'MEDIUM', label: 'Mise en œuvre modérée' },
    { value: 'HARD', label: 'Mise en œuvre complexe' },
];

export const SEVERITY_LABELS: Record<Severity, string> = {
    CRITICAL: 'Critique',
    HIGH: 'Élevée',
    MEDIUM: 'Moyenne',
    LOW: 'Faible',
};

export const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
    { value: 'CRITICAL', label: 'Critique' },
    { value: 'HIGH', label: 'Élevée' },
    { value: 'MEDIUM', label: 'Moyenne' },
    { value: 'LOW', label: 'Faible' },
];

export const STATUS_OPTIONS: { value: RecommendationStatus; label: string }[] = [
    { value: 'OPEN', label: 'À traiter' },
    { value: 'ACKNOWLEDGED', label: 'Prise en compte' },
    { value: 'APPLIED', label: 'Appliquée' },
    { value: 'DISMISSED', label: 'Écartée' },
];

export const STATUS_ACCENTS: Record<RecommendationStatus, (typeof accents)[keyof typeof accents]> =
    {
        OPEN: accents.alert,
        ACKNOWLEDGED: accents.power,
        APPLIED: accents.energy,
        DISMISSED: accents.overhead,
    };
