import { Order } from '../mock-data/schemas';

export type CustomerOrderCount = {
    customerId: string;
    orderCount: number;
};

export function calculateTopCustomersByOrderCount(orders: Order[], limit = 5): CustomerOrderCount[] {
    const orderCountByCustomer = new Map<string, number>();

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            orderCountByCustomer.set(order.customerId, (orderCountByCustomer.get(order.customerId) ?? 0) + 1);
        });

    return Array.from(orderCountByCustomer.entries())
        .map(([customerId, orderCount]) => ({ customerId, orderCount }))
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, limit);
}
