import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { CustomerListSchema, type Customer } from '../mock-data/schemas';

async function fetchCustomers(shopId?: string): Promise<Customer[]> {
    const query = shopId ? `?shop=${encodeURIComponent(shopId)}` : '';
    const response = await fetch(`/api/customers${query}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    return CustomerListSchema.parse(await response.json());
}

export function useCustomers() {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['customers', shopId],
        queryFn: () => fetchCustomers(shopId),
    });
}
