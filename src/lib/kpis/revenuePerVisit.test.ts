import { describe, expect, it } from 'vitest';
import { buildOrder, buildTrafficRow } from '../testing/builders';
import { calculateRevenuePerVisit } from './revenuePerVisit';

describe('calculateRevenuePerVisit', () => {
    it('renvoie 0 sans trafic', () => {
        expect(calculateRevenuePerVisit([buildOrder({ totalAmount: 500 })], [])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune session (pas de division par zéro)', () => {
        const traffic = [buildTrafficRow({ sessions: 0 })];

        expect(calculateRevenuePerVisit([buildOrder({ totalAmount: 500 })], traffic)).toBe(0);
    });

    it('renvoie 0 sans commande', () => {
        expect(calculateRevenuePerVisit([], [buildTrafficRow({ sessions: 100 })])).toBe(0);
    });

    it('divise le CA par les sessions', () => {
        const orders = [buildOrder({ totalAmount: 300 })];
        const traffic = [buildTrafficRow({ sessions: 120 })];

        expect(calculateRevenuePerVisit(orders, traffic)).toBe(2.5);
    });

    it('additionne les sessions de toutes les lignes', () => {
        const orders = [buildOrder({ totalAmount: 300 })];
        const traffic = [
            buildTrafficRow({ sessions: 60 }),
            buildTrafficRow({ sessions: 60, channel: 'paid' }),
        ];

        expect(calculateRevenuePerVisit(orders, traffic)).toBe(2.5);
    });

    it('arrondit au centime (33,33)', () => {
        const orders = [buildOrder({ totalAmount: 100 })];
        const traffic = [buildTrafficRow({ sessions: 3 })];

        expect(calculateRevenuePerVisit(orders, traffic)).toBe(33.33);
    });

    // Le CA n'est pas arrondi à l'euro avant la division : 20,8 / 8 = 2,60 (et non 21 / 8 = 2,63).
    it('utilise le CA non arrondi', () => {
        const orders = [buildOrder({ totalAmount: 10.4 }), buildOrder({ totalAmount: 10.4 })];
        const traffic = [buildTrafficRow({ sessions: 8 })];

        expect(calculateRevenuePerVisit(orders, traffic)).toBe(2.6);
    });

    it('ignore les commandes non completed', () => {
        const orders = [
            buildOrder({ totalAmount: 100 }),
            buildOrder({ status: 'refunded', totalAmount: 900 }),
            buildOrder({ status: 'abandoned', totalAmount: 900 }),
        ];
        const traffic = [buildTrafficRow({ sessions: 50 })];

        expect(calculateRevenuePerVisit(orders, traffic)).toBe(2);
    });
});
