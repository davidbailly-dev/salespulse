import { describe, expect, it } from 'vitest';

import { errorCodeOf } from '../../testing/errorCodeOf';
import { ianaTimezone } from './ianaTimezone';
import { localDay, localDayBounds, localDayOf } from './localDay';

// Les changements d'heure attendus viennent de la base tz embarquée par Node. Ils sont choisis
// dans le passé et vérifiés avec une seconde base, celle du système (`TZ=… date`) : une mise à
// jour des règles à venir ne les change pas. La Havane 2026 a été écartée pour cette raison : la
// tzdata 2026f n'y prévoit plus de retour à l'heure d'hiver, contrairement à celle de Node.
const PARIS = ianaTimezone('Europe/Paris');
const UTC = ianaTimezone('UTC');
const LOS_ANGELES = ianaTimezone('America/Los_Angeles');
// Passe à l'heure d'été à minuit : le jour commence alors à 1 h.
const SANTIAGO = ianaTimezone('America/Santiago');
// Repasse à l'heure d'hiver à 1 h : minuit existe alors deux fois.
const HAVANA = ianaTimezone('America/Havana');
// Le 1919-03-31, l'horloge saute de 23:30 la veille à 00:30 : le saut enjambe minuit.
const TORONTO = ianaTimezone('America/Toronto');

const HOUR = 3_600_000;

function durationInHours(bounds: { start: Date; end: Date }): number {
    return (bounds.end.getTime() - bounds.start.getTime()) / HOUR;
}

function isoBounds(bounds: { start: Date; end: Date }): [string, string] {
    return [bounds.start.toISOString(), bounds.end.toISOString()];
}

describe('localDay', () => {
    it.each(['2026-11-25', '2024-02-29', '2000-02-29', '1000-01-01', '9999-12-31'])(
        'accepte « %s »',
        (value) => {
            expect(localDay(value)).toBe(value);
        },
    );

    it.each([
        ['2025-02-29', '29 février d’une année non bissextile'],
        ['1900-02-29', '29 février d’un siècle non bissextile'],
        ['2026-04-31', '31 d’un mois de 30 jours'],
        ['2026-13-01', 'mois 13'],
        ['2026-00-10', 'mois 0'],
        ['2026-11-00', 'jour 0'],
        ['2026-1-05', 'mois sur un chiffre'],
        ['26-11-25', 'année sur deux chiffres'],
        ['0999-12-31', 'année avant 1000'],
        ['2026/11/25', 'séparateur'],
        ['2026-11-25T00:00', 'heure'],
        ['', 'chaîne vide'],
    ])('refuse « %s » (%s)', (value) => {
        expect(errorCodeOf(() => localDay(value))).toBe('invalid-local-day');
    });

    it('se trie dans l’ordre chronologique par l’ordre alphabétique', () => {
        const days = ['2026-11-25', '2025-12-31', '2026-01-09', '2026-01-10'].map(localDay);

        expect([...days].sort()).toEqual(['2025-12-31', '2026-01-09', '2026-01-10', '2026-11-25']);
    });
});

describe('localDayOf', () => {
    it('donne le jour local d’un instant dans le fuseau', () => {
        const instant = new Date('2026-11-24T23:30:00Z');

        expect(localDayOf(instant, PARIS)).toBe('2026-11-25');
        expect(localDayOf(instant, UTC)).toBe('2026-11-24');
    });

    it('recule d’un jour dans un fuseau en retard sur UTC', () => {
        expect(localDayOf(new Date('2026-01-01T05:00:00Z'), LOS_ANGELES)).toBe('2025-12-31');
    });

    it('change d’année avec le fuseau', () => {
        expect(localDayOf(new Date('2026-12-31T23:30:00Z'), PARIS)).toBe('2027-01-01');
    });

    it('place minuit local dans le jour qui commence', () => {
        expect(localDayOf(new Date('2026-11-24T23:00:00Z'), PARIS)).toBe('2026-11-25');
        expect(localDayOf(new Date('2026-11-24T22:59:59.999Z'), PARIS)).toBe('2026-11-24');
    });

    it('refuse un instant invalide', () => {
        expect(errorCodeOf(() => localDayOf(new Date('invalide'), PARIS))).toBe('invalid-instant');
    });

    it('accepte les instants des bornes de la plage', () => {
        expect(localDayOf(new Date('1000-01-01T00:00:00Z'), UTC)).toBe('1000-01-01');
        expect(localDayOf(new Date('9999-12-31T23:59:59.999Z'), UTC)).toBe('9999-12-31');
    });

    it.each([
        ['0050-06-01T12:00:00Z', UTC, 'an 50, que Date.UTC lirait 1950'],
        ['0999-12-31T23:59:59Z', UTC, 'juste avant l’an 1000'],
        ['1000-01-01T05:00:00Z', LOS_ANGELES, 'an 1000 en UTC, mais 999 dans le fuseau'],
        ['+010000-01-01T00:00:00Z', UTC, 'an 10000'],
    ])('refuse un instant hors des années 1000 à 9999 : %s (%s)', (iso, timezone) => {
        expect(errorCodeOf(() => localDayOf(new Date(iso), timezone))).toBe('invalid-instant');
    });
});

describe('localDayBounds', () => {
    it('borne un jour d’hiver à Paris sur 24 h, de minuit à minuit', () => {
        const bounds = localDayBounds(localDay('2026-11-25'), PARIS);

        expect(isoBounds(bounds)).toEqual(['2026-11-24T23:00:00.000Z', '2026-11-25T23:00:00.000Z']);
    });

    it('borne un jour d’été à Paris à l’heure d’été', () => {
        const bounds = localDayBounds(localDay('2026-07-14'), PARIS);

        expect(isoBounds(bounds)).toEqual(['2026-07-13T22:00:00.000Z', '2026-07-14T22:00:00.000Z']);
    });

    it('borne un jour UTC de minuit à minuit UTC', () => {
        const bounds = localDayBounds(localDay('2026-11-25'), UTC);

        expect(isoBounds(bounds)).toEqual(['2026-11-25T00:00:00.000Z', '2026-11-26T00:00:00.000Z']);
    });

    it('donne 23 h au jour du passage à l’heure d’été', () => {
        const bounds = localDayBounds(localDay('2026-03-29'), PARIS);

        expect(isoBounds(bounds)).toEqual(['2026-03-28T23:00:00.000Z', '2026-03-29T22:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(23);
    });

    it('donne 25 h au jour du passage à l’heure d’hiver', () => {
        const bounds = localDayBounds(localDay('2026-10-25'), PARIS);

        expect(isoBounds(bounds)).toEqual(['2026-10-24T22:00:00.000Z', '2026-10-25T23:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(25);
    });

    it('commence le jour au premier instant qui existe quand minuit est sauté', () => {
        // À Santiago, le 2026-09-06, l'horloge passe de 23:59:59 la veille à 01:00.
        const bounds = localDayBounds(localDay('2026-09-06'), SANTIAGO);

        expect(isoBounds(bounds)).toEqual(['2026-09-06T04:00:00.000Z', '2026-09-07T03:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(23);
    });

    it('finit le jour à son dernier minuit quand l’heure d’hiver revient à minuit', () => {
        // À Santiago, le 2026-04-05 à minuit, l'horloge revient à 23:00 le 2026-04-04.
        const bounds = localDayBounds(localDay('2026-04-04'), SANTIAGO);

        expect(isoBounds(bounds)).toEqual(['2026-04-04T03:00:00.000Z', '2026-04-05T04:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(25);
    });

    it('commence le jour au premier minuit quand minuit revient deux fois', () => {
        // À La Havane, le 2025-11-02, l'horloge revient de 00:59:59 à 00:00.
        const bounds = localDayBounds(localDay('2025-11-02'), HAVANA);

        expect(isoBounds(bounds)).toEqual(['2025-11-02T04:00:00.000Z', '2025-11-03T05:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(25);
    });

    it('commence le jour au changement d’heure quand le saut enjambe minuit', () => {
        const bounds = localDayBounds(localDay('1919-03-31'), TORONTO);

        expect(isoBounds(bounds)).toEqual(['1919-03-31T04:30:00.000Z', '1919-04-01T04:00:00.000Z']);
        expect(durationInHours(bounds)).toBe(23.5);
    });

    it('borne le premier jour de la plage', () => {
        const bounds = localDayBounds(localDay('1000-01-01'), UTC);

        expect(isoBounds(bounds)).toEqual(['1000-01-01T00:00:00.000Z', '1000-01-02T00:00:00.000Z']);
    });

    it('borne le dernier jour de la plage, dont le lendemain en sort', () => {
        const bounds = localDayBounds(localDay('9999-12-31'), UTC);

        expect(isoBounds(bounds)).toEqual([
            '9999-12-31T00:00:00.000Z',
            '+010000-01-01T00:00:00.000Z',
        ]);
    });

    it('enchaîne le dernier jour de l’année sur le premier de la suivante', () => {
        const lastDay = localDayBounds(localDay('2026-12-31'), PARIS);
        const firstDay = localDayBounds(localDay('2027-01-01'), PARIS);

        expect(lastDay.end).toEqual(firstDay.start);
        expect(lastDay.end.toISOString()).toBe('2026-12-31T23:00:00.000Z');
    });

    it('enchaîne le 28 février sur le 29 d’une année bissextile', () => {
        const february28 = localDayBounds(localDay('2028-02-28'), PARIS);
        const february29 = localDayBounds(localDay('2028-02-29'), PARIS);

        expect(february28.end).toEqual(february29.start);
    });

    it('rend des bornes cohérentes avec localDayOf : début inclus, fin exclue', () => {
        const day = localDay('2026-10-25');
        const { start, end } = localDayBounds(day, PARIS);

        expect(localDayOf(start, PARIS)).toBe(day);
        expect(localDayOf(new Date(end.getTime() - 1), PARIS)).toBe(day);
        expect(localDayOf(end, PARIS)).toBe('2026-10-26');
    });
});
