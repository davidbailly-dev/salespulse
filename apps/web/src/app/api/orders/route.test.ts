import type { Order } from '@salespulse/contracts';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDataset } from '../../../lib/mock-data/store';
import { buildOrder } from '../../../lib/testing/builders';
import { GET } from './route';

// Le store remplacé : pas de génération du jeu complet, des commandes choisies par le test.
vi.mock('../../../lib/mock-data/store', () => ({ getDataset: vi.fn() }));

const ORDERS = [
    buildOrder({ id: 'order-a', shopId: 'shop-a', date: '2026-01-10T00:00:00.000Z' }),
    buildOrder({ id: 'order-b', shopId: 'shop-b', date: '2026-01-15T12:00:00.000Z' }),
    buildOrder({ id: 'order-c', shopId: 'shop-a', date: '2026-01-20T23:59:59.999Z' }),
];

function serveOrders(orders: Order[]): void {
    vi.mocked(getDataset).mockReturnValue({ shops: [], products: [], customers: [], orders });
}

/** Appelle la route avec la query string donnée et renvoie les identifiants des commandes. */
async function fetchOrderIds(query = ''): Promise<string[]> {
    const response = await GET(new NextRequest(`http://localhost/api/orders${query}`));
    const orders = (await response.json()) as Order[];
    return orders.map((order) => order.id);
}

describe('GET /api/orders', () => {
    beforeEach(() => {
        serveOrders(ORDERS);
    });

    it('renvoie toutes les commandes sans paramètre', async () => {
        expect(await fetchOrderIds()).toEqual(['order-a', 'order-b', 'order-c']);
    });

    it('ne renvoie que les commandes de la boutique demandée', async () => {
        expect(await fetchOrderIds('?shop=shop-a')).toEqual(['order-a', 'order-c']);
    });

    it('inclut les commandes passées pile aux bornes `from` et `to`', async () => {
        const query = '?from=2026-01-15T12:00:00.000Z&to=2026-01-20T23:59:59.999Z';

        expect(await fetchOrderIds(query)).toEqual(['order-b', 'order-c']);
    });

    it('exclut les commandes hors de la plage', async () => {
        const query = '?from=2026-01-10T00:00:00.001Z&to=2026-01-20T23:59:59.998Z';

        expect(await fetchOrderIds(query)).toEqual(['order-b']);
    });

    it('refuse de renvoyer une commande hors contrat', async () => {
        serveOrders([{ ...buildOrder(), status: 'lost-in-transit' } as unknown as Order]);

        await expect(GET(new NextRequest('http://localhost/api/orders'))).rejects.toThrow();
    });
});
