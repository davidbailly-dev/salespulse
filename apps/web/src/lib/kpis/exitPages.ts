import { PageStat } from '../mock-data/schemas';

export type ExitPage = {
    path: string;
    title: string;
    exits: number;
    // Taux de sortie de la page : exits / views, en %.
    exitRate: number;
};

/**
 * Pages de sortie, classées par nombre de sorties. Classer par taux ferait remonter des pages
 * très peu vues (ex. "À propos") dont le taux élevé n'est que du bruit statistique.
 */
export function calculateExitPages(pages: PageStat[], limit = 5): ExitPage[] {
    return pages
        .filter((page) => page.exits > 0)
        .map((page) => ({
            path: page.path,
            title: page.title,
            exits: page.exits,
            exitRate: Math.round((page.exits / page.views) * 100),
        }))
        .sort((a, b) => b.exits - a.exits)
        .slice(0, limit);
}
