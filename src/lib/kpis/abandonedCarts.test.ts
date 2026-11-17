import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateAbandonedCartsRate } from './abandonedCarts';

describe('calculateAbandonedCartsRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAbandonedCartsRate([])).toBe(0);
    });

    it('renvoie 0 quand aucun panier n\'est abandonné', () => {
        const orders = [buildOrder({ status: 'completed' }), buildOrder({ status: 'refunded' })];

        expect(calculateAbandonedCartsRate(orders)).toBe(0);
    });

    it('rapporte les paniers abandonnés à toutes les commandes, tous statuts confondus', () => {
        const orders = [
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'refunded' }),
        ];

        expect(calculateAbandonedCartsRate(orders)).toBe(50);
    });

    it('vaut 100 quand tous les paniers sont abandonnés', () => {
        expect(calculateAbandonedCartsRate([buildOrder({ status: 'abandoned' })])).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33, 2/3 -> 67)', () => {
        const oneThird = [
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'completed' }),
        ];
        const twoThirds = [
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'completed' }),
        ];

        expect(calculateAbandonedCartsRate(oneThird)).toBe(33);
        expect(calculateAbandonedCartsRate(twoThirds)).toBe(67);
    });
});
