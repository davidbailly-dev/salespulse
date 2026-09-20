import { Order } from '../mock-data/schemas';

export function calculateRevenue(orders: Order[]): number {
    const revenue = orders
        .filter((order) => order.status === 'completed')
        .reduce((acc, order) => acc + order.totalAmount, 0);

    return Math.round(revenue);
}