import { PageStat, PageType } from '@salespulse/contracts';

export type TopPagesType = 'all' | PageType;

/**
 * Pages les plus vues, par nombre de vues décroissant. Un seul calcul pour les trois classements
 * (global, produits, hors produits) : seul le filtre sur `type` change.
 */
export function calculateTopPages(pages: PageStat[], type: TopPagesType = 'all', limit = 10): PageStat[] {
    return pages
        .filter((page) => type === 'all' || page.type === type)
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
}
