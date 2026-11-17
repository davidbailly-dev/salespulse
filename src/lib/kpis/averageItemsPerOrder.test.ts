import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine } from '../testing/builders';
import { calculateAverageItemsPerOrder } from './averageItemsPerOrder';

const orderWithQuantities = (...quantities: number[]) =>
    buildOrder({ lines: quantities.map((quantity) => buildOrderLine({ quantity })) });

describe('calculateAverageItemsPerOrder', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageItemsPerOrder([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ quantity: 5 })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 5 })] }),
        ];

        expect(calculateAverageItemsPerOrder(orders)).toBe(0);
    });

    it('divise le nombre total d\'articles par le nombre de commandes completed', () => {
        // Commande 1 : 2 + 1 = 3 articles ; commande 2 : 1 article -> 4 / 2 = 2.
        const orders = [orderWithQuantities(2, 1), orderWithQuantities(1)];

        expect(calculateAverageItemsPerOrder(orders)).toBe(2);
    });

    it('arrondit à une décimale', () => {
        // 1 + 1 + 2 = 4 articles sur 3 commandes = 1,333…
        const orders = [orderWithQuantities(1), orderWithQuantities(1), orderWithQuantities(2)];

        expect(calculateAverageItemsPerOrder(orders)).toBe(1.3);
    });

    it('ignore les articles des commandes non completed', () => {
        const orders = [
            orderWithQuantities(2),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 10 })] }),
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ quantity: 10 })] }),
        ];

        expect(calculateAverageItemsPerOrder(orders)).toBe(2);
    });
});
