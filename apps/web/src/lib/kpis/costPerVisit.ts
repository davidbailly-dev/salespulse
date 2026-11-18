import { AdSpendRow, Channel, TrafficRow } from '@salespulse/contracts';
import type { ChannelCost } from './costPerClick';

/**
 * Coût par visite (CPV) de chaque canal payant : Σ dépenses / Σ sessions du canal. Plus élevé que
 * le CPC, car il y a toujours moins de sessions mesurées que de clics publicitaires.
 */
export function calculateCostPerVisit(adSpend: AdSpendRow[], traffic: TrafficRow[]): ChannelCost[] {
    const spendByChannel = new Map<Channel, number>();
    adSpend.forEach((row) => spendByChannel.set(row.channel, (spendByChannel.get(row.channel) ?? 0) + row.spend));

    const sessionsByChannel = new Map<Channel, number>();
    traffic.forEach((row) => sessionsByChannel.set(row.channel, (sessionsByChannel.get(row.channel) ?? 0) + row.sessions));

    return [...spendByChannel.entries()]
        .filter(([channel]) => (sessionsByChannel.get(channel) ?? 0) > 0)
        .map(([channel, spend]) => ({
            channel,
            cost: Math.round((spend / (sessionsByChannel.get(channel) ?? 1)) * 100) / 100,
        }))
        .sort((a, b) => b.cost - a.cost);
}
