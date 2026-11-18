import { Order, Product } from '../mock-data/schemas';

/**
 * Analyse de Pareto : part du CA total réalisée par les X% de produits qui
 * vendent le plus, calculée sur le catalogue complet (invendus inclus à 0),
 * pour refléter la concentration réelle des ventes sur l'ensemble du catalogue.
 */
export function calculateSalesConcentration(orders: Order[], products: Product[], topShare = 0.2): number {
    if (products.length === 0) return 0;

    const revenueByProduct = new Map<string, number>(products.map((product) => [product.id, 0]));

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            order.lines.forEach((line) => {
                revenueByProduct.set(
                    line.productId,
                    (revenueByProduct.get(line.productId) ?? 0) + line.quantity * line.unitPrice,
                );
            });
        });

    const sortedRevenues = Array.from(revenueByProduct.values()).sort((a, b) => b - a);
    const totalRevenue = sortedRevenues.reduce((acc, revenue) => acc + revenue, 0);
    if (totalRevenue === 0) return 0;

    const topCount = Math.max(1, Math.ceil(products.length * topShare));
    const topRevenue = sortedRevenues.slice(0, topCount).reduce((acc, revenue) => acc + revenue, 0);

    return Math.round((topRevenue / totalRevenue) * 100);
}
