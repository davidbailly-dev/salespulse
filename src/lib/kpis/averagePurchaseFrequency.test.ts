import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateAveragePurchaseFrequency } from './averagePurchaseFrequency';

describe('calculateAveragePurchaseFrequency', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAveragePurchaseFrequency([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c2', status: 'refunded' }),
        ];

        expect(calculateAveragePurchaseFrequency(orders)).toBe(0);
    });

    it('divise les commandes completed par le nombre de clients actifs', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateAveragePurchaseFrequency(orders)).toBe(1.5);
    });

    it('vaut 1 quand chaque client n\'a commandé qu\'une fois', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c2' })];

        expect(calculateAveragePurchaseFrequency(orders)).toBe(1);
    });

    it('arrondit à une décimale (4 commandes / 3 clients = 1,333… -> 1,3)', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
            buildOrder({ customerId: 'c3' }),
        ];

        expect(calculateAveragePurchaseFrequency(orders)).toBe(1.3);
    });

    it('n\'élargit pas les clients actifs avec les commandes non completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2', status: 'abandoned' }),
            buildOrder({ customerId: 'c3', status: 'refunded' }),
        ];

        expect(calculateAveragePurchaseFrequency(orders)).toBe(1);
    });
});
