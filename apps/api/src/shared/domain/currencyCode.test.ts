import { describe, expect, it } from 'vitest';

import { errorCodeOf } from '../../testing/errorCodeOf';
import { currencyCode, currencyDecimals } from './currencyCode';

describe('currencyCode', () => {
    it('accepte un code de la liste ISO 4217', () => {
        expect(currencyCode('EUR')).toBe('EUR');
        expect(currencyCode('JPY')).toBe('JPY');
    });

    it('accepte une devise récente de la liste, absente de certaines versions d’ICU', () => {
        expect(currencyCode('VED')).toBe('VED');
    });

    it.each(['eur', 'EURO', 'EU', '', 'ZZZ'])('refuse « %s »', (value) => {
        expect(errorCodeOf(() => currencyCode(value))).toBe('invalid-currency');
    });

    it.each([
        ['HRK', 'retirée de la liste'],
        ['XAU', 'sans unités mineures'],
        ['XTS', 'réservée aux tests'],
        ['XXX', 'sans devise'],
    ])('refuse %s, %s', (value) => {
        expect(errorCodeOf(() => currencyCode(value))).toBe('invalid-currency');
    });
});

describe('currencyDecimals', () => {
    it.each([
        ['EUR', 2],
        ['JPY', 0],
        ['KWD', 3],
        ['CLF', 4],
        // Devises dont l'affichage d'Intl n'a pas de décimales, contrairement à ISO 4217.
        ['HUF', 2],
        ['IDR', 2],
        ['COP', 2],
        ['IQD', 3],
    ])('donne le nombre de décimales de %s : %i', (code, decimals) => {
        expect(currencyDecimals(currencyCode(code))).toBe(decimals);
    });
});
