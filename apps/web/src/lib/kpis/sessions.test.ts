import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateSessions } from './sessions';

describe('calculateSessions', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateSessions([])).toBe(0);
    });

    it('additionne les sessions de toutes les lignes', () => {
        const traffic = [
            buildTrafficRow({ sessions: 100, channel: 'organic' }),
            buildTrafficRow({ sessions: 250, channel: 'paid', device: 'mobile' }),
            buildTrafficRow({ sessions: 50, channel: 'email' }),
        ];

        expect(calculateSessions(traffic)).toBe(400);
    });
});
