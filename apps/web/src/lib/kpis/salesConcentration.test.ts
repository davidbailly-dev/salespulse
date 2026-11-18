import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine, buildProduct } from '../testing/builders';
import { calculateSalesConcentration } from './salesConcentration';

const productsWithIds = (...ids: string[]) => ids.map((id) => buildProduct({ id }));

// Commande completed d'une ligne : le CA du produit vient de quantité × prix unitaire.
const saleOf = (productId: string, revenue: number, overrides = {}) =>
    buildOrder({ lines: [buildOrderLine({ productId, quantity: 1, unitPrice: revenue })], ...overrides });

describe('calculateSalesConcentration', () => {
    it('renvoie 0 sans produit au catalogue', () => {
        expect(calculateSalesConcentration([saleOf('p1', 100)], [])).toBe(0);
    });

    it('renvoie 0 sans commande', () => {
        expect(calculateSalesConcentration([], productsWithIds('p1', 'p2'))).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            saleOf('p1', 100, { status: 'refunded' }),
            saleOf('p2', 100, { status: 'abandoned' }),
        ];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2'))).toBe(0);
    });

    // 5 produits -> top 20 % = 1 produit : 800 / 1000 = 80 %.
    it('calcule la part du CA réalisée par les 20 % de produits les plus vendeurs', () => {
        const orders = [
            saleOf('p1', 800),
            saleOf('p2', 100),
            saleOf('p3', 50),
            saleOf('p4', 30),
            saleOf('p5', 20),
        ];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2', 'p3', 'p4', 'p5'))).toBe(80);
    });

    it('trie les produits par CA, quel que soit l\'ordre des commandes', () => {
        const orders = [saleOf('p5', 20), saleOf('p4', 30), saleOf('p3', 50), saleOf('p2', 100), saleOf('p1', 800)];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2', 'p3', 'p4', 'p5'))).toBe(80);
    });

    // Les invendus restent dans le catalogue : 10 produits dont 5 vendus -> top 20 % = 2 produits
    // (500 + 100) / 900 = 67 %. Sans les invendus, le top serait 1 produit sur 5 : 500 / 900 = 56 %.
    it('compte les produits invendus dans la taille du catalogue', () => {
        const orders = [
            saleOf('p1', 500),
            saleOf('p2', 100),
            saleOf('p3', 100),
            saleOf('p4', 100),
            saleOf('p5', 100),
        ];
        const catalog = productsWithIds('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10');

        expect(calculateSalesConcentration(orders, catalog)).toBe(67);
    });

    it('cumule le CA d\'un même produit sur plusieurs commandes', () => {
        const orders = [saleOf('p1', 100), saleOf('p1', 100), saleOf('p2', 100)];

        // 2 produits -> top 20 % = ceil(0,4) = 1 produit : 200 / 300 = 67 %.
        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2'))).toBe(67);
    });

    it('utilise la part demandée (top 50 %)', () => {
        const orders = [saleOf('p1', 400), saleOf('p2', 300), saleOf('p3', 200), saleOf('p4', 100)];

        // top 50 % de 4 produits = 2 : (400 + 300) / 1000.
        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2', 'p3', 'p4'), 0.5)).toBe(70);
    });

    it('vaut 100 quand la part demandée couvre tout le catalogue', () => {
        const orders = [saleOf('p1', 400), saleOf('p2', 300)];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2'), 1)).toBe(100);
    });

    // `Math.max(1, …)` : une part nulle (ou trop petite) retient quand même le meilleur produit.
    it('retient toujours au moins un produit', () => {
        const orders = [saleOf('p1', 400), saleOf('p2', 300), saleOf('p3', 200), saleOf('p4', 100)];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2', 'p3', 'p4'), 0)).toBe(40);
    });

    it('arrondit à l\'entier (200 / 300 = 66,67 -> 67)', () => {
        const orders = [saleOf('p1', 200), saleOf('p2', 100)];

        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2', 'p3'))).toBe(67);
    });

    it('calcule le CA depuis les lignes (quantité × prix) et non depuis totalAmount', () => {
        const orders = [
            buildOrder({ totalAmount: 1, lines: [buildOrderLine({ productId: 'p1', quantity: 2, unitPrice: 50 })] }),
            buildOrder({ totalAmount: 1, lines: [buildOrderLine({ productId: 'p2', quantity: 1, unitPrice: 300 })] }),
        ];

        // p1 = 100, p2 = 300 ; top 50 % de 2 produits = 1 : 300 / 400.
        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2'), 0.5)).toBe(75);
    });

    it('ignore les commandes non completed', () => {
        const orders = [saleOf('p1', 100), saleOf('p2', 10000, { status: 'refunded' })];

        // Seul p1 a du CA : le meilleur produit pèse 100 % du total.
        expect(calculateSalesConcentration(orders, productsWithIds('p1', 'p2'))).toBe(100);
    });
});
