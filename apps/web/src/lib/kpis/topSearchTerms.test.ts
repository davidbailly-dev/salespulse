import { describe, expect, it } from 'vitest';
import { buildSearchTermStat } from '../testing/builders';
import { calculateTopSearchTerms } from './topSearchTerms';

const termsOf = (stats: { term: string }[]) => stats.map((stat) => stat.term);

describe('calculateTopSearchTerms', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateTopSearchTerms([])).toEqual([]);
    });

    it('trie par nombre de recherches décroissant, avec ou sans résultat', () => {
        const stats = [
            buildSearchTermStat({ term: 'arc', hasResults: true, searches: 30 }),
            buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 90 }),
            buildSearchTermStat({ term: 'épée', hasResults: true, searches: 60 }),
        ];

        expect(termsOf(calculateTopSearchTerms(stats))).toEqual(['dragon', 'épée', 'arc']);
    });

    it('conserve les champs de chaque terme', () => {
        const stat = buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 12 });

        expect(calculateTopSearchTerms([stat])).toEqual([{ term: 'dragon', hasResults: false, searches: 12 }]);
    });

    it('limite à 5 termes par défaut', () => {
        const stats = [1, 2, 3, 4, 5, 6].map((n) => buildSearchTermStat({ term: `terme-${n}`, searches: n }));

        expect(termsOf(calculateTopSearchTerms(stats))).toEqual(['terme-6', 'terme-5', 'terme-4', 'terme-3', 'terme-2']);
    });

    it('applique la limite demandée', () => {
        const stats = [1, 2, 3].map((n) => buildSearchTermStat({ term: `terme-${n}`, searches: n }));

        expect(termsOf(calculateTopSearchTerms(stats, 2))).toEqual(['terme-3', 'terme-2']);
    });

    it('ne modifie pas la liste d\'origine', () => {
        const stats = [
            buildSearchTermStat({ term: 'petit', searches: 1 }),
            buildSearchTermStat({ term: 'grand', searches: 9 }),
        ];

        calculateTopSearchTerms(stats);

        expect(termsOf(stats)).toEqual(['petit', 'grand']);
    });
});
