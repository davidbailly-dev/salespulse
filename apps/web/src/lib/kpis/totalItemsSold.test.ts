import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine } from '../testing/builders';
import { calculateTotalItemsSold } from './totalItemsSold';

describe('calculateTotalItemsSold', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateTotalItemsSold([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ quantity: 3 })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 3 })] }),
        ];

        expect(calculateTotalItemsSold(orders)).toBe(0);
    });

    it('additionne les quantités de toutes les lignes des commandes completed', () => {
        const orders = [
            buildOrder({ lines: [buildOrderLine({ quantity: 2 }), buildOrderLine({ quantity: 3 })] }),
            buildOrder({ lines: [buildOrderLine({ quantity: 1 })] }),
        ];

        expect(calculateTotalItemsSold(orders)).toBe(6);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            buildOrder({ lines: [buildOrderLine({ quantity: 4 })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 50 })] }),
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ quantity: 50 })] }),
        ];

        expect(calculateTotalItemsSold(orders)).toBe(4);
    });
});
