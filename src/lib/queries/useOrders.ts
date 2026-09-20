import { useQuery } from '@tanstack/react-query';
import { OrderListSchema, type Order } from '../mock-data/schemas';

export type OrderDateRange = {
    from?: string;
    to?: string;
};

async function fetchOrders(dateRange?: OrderDateRange): Promise<Order[]> {
    const params = new URLSearchParams();
    if (dateRange?.from) params.set('from', dateRange.from);
    if (dateRange?.to) params.set('to', dateRange.to);

    const query = params.toString();
    const response = await fetch(`/api/orders${query ? `?${query}` : ''}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    return OrderListSchema.parse(await response.json());
}

export function useOrders(dateRange?: OrderDateRange) {
    return useQuery({
        queryKey: ['orders', dateRange],
        queryFn: () => fetchOrders(dateRange),
    });
}
