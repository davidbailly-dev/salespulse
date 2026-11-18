import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateCustomerLifetimeValue } from './customerLifetimeValue';
import { calculateLtvCacRatio } from './ltvCacRatio';

// 5 clients à 100 € la commande dont 2 rachètent (réachat 40 %) : LTV = 100 × 1 / 0,6 -> 167 €.
const ORDERS = ['c1', 'c1', 'c2', 'c2', 'c3', 'c4', 'c5'].map((customerId, index) =>
    buildOrder({ id: `o${index}`, customerId, totalAmount: 100 }),
);

describe('calculateLtvCacRatio', () => {
    it('part d\'une LTV connue de 167 € (garde-fou des cas ci-dessous)', () => {
        expect(calculateCustomerLifetimeValue(ORDERS)).toBe(167);
    });

    it('renvoie null quand le CAC est null', () => {
        expect(calculateLtvCacRatio(ORDERS, null)).toBeNull();
    });

    it('renvoie null quand le CAC vaut 0 (pas de division par zéro)', () => {
        expect(calculateLtvCacRatio(ORDERS, 0)).toBeNull();
    });

    it('renvoie 1 quand la LTV égale le CAC', () => {
        expect(calculateLtvCacRatio(ORDERS, 167)).toBe(1);
    });

    it('arrondit à une décimale vers le bas (167 / 50 = 3,34 -> 3,3)', () => {
        expect(calculateLtvCacRatio(ORDERS, 50)).toBe(3.3);
    });

    it('arrondit à une décimale vers le haut (167 / 40 = 4,175 -> 4,2)', () => {
        expect(calculateLtvCacRatio(ORDERS, 40)).toBe(4.2);
    });

    it('renvoie 0 quand il n\'y a aucune commande (LTV nulle) mais un CAC valide', () => {
        expect(calculateLtvCacRatio([], 10)).toBe(0);
    });
});
