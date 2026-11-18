import { SearchTermStat } from '../mock-data/schemas';

/** Termes de recherche interne les plus tapés, avec ou sans résultat. */
export function calculateTopSearchTerms(stats: SearchTermStat[], limit = 5): SearchTermStat[] {
    return [...stats].sort((a, b) => b.searches - a.searches).slice(0, limit);
}
