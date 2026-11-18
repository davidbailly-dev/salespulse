import { Customer, Order } from '../mock-data/schemas';

export type NeverConvertedCustomer = {
    customerId: string;
    name: string;
    registeredAt: string;
};

export function calculateNeverConvertedCustomers(
    orders: Order[],
    customers: Customer[],
    limit = 5,
): NeverConvertedCustomer[] {
    const activeCustomerIds = new Set(
        orders.filter((order) => order.status === 'completed').map((order) => order.customerId),
    );

    return customers
        .filter((customer) => !activeCustomerIds.has(customer.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit)
        .map((customer) => ({
            customerId: customer.id,
            name: customer.name,
            registeredAt: customer.registeredAt,
        }));
}
