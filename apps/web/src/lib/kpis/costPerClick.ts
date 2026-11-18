import { AdSpendRow, Channel } from '@salespulse/contracts';

export type ChannelCost = {
    channel: Channel;
    // En euros, arrondi au centime.
    cost: number;
};

/** Coût par clic (CPC) de chaque canal payant : Σ dépenses / Σ clics, du plus cher au moins cher. */
export function calculateCostPerClick(adSpend: AdSpendRow[]): ChannelCost[] {
    const totalsByChannel = new Map<Channel, { spend: number; clicks: number }>();
    adSpend.forEach((row) => {
        const totals = totalsByChannel.get(row.channel) ?? { spend: 0, clicks: 0 };
        totals.spend += row.spend;
        totals.clicks += row.clicks;
        totalsByChannel.set(row.channel, totals);
    });

    return [...totalsByChannel.entries()]
        .filter(([, totals]) => totals.clicks > 0)
        .map(([channel, totals]) => ({ channel, cost: Math.round((totals.spend / totals.clicks) * 100) / 100 }))
        .sort((a, b) => b.cost - a.cost);
}
