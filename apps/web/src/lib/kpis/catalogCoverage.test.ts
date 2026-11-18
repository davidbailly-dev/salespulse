import { describe, expect, it } from 'vitest';
import { buildOrder, buildOrderLine, buildProduct } from '../testing/builders';
import { calculateCatalogCoverage } from './catalogCoverage';

const productsWithIds = (...ids: string[]) => ids.map((id) => buildProduct({ id }));
const orderOf = (...productIds: string[]) =>
    buildOrder({ lines: productIds.map((productId) => buildOrderLine({ productId })) });

describe('calculateCatalogCoverage', () => {
    it('renvoie 0 sans produit au catalogue', () => {
        expect(calculateCatalogCoverage([orderOf('p1')], [])).toBe(0);
    });

    it('renvoie 0 sans commande', () => {
        expect(calculateCatalogCoverage([], productsWithIds('p1', 'p2'))).toBe(0);
    });

    it('renvoie 0 quand aucune commande n\'est completed', () => {
        const orders = [
            buildOrder({ status: 'abandoned', lines: [buildOrderLine({ productId: 'p1' })] }),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ productId: 'p2' })] }),
        ];

        expect(calculateCatalogCoverage(orders, productsWithIds('p1', 'p2'))).toBe(0);
    });

    it('rapporte les produits vendus au moins une fois à tout le catalogue', () => {
        expect(calculateCatalogCoverage([orderOf('p1')], productsWithIds('p1', 'p2', 'p3', 'p4'))).toBe(25);
    });

    it('compte une seule fois un produit vendu plusieurs fois', () => {
        const orders = [orderOf('p1'), orderOf('p1', 'p1'), orderOf('p1')];

        expect(calculateCatalogCoverage(orders, productsWithIds('p1', 'p2'))).toBe(50);
    });

    it('vaut 100 quand tout le catalogue a été vendu', () => {
        expect(calculateCatalogCoverage([orderOf('p1', 'p2')], productsWithIds('p1', 'p2'))).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33)', () => {
        expect(calculateCatalogCoverage([orderOf('p1')], productsWithIds('p1', 'p2', 'p3'))).toBe(33);
    });

    it('ignore les lignes des commandes non completed', () => {
        const orders = [
            orderOf('p1'),
            buildOrder({ status: 'refunded', lines: [buildOrderLine({ productId: 'p2' })] }),
        ];

        expect(calculateCatalogCoverage(orders, productsWithIds('p1', 'p2'))).toBe(50);
    });
});
