import { useQuery } from '@tanstack/react-query';
import { ProductListSchema, type Product } from '../mock-data/schemas';

async function fetchProducts(): Promise<Product[]> {
    const response = await fetch('/api/products');

    if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
    }

    return ProductListSchema.parse(await response.json());
}

export function useProducts() {
    return useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts,
    });
}
