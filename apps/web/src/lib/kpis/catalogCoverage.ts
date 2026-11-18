import { Order, Product } from '../mock-data/schemas';

export function calculateCatalogCoverage(orders: Order[], products: Product[]): number {
    if (products.length === 0) return 0;

    const soldProductIds = new Set<string>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            order.lines.forEach((line) => soldProductIds.add(line.productId));
        });

    return Math.round((soldProductIds.size / products.length) * 100);
}
