import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateRepurchaseRate } from './repurchaseRate';

describe('calculateRepurchaseRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateRepurchaseRate([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c1', status: 'refunded' }),
        ];

        expect(calculateRepurchaseRate(orders)).toBe(0);
    });

    it('renvoie 0 quand aucun client n\'a commandé deux fois', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c2' })];

        expect(calculateRepurchaseRate(orders)).toBe(0);
    });

    it('rapporte les clients qui rachètent aux clients ayant au moins une commande completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateRepurchaseRate(orders)).toBe(50);
    });

    // Pondération en clients : c1 a beau peser 3 commandes, il ne compte que pour 1 client sur 2.
    // En commandes (`calculateRecurringOrdersRate`), on aurait 75 %.
    it('pondère par les clients et non par les commandes', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
        ];

        expect(calculateRepurchaseRate(orders)).toBe(50);
    });

    it('vaut 100 quand tous les clients rachètent', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c1' })];

        expect(calculateRepurchaseRate(orders)).toBe(100);
    });

    it('arrondit à l\'entier (1 client sur 3 -> 33)', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c2' }),
            buildOrder({ customerId: 'c3' }),
        ];

        expect(calculateRepurchaseRate(orders)).toBe(33);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1' }),
            buildOrder({ customerId: 'c1', status: 'refunded' }),
            buildOrder({ customerId: 'c2', status: 'abandoned' }),
        ];

        // Seul c1 est actif, avec une seule commande completed : aucun réachat.
        expect(calculateRepurchaseRate(orders)).toBe(0);
    });
});
