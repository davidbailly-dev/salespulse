import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculatePagesPerSession } from './pagesPerSession';

describe('calculatePagesPerSession', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculatePagesPerSession([])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune session (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ sessions: 0, pageViews: 0 })];

        expect(calculatePagesPerSession(traffic)).toBe(0);
    });

    it('divise les pages vues par les sessions', () => {
        const traffic = [buildTrafficRow({ sessions: 100, pageViews: 300 })];

        expect(calculatePagesPerSession(traffic)).toBe(3);
    });

    // 600 / 200 = 3 pages par session, et non la moyenne des ratios des lignes
    // (2 et 6) qui donnerait 4.
    it('pondère par les sessions et non par ligne', () => {
        const traffic = [
            buildTrafficRow({ sessions: 150, pageViews: 300 }),
            buildTrafficRow({ sessions: 50, pageViews: 300, channel: 'paid' }),
        ];

        expect(calculatePagesPerSession(traffic)).toBe(3);
    });

    it('arrondit à une décimale vers le bas (3,33 -> 3,3)', () => {
        const traffic = [buildTrafficRow({ sessions: 3, pageViews: 10 })];

        expect(calculatePagesPerSession(traffic)).toBe(3.3);
    });

    it('arrondit à une décimale vers le haut (3,67 -> 3,7)', () => {
        const traffic = [buildTrafficRow({ sessions: 3, pageViews: 11 })];

        expect(calculatePagesPerSession(traffic)).toBe(3.7);
    });
});
