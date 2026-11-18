import { Order, TrafficRow } from '@salespulse/contracts';
import { sumCompletedRevenue } from './revenue';

/**
 * Revenu par visite (RPV) : CA des commandes completed / Σ sessions, en euros avec 2 décimales.
 * Il combine trafic, conversion et panier moyen (RPV = taux de conversion × panier moyen), mais
 * est calculé directement : le taux de conversion du dashboard est un proxy sur les commandes,
 * pas un taux sessions -> achat.
 */
export function calculateRevenuePerVisit(orders: Order[], traffic: TrafficRow[]): number {
    const totalSessions = traffic.reduce((total, row) => total + row.sessions, 0);
    if (totalSessions === 0) return 0;

    return Math.round((sumCompletedRevenue(orders) / totalSessions) * 100) / 100;
}
