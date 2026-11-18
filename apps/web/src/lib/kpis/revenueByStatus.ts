import { Order, OrderStatus } from '../mock-data/schemas';

export type StatusRevenue = {
    status: OrderStatus;
    revenue: number;
};

const ALL_STATUSES: OrderStatus[] = ['completed', 'abandoned', 'refunded'];

/**
 * Contrairement à calculateRevenue (uniquement completed), ventile le CA sur les
 * 3 statuts pour donner une vue d'ensemble de la répartition des commandes.
 */
export function calculateRevenueByStatus(orders: Order[]): StatusRevenue[] {
    const revenueByStatus = new Map<OrderStatus, number>(ALL_STATUSES.map((status) => [status, 0]));

    orders.forEach((order) => {
        revenueByStatus.set(order.status, (revenueByStatus.get(order.status) ?? 0) + order.totalAmount);
    });

    return ALL_STATUSES.map((status) => ({
        status,
        revenue: Math.round(revenueByStatus.get(status) ?? 0),
    }));
}
