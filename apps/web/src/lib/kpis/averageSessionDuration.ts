import { TrafficRow } from '@salespulse/contracts';

/**
 * Durée moyenne de session, en secondes : Σ totalSessionDurationSeconds / Σ sessions. Moyenne
 * pondérée par les sessions (et non moyenne des moyennes des lignes), d'où la durée cumulée
 * stockée dans le schéma plutôt qu'une durée moyenne par ligne.
 */
export function calculateAverageSessionDuration(traffic: TrafficRow[]): number {
    const totalSessions = traffic.reduce((total, row) => total + row.sessions, 0);
    if (totalSessions === 0) return 0;

    const totalDurationSeconds = traffic.reduce((total, row) => total + row.totalSessionDurationSeconds, 0);

    return Math.round(totalDurationSeconds / totalSessions);
}
