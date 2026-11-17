import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateUniqueVisitors } from './uniqueVisitors';

describe('calculateUniqueVisitors', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateUniqueVisitors([])).toBe(0);
    });

    it('additionne les utilisateurs de toutes les lignes', () => {
        const traffic = [
            buildTrafficRow({ users: 80 }),
            buildTrafficRow({ users: 120, channel: 'paid' }),
            buildTrafficRow({ users: 30, device: 'mobile' }),
        ];

        expect(calculateUniqueVisitors(traffic)).toBe(230);
    });

    // Approximation assumée (voir le commentaire du KPI) : un visiteur présent sur plusieurs
    // jours ou canaux est compté autant de fois qu'il y a de lignes.
    it('additionne sans dédoublonner les visiteurs présents sur plusieurs lignes', () => {
        const traffic = [
            buildTrafficRow({ date: '2026-01-14T00:00:00.000Z', users: 50 }),
            buildTrafficRow({ date: '2026-01-15T00:00:00.000Z', users: 50 }),
        ];

        expect(calculateUniqueVisitors(traffic)).toBe(100);
    });
});
