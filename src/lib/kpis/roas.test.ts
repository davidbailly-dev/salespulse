import { describe, expect, it } from 'vitest';
import { buildAdSpendRow, buildOrder } from '../testing/builders';
import { calculateRoas } from './roas';

describe('calculateRoas', () => {
    it('renvoie null sans dépense', () => {
        expect(calculateRoas([buildOrder({ channel: 'paid', totalAmount: 500 })], [])).toBeNull();
    });

    it('renvoie null quand les dépenses totales sont nulles', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 0 })];

        expect(calculateRoas([buildOrder({ channel: 'paid', totalAmount: 500 })], adSpend)).toBeNull();
    });

    it('renvoie 0 quand il y a des dépenses mais aucune commande', () => {
        expect(calculateRoas([], [buildAdSpendRow({ channel: 'paid', spend: 100 })])).toBe(0);
    });

    it('divise le CA du canal payant par les dépenses', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 100 })];
        const orders = [buildOrder({ channel: 'paid', totalAmount: 370 })];

        expect(calculateRoas(orders, adSpend)).toBe(3.7);
    });

    it('n\'attribue que le CA des canaux qui ont une dépense', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 100 })];
        const orders = [
            buildOrder({ channel: 'paid', totalAmount: 200 }),
            buildOrder({ channel: 'organic', totalAmount: 1000 }),
            buildOrder({ channel: 'social', totalAmount: 1000 }),
        ];

        expect(calculateRoas(orders, adSpend)).toBe(2);
    });

    it('additionne les canaux avec dépense (dépenses et CA)', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 50 }),
            buildAdSpendRow({ channel: 'social', spend: 50 }),
        ];
        const orders = [
            buildOrder({ channel: 'paid', totalAmount: 200 }),
            buildOrder({ channel: 'social', totalAmount: 150 }),
            buildOrder({ channel: 'email', totalAmount: 999 }),
        ];

        expect(calculateRoas(orders, adSpend)).toBe(3.5);
    });

    it('ne compte que les commandes completed', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 100 })];
        const orders = [
            buildOrder({ channel: 'paid', totalAmount: 200 }),
            buildOrder({ channel: 'paid', status: 'refunded', totalAmount: 500 }),
            buildOrder({ channel: 'paid', status: 'abandoned', totalAmount: 500 }),
        ];

        expect(calculateRoas(orders, adSpend)).toBe(2);
    });

    it('arrondit à une décimale (3,33 -> 3,3)', () => {
        const adSpend = [buildAdSpendRow({ channel: 'paid', spend: 30 })];
        const orders = [buildOrder({ channel: 'paid', totalAmount: 100 })];

        expect(calculateRoas(orders, adSpend)).toBe(3.3);
    });
});
