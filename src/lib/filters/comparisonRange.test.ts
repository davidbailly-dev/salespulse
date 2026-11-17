import { describe, expect, it } from 'vitest';
import { COMPARISON_MODES, isValidComparisonMode, resolveComparisonRange } from './comparisonRange';

describe('resolveComparisonRange', () => {
    describe('mode yoy (N-1)', () => {
        it('recule les deux bornes d\'un an calendaire', () => {
            const range = { from: '2026-02-13T14:30:00.000Z', to: '2026-03-15T14:30:00.000Z' };

            expect(resolveComparisonRange(range, 'yoy')).toEqual({
                from: '2025-02-13T14:30:00.000Z',
                to: '2025-03-15T14:30:00.000Z',
            });
        });

        it('conserve l\'heure et les millisecondes des bornes', () => {
            const range = { from: '2026-04-01T00:00:00.000Z', to: '2026-04-30T23:59:59.999Z' };

            expect(resolveComparisonRange(range, 'yoy')).toEqual({
                from: '2025-04-01T00:00:00.000Z',
                to: '2025-04-30T23:59:59.999Z',
            });
        });

        describe('bornes absentes', () => {
            it('laisse `from` indéfini quand il est absent', () => {
                const result = resolveComparisonRange({ to: '2026-03-15T14:30:00.000Z' }, 'yoy');

                expect(result.from).toBeUndefined();
                expect(result.to).toBe('2025-03-15T14:30:00.000Z');
            });

            it('laisse `to` indéfini quand il est absent', () => {
                const result = resolveComparisonRange({ from: '2026-02-13T14:30:00.000Z' }, 'yoy');

                expect(result.from).toBe('2025-02-13T14:30:00.000Z');
                expect(result.to).toBeUndefined();
            });

            it('renvoie une plage sans borne quand aucune n\'est fournie', () => {
                const result = resolveComparisonRange({}, 'yoy');

                expect(result.from).toBeUndefined();
                expect(result.to).toBeUndefined();
            });

            it('traite une chaîne vide comme une borne absente', () => {
                const result = resolveComparisonRange({ from: '', to: '' }, 'yoy');

                expect(result.from).toBeUndefined();
                expect(result.to).toBeUndefined();
            });
        });

        describe('années bissextiles', () => {
            it('décale un mois entier "février 2025" vers "février 2024" (jusqu\'au 28)', () => {
                const range = { from: '2025-02-01T00:00:00.000Z', to: '2025-02-28T23:59:59.999Z' };

                expect(resolveComparisonRange(range, 'yoy')).toEqual({
                    from: '2024-02-01T00:00:00.000Z',
                    to: '2024-02-28T23:59:59.999Z',
                });
            });

            // Comportement natif de `Date` assumé (voir subtractOneYear) : la borne haute du
            // 29 février 2024 retombe le 1er mars 2023, donc la plage N-1 déborde d'un jour.
            it('fait retomber le 29 février au 1er mars de l\'année précédente', () => {
                const range = { from: '2024-02-01T00:00:00.000Z', to: '2024-02-29T23:59:59.999Z' };

                expect(resolveComparisonRange(range, 'yoy')).toEqual({
                    from: '2023-02-01T00:00:00.000Z',
                    to: '2023-03-01T23:59:59.999Z',
                });
            });
        });

        it('ne modifie pas la plage reçue', () => {
            const range = { from: '2026-02-13T14:30:00.000Z', to: '2026-03-15T14:30:00.000Z' };

            resolveComparisonRange(range, 'yoy');

            expect(range).toEqual({ from: '2026-02-13T14:30:00.000Z', to: '2026-03-15T14:30:00.000Z' });
        });
    });
});

describe('isValidComparisonMode', () => {
    it('accepte "yoy"', () => {
        expect(isValidComparisonMode('yoy')).toBe(true);
    });

    it.each([null, '', 'YOY', 'mom', 'previous'])('refuse %j', (value) => {
        expect(isValidComparisonMode(value)).toBe(false);
    });

    it('accepte chaque mode déclaré dans COMPARISON_MODES', () => {
        COMPARISON_MODES.forEach((mode) => expect(isValidComparisonMode(mode.id)).toBe(true));
    });
});
