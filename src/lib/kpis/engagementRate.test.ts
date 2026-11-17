import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateEngagementRate } from './engagementRate';

describe('calculateEngagementRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateEngagementRate([])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune session (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ sessions: 0, engagedSessions: 0 })];

        expect(calculateEngagementRate(traffic)).toBe(0);
    });

    it('rapporte les sessions engagées à toutes les sessions', () => {
        const traffic = [buildTrafficRow({ sessions: 100, engagedSessions: 60 })];

        expect(calculateEngagementRate(traffic)).toBe(60);
    });

    // 100 / 400 = 25 %, et non la moyenne des taux des lignes (100 % et 0 %) = 50 %.
    it('pondère par les sessions et non par ligne', () => {
        const traffic = [
            buildTrafficRow({ sessions: 100, engagedSessions: 100 }),
            buildTrafficRow({ sessions: 300, engagedSessions: 0, channel: 'paid' }),
        ];

        expect(calculateEngagementRate(traffic)).toBe(25);
    });

    it('vaut 100 quand toutes les sessions sont engagées', () => {
        const traffic = [buildTrafficRow({ sessions: 80, engagedSessions: 80 })];

        expect(calculateEngagementRate(traffic)).toBe(100);
    });

    it('arrondit à l\'entier (2/3 -> 67)', () => {
        const traffic = [buildTrafficRow({ sessions: 3, engagedSessions: 2 })];

        expect(calculateEngagementRate(traffic)).toBe(67);
    });
});
