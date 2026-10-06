import { SimpleFaker } from '@faker-js/faker';
import { DEFAULT_ANALYTICS_TUNING, type AnalyticsTuning } from './analyticsTuning';
import type { AdSpendRow, Channel, TrafficRow } from './schemas';

const AD_SPEND_SEED = 717171;

// Canaux qui génèrent une dépense, avec leur coût par clic de base (en euros). Les autres canaux
// (organique, direct, e-mail, référents) n'ont aucune ligne. Ces coûts sont élevés pour un
// e-commerce classique parce qu'ils sont calibrés sur le panier moyen du mock (~800 EUR, articles
// de collection). Réglage mesuré avec la fenêtre N-1 (qui rend le CAC réaliste) : ROAS d'environ 5
// à 6 et LTV/CAC d'environ 3 sur la vue par défaut de 30 jours (6 sur 90 jours). Les deux ne
// peuvent pas être tenus à la fois à 3-4 : le CAC se déduit de la dépense, donc du ROAS. Le social
// convertit moins bien que le payant, d'où un ROAS un peu plus bas à coût par clic comparable.
export const AD_SPEND_CPC: Partial<Record<Channel, number>> = {
    paid: 2.25,
    social: 1.7,
};

// Un clic publicitaire ne donne pas toujours une session mesurée (page abandonnée avant
// chargement, blocage du suivi) : il y a donc un peu plus de clics que de sessions.
const CLICKS_PER_SESSION = 1.1;

/**
 * Dépenses dérivées du trafic (clics ~ sessions du canal, dépense = clics × coût par clic), pour
 * rester cohérentes avec les sessions et les commandes déjà générées. Seedé à part : ajouter ce
 * module ne change ni le trafic ni les commandes existants.
 */
export function generateAdSpend(traffic: TrafficRow[], tuning: AnalyticsTuning = DEFAULT_ANALYTICS_TUNING): AdSpendRow[] {
    const random = new SimpleFaker();
    random.seed(AD_SPEND_SEED + tuning.seedOffset);
    const jitter = (spread: number) => random.number.float({ min: 1 - spread, max: 1 + spread });

    // Sessions du jour, par boutique et par canal, tous appareils confondus.
    const sessionsByKey = new Map<string, { date: string; shopId: string; channel: Channel; sessions: number }>();
    traffic.forEach(({ date, shopId, channel, sessions }) => {
        if (AD_SPEND_CPC[channel] === undefined) return;

        const key = `${date}|${shopId}|${channel}`;
        const entry = sessionsByKey.get(key);
        if (entry) entry.sessions += sessions;
        else sessionsByKey.set(key, { date, shopId, channel, sessions });
    });

    const rows: AdSpendRow[] = [];
    for (const { date, shopId, channel, sessions } of sessionsByKey.values()) {
        const clicks = Math.round(sessions * CLICKS_PER_SESSION * jitter(0.05));
        if (clicks <= 0) continue;

        const cpc = (AD_SPEND_CPC[channel] ?? 0) * tuning.cpcFactor;
        rows.push({ date, shopId, channel, spend: Math.round(clicks * cpc * jitter(0.1) * 100) / 100, clicks });
    }

    return rows;
}
