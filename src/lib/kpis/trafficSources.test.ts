import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateTrafficSources } from './trafficSources';

describe('calculateTrafficSources', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTrafficSources([])).toEqual([]);
    });

    it('renvoie une liste vide quand il n\'y a aucune session', () => {
        const traffic = [buildTrafficRow({ sessions: 0 })];

        expect(calculateTrafficSources(traffic)).toEqual([]);
    });

    it('répartit les sessions par canal, du plus grand au plus petit', () => {
        const traffic = [
            buildTrafficRow({ channel: 'direct', sessions: 100 }),
            buildTrafficRow({ channel: 'organic', sessions: 600 }),
            buildTrafficRow({ channel: 'paid', sessions: 300 }),
        ];

        expect(calculateTrafficSources(traffic)).toEqual([
            { channel: 'organic', sessions: 600, share: 60 },
            { channel: 'paid', sessions: 300, share: 30 },
            { channel: 'direct', sessions: 100, share: 10 },
        ]);
    });

    it('cumule les lignes d\'un même canal (jours et appareils différents)', () => {
        const traffic = [
            buildTrafficRow({ channel: 'organic', device: 'desktop', sessions: 100 }),
            buildTrafficRow({ channel: 'organic', device: 'mobile', sessions: 50 }),
            buildTrafficRow({ channel: 'organic', date: '2026-01-16T00:00:00.000Z', sessions: 50 }),
            buildTrafficRow({ channel: 'paid', sessions: 200 }),
        ];

        expect(calculateTrafficSources(traffic)).toEqual([
            { channel: 'organic', sessions: 200, share: 50 },
            { channel: 'paid', sessions: 200, share: 50 },
        ]);
    });

    // Parts arrondies à l'entier : 3 canaux égaux donnent 33 % chacun, soit 99 % au total.
    it('arrondit chaque part indépendamment (la somme peut valoir 99)', () => {
        const traffic = [
            buildTrafficRow({ channel: 'organic', sessions: 100 }),
            buildTrafficRow({ channel: 'paid', sessions: 100 }),
            buildTrafficRow({ channel: 'direct', sessions: 100 }),
        ];

        const shares = calculateTrafficSources(traffic).map((source) => source.share);

        expect(shares).toEqual([33, 33, 33]);
    });

    it('calcule les parts sur le total des sessions de tous les canaux', () => {
        const traffic = [buildTrafficRow({ channel: 'organic', sessions: 1 }), buildTrafficRow({ channel: 'paid', sessions: 2 })];

        expect(calculateTrafficSources(traffic).map((source) => source.share)).toEqual([67, 33]);
    });
});
