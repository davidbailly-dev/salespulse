import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateDeepScrollRate } from './deepScrollRate';

describe('calculateDeepScrollRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateDeepScrollRate([])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune session (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ sessions: 0, deepScrollSessions: 0 })];

        expect(calculateDeepScrollRate(traffic)).toBe(0);
    });

    // Rapporté à toutes les sessions (100), pas aux seules sessions engagées (60) : 30 % et non 50 %.
    it('rapporte les sessions à scroll profond à toutes les sessions', () => {
        const traffic = [buildTrafficRow({ sessions: 100, engagedSessions: 60, deepScrollSessions: 30 })];

        expect(calculateDeepScrollRate(traffic)).toBe(30);
    });

    // 100 / 400 = 25 %, et non la moyenne des taux des lignes (100 % et 0 %) = 50 %.
    it('pondère par les sessions et non par ligne', () => {
        const traffic = [
            buildTrafficRow({ sessions: 100, engagedSessions: 100, deepScrollSessions: 100 }),
            buildTrafficRow({ sessions: 300, engagedSessions: 100, deepScrollSessions: 0, channel: 'paid' }),
        ];

        expect(calculateDeepScrollRate(traffic)).toBe(25);
    });

    it('arrondit à l\'entier (1/3 -> 33)', () => {
        const traffic = [buildTrafficRow({ sessions: 3, engagedSessions: 2, deepScrollSessions: 1 })];

        expect(calculateDeepScrollRate(traffic)).toBe(33);
    });
});
