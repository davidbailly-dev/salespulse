import { describe, expect, it } from 'vitest';
import { buildPageStat } from '../testing/builders';
import { calculateExitPages } from './exitPages';

describe('calculateExitPages', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateExitPages([])).toEqual([]);
    });

    it('exclut les pages sans aucune sortie', () => {
        const pages = [buildPageStat({ path: '/a', views: 100, exits: 0 }), buildPageStat({ path: '/b', views: 100, exits: 10 })];

        expect(calculateExitPages(pages).map((page) => page.path)).toEqual(['/b']);
    });

    it('expose le chemin, le titre, les sorties et le taux de sortie', () => {
        const pages = [buildPageStat({ path: '/produits/epee', title: 'Épée', views: 100, exits: 20 })];

        expect(calculateExitPages(pages)).toEqual([
            { path: '/produits/epee', title: 'Épée', exits: 20, exitRate: 20 },
        ]);
    });

    it('arrondit le taux de sortie à l\'entier (1/3 -> 33)', () => {
        const pages = [buildPageStat({ views: 3, exits: 1 })];

        expect(calculateExitPages(pages)[0].exitRate).toBe(33);
    });

    // Classer par taux ferait remonter une petite page à 100 % de sortie devant la vraie page de sortie.
    it('classe par nombre de sorties et non par taux de sortie', () => {
        const pages = [
            buildPageStat({ path: '/a-propos', views: 10, exits: 10 }),
            buildPageStat({ path: '/panier', views: 1000, exits: 50 }),
        ];

        expect(calculateExitPages(pages).map((page) => page.path)).toEqual(['/panier', '/a-propos']);
    });

    it('limite à 5 pages par défaut', () => {
        const pages = [1, 2, 3, 4, 5, 6].map((n) => buildPageStat({ path: `/p${n}`, views: 1000, exits: n * 10 }));

        expect(calculateExitPages(pages).map((page) => page.path)).toEqual(['/p6', '/p5', '/p4', '/p3', '/p2']);
    });

    it('applique la limite demandée', () => {
        const pages = [1, 2, 3].map((n) => buildPageStat({ path: `/p${n}`, views: 1000, exits: n * 10 }));

        expect(calculateExitPages(pages, 2).map((page) => page.path)).toEqual(['/p3', '/p2']);
    });
});
