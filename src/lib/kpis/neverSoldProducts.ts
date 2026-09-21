import { Order, Product } from '../mock-data/schemas';

export type NeverSoldProduct = {
    productId: string;
    name: string;
    category: Product['category'];
};

export function calculateNeverSoldProducts(orders: Order[], products: Product[], limit = 5): NeverSoldProduct[] {
    const soldProductIds = new Set<string>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            order.lines.forEach((line) => soldProductIds.add(line.productId));
        });

    return products
        .filter((product) => !soldProductIds.has(product.id))
        .sort((a, b) => a.name.localeCompare(b.name))
        .slice(0, limit)
        .map((product) => ({ productId: product.id, name: product.name, category: product.category }));
}
