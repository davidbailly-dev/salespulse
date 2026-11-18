import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateCustomerLifetimeValue } from './customerLifetimeValue';

// Commande completed de 100 € pour un client donné.
const order = (customerId: string, overrides = {}) => buildOrder({ customerId, totalAmount: 100, ...overrides });

describe('calculateCustomerLifetimeValue', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateCustomerLifetimeValue([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [order('c1', { status: 'abandoned' }), order('c2', { status: 'refunded' })];

        expect(calculateCustomerLifetimeValue(orders)).toBe(0);
    });

    it('vaut le panier moyen quand aucun client ne rachète (1 commande attendue)', () => {
        const orders = [order('c1'), order('c2')];

        expect(calculateCustomerLifetimeValue(orders)).toBe(100);
    });

    // Réachat 50 % -> 1 / (1 - 0,5) = 2 commandes attendues. Panier moyen : 300 / 3 = 100.
    it('multiplie le panier moyen par 1 / (1 - taux de réachat)', () => {
        const orders = [order('c1'), order('c1'), order('c2')];

        expect(calculateCustomerLifetimeValue(orders)).toBe(200);
    });

    // Réachat 40 % (2 clients sur 5) -> 1 / 0,6 = 1,666… commande attendue -> 166,67 -> 167.
    it('arrondit la LTV à l\'euro', () => {
        const orders = [
            order('c1'),
            order('c1'),
            order('c2'),
            order('c2'),
            order('c3'),
            order('c4'),
            order('c5'),
        ];

        expect(calculateCustomerLifetimeValue(orders)).toBe(167);
    });

    // Sans plafond, un réachat de 100 % ferait diverger 1 / (1 - r) vers l'infini. Plafonné à
    // 95 % : 1 / 0,05 = 20 commandes attendues.
    it('plafonne le taux de réachat à 95 % pour éviter une LTV infinie', () => {
        const orders = [order('c1'), order('c1')];

        expect(calculateCustomerLifetimeValue(orders)).toBe(2000);
    });

    it('ignore les commandes non completed (panier moyen et réachat)', () => {
        const orders = [order('c1'), order('c1', { status: 'refunded' }), order('c2', { status: 'abandoned' })];

        // Un seul client actif, une seule commande completed : aucun réachat, panier moyen 100.
        expect(calculateCustomerLifetimeValue(orders)).toBe(100);
    });
});
