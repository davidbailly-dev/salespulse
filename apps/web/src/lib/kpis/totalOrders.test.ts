import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateTotalOrders } from './totalOrders';

describe('calculateTotalOrders', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateTotalOrders([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [buildOrder({ status: 'abandoned' }), buildOrder({ status: 'refunded' })];

        expect(calculateTotalOrders(orders)).toBe(0);
    });

    it('ne compte que les commandes completed', () => {
        const orders = [
            buildOrder({ id: 'a', status: 'completed' }),
            buildOrder({ id: 'b', status: 'completed' }),
            buildOrder({ id: 'c', status: 'abandoned' }),
            buildOrder({ id: 'd', status: 'refunded' }),
        ];

        expect(calculateTotalOrders(orders)).toBe(2);
    });
});
