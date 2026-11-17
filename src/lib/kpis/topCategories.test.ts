import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine, buildProduct } from '../testing/builders';
import { calculateTopCategories } from './topCategories';

const PRODUCTS = [
    buildProduct({ id: 'p1', category: 'Armes' }),
    buildProduct({ id: 'p2', category: 'Potions' }),
    buildProduct({ id: 'p3', category: 'Armes' }),
    buildProduct({ id: 'p4', category: 'Grimoires' }),
];

describe('calculateTopCategories', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopCategories([], PRODUCTS, 'revenue')).toEqual([]);
    });

    it('renvoie une liste vide quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ productId: 'p1' })] }),
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ productId: 'p2' })] }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue')).toEqual([]);
    });

    it('regroupe les ventes par catégorie du produit', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 100 }),
                    buildOrderLine({ productId: 'p2', quantity: 10, unitPrice: 5 }),
                    buildOrderLine({ productId: 'p3', quantity: 1, unitPrice: 50 }),
                ],
            }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue')).toEqual([
            { category: 'Armes', quantity: 2, revenue: 150 },
            { category: 'Potions', quantity: 10, revenue: 50 },
        ]);
    });

    describe('métrique de tri', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 100 }),
                    buildOrderLine({ productId: 'p2', quantity: 10, unitPrice: 5 }),
                ],
            }),
        ];

        it('trie par CA décroissant', () => {
            expect(calculateTopCategories(orders, PRODUCTS, 'revenue').map((entry) => entry.category)).toEqual([
                'Armes',
                'Potions',
            ]);
        });

        it('trie par quantité décroissante', () => {
            expect(calculateTopCategories(orders, PRODUCTS, 'quantity').map((entry) => entry.category)).toEqual([
                'Potions',
                'Armes',
            ]);
        });
    });

    it('ignore les lignes dont le produit est absent du catalogue', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ productId: 'inconnu', quantity: 5, unitPrice: 999 }),
                    buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 100 }),
                ],
            }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue')).toEqual([
            { category: 'Armes', quantity: 1, revenue: 100 },
        ]);
    });

    it('arrondit le CA de la catégorie après avoir additionné ses lignes', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 10.4 }),
                    buildOrderLine({ productId: 'p3', quantity: 1, unitPrice: 10.4 }),
                ],
            }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue')[0].revenue).toBe(21);
    });

    it('ignore les lignes des commandes non completed', () => {
        const orders = [
            buildOrder({ lines: [buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 100 })] }),
            buildOrder({
                status: 'refunded',
                lines: [buildOrderLine({ productId: 'p4', quantity: 9, unitPrice: 900 })],
            }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue').map((entry) => entry.category)).toEqual(['Armes']);
    });

    it('applique la limite demandée', () => {
        const orders = [
            buildOrder({
                lines: [
                    buildOrderLine({ productId: 'p1', quantity: 1, unitPrice: 300 }),
                    buildOrderLine({ productId: 'p2', quantity: 1, unitPrice: 200 }),
                    buildOrderLine({ productId: 'p4', quantity: 1, unitPrice: 100 }),
                ],
            }),
        ];

        expect(calculateTopCategories(orders, PRODUCTS, 'revenue', 2).map((entry) => entry.category)).toEqual([
            'Armes',
            'Potions',
        ]);
    });
});
