import { TrafficRow } from '@salespulse/contracts';

/** Sessions : volume brut de trafic, somme des sessions sur la période filtrée. */
export function calculateSessions(traffic: TrafficRow[]): number {
    return traffic.reduce((total, row) => total + row.sessions, 0);
}
