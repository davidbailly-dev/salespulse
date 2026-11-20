import type { Order } from '@salespulse/contracts';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOrder } from '../testing/builders';
import { setSearchParams } from '../testing/nextNavigation';
import { createQueryWrapper } from '../testing/react';
import { useComparedKpi } from './useComparedKpi';
import { useOrders } from './useOrders';

vi.mock('next/navigation', () => import('../testing/nextNavigation'));

const NOW = new Date('2026-03-15T10:00:00.000Z');
const CURRENT_ORDERS = [buildOrder({ id: 'order-1' }), buildOrder({ id: 'order-2' }), buildOrder({ id: 'order-3' })];
const PREVIOUS_ORDERS = [buildOrder({ id: 'order-0' }), buildOrder({ id: 'order-00' })];

const fetchMock = vi.fn<typeof fetch>();

function countOrders(orders: Order[]): number {
    return orders.length;
}

/** Simule l'API : commandes de la période courante (2026) ou de la période N-1 (2025). */
function serveOrders({ previous }: { previous: 'loaded' | 'pending' }) {
    fetchMock.mockImplementation((input) => {
        const from = new URL(String(input), 'http://localhost').searchParams.get('from') ?? '';
        if (from.startsWith('2026')) return Promise.resolve(Response.json(CURRENT_ORDERS));
        // Réponse N-1 qui n'arrive jamais : la période de comparaison reste en chargement.
        if (previous === 'pending') return new Promise<Response>(() => {});
        return Promise.resolve(Response.json(PREVIOUS_ORDERS));
    });
}

function renderComparedOrderCount() {
    return renderHook(() => useComparedKpi(useOrders, countOrders), { wrapper: createQueryWrapper() });
}

describe('useComparedKpi', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(NOW);
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.useRealTimers();
    });

    it('laisse `previousValue` à `undefined` sans comparaison, sans lancer la requête N-1', async () => {
        setSearchParams('preset=30d');
        serveOrders({ previous: 'loaded' });

        const { result } = renderComparedOrderCount();
        await waitFor(() => expect(result.current.value).toBe(3));

        expect(result.current.previousValue).toBeUndefined();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('met `previousValue` à `null` tant que la période N-1 n\'est pas chargée', async () => {
        setSearchParams('preset=30d&compare=yoy');
        serveOrders({ previous: 'pending' });

        const { result } = renderComparedOrderCount();
        await waitFor(() => expect(result.current.value).toBe(3));

        expect(result.current.previousValue).toBeNull();
    });

    it('calcule `previousValue` avec la même fonction une fois la période N-1 chargée', async () => {
        setSearchParams('preset=30d&compare=yoy');
        serveOrders({ previous: 'loaded' });

        const { result } = renderComparedOrderCount();

        await waitFor(() => expect(result.current.previousValue).toBe(2));
        expect(result.current.value).toBe(3);
    });
});
