import { AdSpendRow, Order } from '@salespulse/contracts';

type DateRange = { from?: string; to?: string };

/**
 * Nouveaux clients : clients dont la première commande completed du dataset tombe dans la période.
 * `allOrders` doit être l'historique complet (non filtré par période), sinon on ne saurait pas si
 * une commande de la période est la première. `Customer.registeredAt` est inutilisable ici : dans
 * le mock, c'est une date tirée au hasard sur deux ans, sans lien avec les commandes.
 *
 * Effet de bord du mock : les clients déjà actifs au début de la fenêtre de 90 jours paraissent
 * "nouveaux" au début de la fenêtre, faute d'historique avant.
 */
export function calculateNewCustomersCount(allOrders: Order[], range: DateRange): number {
    const firstOrderTimeByCustomer = new Map<string, number>();
    allOrders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            const time = new Date(order.date).getTime();
            const firstTime = firstOrderTimeByCustomer.get(order.customerId);
            if (firstTime === undefined || time < firstTime) firstOrderTimeByCustomer.set(order.customerId, time);
        });

    const fromTime = range.from ? new Date(range.from).getTime() : -Infinity;
    const toTime = range.to ? new Date(range.to).getTime() : Infinity;

    return [...firstOrderTimeByCustomer.values()].filter((time) => time >= fromTime && time <= toTime).length;
}

/**
 * Coût d'acquisition client (CAC) "mixte" : Σ dépenses / nouveaux clients, en euros entiers. Toutes
 * les dépenses sont rapportées à tous les nouveaux clients, quel que soit leur canal d'arrivée
 * (définition standard). `null` sans nouveau client sur la période.
 */
export function calculateCustomerAcquisitionCost(
    adSpend: AdSpendRow[],
    allOrders: Order[],
    range: DateRange,
): number | null {
    const newCustomersCount = calculateNewCustomersCount(allOrders, range);
    if (newCustomersCount === 0) return null;

    const totalSpend = adSpend.reduce((total, row) => total + row.spend, 0);

    return Math.round(totalSpend / newCustomersCount);
}
