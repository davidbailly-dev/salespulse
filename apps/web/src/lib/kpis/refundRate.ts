import { Order } from '@salespulse/contracts';

export function calculateRefundRate(orders: Order[]): number {
    if (orders.length === 0) return 0;

    const refundedCount = orders.filter((order) => order.status === 'refunded').length;

    return Math.round((refundedCount / orders.length) * 100);
}
