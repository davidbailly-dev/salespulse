import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateCustomerRevenueSegments } from './customerRevenueSegments';

const LABELS = ['< 500€', '500 - 1500€', '1500 - 4000€', '≥ 4000€'];

describe('calculateCustomerRevenueSegments', () => {
    it('renvoie les 4 segments à 0 pour une liste vide', () => {
        expect(calculateCustomerRevenueSegments([])).toEqual(LABELS.map((label) => ({ label, count: 0 })));
    });

    it('renvoie les 4 segments à 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'refunded', totalAmount: 800 }),
            buildOrder({ customerId: 'c2', status: 'abandoned', totalAmount: 800 }),
        ];

        expect(calculateCustomerRevenueSegments(orders).map((segment) => segment.count)).toEqual([0, 0, 0, 0]);
    });

    // Bornes [min, max[ : 500 tombe dans « 500 - 1500€ », pas dans « < 500€ ».
    it.each([
        [0.01, '< 500€'],
        [499.99, '< 500€'],
        [500, '500 - 1500€'],
        [1499.99, '500 - 1500€'],
        [1500, '1500 - 4000€'],
        [3999.99, '1500 - 4000€'],
        [4000, '≥ 4000€'],
        [10000, '≥ 4000€'],
    ])('place un client à %d € dans « %s » (et dans aucun autre)', (revenue, expectedLabel) => {
        const segments = calculateCustomerRevenueSegments([buildOrder({ customerId: 'c1', totalAmount: revenue })]);

        expect(segments.filter((segment) => segment.count === 1).map((segment) => segment.label)).toEqual([expectedLabel]);
        expect(segments.reduce((total, segment) => total + segment.count, 0)).toBe(1);
    });

    it('additionne le CA de toutes les commandes d\'un même client', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 300 }),
            buildOrder({ customerId: 'c1', totalAmount: 300 }),
        ];

        // 600 € cumulés -> « 500 - 1500€ », alors que chaque commande seule serait « < 500€ ».
        expect(calculateCustomerRevenueSegments(orders).map((segment) => segment.count)).toEqual([0, 1, 0, 0]);
    });

    it('compte les clients de chaque segment', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c2', totalAmount: 200 }),
            buildOrder({ customerId: 'c3', totalAmount: 1000 }),
            buildOrder({ customerId: 'c4', totalAmount: 2000 }),
            buildOrder({ customerId: 'c5', totalAmount: 5000 }),
            buildOrder({ customerId: 'c6', totalAmount: 6000 }),
        ];

        expect(calculateCustomerRevenueSegments(orders)).toEqual([
            { label: '< 500€', count: 2 },
            { label: '500 - 1500€', count: 1 },
            { label: '1500 - 4000€', count: 1 },
            { label: '≥ 4000€', count: 2 },
        ]);
    });

    it('ne compte que le CA des commandes completed d\'un client', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c1', status: 'refunded', totalAmount: 5000 }),
        ];

        expect(calculateCustomerRevenueSegments(orders).map((segment) => segment.count)).toEqual([1, 0, 0, 0]);
    });
});
