import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateConversionRate } from './conversionRate';

describe('calculateConversionRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateConversionRate([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [buildOrder({ status: 'abandoned' }), buildOrder({ status: 'refunded' })];

        expect(calculateConversionRate(orders)).toBe(0);
    });

    it('rapporte les commandes completed à toutes les commandes, tous statuts confondus', () => {
        const orders = [
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'refunded' }),
            buildOrder({ status: 'abandoned' }),
        ];

        expect(calculateConversionRate(orders)).toBe(25);
    });

    it('vaut 100 quand toutes les commandes sont completed', () => {
        expect(calculateConversionRate([buildOrder({ status: 'completed' })])).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33, 2/3 -> 67)', () => {
        const oneThird = [
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'abandoned' }),
            buildOrder({ status: 'abandoned' }),
        ];
        const twoThirds = [
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'completed' }),
            buildOrder({ status: 'abandoned' }),
        ];

        expect(calculateConversionRate(oneThird)).toBe(33);
        expect(calculateConversionRate(twoThirds)).toBe(67);
    });
});
