import { Customer, Order } from '../mock-data/schemas';

export function calculateCustomerActivationRate(orders: Order[], customers: Customer[]): number {
    if (customers.length === 0) return 0;

    const activeCustomerIds = new Set(
        orders.filter((order) => order.status === 'completed').map((order) => order.customerId),
    );

    return Math.round((activeCustomerIds.size / customers.length) * 100);
}
