import { Order } from '../mock-data/schemas';

/**
 * Taux de réachat : % de clients ayant au moins une commande completed qui en ont passé
 * au moins deux (sur la période filtrée). Pondération en clients, contrairement à
 * `calculateRecurringOrdersRate` qui pondère en commandes.
 */
export function calculateRepurchaseRate(orders: Order[]): number {
    const completedOrderCountByCustomer = new Map<string, number>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            completedOrderCountByCustomer.set(
                order.customerId,
                (completedOrderCountByCustomer.get(order.customerId) ?? 0) + 1,
            );
        });

    if (completedOrderCountByCustomer.size === 0) return 0;

    const repurchasingCustomersCount = [...completedOrderCountByCustomer.values()].filter(
        (orderCount) => orderCount >= 2,
    ).length;

    return Math.round((repurchasingCustomersCount / completedOrderCountByCustomer.size) * 100);
}
