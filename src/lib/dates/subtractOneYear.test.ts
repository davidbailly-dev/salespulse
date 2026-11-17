import { describe, expect, it } from 'vitest';
import { subtractOneYear } from './subtractOneYear';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('subtractOneYear', () => {
    it('recule d\'un an calendaire en conservant le jour et l\'heure', () => {
        const result = subtractOneYear(new Date('2026-06-15T10:30:00.000Z'));

        expect(result.toISOString()).toBe('2025-06-15T10:30:00.000Z');
    });

    it('conserve les millisecondes', () => {
        const result = subtractOneYear(new Date('2026-01-15T23:59:59.999Z'));

        expect(result.toISOString()).toBe('2025-01-15T23:59:59.999Z');
    });

    it('enjambe le changement d\'année', () => {
        const result = subtractOneYear(new Date('2026-01-01T00:00:00.000Z'));

        expect(result.toISOString()).toBe('2025-01-01T00:00:00.000Z');
    });

    it('ne modifie pas la date reçue et renvoie une nouvelle instance', () => {
        const original = new Date('2026-06-15T10:30:00.000Z');
        const result = subtractOneYear(original);

        expect(result).not.toBe(original);
        expect(original.toISOString()).toBe('2026-06-15T10:30:00.000Z');
    });

    describe('années bissextiles', () => {
        // Et non au 1er mars (comportement natif de `Date`), qui ferait déborder "février" sur mars.
        it('fait reculer le 29 février au 28 février de l\'année précédente, à la même heure', () => {
            const result = subtractOneYear(new Date('2024-02-29T12:00:00.000Z'));

            expect(result.toISOString()).toBe('2023-02-28T12:00:00.000Z');
        });

        it('fait reculer le 29 février au 28 février jusqu\'à la dernière milliseconde', () => {
            const result = subtractOneYear(new Date('2024-02-29T23:59:59.999Z'));

            expect(result.toISOString()).toBe('2023-02-28T23:59:59.999Z');
        });

        it('conserve le 28 février tel quel', () => {
            const result = subtractOneYear(new Date('2024-02-28T12:00:00.000Z'));

            expect(result.toISOString()).toBe('2023-02-28T12:00:00.000Z');
        });

        it('conserve le 28 février quand l\'année précédente est bissextile', () => {
            const result = subtractOneYear(new Date('2025-02-28T12:00:00.000Z'));

            expect(result.toISOString()).toBe('2024-02-28T12:00:00.000Z');
        });

        it('décale de 366 jours (et non 365) quand le 29 février est enjambé', () => {
            const current = new Date('2024-03-01T00:00:00.000Z');
            const shifted = subtractOneYear(current);

            expect((current.getTime() - shifted.getTime()) / MS_PER_DAY).toBe(366);
        });

        it('décale de 365 jours quand aucun 29 février n\'est enjambé', () => {
            const current = new Date('2025-03-01T00:00:00.000Z');
            const shifted = subtractOneYear(current);

            expect((current.getTime() - shifted.getTime()) / MS_PER_DAY).toBe(365);
        });

        it('décale de 366 jours depuis la fin d\'une année bissextile', () => {
            const current = new Date('2024-12-31T00:00:00.000Z');
            const shifted = subtractOneYear(current);

            expect(shifted.toISOString()).toBe('2023-12-31T00:00:00.000Z');
            expect((current.getTime() - shifted.getTime()) / MS_PER_DAY).toBe(366);
        });
    });
});
