import { Order } from '../mock-data/schemas';

// Somme non arrondie : les KPIs qui divisent le CA (revenu par visite, ROAS) ne doivent pas
// hériter de l'arrondi à l'euro de `calculateRevenue`.
export function sumCompletedRevenue(orders: Order[]): number {
    return orders
        .filter((order) => order.status === 'completed')
        .reduce((acc, order) => acc + order.totalAmount, 0);
}

export function calculateRevenue(orders: Order[]): number {
    return Math.round(sumCompletedRevenue(orders));
}