import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setSearchParams } from '../testing/nextNavigation';
import { useDateRangeFilter } from './useDateRangeFilter';

vi.mock('next/navigation', () => import('../testing/nextNavigation'));

const NOW = new Date('2026-03-15T10:00:00.000Z');

describe('useDateRangeFilter', () => {
    beforeEach(() => {
        // Seule l'horloge est simulée : les minuteries restent réelles.
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW);
        setSearchParams('');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('reprend telles quelles les bornes `from` et `to` de l\'URL', () => {
        setSearchParams('from=2026-01-01T00:00:00.000Z&to=2026-01-31T23:59:59.999Z&preset=7d');

        const { result } = renderHook(() => useDateRangeFilter());

        expect(result.current).toEqual({ from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T23:59:59.999Z' });
    });

    it('applique le preset de l\'URL', () => {
        setSearchParams('preset=7d');

        const { result } = renderHook(() => useDateRangeFilter());

        expect(result.current).toEqual({ from: '2026-03-08T10:00:00.000Z', to: '2026-03-15T10:00:00.000Z' });
    });

    it.each([
        ['absent', ''],
        ['invalide', 'preset=365d'],
        ['accompagné d\'une seule borne', 'from=2026-01-01T00:00:00.000Z'],
    ])('applique le preset par défaut (30 jours) quand le preset est %s', (_label, query) => {
        setSearchParams(query);

        const { result } = renderHook(() => useDateRangeFilter());

        expect(result.current).toEqual({ from: '2026-02-13T10:00:00.000Z', to: '2026-03-15T10:00:00.000Z' });
    });

    describe('quand l\'horloge avance entre deux rendus aux paramètres inchangés', () => {
        it('garde le même contenu, donc la même `queryKey`', () => {
            setSearchParams('preset=30d');
            const { result, rerender } = renderHook(() => useDateRangeFilter());
            const firstRange = { ...result.current };

            vi.setSystemTime(new Date(NOW.getTime() + 1_000));
            rerender();

            expect(result.current).toEqual(firstRange);
        });

        it('renvoie le même objet', () => {
            setSearchParams('preset=30d');
            const { result, rerender } = renderHook(() => useDateRangeFilter());
            const firstRange = result.current;

            vi.setSystemTime(new Date(NOW.getTime() + 1_000));
            rerender();

            expect(result.current).toBe(firstRange);
        });
    });

    it('recalcule la plage quand le preset change', () => {
        setSearchParams('preset=7d');
        const { result, rerender } = renderHook(() => useDateRangeFilter());

        setSearchParams('preset=90d');
        rerender();

        expect(result.current).toEqual({ from: '2025-12-15T10:00:00.000Z', to: '2026-03-15T10:00:00.000Z' });
    });
});
