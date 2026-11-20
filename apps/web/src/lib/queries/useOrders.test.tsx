import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildOrder } from '../testing/builders';
import { setSearchParams } from '../testing/nextNavigation';
import { createQueryWrapper } from '../testing/react';
import { useOrders } from './useOrders';

vi.mock('next/navigation', () => import('../testing/nextNavigation'));

const RANGE = { from: '2026-01-01T00:00:00.000Z', to: '2026-01-31T23:59:59.999Z' };

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

/** URL du premier appel à `fetch`, résolue pour en lire le chemin et les paramètres. */
function firstFetchedUrl(): URL {
    return new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost');
}

describe('useOrders', () => {
    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal('fetch', fetchMock);
        setSearchParams('');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('demande `/api/orders` avec la plage et la boutique lue dans `?shop=`', async () => {
        setSearchParams('shop=shop-a');
        fetchMock.mockResolvedValue(jsonResponse([]));

        const { result } = renderHook(() => useOrders(RANGE), { wrapper: createQueryWrapper() });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const url = firstFetchedUrl();
        expect(url.pathname).toBe('/api/orders');
        expect(Object.fromEntries(url.searchParams)).toEqual({ ...RANGE, shop: 'shop-a' });
    });

    it('n\'envoie aucun paramètre `shop` sans boutique sélectionnée', async () => {
        fetchMock.mockResolvedValue(jsonResponse([]));

        const { result } = renderHook(() => useOrders(RANGE), { wrapper: createQueryWrapper() });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(firstFetchedUrl().searchParams.has('shop')).toBe(false);
    });

    it('renvoie les commandes reçues une fois validées', async () => {
        const orders = [buildOrder({ id: 'order-1' }), buildOrder({ id: 'order-2' })];
        fetchMock.mockResolvedValue(jsonResponse(orders));

        const { result } = renderHook(() => useOrders(RANGE), { wrapper: createQueryWrapper() });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(orders);
    });

    it('passe en erreur sur une réponse HTTP en erreur, même au corps conforme au schéma', async () => {
        // Corps valide : seul le statut peut faire échouer la requête.
        fetchMock.mockResolvedValue(jsonResponse([], 500));

        const { result } = renderHook(() => useOrders(RANGE), { wrapper: createQueryWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('passe en erreur sur une réponse qui ne respecte pas le schéma', async () => {
        fetchMock.mockResolvedValue(jsonResponse([{ id: 'order-1', total: 'cent euros' }]));

        const { result } = renderHook(() => useOrders(RANGE), { wrapper: createQueryWrapper() });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('ne lance aucune requête avec `enabled: false`', () => {
        const { result } = renderHook(() => useOrders(RANGE, { enabled: false }), {
            wrapper: createQueryWrapper(),
        });

        expect(result.current.fetchStatus).toBe('idle');
        expect(fetchMock).not.toHaveBeenCalled();
    });
});
