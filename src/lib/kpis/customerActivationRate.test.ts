import { describe, expect, it } from 'vitest';
import { buildCustomer, buildOrder } from '../testing/builders';
import { calculateCustomerActivationRate } from './customerActivationRate';

const customersWithIds = (...ids: string[]) => ids.map((id) => buildCustomer({ id }));

describe('calculateCustomerActivationRate', () => {
    it('renvoie 0 sans client', () => {
        expect(calculateCustomerActivationRate([buildOrder()], [])).toBe(0);
    });

    it('renvoie 0 sans commande', () => {
        expect(calculateCustomerActivationRate([], customersWithIds('c1', 'c2'))).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', status: 'abandoned' }),
            buildOrder({ customerId: 'c2', status: 'refunded' }),
        ];

        expect(calculateCustomerActivationRate(orders, customersWithIds('c1', 'c2'))).toBe(0);
    });

    it('rapporte les clients ayant au moins une commande completed à tous les clients', () => {
        const orders = [buildOrder({ customerId: 'c1' })];

        expect(calculateCustomerActivationRate(orders, customersWithIds('c1', 'c2', 'c3', 'c4'))).toBe(25);
    });

    it('compte une seule fois un client qui a plusieurs commandes', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c1' })];

        expect(calculateCustomerActivationRate(orders, customersWithIds('c1', 'c2'))).toBe(50);
    });

    it('vaut 100 quand tous les clients ont commandé', () => {
        const orders = [buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c2' })];

        expect(calculateCustomerActivationRate(orders, customersWithIds('c1', 'c2'))).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33, 2/3 -> 67)', () => {
        const customers = customersWithIds('c1', 'c2', 'c3');

        expect(calculateCustomerActivationRate([buildOrder({ customerId: 'c1' })], customers)).toBe(33);
        expect(
            calculateCustomerActivationRate([buildOrder({ customerId: 'c1' }), buildOrder({ customerId: 'c2' })], customers),
        ).toBe(67);
    });
});
