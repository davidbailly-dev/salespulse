import { describe, expect, it } from 'vitest';
import { buildErrorRow, buildTrafficRow } from '../testing/builders';
import { calculateNotFoundRate } from './notFoundRate';

describe('calculateNotFoundRate', () => {
    it('renvoie 0 sans erreur ni trafic', () => {
        expect(calculateNotFoundRate([], [])).toBe(0);
    });

    it('renvoie 0 quand il n\'y a aucune page vue (pas de division par zéro)', () => {
        const errors = [buildErrorRow({ type: 'not_found', count: 5 })];

        expect(calculateNotFoundRate(errors, [buildTrafficRow({ pageViews: 0 })])).toBe(0);
    });

    it('renvoie 0 sans erreur', () => {
        expect(calculateNotFoundRate([], [buildTrafficRow({ pageViews: 300 })])).toBe(0);
    });

    it('rapporte les erreurs 404 aux pages vues, en %', () => {
        const errors = [buildErrorRow({ type: 'not_found', count: 3 })];

        expect(calculateNotFoundRate(errors, [buildTrafficRow({ pageViews: 300 })])).toBe(1);
    });

    it('additionne les erreurs de plusieurs lignes et les pages vues de plusieurs lignes', () => {
        const errors = [
            buildErrorRow({ type: 'not_found', count: 1 }),
            buildErrorRow({ type: 'not_found', count: 2, date: '2026-01-16T00:00:00.000Z' }),
        ];
        const traffic = [buildTrafficRow({ pageViews: 100 }), buildTrafficRow({ pageViews: 200, channel: 'paid' })];

        expect(calculateNotFoundRate(errors, traffic)).toBe(1);
    });

    it('ignore les erreurs de paiement', () => {
        const errors = [
            buildErrorRow({ type: 'not_found', count: 3 }),
            buildErrorRow({ type: 'payment_failed', count: 100 }),
        ];

        expect(calculateNotFoundRate(errors, [buildTrafficRow({ pageViews: 300 })])).toBe(1);
    });

    it('arrondit à 2 décimales (1 / 300 = 0,33 %)', () => {
        const errors = [buildErrorRow({ type: 'not_found', count: 1 })];

        expect(calculateNotFoundRate(errors, [buildTrafficRow({ pageViews: 300 })])).toBe(0.33);
    });

    it('arrondit à 2 décimales (1 / 3 = 33,33 %)', () => {
        const errors = [buildErrorRow({ type: 'not_found', count: 1 })];

        expect(calculateNotFoundRate(errors, [buildTrafficRow({ pageViews: 3 })])).toBe(33.33);
    });
});
