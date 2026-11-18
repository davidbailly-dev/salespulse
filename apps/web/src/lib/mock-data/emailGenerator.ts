import { SimpleFaker } from '@faker-js/faker';
import { DEFAULT_ANALYTICS_TUNING, type AnalyticsTuning } from './analyticsTuning';
import type { EmailCampaign, EmailRow, TrafficRow } from '@salespulse/contracts';

const EMAILS_SEED = 131313;

// Un clic dans un e-mail ne donne pas toujours une session mesurée : un peu plus de clics que de
// sessions du canal `email`, comme pour les clics publicitaires (voir adSpendGenerator.ts).
const CLICKS_PER_SESSION = 1.1;

// Part de chaque type de campagne dans les clics, et taux de base (sur les e-mails envoyés). Une
// relance de panier abandonné est ouverte et cliquée bien plus qu'une newsletter.
const CAMPAIGN_PROFILES: Record<EmailCampaign, { clickShare: number; openRate: number; clickRate: number }> = {
    newsletter: { clickShare: 0.6, openRate: 0.28, clickRate: 0.025 },
    cart_recovery: { clickShare: 0.4, openRate: 0.45, clickRate: 0.06 },
};

/**
 * E-mails dérivés du trafic : les clics du jour partent des sessions du canal `email`, puis les
 * envois et les ouvertures s'en déduisent par les taux de chaque campagne. Le canal `email` et
 * ses statistiques d'envoi restent ainsi cohérents. Seedé à part, comme les autres jeux analytics.
 */
export function generateEmails(traffic: TrafficRow[], tuning: AnalyticsTuning = DEFAULT_ANALYTICS_TUNING): EmailRow[] {
    const random = new SimpleFaker();
    random.seed(EMAILS_SEED + tuning.seedOffset);
    const jitter = (spread: number) => random.number.float({ min: 1 - spread, max: 1 + spread });

    const sessionsByKey = new Map<string, { date: string; shopId: string; sessions: number }>();
    traffic
        .filter((row) => row.channel === 'email')
        .forEach(({ date, shopId, sessions }) => {
            const key = `${date}|${shopId}`;
            const entry = sessionsByKey.get(key);
            if (entry) entry.sessions += sessions;
            else sessionsByKey.set(key, { date, shopId, sessions });
        });

    const rows: EmailRow[] = [];
    for (const { date, shopId, sessions } of sessionsByKey.values()) {
        for (const [campaign, profile] of Object.entries(CAMPAIGN_PROFILES) as [EmailCampaign, (typeof CAMPAIGN_PROFILES)[EmailCampaign]][]) {
            const clicks = Math.round(sessions * CLICKS_PER_SESSION * profile.clickShare * jitter(0.1));
            if (clicks <= 0) continue;

            const sent = Math.round((clicks / profile.clickRate) * jitter(0.1));
            // `clicks <= opens <= sent` : un clic suppose une ouverture, une ouverture un envoi.
            const opens = Math.min(sent, Math.max(clicks, Math.round(sent * profile.openRate * jitter(0.05))));
            rows.push({ date, shopId, campaign, sent, opens, clicks });
        }
    }

    return rows;
}
