import { Order } from '@salespulse/contracts';
import { calculateRevenue } from './revenue';

export function calculateAverageRevenuePerActiveCustomer(orders: Order[]): number {
    const activeCustomerIds = new Set(
        orders.filter((order) => order.status === 'completed').map((order) => order.customerId),
    );
    if (activeCustomerIds.size === 0) return 0;

    return Math.round(calculateRevenue(orders) / activeCustomerIds.size);
}
