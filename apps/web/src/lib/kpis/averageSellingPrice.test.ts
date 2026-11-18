import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine } from '../testing/builders';
import { calculateAverageSellingPrice } from './averageSellingPrice';

describe('calculateAverageSellingPrice', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageSellingPrice([])).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ quantity: 2, unitPrice: 50 })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 2, unitPrice: 50 })] }),
        ];

        expect(calculateAverageSellingPrice(orders)).toBe(0);
    });

    // Prix pondéré par les quantités : (1 × 100 + 3 × 20) / 4 = 40, et non (100 + 20) / 2 = 60.
    it('pondère les prix par les quantités vendues', () => {
        const orders = [
            buildOrder({ lines: [buildOrderLine({ quantity: 1, unitPrice: 100 })] }),
            buildOrder({ lines: [buildOrderLine({ quantity: 3, unitPrice: 20 })] }),
        ];

        expect(calculateAverageSellingPrice(orders)).toBe(40);
    });

    it('agrège les lignes de plusieurs commandes', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ quantity: 1, unitPrice: 10 }),
                    buildOrderLine({ quantity: 2, unitPrice: 10.5 }),
                ],
            }),
        ];

        // (10 + 21) / 3 = 10,333…
        expect(calculateAverageSellingPrice(orders)).toBe(10.33);
    });

    it('ignore les lignes des commandes non completed', () => {
        const orders = [
            buildOrder({ lines: [buildOrderLine({ quantity: 2, unitPrice: 30 })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ quantity: 10, unitPrice: 999 })] }),
        ];

        expect(calculateAverageSellingPrice(orders)).toBe(30);
    });
});
