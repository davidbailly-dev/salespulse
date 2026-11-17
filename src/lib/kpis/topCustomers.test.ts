import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateTopCustomers } from './topCustomers';

describe('calculateTopCustomers', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopCustomers([])).toEqual([]);
    });

    it('renvoie une liste vide quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c2', status: 'refunded' }),
        ];

        expect(calculateTopCustomers(orders)).toEqual([]);
    });

    it('additionne le CA de chaque client et trie par CA décroissant', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c2', totalAmount: 500 }),
            buildOrder({ customerId: 'c1', totalAmount: 250 }),
        ];

        expect(calculateTopCustomers(orders)).toEqual([
            { customerId: 'c2', revenue: 500 },
            { customerId: 'c1', revenue: 350 },
        ]);
    });

    it('arrondit le CA du client après avoir additionné ses commandes', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 10.4 }),
            buildOrder({ customerId: 'c1', totalAmount: 10.4 }),
        ];

        expect(calculateTopCustomers(orders)).toEqual([{ customerId: 'c1', revenue: 21 }]);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', totalAmount: 100 }),
            buildOrder({ customerId: 'c1', status: 'refunded', totalAmount: 900 }),
            buildOrder({ customerId: 'c2', status: 'abandoned', totalAmount: 900 }),
        ];

        expect(calculateTopCustomers(orders)).toEqual([{ customerId: 'c1', revenue: 100 }]);
    });

    it('limite à 5 clients par défaut', () => {
        const orders = [1, 2, 3, 4, 5, 6].map((n) => buildOrder({ customerId: `c${n}`, totalAmount: n * 100 }));

        expect(calculateTopCustomers(orders).map((customer) => customer.customerId)).toEqual([
            'c6',
            'c5',
            'c4',
            'c3',
            'c2',
        ]);
    });

    it('applique la limite demandée', () => {
        const orders = [1, 2, 3].map((n) => buildOrder({ customerId: `c${n}`, totalAmount: n * 100 }));

        expect(calculateTopCustomers(orders, 2).map((customer) => customer.customerId)).toEqual(['c3', 'c2']);
    });
});
