import { EmailCampaign, EmailRow } from '@salespulse/contracts';

export type EmailMetric = 'open' | 'click';

export type CampaignRate = {
    campaign: EmailCampaign;
    // En %, 1 décimale, rapporté aux e-mails envoyés.
    rate: number;
};

/**
 * Taux d'ouverture (Σ opens / Σ sent) ou de clic (Σ clicks / Σ sent) par type de campagne, du plus
 * élevé au moins élevé. Rapportés à l'envoi pour que les deux taux soient comparables entre eux.
 */
export function calculateEmailRates(emails: EmailRow[], metric: EmailMetric): CampaignRate[] {
    const totalsByCampaign = new Map<EmailCampaign, { sent: number; count: number }>();
    emails.forEach((row) => {
        const totals = totalsByCampaign.get(row.campaign) ?? { sent: 0, count: 0 };
        totals.sent += row.sent;
        totals.count += metric === 'open' ? row.opens : row.clicks;
        totalsByCampaign.set(row.campaign, totals);
    });

    return [...totalsByCampaign.entries()]
        .filter(([, totals]) => totals.sent > 0)
        .map(([campaign, totals]) => ({ campaign, rate: Math.round((totals.count / totals.sent) * 1000) / 10 }))
        .sort((a, b) => b.rate - a.rate);
}
