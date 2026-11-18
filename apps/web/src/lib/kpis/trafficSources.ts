import { Channel, TrafficRow } from '@salespulse/contracts';

export type TrafficSource = {
    channel: Channel;
    sessions: number;
    // Part des sessions totales, arrondie à l'entier : la somme des parts peut donc valoir 99 ou 101.
    share: number;
};

/** Répartition des sessions par canal d'acquisition, triée par part décroissante. */
export function calculateTrafficSources(traffic: TrafficRow[]): TrafficSource[] {
    const sessionsByChannel = new Map<Channel, number>();
    traffic.forEach((row) => {
        sessionsByChannel.set(row.channel, (sessionsByChannel.get(row.channel) ?? 0) + row.sessions);
    });

    const totalSessions = [...sessionsByChannel.values()].reduce((total, sessions) => total + sessions, 0);
    if (totalSessions === 0) return [];

    return [...sessionsByChannel.entries()]
        .map(([channel, sessions]) => ({
            channel,
            sessions,
            share: Math.round((sessions / totalSessions) * 100),
        }))
        .sort((a, b) => b.sessions - a.sessions);
}
