import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { ProductListSchema, type Product } from '../mock-data/schemas';

async function fetchProducts(shopId?: string): Promise<Product[]> {
    const query = shopId ? `?shop=${encodeURIComponent(shopId)}` : '';
    const response = await fetch(`/api/products${query}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return ProductListSchema.parse(await response.json());
}

export function useProducts() {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['products', shopId],
        queryFn: () => fetchProducts(shopId),
    });
}
