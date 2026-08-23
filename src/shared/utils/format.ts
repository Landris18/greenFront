export type FormattedValue = {
    value: string;
    unit: string;
};

const numberFormatter = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

function round(value: number, digits: number): string {
    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
    }).format(value);
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }
    return round(value, digits);
}

export function formatPercent(value: number | null | undefined, digits = 1): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '-';
    }
    return `${round(value, digits)} %`;
}

export const ENERGY_UNIT = 'kWh';
export const CARBON_UNIT = 'gCO2e';
const GRAMS_PER_KG = 1000;
export const POWER_UNIT = 'W';

const MAX_DECIMALES = 6;

export function decimalesUtiles(value: number, maximum = MAX_DECIMALES): number {
    const absolu = Math.abs(value);
    if (absolu === 0 || Number.isNaN(absolu) || absolu >= 1) {
        return 2;
    }
    return Math.min(maximum, 2 - Math.floor(Math.log10(absolu)));
}

export type Echelle = { unite: string; facteur: number; decimales: number };

export function echelleEnergie(maximumKwh: number): Echelle {
    const absolu = Math.abs(maximumKwh);
    if (absolu > 0 && absolu < 0.001) {
        return { unite: 'mWh', facteur: 1_000_000, decimales: decimalesUtiles(absolu * 1_000_000) };
    }
    if (absolu > 0 && absolu < 1) {
        return { unite: 'Wh', facteur: 1000, decimales: decimalesUtiles(absolu * 1000) };
    }
    return { unite: ENERGY_UNIT, facteur: 1, decimales: decimalesUtiles(absolu) };
}

export function echelleCarbone(maximumGrammes: number): Echelle {
    const absolu = Math.abs(maximumGrammes);
    if (absolu > 0 && absolu < 1) {
        return { unite: 'mgCO2e', facteur: 1000, decimales: decimalesUtiles(absolu * 1000) };
    }
    return { unite: CARBON_UNIT, facteur: 1, decimales: decimalesUtiles(absolu) };
}

export function formatEnergy(kwh: number | null | undefined): FormattedValue {
    if (kwh === null || kwh === undefined || Number.isNaN(kwh)) {
        return { value: '-', unit: ENERGY_UNIT };
    }
    return { value: round(kwh, decimalesUtiles(kwh)), unit: ENERGY_UNIT };
}

export function formatCarbon(kg: number | null | undefined): FormattedValue {
    if (kg === null || kg === undefined || Number.isNaN(kg)) {
        return { value: '-', unit: CARBON_UNIT };
    }
    const grammes = kg * GRAMS_PER_KG;
    return { value: round(grammes, decimalesUtiles(grammes)), unit: CARBON_UNIT };
}

export function formatBytes(bytes: number | null | undefined): FormattedValue {
    if (bytes === null || bytes === undefined || Number.isNaN(bytes)) {
        return { value: '-', unit: 'o' };
    }
    const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
    let index = 0;
    let current = Math.abs(bytes);
    while (current >= 1024 && index < units.length - 1) {
        current /= 1024;
        index += 1;
    }
    return { value: round(Math.sign(bytes) * current, current < 10 ? 2 : 1), unit: units[index] };
}

export function formatRate(bytesPerSecond: number | null | undefined): FormattedValue {
    const formatted = formatBytes(bytesPerSecond);
    return { value: formatted.value, unit: `${formatted.unit}/s` };
}

export function formatWatts(watts: number | null | undefined): FormattedValue {
    if (watts === null || watts === undefined || Number.isNaN(watts)) {
        return { value: '-', unit: POWER_UNIT };
    }
    return { value: round(watts, decimalesUtiles(watts, 3)), unit: POWER_UNIT };
}

export function formatDuration(seconds: number | null | undefined): string {
    if (!seconds || seconds <= 0) {
        return '-';
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return `${days} j ${hours} h`;
    }
    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }
    return `${minutes} min`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
    if (!value) {
        return '-';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
}

export function formatRelative(value: string | Date | null | undefined): string {
    if (!value) {
        return 'jamais';
    }
    const date = typeof value === 'string' ? new Date(value) : value;
    const seconds = Math.round((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) {
        return "à l'instant";
    }
    if (seconds < 3600) {
        return `il y a ${Math.floor(seconds / 60)} min`;
    }
    if (seconds < 86400) {
        return `il y a ${Math.floor(seconds / 3600)} h`;
    }
    return `il y a ${Math.floor(seconds / 86400)} j`;
}

export function formatCount(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return '-';
    }
    return numberFormatter.format(value);
}

export function initiales(nom: string | null | undefined): string {
    if (!nom) {
        return '?';
    }
    return (
        nom
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((mot) => mot[0]?.toUpperCase() ?? '')
            .join('') || '?'
    );
}

export function stripCommonPrefix(labels: string[]): string[] {
    if (labels.length < 2) {
        return labels;
    }

    let prefixLength = 0;
    const shortest = Math.min(...labels.map((label) => label.length));
    while (prefixLength < shortest) {
        const character = labels[0][prefixLength];
        if (!labels.every((label) => label[prefixLength] === character)) {
            break;
        }
        prefixLength += 1;
    }

    const boundary = labels[0].slice(0, prefixLength).lastIndexOf('-') + 1;
    if (boundary <= 0 || labels.some((label) => label.length - boundary < 3)) {
        return labels;
    }
    return labels.map((label) => label.slice(boundary));
}

export function formatRecommendationValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return 'Aucun';
    }
    return String(value);
}

export function formatGain(percent: number | null | undefined): string {
    if (percent === null || percent === undefined || Number.isNaN(percent)) {
        return 'non calculable';
    }
    const sign = percent > 0 ? '-' : '+';
    return `${sign}${round(Math.abs(percent), 1)} %`;
}
