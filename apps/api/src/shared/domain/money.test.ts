import { describe, expect, it } from 'vitest';

import { errorCodeOf } from '../../testing/errorCodeOf';
import { addMoney, money, subtractMoney } from './money';

describe('money', () => {
    it('garde un montant entier en unités mineures avec sa devise', () => {
        expect(money(1999, 'EUR')).toEqual({ amount: 1999, currency: 'EUR' });
    });

    it('accepte zéro, un montant négatif et le plus grand entier sûr', () => {
        expect(money(0, 'EUR').amount).toBe(0);
        expect(money(-500, 'EUR').amount).toBe(-500);
        expect(money(Number.MAX_SAFE_INTEGER, 'EUR').amount).toBe(Number.MAX_SAFE_INTEGER);
        expect(money(-Number.MAX_SAFE_INTEGER, 'EUR').amount).toBe(-Number.MAX_SAFE_INTEGER);
    });

    it('ramène le zéro négatif à zéro', () => {
        expect(Object.is(money(-0, 'EUR').amount, 0)).toBe(true);
    });

    it.each([
        19.99,
        0.5,
        Number.NaN,
        Number.POSITIVE_INFINITY,
        Number.MAX_SAFE_INTEGER + 1,
        -Number.MAX_SAFE_INTEGER - 1,
    ])('refuse le montant %s', (amount) => {
        expect(errorCodeOf(() => money(amount, 'EUR'))).toBe('invalid-money');
    });

    it('refuse une devise inconnue', () => {
        expect(errorCodeOf(() => money(100, 'eur'))).toBe('invalid-currency');
    });
});

describe('addMoney', () => {
    it('additionne deux montants de même devise', () => {
        expect(addMoney(money(1999, 'EUR'), money(1, 'EUR'))).toEqual(money(2000, 'EUR'));
    });

    it('refuse deux devises différentes', () => {
        expect(errorCodeOf(() => addMoney(money(100, 'EUR'), money(100, 'USD')))).toBe(
            'currency-mismatch',
        );
    });

    it('refuse un résultat au-delà du plus grand entier sûr', () => {
        const max = money(Number.MAX_SAFE_INTEGER, 'EUR');

        expect(errorCodeOf(() => addMoney(max, money(1, 'EUR')))).toBe('invalid-money');
    });
});

describe('subtractMoney', () => {
    it('soustrait deux montants de même devise, résultat négatif compris', () => {
        expect(subtractMoney(money(500, 'EUR'), money(800, 'EUR'))).toEqual(money(-300, 'EUR'));
    });

    it('refuse deux devises différentes', () => {
        expect(errorCodeOf(() => subtractMoney(money(100, 'EUR'), money(100, 'JPY')))).toBe(
            'currency-mismatch',
        );
    });

    it('refuse un résultat en deçà du plus petit entier sûr', () => {
        const min = money(-Number.MAX_SAFE_INTEGER, 'EUR');

        expect(errorCodeOf(() => subtractMoney(min, money(1, 'EUR')))).toBe('invalid-money');
    });
});
