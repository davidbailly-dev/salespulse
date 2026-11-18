import { Order } from '../mock-data/schemas';

/**
 * Option A (voir CLAUDE.md) : un client est "récurrent" s'il a ≥2 commandes completed
 * dans le dataset courant. Pondération en % de commandes (pas de clients, ni de CA).
 */
export function calculateRecurringOrdersRate(orders: Order[]): number {
    const completedOrders = orders.filter((order) => order.status === 'completed');
    if (completedOrders.length === 0) return 0;

    const completedOrderCountByCustomer = new Map<string, number>();
    completedOrders.forEach((order) => {
        completedOrderCountByCustomer.set(
            order.customerId,
            (completedOrderCountByCustomer.get(order.customerId) ?? 0) + 1,
        );
    });

    const recurringOrdersCount = completedOrders.filter(
        (order) => (completedOrderCountByCustomer.get(order.customerId) ?? 0) >= 2,
    ).length;

    return Math.round((recurringOrdersCount / completedOrders.length) * 100);
}
