import { describe, expect, it } from 'vitest';
import { buildOrder, buildTrafficRow } from '../testing/builders';
import { calculateConversionByDevice, calculateSessionsByDevice } from './deviceBreakdown';

// `count` commandes d'un appareil donné, avec des identifiants distincts.
const ordersOn = (device: 'desktop' | 'mobile' | 'tablet', count: number, status: 'completed' | 'refunded' = 'completed') =>
    Array.from({ length: count }, (_, i) => buildOrder({ id: `${device}-${status}-${i}`, device, status }));

describe('calculateSessionsByDevice', () => {
    it('renvoie une liste vide pour une liste vide', () => {
        expect(calculateSessionsByDevice([])).toEqual([]);
    });

    it('renvoie une liste vide quand il n\'y a aucune session', () => {
        expect(calculateSessionsByDevice([buildTrafficRow({ sessions: 0 })])).toEqual([]);
    });

    it('répartit les sessions par appareil, de la plus grande part à la plus petite', () => {
        const traffic = [
            buildTrafficRow({ device: 'tablet', sessions: 100 }),
            buildTrafficRow({ device: 'desktop', sessions: 600 }),
            buildTrafficRow({ device: 'mobile', sessions: 300 }),
        ];

        expect(calculateSessionsByDevice(traffic)).toEqual([
            { device: 'desktop', sessions: 600, share: 60 },
            { device: 'mobile', sessions: 300, share: 30 },
            { device: 'tablet', sessions: 100, share: 10 },
        ]);
    });

    it('cumule les lignes d\'un même appareil (canaux et jours différents)', () => {
        const traffic = [
            buildTrafficRow({ device: 'mobile', channel: 'organic', sessions: 100 }),
            buildTrafficRow({ device: 'mobile', channel: 'paid', sessions: 100 }),
            buildTrafficRow({ device: 'desktop', sessions: 200 }),
        ];

        expect(calculateSessionsByDevice(traffic).map((entry) => entry.sessions)).toEqual([200, 200]);
    });

    it('arrondit chaque part indépendamment (la somme peut valoir 99)', () => {
        const traffic = [
            buildTrafficRow({ device: 'desktop', sessions: 100 }),
            buildTrafficRow({ device: 'mobile', sessions: 100 }),
            buildTrafficRow({ device: 'tablet', sessions: 100 }),
        ];

        expect(calculateSessionsByDevice(traffic).map((entry) => entry.share)).toEqual([33, 33, 33]);
    });
});

describe('calculateConversionByDevice', () => {
    it('renvoie une liste vide sans trafic', () => {
        expect(calculateConversionByDevice(ordersOn('desktop', 3), [])).toEqual([]);
    });

    it('renvoie une liste vide quand il n\'y a aucune session', () => {
        expect(calculateConversionByDevice(ordersOn('desktop', 3), [buildTrafficRow({ sessions: 0 })])).toEqual([]);
    });

    it('calcule commandes completed / sessions de l\'appareil, en % avec 2 décimales', () => {
        const traffic = [
            buildTrafficRow({ device: 'desktop', sessions: 400 }),
            buildTrafficRow({ device: 'desktop', sessions: 200, channel: 'paid' }),
            buildTrafficRow({ device: 'mobile', sessions: 300 }),
        ];
        const orders = [...ordersOn('desktop', 9), ...ordersOn('mobile', 6)];

        // desktop : 9 / 600 = 1,5 % ; mobile : 6 / 300 = 2 %. Trié par taux décroissant.
        expect(calculateConversionByDevice(orders, traffic)).toEqual([
            { device: 'mobile', rate: 2 },
            { device: 'desktop', rate: 1.5 },
        ]);
    });

    it('arrondit à 2 décimales (1 / 300 = 0,33 %)', () => {
        const traffic = [buildTrafficRow({ device: 'mobile', sessions: 300 })];

        expect(calculateConversionByDevice(ordersOn('mobile', 1), traffic)).toEqual([{ device: 'mobile', rate: 0.33 }]);
    });

    it('donne un taux de 0 à un appareil avec des sessions mais sans commande', () => {
        const traffic = [
            buildTrafficRow({ device: 'desktop', sessions: 100 }),
            buildTrafficRow({ device: 'tablet', sessions: 100 }),
        ];

        expect(calculateConversionByDevice(ordersOn('desktop', 2), traffic)).toEqual([
            { device: 'desktop', rate: 2 },
            { device: 'tablet', rate: 0 },
        ]);
    });

    it('ignore un appareil sans session, même s\'il a des commandes', () => {
        const traffic = [buildTrafficRow({ device: 'desktop', sessions: 100 })];
        const orders = [...ordersOn('desktop', 1), ...ordersOn('tablet', 5)];

        expect(calculateConversionByDevice(orders, traffic)).toEqual([{ device: 'desktop', rate: 1 }]);
    });

    it('ne compte que les commandes completed', () => {
        const traffic = [buildTrafficRow({ device: 'mobile', sessions: 100 })];
        const orders = [...ordersOn('mobile', 3), ...ordersOn('mobile', 10, 'refunded')];

        expect(calculateConversionByDevice(orders, traffic)).toEqual([{ device: 'mobile', rate: 3 }]);
    });
});
