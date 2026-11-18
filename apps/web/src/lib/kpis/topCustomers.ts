import { Order } from '../mock-data/schemas';

export type CustomerAggregate = {
    customerId: string;
    revenue: number;
};

export function calculateTopCustomers(orders: Order[], limit = 5): CustomerAggregate[] {
    const revenueByCustomer = new Map<string, number>();

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            revenueByCustomer.set(
                order.customerId,
                (revenueByCustomer.get(order.customerId) ?? 0) + order.totalAmount,
            );
        });

    return Array.from(revenueByCustomer.entries())
        .map(([customerId, revenue]) => ({ customerId, revenue: Math.round(revenue) }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);
}
