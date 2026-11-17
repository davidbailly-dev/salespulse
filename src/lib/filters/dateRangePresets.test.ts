import { afterEach, describe, expect, it, vi } from 'vitest';
import { DATE_RANGE_PRESETS, DEFAULT_PRESET, isValidPreset, resolvePresetRange } from './dateRangePresets';

// Mi-mars 2026 (année non bissextile), en milieu de journée pour vérifier que l'heure est conservée.
const NOW = new Date('2026-03-15T14:30:00.000Z');

describe('resolvePresetRange', () => {
    describe('plages glissantes', () => {
        it.each([
            ['7d', '2026-03-08T14:30:00.000Z'],
            ['30d', '2026-02-13T14:30:00.000Z'],
            ['90d', '2025-12-15T14:30:00.000Z'],
        ] as const)('%s : remonte à %s et finit à l\'instant courant', (presetId, expectedFrom) => {
            expect(resolvePresetRange(presetId, NOW)).toEqual({
                from: expectedFrom,
                to: '2026-03-15T14:30:00.000Z',
            });
        });

        it('enjambe le changement d\'année', () => {
            const range = resolvePresetRange('30d', new Date('2026-01-10T08:00:00.000Z'));

            expect(range.from).toBe('2025-12-11T08:00:00.000Z');
        });

        it('compte 29 jours de février dans une année bissextile', () => {
            const range = resolvePresetRange('30d', new Date('2024-03-15T00:00:00.000Z'));

            expect(range.from).toBe('2024-02-14T00:00:00.000Z');
        });
    });

    describe('month (mois en cours)', () => {
        it('commence au 1er du mois à minuit UTC et finit à l\'instant courant', () => {
            expect(resolvePresetRange('month', NOW)).toEqual({
                from: '2026-03-01T00:00:00.000Z',
                to: '2026-03-15T14:30:00.000Z',
            });
        });

        it('donne une plage vide au tout début du mois', () => {
            const now = new Date('2026-03-01T00:00:00.000Z');

            expect(resolvePresetRange('month', now)).toEqual({
                from: '2026-03-01T00:00:00.000Z',
                to: '2026-03-01T00:00:00.000Z',
            });
        });
    });

    describe('lastMonth (mois dernier)', () => {
        it('couvre le mois précédent entier, de son 1er minuit à sa dernière milliseconde', () => {
            expect(resolvePresetRange('lastMonth', new Date('2026-05-20T10:00:00.000Z'))).toEqual({
                from: '2026-04-01T00:00:00.000Z',
                to: '2026-04-30T23:59:59.999Z',
            });
        });

        it('retombe en décembre de l\'année précédente quand on est en janvier', () => {
            expect(resolvePresetRange('lastMonth', new Date('2026-01-10T10:00:00.000Z'))).toEqual({
                from: '2025-12-01T00:00:00.000Z',
                to: '2025-12-31T23:59:59.999Z',
            });
        });

        it('finit le 28 février en mars d\'une année non bissextile', () => {
            expect(resolvePresetRange('lastMonth', new Date('2023-03-10T10:00:00.000Z'))).toEqual({
                from: '2023-02-01T00:00:00.000Z',
                to: '2023-02-28T23:59:59.999Z',
            });
        });

        it('finit le 29 février en mars d\'une année bissextile', () => {
            expect(resolvePresetRange('lastMonth', new Date('2024-03-10T10:00:00.000Z'))).toEqual({
                from: '2024-02-01T00:00:00.000Z',
                to: '2024-02-29T23:59:59.999Z',
            });
        });

        it('ne déborde pas quand le jour courant (31) n\'existe pas le mois précédent', () => {
            expect(resolvePresetRange('lastMonth', new Date('2026-03-31T10:00:00.000Z'))).toEqual({
                from: '2026-02-01T00:00:00.000Z',
                to: '2026-02-28T23:59:59.999Z',
            });
        });

        it('ne dépend pas de l\'heure courante', () => {
            const morning = resolvePresetRange('lastMonth', new Date('2026-05-20T00:00:00.000Z'));
            const evening = resolvePresetRange('lastMonth', new Date('2026-05-20T23:59:59.999Z'));

            expect(morning).toEqual(evening);
        });
    });

    it('ne modifie pas la date reçue', () => {
        const now = new Date('2026-03-15T14:30:00.000Z');

        (['7d', '30d', '90d', 'month', 'lastMonth'] as const).forEach((presetId) => resolvePresetRange(presetId, now));

        expect(now.toISOString()).toBe('2026-03-15T14:30:00.000Z');
    });

    describe('instant courant par défaut', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('utilise l\'horloge système quand `now` est omis', () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-03-15T14:30:00.000Z'));

            expect(resolvePresetRange('7d')).toEqual({
                from: '2026-03-08T14:30:00.000Z',
                to: '2026-03-15T14:30:00.000Z',
            });
        });
    });
});

describe('isValidPreset', () => {
    it.each(['7d', '30d', '90d', 'month', 'lastMonth'])('accepte "%s"', (value) => {
        expect(isValidPreset(value)).toBe(true);
    });

    it.each([null, '', '14d', '7D', 'yoy', 'last month'])('refuse %j', (value) => {
        expect(isValidPreset(value)).toBe(false);
    });
});

describe('constantes', () => {
    it('définit un preset par défaut valide', () => {
        expect(isValidPreset(DEFAULT_PRESET)).toBe(true);
    });

    it('propose chaque preset une seule fois', () => {
        const ids = DATE_RANGE_PRESETS.map((preset) => preset.id);

        expect(new Set(ids).size).toBe(ids.length);
    });
});
