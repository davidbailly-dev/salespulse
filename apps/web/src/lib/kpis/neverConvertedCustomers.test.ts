import { describe, expect, it } from 'vitest';
import { buildCustomer, buildOrder } from '../testing/builders';
import { calculateNeverConvertedCustomers } from './neverConvertedCustomers';

describe('calculateNeverConvertedCustomers', () => {
    it('renvoie une liste vide sans client', () => {
        expect(calculateNeverConvertedCustomers([buildOrder()], [])).toEqual([]);
    });

    it('renvoie tous les clients quand il n\'y a aucune commande', () => {
        const customers = [buildCustomer({ id: 'c1', name: 'Alice' }), buildCustomer({ id: 'c2', name: 'Bob' })];

        expect(calculateNeverConvertedCustomers([], customers).map((customer) => customer.customerId)).toEqual([
            'c1',
            'c2',
        ]);
    });

    it('exclut les clients ayant au moins une commande completed', () => {
        const customers = [buildCustomer({ id: 'c1', name: 'Alice' }), buildCustomer({ id: 'c2', name: 'Bob' })];
        const orders = [buildOrder({ customerId: 'c1' })];

        expect(calculateNeverConvertedCustomers(orders, customers).map((customer) => customer.customerId)).toEqual([
            'c2',
        ]);
    });

    it('garde parmi les « jamais convertis » un client dont les commandes ne sont pas completed', () => {
        const customers = [buildCustomer({ id: 'c1', name: 'Alice' }), buildCustomer({ id: 'c2', name: 'Bob' })];
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c2', status: 'refunded' }),
        ];

        expect(calculateNeverConvertedCustomers(orders, customers)).toHaveLength(2);
    });

    it('expose l\'identifiant, le nom et la date d\'inscription', () => {
        const customers = [buildCustomer({ id: 'c1', name: 'Alice', registeredAt: '2025-03-01T00:00:00.000Z' })];

        expect(calculateNeverConvertedCustomers([], customers)).toEqual([
            { customerId: 'c1', name: 'Alice', registeredAt: '2025-03-01T00:00:00.000Z' },
        ]);
    });

    it('trie par nom', () => {
        const customers = [
            buildCustomer({ id: 'c3', name: 'Charlie' }),
            buildCustomer({ id: 'c1', name: 'Alice' }),
            buildCustomer({ id: 'c2', name: 'Bob' }),
        ];

        expect(calculateNeverConvertedCustomers([], customers).map((customer) => customer.name)).toEqual([
            'Alice',
            'Bob',
            'Charlie',
        ]);
    });

    it('limite à 5 clients par défaut', () => {
        const customers = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) =>
            buildCustomer({ id: `c-${letter}`, name: `Client ${letter}` }),
        );

        expect(calculateNeverConvertedCustomers([], customers).map((customer) => customer.name)).toEqual([
            'Client A',
            'Client B',
            'Client C',
            'Client D',
            'Client E',
        ]);
    });

    it('applique la limite demandée après le tri', () => {
        const customers = [
            buildCustomer({ id: 'c3', name: 'Charlie' }),
            buildCustomer({ id: 'c1', name: 'Alice' }),
            buildCustomer({ id: 'c2', name: 'Bob' }),
        ];

        expect(calculateNeverConvertedCustomers([], customers, 2).map((customer) => customer.name)).toEqual([
            'Alice',
            'Bob',
        ]);
    });

    it('ne modifie pas la liste de clients d\'origine', () => {
        const customers = [buildCustomer({ id: 'c2', name: 'Bob' }), buildCustomer({ id: 'c1', name: 'Alice' })];

        calculateNeverConvertedCustomers([], customers);

        expect(customers.map((customer) => customer.name)).toEqual(['Bob', 'Alice']);
    });
});
