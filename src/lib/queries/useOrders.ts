import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { OrderListSchema, type Order } from '../mock-data/schemas';

export type OrderDateRange = {
    from?: string;
    to?: string;
};

async function fetchOrders(dateRange?: OrderDateRange, shopId?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.set('from', dateRange.from);
    if (dateRange?.to) params.set('to', dateRange.to);
    if (shopId) params.set('shop', shopId);

    const query = params.toString();
    const response = await fetch(`/api/orders${query ? `?${query}` : ''}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    return OrderListSchema.parse(await response.json());
}

// La boutique est lue ici (et non passée par chaque composant KPI) : c'est un contexte
// global de l'URL, un seul point d'entrée pour tous les hooks de données.
export function useOrders(dateRange?: OrderDateRange) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['orders', dateRange, shopId],
        queryFn: () => fetchOrders(dateRange, shopId),
    });
}
