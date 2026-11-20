import type { AnalyticsDataset, TrafficRow } from '@salespulse/contracts';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getAnalyticsDataset } from '../../../../lib/mock-data/store';
import { buildTrafficRow } from '../../../../lib/testing/builders';
import { GET } from './route';

// Le store remplacé ; `filterTraffic` reste le vrai, la route doit lui transmettre ses paramètres.
vi.mock('../../../../lib/mock-data/store', () => ({ getAnalyticsDataset: vi.fn() }));

const ROWS = [
    buildTrafficRow({ shopId: 'shop-a', date: '2026-01-10T00:00:00.000Z', sessions: 100 }),
    buildTrafficRow({ shopId: 'shop-a', date: '2026-01-11T00:00:00.000Z', sessions: 100 }),
    buildTrafficRow({ shopId: 'shop-b', date: '2026-01-11T00:00:00.000Z', sessions: 100 }),
];

function serveTraffic(traffic: TrafficRow[]): void {
    vi.mocked(getAnalyticsDataset).mockReturnValue({ traffic } as AnalyticsDataset);
}

/** Appelle la route avec la query string donnée et résume chaque ligne renvoyée. */
async function fetchTraffic(query = ''): Promise<{ shopId: string; date: string; sessions: number }[]> {
    const response = await GET(new NextRequest(`http://localhost/api/analytics/traffic${query}`));
    const rows = (await response.json()) as TrafficRow[];
    return rows.map(({ shopId, date, sessions }) => ({ shopId, date: date.slice(0, 10), sessions }));
}

describe('GET /api/analytics/traffic', () => {
    beforeEach(() => {
        serveTraffic(ROWS);
    });

    it('renvoie toutes les lignes sans paramètre', async () => {
        expect(await fetchTraffic()).toHaveLength(3);
    });

    it('ne renvoie que les lignes de la boutique demandée', async () => {
        expect(await fetchTraffic('?shop=shop-b')).toEqual([{ shopId: 'shop-b', date: '2026-01-11', sessions: 100 }]);
    });

    it('proratise le jour entamé par `from` et exclut le jour qui commence pile à `to`', async () => {
        const query = '?shop=shop-a&from=2026-01-10T12:00:00.000Z&to=2026-01-11T00:00:00.000Z';

        expect(await fetchTraffic(query)).toEqual([{ shopId: 'shop-a', date: '2026-01-10', sessions: 50 }]);
    });

    it('refuse de renvoyer une ligne hors contrat', async () => {
        serveTraffic([buildTrafficRow({ sessions: -1 })]);

        await expect(GET(new NextRequest('http://localhost/api/analytics/traffic'))).rejects.toThrow();
    });
});
