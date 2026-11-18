import { Order } from '@salespulse/contracts';
import { calculateAverageOrderValue } from './averageOrderValue';
import { calculateRepurchaseRate } from './repurchaseRate';

// Sans plafond, un taux de réachat de 100 % ferait diverger 1 / (1 - r) vers l'infini.
const MAX_REPURCHASE_RATE = 0.95;

/**
 * LTV marketing (en CA, pas en marge : pas de champ marge dans le mock) :
 * panier moyen × nombre de commandes attendu par client.
 *
 * Nombre de commandes attendu = 1 / (1 - r), r étant le taux de réachat. C'est la somme
 * de la série géométrique : un client passe une commande, puis en repasse une autre avec
 * la probabilité r, et ainsi de suite (1 + r + r² + ...). Avec r = 36 %, on attend
 * 1 / (1 - 0,36) ≈ 1,56 commande par client.
 *
 * Le taux de réachat est mesuré sur la période filtrée : la LTV varie donc avec le filtre
 * de dates (valeur basse sur une période courte). Prédictif, contrairement à
 * `calculateAverageRevenuePerActiveCustomer` qui mesure le CA réellement encaissé.
 */
export function calculateCustomerLifetimeValue(orders: Order[]): number {
    const repurchaseRate = Math.min(calculateRepurchaseRate(orders) / 100, MAX_REPURCHASE_RATE);
    const expectedOrdersPerCustomer = 1 / (1 - repurchaseRate);

    return Math.round(calculateAverageOrderValue(orders) * expectedOrdersPerCustomer);
}
