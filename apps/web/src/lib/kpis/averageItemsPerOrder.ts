import { Order } from '../mock-data/schemas';
import { calculateTotalOrders } from './totalOrders';

export function calculateAverageItemsPerOrder(orders: Order[]): number {
    const completedOrders = orders.filter((order) => order.status === 'completed');
    const totalOrders = calculateTotalOrders(orders);

    if (totalOrders === 0) return 0;

    const totalItems = completedOrders.reduce(
        (acc, order) => acc + order.lines.reduce((lineAcc, line) => lineAcc + line.quantity, 0),
        0,
    );

    return Number((totalItems / totalOrders).toFixed(1));
}
