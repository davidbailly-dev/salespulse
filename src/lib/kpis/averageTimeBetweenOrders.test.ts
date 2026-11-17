import { describe, expect, it } from 'vitest';
import { buildOrder } from '../testing/builders';
import { calculateAverageTimeBetweenOrdersDays } from './averageTimeBetweenOrders';

// Date ISO située `offset` jours après le 1er janvier 2026 (minuit UTC).
const dayOffset = (offset: number): string => new Date(Date.UTC(2026, 0, 1 + offset)).toISOString();

describe('calculateAverageTimeBetweenOrdersDays', () => {
    it('renvoie null pour une liste vide', () => {
        expect(calculateAverageTimeBetweenOrdersDays([])).toBeNull();
    });

    it('renvoie null quand aucun client n\'a au moins 2 commandes', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c2', date: dayOffset(5) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBeNull();
    });

    it('renvoie null quand les seules commandes multiples ne sont pas completed', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(10), status: 'refunded' }),
            buildOrder({ customerId: 'c1', date: dayOffset(20), status: 'abandoned' }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBeNull();
    });

    it('calcule l\'écart en jours entre deux commandes d\'un même client', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(10) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(10);
    });

    it('trie les commandes d\'un client par date quel que soit l\'ordre d\'entrée', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(20) }),
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(10) }),
        ];

        // Écarts : 10 et 10. Sans tri, on aurait 20 -> 0 (-20) puis 0 -> 10.
        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(10);
    });

    // Moyenne de tous les écarts : (10 + 10 + 40) / 3 = 20, et non la moyenne des moyennes
    // par client (10 + 40) / 2 = 25. Un client très actif pèse davantage.
    it('moyenne l\'ensemble des écarts et non les moyennes par client', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(10) }),
            buildOrder({ customerId: 'c1', date: dayOffset(20) }),
            buildOrder({ customerId: 'c2', date: dayOffset(0) }),
            buildOrder({ customerId: 'c2', date: dayOffset(40) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(20);
    });

    it('ne crée pas d\'écart entre les commandes de clients différents', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c2', date: dayOffset(5) }),
            buildOrder({ customerId: 'c3', date: dayOffset(9) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBeNull();
    });

    it('ignore les commandes non completed dans le calcul des écarts', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(4), status: 'abandoned' }),
            buildOrder({ customerId: 'c1', date: dayOffset(10) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(10);
    });

    it('arrondit à l\'entier (écarts de 1 et 2 jours = 1,5 -> 2)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: dayOffset(0) }),
            buildOrder({ customerId: 'c1', date: dayOffset(1) }),
            buildOrder({ customerId: 'c2', date: dayOffset(0) }),
            buildOrder({ customerId: 'c2', date: dayOffset(2) }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(2);
    });

    it('compte les fractions de jour dans les écarts (1,5 jour -> 2)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: '2026-01-01T00:00:00.000Z' }),
            buildOrder({ customerId: 'c1', date: '2026-01-02T12:00:00.000Z' }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(2);
    });

    // Une troncature en jours entiers donnerait 0 : l'écart de 12 h doit compter pour 0,5 jour.
    it('prend en compte les écarts inférieurs à un jour (12 h -> 0,5 -> 1)', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: '2026-01-01T00:00:00.000Z' }),
            buildOrder({ customerId: 'c1', date: '2026-01-01T12:00:00.000Z' }),
        ];

        expect(calculateAverageTimeBetweenOrdersDays(orders)).toBe(1);
    });
});
