import { TrafficRow } from '../mock-data/schemas';

/**
 * Visiteurs uniques : somme des `users` des lignes de la période filtrée.
 *
 * Approximation assumée : `users` est stocké par jour, canal et appareil, donc un visiteur qui
 * revient plusieurs jours (ou par plusieurs canaux) est compté plusieurs fois. En production,
 * il faudrait interroger GA4 sur la période entière (`totalUsers` sans dimension de date),
 * car les utilisateurs ne sont pas additifs.
 */
export function calculateUniqueVisitors(traffic: TrafficRow[]): number {
    return traffic.reduce((total, row) => total + row.users, 0);
}
