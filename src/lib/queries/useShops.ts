import { useQuery } from '@tanstack/react-query';
import { ShopListSchema, type Shop } from '../mock-data/schemas';

async function fetchShops(): Promise<Shop[]> {
    const response = await fetch('/api/shops');

    if (!response.ok) {
        throw new Error(`Failed to fetch shops: ${response.status}`);
    }

    return ShopListSchema.parse(await response.json());
}

export function useShops() {
    return useQuery({
        queryKey: ['shops'],
        queryFn: fetchShops,
    });
}
