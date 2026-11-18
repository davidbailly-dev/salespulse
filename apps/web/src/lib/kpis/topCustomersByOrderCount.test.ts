import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateTopCustomersByOrderCount } from './topCustomersByOrderCount';

// Génère `count` commandes completed pour un client.
const ordersFor = (customerId: string, count: number) =>
    Array.from({ length: count }, (_, i) => buildOrder({ id: `${customerId}-${i}`, customerId }));

describe('calculateTopCustomersByOrderCount', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopCustomersByOrderCount([])).toEqual([]);
    });

    it('renvoie une liste vide quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c2', status: 'refunded' }),
        ];

        expect(calculateTopCustomersByOrderCount(orders)).toEqual([]);
    });

    it('compte les commandes completed par client et trie par nombre décroissant', () => {
        const orders = [...ordersFor('c1', 1), ...ordersFor('c2', 3), ...ordersFor('c3', 2)];

        expect(calculateTopCustomersByOrderCount(orders)).toEqual([
            { customerId: 'c2', orderCount: 3 },
            { customerId: 'c3', orderCount: 2 },
            { customerId: 'c1', orderCount: 1 },
        ]);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            ...ordersFor('c1', 1),
            buildOrder({ id: 'x1', customerId: 'c1', status: 'refunded' }),
            buildOrder({ id: 'x2', customerId: 'c1', status: 'abandoned' }),
        ];

        expect(calculateTopCustomersByOrderCount(orders)).toEqual([{ customerId: 'c1', orderCount: 1 }]);
    });

    it('limite à 5 clients par défaut', () => {
        const orders = [1, 2, 3, 4, 5, 6].flatMap((n) => ordersFor(`c${n}`, n));

        expect(calculateTopCustomersByOrderCount(orders).map((customer) => customer.customerId)).toEqual([
            'c6',
            'c5',
            'c4',
            'c3',
            'c2',
        ]);
    });

    it('applique la limite demandée', () => {
        const orders = [1, 2, 3].flatMap((n) => ordersFor(`c${n}`, n));

        expect(calculateTopCustomersByOrderCount(orders, 1)).toEqual([{ customerId: 'c3', orderCount: 3 }]);
    });
});
