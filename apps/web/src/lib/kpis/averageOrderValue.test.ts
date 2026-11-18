import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateAverageOrderValue } from './averageOrderValue';

describe('calculateAverageOrderValue', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageOrderValue([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', totalAmount: 100 }),
            buildOrder({ status: 'refunded', totalAmount: 100 }),
        ];

        expect(calculateAverageOrderValue(orders)).toBe(0);
    });

    it('divise le CA par le nombre de commandes completed', () => {
        const orders = [
            buildOrder({ totalAmount: 100 }),
            buildOrder({ totalAmount: 50 }),
            buildOrder({ totalAmount: 30 }),
        ];

        expect(calculateAverageOrderValue(orders)).toBe(60);
    });

    it('arrondit à 2 décimales', () => {
        const orders = [
            buildOrder({ totalAmount: 100 }),
            buildOrder({ totalAmount: 100 }),
            buildOrder({ totalAmount: 101 }),
        ];

        expect(calculateAverageOrderValue(orders)).toBe(100.33);
    });

    it('ignore les commandes non completed au numérateur comme au dénominateur', () => {
        const orders = [
            buildOrder({ totalAmount: 100 }),
            buildOrder({ status: 'refunded', totalAmount: 1000 }),
            buildOrder({ status: 'abandoned', totalAmount: 1000 }),
        ];

        expect(calculateAverageOrderValue(orders)).toBe(100);
    });

    // Le CA utilisé est celui de `calculateRevenue`, arrondi à l'euro avant la division.
    it('hérite de l\'arrondi à l\'euro du CA (20,8 € sur 2 commandes -> 21 / 2 = 10,5)', () => {
        const orders = [buildOrder({ totalAmount: 10.4 }), buildOrder({ totalAmount: 10.4 })];

        expect(calculateAverageOrderValue(orders)).toBe(10.5);
    });
});
