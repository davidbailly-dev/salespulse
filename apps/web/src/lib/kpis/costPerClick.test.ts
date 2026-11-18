import { describe, expect, it } from 'vitest';
import { buildAdSpendRow } from '../testing/builders';
import { calculateCostPerClick } from './costPerClick';

describe('calculateCostPerClick', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateCostPerClick([])).toEqual([]);
    });

    it('calcule dépenses / clics par canal, du plus cher au moins cher', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 100, clicks: 200 }),
            buildAdSpendRow({ channel: 'social', spend: 30, clicks: 20 }),
        ];

        expect(calculateCostPerClick(adSpend)).toEqual([
            { channel: 'social', cost: 1.5 },
            { channel: 'paid', cost: 0.5 },
        ]);
    });

    // Σ dépenses / Σ clics = 100 / 200 = 0,50 €, et non la moyenne des CPC des lignes
    // (1,00 € et 0,47 €) qui donnerait environ 0,74 €.
    it('cumule dépenses et clics avant de diviser (et non une moyenne des ratios)', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 10, clicks: 10 }),
            buildAdSpendRow({ channel: 'paid', spend: 90, clicks: 190 }),
        ];

        expect(calculateCostPerClick(adSpend)).toEqual([{ channel: 'paid', cost: 0.5 }]);
    });

    it('arrondit au centime', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 10, clicks: 3 }),
            buildAdSpendRow({ channel: 'social', spend: 20, clicks: 3 }),
        ];

        expect(calculateCostPerClick(adSpend)).toEqual([
            { channel: 'social', cost: 6.67 },
            { channel: 'paid', cost: 3.33 },
        ]);
    });

    it('exclut un canal sans aucun clic (pas de division par zéro)', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 100, clicks: 200 }),
            buildAdSpendRow({ channel: 'social', spend: 50, clicks: 0 }),
        ];

        expect(calculateCostPerClick(adSpend)).toEqual([{ channel: 'paid', cost: 0.5 }]);
    });
});
