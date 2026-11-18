import { Order } from '@salespulse/contracts';

export function calculateTotalOrders(orders: Order[]): number {
    const totalOrders = orders.filter((order) => order.status === 'completed');

    return Number(totalOrders.length);
}