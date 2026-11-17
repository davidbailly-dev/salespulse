import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRecurringOrdersRate } from './recurringCustomers';

describe('calculateRecurringOrdersRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateRecurringOrdersRate([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c1', status: 'refunded' }),
        ];

        expect(calculateRecurringOrdersRate(orders)).toBe(0);
    });

    it('renvoie 0 quand chaque client n\'a commandé qu\'une fois', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c2' })];

        expect(calculateRecurringOrdersRate(orders)).toBe(0);
    });

    it('vaut 100 quand tous les clients ont commandé au moins deux fois', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateRecurringOrdersRate(orders)).toBe(100);
    });

    it('rapporte les commandes des clients récurrents à toutes les commandes completed', () => {
        // c1 a 2 commandes (récurrent), c2 en a 1 : 2 commandes récurrentes sur 3 -> 67 %.
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateRecurringOrdersRate(orders)).toBe(67);
    });

    // Pondération en commandes : c1 pèse 3 commandes. En clients, on aurait 1 sur 2 = 50 %.
    it('pondère par les commandes et non par les clients', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateRecurringOrdersRate(orders)).toBe(75);
    });

    it('ne compte pas les commandes non completed pour devenir récurrent', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1', status: 'refunded' }),
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
        ];

        expect(calculateRecurringOrdersRate(orders)).toBe(0);
    });
});
