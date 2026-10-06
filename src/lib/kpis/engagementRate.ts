import { TrafficRow } from '../mock-data/schemas';

/**
 * Taux d'engagement : Σ engagedSessions / Σ sessions, en %. Comme GA4, on ne calcule que ce
 * taux : le taux de rebond en est le complémentaire (100 − engagement), donc pas affiché en double.
 */
export function calculateEngagementRate(traffic: TrafficRow[]): number {
    const totalSessions = traffic.reduce((total, row) => total + row.sessions, 0);
    if (totalSessions === 0) return 0;

    const engagedSessions = traffic.reduce((total, row) => total + row.engagedSessions, 0);

    return Math.round((engagedSessions / totalSessions) * 100);
}
