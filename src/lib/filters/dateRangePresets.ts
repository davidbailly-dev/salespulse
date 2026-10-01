import type { OrderDateRange } from '../queries/useOrders';

export type DateRangePresetId = '7d' | '30d' | '90d' | 'month' | 'lastMonth';

export const DEFAULT_PRESET: DateRangePresetId = '30d';

export const DATE_RANGE_PRESETS: { id: DateRangePresetId; label: string }[] = [
    { id: '7d', label: '7 jours' },
    { id: '30d', label: '30 jours' },
    { id: '90d', label: '90 jours' },
    { id: 'month', label: 'Mois en cours' },
    { id: 'lastMonth', label: 'Mois dernier' },
];

const PRESET_IDS: DateRangePresetId[] = DATE_RANGE_PRESETS.map((preset) => preset.id);

export function isValidPreset(value: string | null): value is DateRangePresetId {
    return PRESET_IDS.includes(value as DateRangePresetId);
}

function daysAgoRange(days: number, now: Date): OrderDateRange {
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - days);
    return { from: from.toISOString(), to: now.toISOString() };
}

export function resolvePresetRange(presetId: DateRangePresetId, now: Date = new Date()): OrderDateRange {
    switch (presetId) {
        case '7d':
            return daysAgoRange(7, now);
        case '30d':
            return daysAgoRange(30, now);
        case '90d':
            return daysAgoRange(90, now);
        case 'month': {
            const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            return { from: from.toISOString(), to: now.toISOString() };
        }
        case 'lastMonth': {
            const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
            // Date.UTC(..., moisCourant, 0) = jour 0 du mois courant = dernier jour du mois précédent.
            const lastDayOfPreviousMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
            lastDayOfPreviousMonth.setUTCHours(23, 59, 59, 999);
            return { from: from.toISOString(), to: lastDayOfPreviousMonth.toISOString() };
        }
    }
}
