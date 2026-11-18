import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRevenueByStatus } from './revenueByStatus';

describe('calculateRevenueByStatus', () => {
    it('renvoie les 3 statuts à 0 pour une liste vide', () => {
        expect(calculateRevenueByStatus([])).toEqual([
            { status: 'completed', revenue: 0 },
            { status: 'abandoned', revenue: 0 },
            { status: 'refunded', revenue: 0 },
        ]);
    });

    it('conserve un statut à 0 quand aucune commande ne le porte', () => {
        const result = calculateRevenueByStatus([buildOrder({ status: 'completed', totalAmount: 100 })]);

        expect(result).toEqual([
            { status: 'completed', revenue: 100 },
            { status: 'abandoned', revenue: 0 },
            { status: 'refunded', revenue: 0 },
        ]);
    });

    it('ventile le CA sur les 3 statuts, dans un ordre fixe', () => {
        const orders = [
            buildOrder({ status: 'refunded', totalAmount: 30 }),
            buildOrder({ status: 'abandoned', totalAmount: 20 }),
            buildOrder({ status: 'completed', totalAmount: 100 }),
            buildOrder({ status: 'completed', totalAmount: 50 }),
        ];

        expect(calculateRevenueByStatus(orders)).toEqual([
            { status: 'completed', revenue: 150 },
            { status: 'abandoned', revenue: 20 },
            { status: 'refunded', revenue: 30 },
        ]);
    });

    it('arrondit chaque statut à l\'euro après avoir additionné', () => {
        const orders = [
            buildOrder({ status: 'completed', totalAmount: 10.4 }),
            buildOrder({ status: 'completed', totalAmount: 10.4 }),
            buildOrder({ status: 'abandoned', totalAmount: 5.5 }),
            buildOrder({ status: 'refunded', totalAmount: 2.4 }),
        ];

        expect(calculateRevenueByStatus(orders)).toEqual([
            { status: 'completed', revenue: 21 },
            { status: 'abandoned', revenue: 6 },
            { status: 'refunded', revenue: 2 },
        ]);
    });
});
