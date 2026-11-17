import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine, buildProduct } from '../testing/builders';
import { calculateNeverSoldProducts } from './neverSoldProducts';

const soldOrder = (productId: string, overrides = {}) =>
    buildOrder({ lines: [buildOrderLine({ productId })], ...overrides });

describe('calculateNeverSoldProducts', () => {
    it('renvoie une liste vide sans produit', () => {
        expect(calculateNeverSoldProducts([soldOrder('p1')], [])).toEqual([]);
    });

    it('renvoie tous les produits quand il n\'y a aucune commande', () => {
        const products = [buildProduct({ id: 'p1', name: 'Épée' }), buildProduct({ id: 'p2', name: 'Bouclier' })];

        expect(calculateNeverSoldProducts([], products)).toHaveLength(2);
    });

    it('exclut les produits vendus dans une commande completed', () => {
        const products = [buildProduct({ id: 'p1', name: 'Épée' }), buildProduct({ id: 'p2', name: 'Bouclier' })];

        expect(calculateNeverSoldProducts([soldOrder('p1')], products).map((product) => product.productId)).toEqual([
            'p2',
        ]);
    });

    it('garde parmi les invendus un produit présent uniquement dans des commandes non completed', () => {
        const products = [buildProduct({ id: 'p1', name: 'Épée' }), buildProduct({ id: 'p2', name: 'Bouclier' })];
        const orders = [soldOrder('p1', { status: 'refunded' }), soldOrder('p2', { status: 'abandoned' })];

        expect(calculateNeverSoldProducts(orders, products)).toHaveLength(2);
    });

    it('expose l\'identifiant, le nom et la catégorie', () => {
        const products = [buildProduct({ id: 'p1', name: 'Potion de soin', category: 'Potions', price: 20 })];

        expect(calculateNeverSoldProducts([], products)).toEqual([
            { productId: 'p1', name: 'Potion de soin', category: 'Potions' },
        ]);
    });

    it('trie par nom', () => {
        const products = [
            buildProduct({ id: 'p3', name: 'Casque' }),
            buildProduct({ id: 'p1', name: 'Arc' }),
            buildProduct({ id: 'p2', name: 'Bouclier' }),
        ];

        expect(calculateNeverSoldProducts([], products).map((product) => product.name)).toEqual([
            'Arc',
            'Bouclier',
            'Casque',
        ]);
    });

    it('limite à 5 produits par défaut', () => {
        const products = ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) =>
            buildProduct({ id: `p-${letter}`, name: `Produit ${letter}` }),
        );

        expect(calculateNeverSoldProducts([], products).map((product) => product.name)).toEqual([
            'Produit A',
            'Produit B',
            'Produit C',
            'Produit D',
            'Produit E',
        ]);
    });

    it('applique la limite demandée après le tri', () => {
        const products = [
            buildProduct({ id: 'p3', name: 'Casque' }),
            buildProduct({ id: 'p1', name: 'Arc' }),
            buildProduct({ id: 'p2', name: 'Bouclier' }),
        ];

        expect(calculateNeverSoldProducts([], products, 2).map((product) => product.name)).toEqual(['Arc', 'Bouclier']);
    });

    it('ne modifie pas la liste de produits d\'origine', () => {
        const products = [buildProduct({ id: 'p2', name: 'Bouclier' }), buildProduct({ id: 'p1', name: 'Arc' })];

        calculateNeverSoldProducts([], products);

        expect(products.map((product) => product.name)).toEqual(['Bouclier', 'Arc']);
    });
});
