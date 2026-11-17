import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateAverageSessionDuration } from './averageSessionDuration';

describe('calculateAverageSessionDuration', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateAverageSessionDuration([])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune session (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ sessions: 0, totalSessionDurationSeconds: 100 })];

        expect(calculateAverageSessionDuration(traffic)).toBe(0);
    });

    it('divise la durée cumulée par le nombre de sessions', () => {
        const traffic = [buildTrafficRow({ sessions: 100, totalSessionDurationSeconds: 12000 })];

        expect(calculateAverageSessionDuration(traffic)).toBe(120);
    });

    // Moyenne pondérée par les sessions : 70000 / 400 = 175 s, et non la moyenne des moyennes
    // des lignes (100 s et 200 s) qui donnerait 150 s.
    it('pondère par les sessions et non par ligne', () => {
        const traffic = [
            buildTrafficRow({ sessions: 100, totalSessionDurationSeconds: 10000 }),
            buildTrafficRow({ sessions: 300, totalSessionDurationSeconds: 60000, channel: 'paid' }),
        ];

        expect(calculateAverageSessionDuration(traffic)).toBe(175);
    });

    it('arrondit à la seconde (33,33 -> 33)', () => {
        const traffic = [buildTrafficRow({ sessions: 3, totalSessionDurationSeconds: 100 })];

        expect(calculateAverageSessionDuration(traffic)).toBe(33);
    });

    it('arrondit à la seconde supérieure à la demi-seconde (2,5 -> 3)', () => {
        const traffic = [buildTrafficRow({ sessions: 2, totalSessionDurationSeconds: 5 })];

        expect(calculateAverageSessionDuration(traffic)).toBe(3);
    });
});
