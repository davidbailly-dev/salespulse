import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine } from '../testing/builders';
import { calculateTopProducts } from './topProducts';

const lineOf = (productId: string, quantity: number, unitPrice: number) =>
    buildOrderLine({ productId, quantity, unitPrice });

describe('calculateTopProducts', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopProducts([], 'revenue')).toEqual([]);
    });

    it('renvoie une liste vide quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'refunded', lines: [lineOf('p1', 1, 100)] }),
            buildOrder({ status: 'abandoned', lines: [lineOf('p2', 1, 100)] }),
        ];

        expect(calculateTopProducts(orders, 'revenue')).toEqual([]);
    });

    it('agrège quantité et CA d\'un produit sur plusieurs commandes', () => {
        const orders = [
            buildOrder({ lines: [lineOf('p1', 1, 100)] }),
            buildOrder({ lines: [lineOf('p1', 2, 100), lineOf('p2', 1, 30)] }),
        ];

        expect(calculateTopProducts(orders, 'revenue')).toEqual([
            { productId: 'p1', quantity: 3, revenue: 300 },
            { productId: 'p2', quantity: 1, revenue: 30 },
        ]);
    });

    describe('métrique de tri', () => {
        // p1 : 1 unité à 100 € ; p2 : 10 unités à 5 €.
        const orders = [buildOrder({ lines: [lineOf('p1', 1, 100), lineOf('p2', 10, 5)] })];

        it('trie par CA décroissant', () => {
            expect(calculateTopProducts(orders, 'revenue').map((product) => product.productId)).toEqual(['p1', 'p2']);
        });

        it('trie par quantité décroissante', () => {
            expect(calculateTopProducts(orders, 'quantity').map((product) => product.productId)).toEqual(['p2', 'p1']);
        });
    });

    it('arrondit le CA du produit après avoir additionné ses lignes', () => {
        const orders = [buildOrder({ lines: [lineOf('p1', 1, 10.4)] }), buildOrder({ lines: [lineOf('p1', 1, 10.4)] })];

        expect(calculateTopProducts(orders, 'revenue')[0].revenue).toBe(21);
    });

    it('calcule le CA depuis les lignes (quantité × prix) et non depuis totalAmount', () => {
        const orders = [buildOrder({ totalAmount: 1, lines: [lineOf('p1', 2, 50)] })];

        expect(calculateTopProducts(orders, 'revenue')).toEqual([{ productId: 'p1', quantity: 2, revenue: 100 }]);
    });

    it('ignore les lignes des commandes non completed', () => {
        const orders = [
            buildOrder({ lines: [lineOf('p1', 1, 100)] }),
            buildOrder({ status: 'refunded', lines: [lineOf('p1', 50, 100), lineOf('p2', 50, 100)] }),
        ];

        expect(calculateTopProducts(orders, 'quantity')).toEqual([{ productId: 'p1', quantity: 1, revenue: 100 }]);
    });

    it('limite à 5 produits par défaut', () => {
        const orders = [
            buildOrder({ lines: [1, 2, 3, 4, 5, 6].map((n) => lineOf(`p${n}`, 1, n * 10)) }),
        ];

        expect(calculateTopProducts(orders, 'revenue').map((product) => product.productId)).toEqual([
            'p6',
            'p5',
            'p4',
            'p3',
            'p2',
        ]);
    });

    it('applique la limite demandée', () => {
        const orders = [buildOrder({ lines: [lineOf('p1', 1, 30), lineOf('p2', 1, 20), lineOf('p3', 1, 10)] })];

        expect(calculateTopProducts(orders, 'revenue', 1).map((product) => product.productId)).toEqual(['p1']);
    });
});
