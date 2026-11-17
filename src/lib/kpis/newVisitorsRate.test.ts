import { describe, expect, it } from 'vitest';
import { buildTrafficRow } from '../testing/builders';
import { calculateNewVisitorsRate } from './newVisitorsRate';

describe('calculateNewVisitorsRate', () => {
    it('renvoie 0 pour une liste vide', () => {
        expect(calculateNewVisitorsRate([])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucun utilisateur (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ users: 0, newUsers: 0 })];

        expect(calculateNewVisitorsRate(traffic)).toBe(0);
    });

    it('rapporte les nouveaux utilisateurs à tous les utilisateurs', () => {
        const traffic = [buildTrafficRow({ users: 80, newUsers: 40 })];

        expect(calculateNewVisitorsRate(traffic)).toBe(50);
    });

    // 100 / 400 = 25 %, et non la moyenne des taux des lignes (100 % et 0 %) = 50 %.
    it('pondère par les utilisateurs et non par ligne', () => {
        const traffic = [
            buildTrafficRow({ users: 100, newUsers: 100 }),
            buildTrafficRow({ users: 300, newUsers: 0, channel: 'paid' }),
        ];

        expect(calculateNewVisitorsRate(traffic)).toBe(25);
    });

    it('vaut 100 quand tous les utilisateurs sont nouveaux', () => {
        const traffic = [buildTrafficRow({ users: 50, newUsers: 50 })];

        expect(calculateNewVisitorsRate(traffic)).toBe(100);
    });

    it('arrondit à l\'entier (1/3 -> 33)', () => {
        const traffic = [buildTrafficRow({ users: 3, newUsers: 1 })];

        expect(calculateNewVisitorsRate(traffic)).toBe(33);
    });
});
