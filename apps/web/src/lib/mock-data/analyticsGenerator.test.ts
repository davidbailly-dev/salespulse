import { AnalyticsDatasetSchema } from '@salespulse/contracts';
import { describe, expect, it } from 'vitest';
import { subtractOneYear } from '../dates/subtractOneYear';
import { generateAnalyticsDataset } from './analyticsGenerator';
import { DEFAULT_ANALYTICS_TUNING, HISTORY_ANALYTICS_TUNING } from './analyticsTuning';
import { generateDataset } from './generator';
import { generateHistoryOrders } from './historyGenerator';

// Tests d'invariants, sur les deux fenêtres telles que le store les génère.

const NOW = new Date('2026-03-15T10:00:00.000Z');
const dataset = generateDataset(NOW);
const historyDataset = { ...dataset, orders: generateHistoryOrders(dataset, NOW) };

describe.each([
    { window: 'actuelle', input: dataset, now: NOW, tuning: DEFAULT_ANALYTICS_TUNING },
    { window: 'N-1', input: historyDataset, now: subtractOneYear(NOW), tuning: HISTORY_ANALYTICS_TUNING },
])('generateAnalyticsDataset, fenêtre $window', ({ input, now, tuning }) => {
    const analytics = generateAnalyticsDataset(input, now, tuning);

    it('respecte le schéma des données analytics', () => {
        expect(() => AnalyticsDatasetSchema.parse(analytics)).not.toThrow();
    });

    it('donne les mêmes données pour les mêmes entrées', () => {
        expect(generateAnalyticsDataset(input, now, tuning)).toEqual(analytics);
    });
});
