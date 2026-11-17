import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateAverageRevenuePerActiveCustomer } from './averageRevenuePerCustomer';

describe('calculateAverageRevenuePerActiveCustomer', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageRevenuePerActiveCustomer([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned', totalAmount: 100 }),
            buildOrder({ customerId: 'c2', status: 'refunded', totalAmount: 100 }),
        ];

        expect(calculateAverageRevenuePerActiveCustomer(orders)).toBe(0);
    });

    it('divise le CA par le nombre de clients actifs (un client = un seul compte)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c1', totalAmount: 50 }),
            buildOrder({ customerId: 'c2', totalAmount: 50 }),
        ];

        expect(calculateAverageRevenuePerActiveCustomer(orders)).toBe(100);
    });

    it('arrondit à l\'euro (100 € sur 3 clients = 33,33 -> 33)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 50 }),
            buildOrder({ customerId: 'c2', totalAmount: 25 }),
            buildOrder({ customerId: 'c3', totalAmount: 25 }),
        ];

        expect(calculateAverageRevenuePerActiveCustomer(orders)).toBe(33);
    });

    it('arrondit à l\'entier supérieur à la demi-unité (5 € sur 2 clients = 2,5 -> 3)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 3 }),
            buildOrder({ customerId: 'c2', totalAmount: 2 }),
        ];

        expect(calculateAverageRevenuePerActiveCustomer(orders)).toBe(3);
    });

    it('ne compte pas au dénominateur un client sans commande completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c2', status: 'refunded', totalAmount: 100 }),
        ];

        expect(calculateAverageRevenuePerActiveCustomer(orders)).toBe(100);
    });
});
