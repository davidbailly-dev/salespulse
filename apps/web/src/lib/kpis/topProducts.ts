import { Order } from '../mock-data/schemas';

export type ProductAggregate = {
    productId: string;
    quantity: number;
    revenue: number;
};

export type TopProductsMetric = 'quantity' | 'revenue';

export function calculateTopProducts(
    orders: Order[],
    metric: TopProductsMetric,
    limit = 5,
): ProductAggregate[] {
    const aggregates = new Map<string, ProductAggregate>();

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            order.lines.forEach((line) => {
                const aggregate = aggregates.get(line.productId) ?? {
                    productId: line.productId,
                    quantity: 0,
                    revenue: 0,
                };

                aggregate.quantity += line.quantity;
                aggregate.revenue += line.quantity * line.unitPrice;
                aggregates.set(line.productId, aggregate);
            });
        });

    return Array.from(aggregates.values())
        .map((aggregate) => ({ ...aggregate, revenue: Math.round(aggregate.revenue) }))
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, limit);
}
