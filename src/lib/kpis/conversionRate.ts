import { Order } from '../mock-data/schemas';

/**
 * Pas de notion de "visite" dans le mock (voir CLAUDE.md) : proxy sur les commandes
 * elles-mêmes plutôt qu'un vrai taux visites → achat.
 */
export function calculateConversionRate(orders: Order[]): number {
    if (orders.length === 0) return 0;

    const completedCount = orders.filter((order) => order.status === 'completed').length;

    // orders.length === completed + abandoned + refunded, ce sont les 3 seuls statuts possibles (OrderStatusSchema).
    return Math.round((completedCount / orders.length) * 100);
}
