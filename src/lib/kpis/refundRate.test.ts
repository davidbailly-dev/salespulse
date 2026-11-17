import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRefundRate } from './refundRate';

describe('calculateRefundRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateRefundRate([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est remboursée', () => {
        const orders = [buildOrder({ status: 'completed' }), buildOrder({ status: 'abandoned' })];

        expect(calculateRefundRate(orders)).toBe(0);
    });

    it('rapporte les remboursements à toutes les commandes, tous statuts confondus', () => {
        const orders = [
            buildOrder({ status: 'refunded' }),
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'completed' }),
        ];

        expect(calculateRefundRate(orders)).toBe(25);
    });

    it('vaut 100 quand toutes les commandes sont remboursées', () => {
        expect(calculateRefundRate([buildOrder({ status: 'refunded' })])).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33, 2/3 -> 67)', () => {
        const oneThird = [
            buildOrder({ status: 'refunded' }),
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'completed' }),
        ];
        const twoThirds = [
            buildOrder({ status: 'refunded' }),
            buildOrder({ status: 'refunded' }),
            buildOrder({ status: 'completed' }),
        ];

        expect(calculateRefundRate(oneThird)).toBe(33);
        expect(calculateRefundRate(twoThirds)).toBe(67);
    });
});
