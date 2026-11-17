import { describe, expect, it } from 'vitest';
import { buildAdSpendRow, buildOrder } from '../testing/builders';
import { calculateCustomerAcquisitionCost, calculateNewCustomersCount } from './customerAcquisitionCost';

// Date ISO située `offset` jours après le 1er janvier 2026 (minuit UTC).
const dayOffset = (offset: number): string => new Date(Date.UTC(2026, 0, 1 + offset)).toISOString();

const firstOrder = (customerId: string, offset: number, overrides = {}) =>
    buildOrder({ id: `${customerId}-${offset}`, customerId, date: dayOffset(offset), ...overrides });

describe('calculateNewCustomersCount', () => {
    it('renvoie 0 sans commande', () => {
        expect(calculateNewCustomersCount([], {})).toBe(0);
    });

    it('compte les clients dont la première commande completed tombe dans la période', () => {
        const orders = [firstOrder('c1', 6), firstOrder('c2', 10)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(2);
    });

    it('ne compte pas un client dont la première commande précède la période, même s\'il commande dans la période', () => {
        const orders = [firstOrder('c1', 0), firstOrder('c1', 10), firstOrder('c2', 10)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(1);
    });

    it('ne compte pas un client dont la première commande suit la période', () => {
        const orders = [firstOrder('c1', 20)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(0);
    });

    it('inclut les bornes `from` et `to`', () => {
        const orders = [firstOrder('c1', 5), firstOrder('c2', 15)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(2);
    });

    it('exclut une commande une milliseconde avant `from` ou après `to`', () => {
        const orders = [
            buildOrder({ customerId: 'c1', date: '2026-01-05T23:59:59.999Z' }),
            buildOrder({ customerId: 'c2', date: '2026-01-16T00:00:00.001Z' }),
        ];

        expect(calculateNewCustomersCount(orders, { from: '2026-01-06T00:00:00.000Z', to: '2026-01-16T00:00:00.000Z' })).toBe(0);
    });

    it('compte tous les clients sans borne', () => {
        const orders = [firstOrder('c1', 0), firstOrder('c2', 100), firstOrder('c3', 200)];

        expect(calculateNewCustomersCount(orders, {})).toBe(3);
    });

    it('accepte une plage avec seulement `from`', () => {
        const orders = [firstOrder('c1', 0), firstOrder('c2', 10), firstOrder('c3', 20)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(10) })).toBe(2);
    });

    it('accepte une plage avec seulement `to`', () => {
        const orders = [firstOrder('c1', 0), firstOrder('c2', 10), firstOrder('c3', 20)];

        expect(calculateNewCustomersCount(orders, { to: dayOffset(10) })).toBe(2);
    });

    it('retient la commande la plus ancienne quel que soit l\'ordre d\'entrée', () => {
        // La commande tardive est listée avant la commande ancienne : la première est jour 0.
        const orders = [firstOrder('c1', 10), firstOrder('c1', 0)];

        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(0);
    });

    it('ne tient compte que des commandes completed pour trouver la première commande', () => {
        const orders = [
            firstOrder('c1', 0, { status: 'abandoned' }),
            firstOrder('c1', 10),
            firstOrder('c2', 8, { status: 'refunded' }),
        ];

        // c1 devient « nouveau » au jour 10 (son panier abandonné du jour 0 ne compte pas) ;
        // c2 n'a aucune commande completed.
        expect(calculateNewCustomersCount(orders, { from: dayOffset(5), to: dayOffset(15) })).toBe(1);
    });
});

describe('calculateCustomerAcquisitionCost', () => {
    const range = { from: dayOffset(5), to: dayOffset(15) };

    it('renvoie null sans nouveau client', () => {
        expect(calculateCustomerAcquisitionCost([buildAdSpendRow({ spend: 100 })], [], range)).toBeNull();
    });

    it('renvoie null quand tous les clients ont déjà commandé avant la période', () => {
        const orders = [firstOrder('c1', 0), firstOrder('c1', 10)];

        expect(calculateCustomerAcquisitionCost([buildAdSpendRow({ spend: 100 })], orders, range)).toBeNull();
    });

    it('divise toutes les dépenses par le nombre de nouveaux clients', () => {
        const adSpend = [
            buildAdSpendRow({ channel: 'paid', spend: 100 }),
            buildAdSpendRow({ channel: 'social', spend: 50 }),
        ];
        const orders = [firstOrder('c1', 6), firstOrder('c2', 8)];

        expect(calculateCustomerAcquisitionCost(adSpend, orders, range)).toBe(75);
    });

    it('arrondit à l\'euro entier', () => {
        const adSpend = [buildAdSpendRow({ spend: 100 })];
        const orders = [firstOrder('c1', 6), firstOrder('c2', 7), firstOrder('c3', 8)];

        expect(calculateCustomerAcquisitionCost(adSpend, orders, range)).toBe(33);
    });

    it('renvoie 0 (et non null) quand il y a des nouveaux clients mais aucune dépense', () => {
        expect(calculateCustomerAcquisitionCost([], [firstOrder('c1', 6)], range)).toBe(0);
    });
});
