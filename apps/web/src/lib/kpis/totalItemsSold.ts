import { Order } from '../mock-data/schemas';

export function calculateTotalItemsSold(orders: Order[]): number {
    return orders
        .filter((order) => order.status === 'completed')
        .reduce((acc, order) => acc + order.lines.reduce((lineAcc, line) => lineAcc + line.quantity, 0), 0);
}
