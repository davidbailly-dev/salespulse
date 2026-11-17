import { describe, expect, it } from 'vitest';
import { buildAdSpendRow, buildTrafficRow } from '../testing/builders';
import { calculateCostPerVisit } from './costPerVisit';

describe('calculateCostPerVisit', () => {
    it('renvoie une liste vide sans dépense', () => {
        expect(calculateCostPerVisit([], [buildTrafficRow({ channel: 'paid', sessions: 100 })])).toEqual([]);
    });

    it('renvoie une liste vide sans trafic', () => {
        expect(calculateCostPerVisit([buildAdSpendRow({ channel: 'paid', spend: 100 })], [])).toEqual([]);
    });

    it('calcule dépenses / sessions par canal, du plus cher au moins cher', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'social', spend: 30 }),
            buildAdSpendRow({ channel: 'paid', spend: 100 }),
        ];
        const traffic = [
            buildTrafficRow({ channel: 'paid', device: 'desktop', sessions: 30 }),
            buildTrafficRow({ channel: 'paid', device: 'mobile', sessions: 20 }),
            buildTrafficRow({ channel: 'social', sessions: 60 }),
        ];

        expect(calculateCostPerVisit(adSpend, traffic)).toEqual([
            { channel: 'paid', cost: 2 },
            { channel: 'social', cost: 0.5 },
        ]);
    });

    it('cumule les dépenses de plusieurs lignes d\'un même canal', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', date: '2026-01-14T00:00:00.000Z', spend: 40 }),
            buildAdSpendRow({ channel: 'paid', date: '2026-01-15T00:00:00.000Z', spend: 60 }),
        ];
        const traffic = [buildTrafficRow({ channel: 'paid', sessions: 50 })];

        expect(calculateCostPerVisit(adSpend, traffic)).toEqual([{ channel: 'paid', cost: 2 }]);
    });

    it('ne liste que les canaux qui ont des dépenses', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 100 })];
        const traffic = [
            buildTrafficRow({ channel: 'paid', sessions: 50 }),
            buildTrafficRow({ channel: 'organic', sessions: 500 }),
        ];

        expect(calculateCostPerVisit(adSpend, traffic).map((entry) => entry.channel)).toEqual(['paid']);
    });

    it('exclut un canal dont les dépenses n\'ont aucune session mesurée', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 100 }),
            buildAdSpendRow({ channel: 'social', spend: 50 }),
        ];
        const traffic = [
            buildTrafficRow({ channel: 'paid', sessions: 50 }),
            buildTrafficRow({ channel: 'social', sessions: 0 }),
        ];

        expect(calculateCostPerVisit(adSpend, traffic).map((entry) => entry.channel)).toEqual(['paid']);
    });

    it('exclut un canal dont les dépenses n\'ont aucune ligne de trafic', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 100 }),
            buildAdSpendRow({ channel: 'social', spend: 50 }),
        ];
        const traffic = [buildTrafficRow({ channel: 'paid', sessions: 50 })];

        expect(calculateCostPerVisit(adSpend, traffic).map((entry) => entry.channel)).toEqual(['paid']);
    });

    it('arrondit au centime', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 10 })];
        const traffic = [buildTrafficRow({ channel: 'paid', sessions: 3 })];

        expect(calculateCostPerVisit(adSpend, traffic)).toEqual([{ channel: 'paid', cost: 3.33 }]);
    });
});
