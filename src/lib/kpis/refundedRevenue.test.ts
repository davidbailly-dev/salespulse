import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRefundedRevenue } from './refundedRevenue';

describe('calculateRefundedRevenue', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateRefundedRevenue([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est remboursée', () => {
        const orders = [
            buildOrder({ status: 'completed', totalAmount: 100 }),
            buildOrder({ status: 'abandoned', totalAmount: 100 }),
        ];

        expect(calculateRefundedRevenue(orders)).toBe(0);
    });

    it('additionne uniquement les commandes remboursées', () => {
        const orders = [
            buildOrder({ status: 'refunded', totalAmount: 40 }),
            buildOrder({ status: 'refunded', totalAmount: 60 }),
            buildOrder({ status: 'completed', totalAmount: 500 }),
        ];

        expect(calculateRefundedRevenue(orders)).toBe(100);
    });

    it('arrondit la somme à l\'euro', () => {
        const orders = [
            buildOrder({ status: 'refunded', totalAmount: 10.4 }),
            buildOrder({ status: 'refunded', totalAmount: 10.4 }),
        ];

        expect(calculateRefundedRevenue(orders)).toBe(21);
    });
});
