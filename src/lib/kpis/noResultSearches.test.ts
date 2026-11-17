import { describe, expect, it } from 'vitest';
import { buildSearchTermStat } from '../testing/builders';
import { calculateNoResultSearches } from './noResultSearches';

const termsOf = (result: { terms: { term: string }[] }) => result.terms.map((stat) => stat.term);

describe('calculateNoResultSearches', () => {
    it('renvoie un taux nul et aucun terme pour une liste vide', () => {
        expect(calculateNoResultSearches([])).toEqual({ rate: 0, terms: [] });
    });

    it('renvoie un taux nul et aucun terme quand toutes les recherches ont des résultats', () => {
        const stats = [
            buildSearchTermStat({ term: 'épée', hasResults: true, searches: 50 }),
            buildSearchTermStat({ term: 'arc', hasResults: true, searches: 30 }),
        ];

        expect(calculateNoResultSearches(stats)).toEqual({ rate: 0, terms: [] });
    });

    it('renvoie un taux nul quand aucune recherche n\'a été faite (pas de division par zéro)', () => {
        const stats = [buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 0 })];

        expect(calculateNoResultSearches(stats).rate).toBe(0);
    });

    it('rapporte les recherches sans résultat à toutes les recherches, en %', () => {
        const stats = [
            buildSearchTermStat({ term: 'épée', hasResults: true, searches: 80 }),
            buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 15 }),
            buildSearchTermStat({ term: 'licorne', hasResults: false, searches: 5 }),
        ];

        expect(calculateNoResultSearches(stats).rate).toBe(20);
    });

    it('vaut 100 quand aucune recherche n\'a de résultat', () => {
        const stats = [buildSearchTermStat({ hasResults: false, searches: 10 })];

        expect(calculateNoResultSearches(stats).rate).toBe(100);
    });

    it('arrondit le taux à l\'entier (1/3 -> 33)', () => {
        const stats = [
            buildSearchTermStat({ term: 'épée', hasResults: true, searches: 2 }),
            buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 1 }),
        ];

        expect(calculateNoResultSearches(stats).rate).toBe(33);
    });

    it('ne liste que les termes sans résultat, du plus tapé au moins tapé', () => {
        const stats = [
            buildSearchTermStat({ term: 'licorne', hasResults: false, searches: 5 }),
            buildSearchTermStat({ term: 'épée', hasResults: true, searches: 80 }),
            buildSearchTermStat({ term: 'dragon', hasResults: false, searches: 15 }),
        ];

        expect(termsOf(calculateNoResultSearches(stats))).toEqual(['dragon', 'licorne']);
    });

    it('limite à 5 termes par défaut', () => {
        const stats = [1, 2, 3, 4, 5, 6, 7].map((n) =>
            buildSearchTermStat({ term: `terme-${n}`, hasResults: false, searches: n }),
        );

        expect(termsOf(calculateNoResultSearches(stats))).toEqual(['terme-7', 'terme-6', 'terme-5', 'terme-4', 'terme-3']);
    });

    it('applique la limite demandée sans changer le taux', () => {
        const stats = [
            buildSearchTermStat({ term: 'a', hasResults: false, searches: 3 }),
            buildSearchTermStat({ term: 'b', hasResults: false, searches: 1 }),
        ];

        const result = calculateNoResultSearches(stats, 1);

        expect(termsOf(result)).toEqual(['a']);
        expect(result.rate).toBe(100);
    });

    it('ne modifie pas la liste d\'origine', () => {
        const stats = [
            buildSearchTermStat({ term: 'petit', hasResults: false, searches: 1 }),
            buildSearchTermStat({ term: 'grand', hasResults: false, searches: 9 }),
        ];

        calculateNoResultSearches(stats);

        expect(stats.map((stat) => stat.term)).toEqual(['petit', 'grand']);
    });
});
