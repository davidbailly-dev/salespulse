import { SearchTermStat } from '@salespulse/contracts';

export type NoResultSearches = {
    // Part des recherches sans résultat : Σ searches sans résultat / Σ searches, en %.
    rate: number;
    // Termes sans résultat les plus tapés : les besoins que le catalogue ne couvre pas.
    terms: SearchTermStat[];
};

export function calculateNoResultSearches(stats: SearchTermStat[], limit = 5): NoResultSearches {
    const totalSearches = stats.reduce((total, stat) => total + stat.searches, 0);
    const noResultStats = stats.filter((stat) => !stat.hasResults);
    const noResultSearches = noResultStats.reduce((total, stat) => total + stat.searches, 0);

    return {
        rate: totalSearches === 0 ? 0 : Math.round((noResultSearches / totalSearches) * 100),
        terms: [...noResultStats].sort((a, b) => b.searches - a.searches).slice(0, limit),
    };
}
