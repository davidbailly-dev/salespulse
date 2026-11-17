import { describe, expect, it } from 'vitest';
import { buildPageStat } from '../testing/builders';
import { calculateTopPages } from './topPages';

const PAGES = [
    buildPageStat({ path: '/produits/epee', type: 'product', views: 300 }),
    buildPageStat({ path: '/', type: 'other', views: 900 }),
    buildPageStat({ path: '/produits/arc', type: 'product', views: 500 }),
    buildPageStat({ path: '/contact', type: 'other', views: 100 }),
];

const pathsOf = (pages: { path: string }[]) => pages.map((page) => page.path);

describe('calculateTopPages', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopPages([])).toEqual([]);
    });

    it('trie toutes les pages par vues décroissantes par défaut', () => {
        expect(pathsOf(calculateTopPages(PAGES))).toEqual(['/', '/produits/arc', '/produits/epee', '/contact']);
    });

    it('ne garde que les pages produit avec le type "product"', () => {
        expect(pathsOf(calculateTopPages(PAGES, 'product'))).toEqual(['/produits/arc', '/produits/epee']);
    });

    it('ne garde que les pages hors produit avec le type "other"', () => {
        expect(pathsOf(calculateTopPages(PAGES, 'other'))).toEqual(['/', '/contact']);
    });

    it('renvoie une liste vide quand aucune page ne correspond au type', () => {
        const productsOnly = PAGES.filter((page) => page.type === 'product');

        expect(calculateTopPages(productsOnly, 'other')).toEqual([]);
    });

    it('limite à 10 pages par défaut', () => {
        const pages = Array.from({ length: 12 }, (_, i) => buildPageStat({ path: `/page-${i}`, views: i + 1 }));

        const result = calculateTopPages(pages);

        expect(result).toHaveLength(10);
        expect(result[0].path).toBe('/page-11');
    });

    it('applique la limite demandée après le filtre', () => {
        expect(pathsOf(calculateTopPages(PAGES, 'product', 1))).toEqual(['/produits/arc']);
    });

    it('ne modifie pas la liste d\'origine', () => {
        const pages = [buildPageStat({ path: '/b', views: 1 }), buildPageStat({ path: '/a', views: 2 })];

        calculateTopPages(pages);

        expect(pathsOf(pages)).toEqual(['/b', '/a']);
    });
});
