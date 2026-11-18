import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRevenue, sumCompletedRevenue } from './revenue';

describe('sumCompletedRevenue', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(sumCompletedRevenue([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', totalAmount: 100 }),
            buildOrder({ status: 'refunded', totalAmount: 50 }),
        ];

        expect(sumCompletedRevenue(orders)).toBe(0);
    });

    it('additionne uniquement les commandes completed, sans arrondir', () => {
        const orders = [
            buildOrder({ status: 'completed', totalAmount: 10.25 }),
            buildOrder({ status: 'completed', totalAmount: 20.5 }),
            buildOrder({ status: 'refunded', totalAmount: 99 }),
            buildOrder({ status: 'abandoned', totalAmount: 99 }),
        ];

        expect(sumCompletedRevenue(orders)).toBe(30.75);
    });
});

describe('calculateRevenue', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateRevenue([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [buildOrder({ status: 'refunded', totalAmount: 50 })];

        expect(calculateRevenue(orders)).toBe(0);
    });

    it('arrondit la somme à l\'euro (contrairement à sumCompletedRevenue)', () => {
        const orders = [
            buildOrder({ totalAmount: 10.25 }),
            buildOrder({ totalAmount: 20.5 }),
        ];

        expect(sumCompletedRevenue(orders)).toBe(30.75);
        expect(calculateRevenue(orders)).toBe(31);
    });

    it('arrondit vers le bas sous la demi-unité et vers le haut à la demi-unité', () => {
        expect(calculateRevenue([buildOrder({ totalAmount: 30.4 })])).toBe(30);
        expect(calculateRevenue([buildOrder({ totalAmount: 30.5 })])).toBe(31);
    });

    it('arrondit la somme et non chaque commande', () => {
        // 10,4 + 10,4 = 20,8 -> 21 ; arrondir chaque commande donnerait 10 + 10 = 20.
        const orders = [buildOrder({ totalAmount: 10.4 }), buildOrder({ totalAmount: 10.4 })];

        expect(calculateRevenue(orders)).toBe(21);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            buildOrder({ totalAmount: 100 }),
            buildOrder({ status: 'refunded', totalAmount: 500 }),
            buildOrder({ status: 'abandoned', totalAmount: 900 }),
        ];

        expect(calculateRevenue(orders)).toBe(100);
    });
});
