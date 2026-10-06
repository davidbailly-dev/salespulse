import { TrafficRow } from '../mock-data/schemas';

/**
 * Part de nouveaux visiteurs : Σ newUsers / Σ users, en %. Les visiteurs récurrents en sont le
 * complémentaire (calculé à l'affichage). Ne pas confondre avec `calculateRecurringOrdersRate`,
 * qui porte sur les commandes et les clients, pas sur le trafic.
 */
export function calculateNewVisitorsRate(traffic: TrafficRow[]): number {
    const totalUsers = traffic.reduce((total, row) => total + row.users, 0);
    if (totalUsers === 0) return 0;

    const totalNewUsers = traffic.reduce((total, row) => total + row.newUsers, 0);

    return Math.round((totalNewUsers / totalUsers) * 100);
}
