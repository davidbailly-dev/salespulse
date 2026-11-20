import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setSearchParams } from '../testing/nextNavigation';
import { useComparisonRange } from './useComparisonRange';

vi.mock('next/navigation', () => import('../testing/nextNavigation'));

const NOW = new Date('2026-03-15T10:00:00.000Z');

describe('useComparisonRange', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it.each([
        ['absent', 'preset=30d'],
        ['invalide', 'preset=30d&compare=previous'],
    ])('renvoie `undefined` quand le mode de comparaison est %s', (_label, query) => {
        setSearchParams(query);

        const { result } = renderHook(() => useComparisonRange());

        expect(result.current).toBeUndefined();
    });

    it('renvoie la même plage un an plus tôt avec `compare=yoy`', () => {
        setSearchParams('preset=30d&compare=yoy');

        const { result } = renderHook(() => useComparisonRange());

        expect(result.current).toEqual({ from: '2025-02-13T10:00:00.000Z', to: '2025-03-15T10:00:00.000Z' });
    });

    describe('quand l\'horloge avance entre deux rendus aux paramètres inchangés', () => {
        it('garde le même contenu, donc la même `queryKey`', () => {
            setSearchParams('preset=30d&compare=yoy');
            const { result, rerender } = renderHook(() => useComparisonRange());
            const firstRange = { ...result.current };

            vi.setSystemTime(new Date(NOW.getTime() + 1_000));
            rerender();

            expect(result.current).toEqual(firstRange);
        });

        it('renvoie le même objet', () => {
            setSearchParams('preset=30d&compare=yoy');
            const { result, rerender } = renderHook(() => useComparisonRange());
            const firstRange = result.current;

            vi.setSystemTime(new Date(NOW.getTime() + 1_000));
            rerender();

            expect(result.current).toBe(firstRange);
        });
    });
});
