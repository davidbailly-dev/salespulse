import { useQuery } from '@tanstack/react-query';
import { CustomerListSchema, type Customer } from '../mock-data/schemas';

async function fetchCustomers(): Promise<Customer[]> {
    const response = await fetch('/api/customers');

    if (!response.ok) {
        throw new Error(`Failed to fetch customers: ${response.status}`);
    }

    return CustomerListSchema.parse(await response.json());
}

export function useCustomers() {
    return useQuery({
        queryKey: ['customers'],
        queryFn: fetchCustomers,
    });
}
