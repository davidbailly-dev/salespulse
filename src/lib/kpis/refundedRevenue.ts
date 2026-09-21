import { Order } from '../mock-data/schemas';

export function calculateRefundedRevenue(orders: Order[]): number {
    const refundedRevenue = orders
        .filter((order) => order.status === 'refunded')
        .reduce((acc, order) => acc + order.totalAmount, 0);

    return Math.round(refundedRevenue);
}
