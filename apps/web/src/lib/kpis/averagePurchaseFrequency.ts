import { Order } from '../mock-data/schemas';

export function calculateAveragePurchaseFrequency(orders: Order[]): number {
    const completedOrders = orders.filter((order) => order.status === 'completed');
    const activeCustomerIds = new Set(completedOrders.map((order) => order.customerId));
    if (activeCustomerIds.size === 0) return 0;

    return Number((completedOrders.length / activeCustomerIds.size).toFixed(1));
}
