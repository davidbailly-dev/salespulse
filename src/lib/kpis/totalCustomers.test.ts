import { describe, expect, it } from 'vitest';
import { buildCustomer } from '../testing/builders';
import { calculateTotalCustomers } from './totalCustomers';

describe('calculateTotalCustomers', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateTotalCustomers([])).toBe(0);
    });

    it('compte tous les clients', () => {
        const customers = [buildCustomer({ id: 'c1' }), buildCustomer({ id: 'c2' }), buildCustomer({ id: 'c3' })];

        expect(calculateTotalCustomers(customers)).toBe(3);
    });
});
