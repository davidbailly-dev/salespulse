import { Order } from '../mock-data/schemas';

export function calculateAbandonedCartsRate(orders: Order[]): number {
    if (orders.length === 0) return 0;

    const abandonedCount = orders.filter((order) => order.status === 'abandoned').length;

    return Math.round((abandonedCount / orders.length) * 100);
}
