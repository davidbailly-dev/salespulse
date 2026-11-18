import { TrafficRow } from '@salespulse/contracts';

/**
 * Scroll profond : part des sessions (toutes, pas seulement les engagées) allant au moins aux
 * trois quarts de la page, Σ deepScrollSessions / Σ sessions en %.
 */
export function calculateDeepScrollRate(traffic: TrafficRow[]): number {
    const totalSessions = traffic.reduce((total, row) => total + row.sessions, 0);
    if (totalSessions === 0) return 0;

    const deepScrollSessions = traffic.reduce((total, row) => total + row.deepScrollSessions, 0);

    return Math.round((deepScrollSessions / totalSessions) * 100);
}
