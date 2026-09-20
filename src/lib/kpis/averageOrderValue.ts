import { Order } from '../mock-data/schemas';
import { calculateRevenue } from './revenue';
import { calculateTotalOrders } from './totalOrders';

export function calculateAverageOrderValue(orders: Order[]): number {
    const revenue = calculateRevenue(orders);
    const totalOrders = calculateTotalOrders(orders);
    let averageOrderValue = 0;

    if (totalOrders > 0) {
        averageOrderValue = revenue / totalOrders;
    }

    return Number(averageOrderValue.toFixed(2));
}