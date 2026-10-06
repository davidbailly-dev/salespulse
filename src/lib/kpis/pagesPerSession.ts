import { TrafficRow } from '../mock-data/schemas';

/** Pages par session : Σ pageViews / Σ sessions, arrondi à une décimale. */
export function calculatePagesPerSession(traffic: TrafficRow[]): number {
    const totalSessions = traffic.reduce((total, row) => total + row.sessions, 0);
    if (totalSessions === 0) return 0;

    const totalPageViews = traffic.reduce((total, row) => total + row.pageViews, 0);

    return Math.round((totalPageViews / totalSessions) * 10) / 10;
}
