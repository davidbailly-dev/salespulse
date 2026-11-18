import { Category, Order, Product } from '../mock-data/schemas';

export type CategoryAggregate = {
    category: Category;
    quantity: number;
    revenue: number;
};

export type TopCategoriesMetric = 'quantity' | 'revenue';

export function calculateTopCategories(
    orders: Order[],
    products: Product[],
    metric: TopCategoriesMetric,
    limit = 5,
): CategoryAggregate[] {
    // La catégorie vit sur Product, pas sur OrderLine : contrairement à calculateTopProducts,
    // la jointure avec les produits est nécessaire dès le calcul de l'agrégat.
    const productsById = new Map(products.map((product) => [product.id, product]));
    const aggregates = new Map<Category, CategoryAggregate>();

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            order.lines.forEach((line) => {
                const product = productsById.get(line.productId);
                if (!product) return;

                const aggregate = aggregates.get(product.category) ?? {
                    category: product.category,
                    quantity: 0,
                    revenue: 0,
                };

                aggregate.quantity += line.quantity;
                aggregate.revenue += line.quantity * line.unitPrice;
                aggregates.set(product.category, aggregate);
            });
        });

    return Array.from(aggregates.values())
        .map((aggregate) => ({ ...aggregate, revenue: Math.round(aggregate.revenue) }))
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, limit);
}
