import { Order } from '../mock-data/schemas';

/**
 * Prix pondéré par les quantités réellement vendues (commandes completed),
 * différent d'une simple moyenne des prix catalogue.
 */
export function calculateAverageSellingPrice(orders: Order[]): number {
    const completedLines = orders
        .filter((order) => order.status === 'completed')
        .flatMap((order) => order.lines);

    const totalQuantity = completedLines.reduce((acc, line) => acc + line.quantity, 0);
    if (totalQuantity === 0) return 0;

    const totalRevenue = completedLines.reduce((acc, line) => acc + line.quantity * line.unitPrice, 0);

    return Number((totalRevenue / totalQuantity).toFixed(2));
}
