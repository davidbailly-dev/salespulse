import { Order } from '../mock-data/schemas';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Délai moyen (en jours) entre deux commandes completed consécutives d'un même client.
 * Moyenne sur l'ensemble des écarts (pas une moyenne de moyennes par client) : un client
 * très actif pèse donc davantage. Renvoie `null` s'il n'existe aucun écart (aucun client
 * avec au moins 2 commandes), pour afficher "–" plutôt qu'un 0 trompeur.
 * Limité à la période filtrée : un client dont les deux commandes encadrent la période
 * n'est pas pris en compte.
 */
export function calculateAverageTimeBetweenOrdersDays(orders: Order[]): number | null {
    const orderTimesByCustomer = new Map<string, number[]>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            const orderTimes = orderTimesByCustomer.get(order.customerId) ?? [];
            orderTimes.push(new Date(order.date).getTime());
            orderTimesByCustomer.set(order.customerId, orderTimes);
        });

    let totalGapDays = 0;
    let gapCount = 0;
    orderTimesByCustomer.forEach((orderTimes) => {
        const sortedTimes = [...orderTimes].sort((a, b) => a - b);
        for (let i = 1; i < sortedTimes.length; i++) {
            totalGapDays += (sortedTimes[i] - sortedTimes[i - 1]) / MS_PER_DAY;
            gapCount++;
        }
    });

    if (gapCount === 0) return null;

    return Math.round(totalGapDays / gapCount);
}
