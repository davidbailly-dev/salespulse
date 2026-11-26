import { z } from 'zod';

// Calqué sur ce qu'exposerait un connecteur GA4 : le trafic est stocké en
// lignes agrégées par jour, boutique, canal et appareil, jamais en sessions individuelles.

// Canal d'acquisition et appareil d'une session.
export const ChannelSchema = z.enum(['organic', 'paid', 'direct', 'social', 'email', 'referral']);
export type Channel = z.infer<typeof ChannelSchema>;

export const DeviceSchema = z.enum(['desktop', 'mobile', 'tablet']);
export type Device = z.infer<typeof DeviceSchema>;

export const TrafficRowSchema = z.object({
    // Début du jour (UTC) : la granularité est la journée.
    date: z.string().datetime(),
    shopId: z.string(),
    channel: ChannelSchema,
    device: DeviceSchema,
    sessions: z.number().int().nonnegative(),
    users: z.number().int().nonnegative(),
    newUsers: z.number().int().nonnegative(),
    engagedSessions: z.number().int().nonnegative(),
    // Sessions allant au moins aux trois quarts de la page (sous-ensemble des sessions engagées).
    deepScrollSessions: z.number().int().nonnegative(),
    // Durée cumulée (et non moyenne) pour pouvoir agréger sans biais : moyenne = total / sessions.
    totalSessionDurationSeconds: z.number().int().nonnegative(),
    pageViews: z.number().int().nonnegative(),
});
export type TrafficRow = z.infer<typeof TrafficRowSchema>;

export const TrafficRowListSchema = z.array(TrafficRowSchema);

export const PageTypeSchema = z.enum(['product', 'other']);
export type PageType = z.infer<typeof PageTypeSchema>;

const pageFields = {
    path: z.string(),
    title: z.string(),
    type: PageTypeSchema,
    productId: z.string().optional(),
    views: z.number().int().nonnegative(),
    // Nombre de sessions ayant quitté le site depuis cette page.
    exits: z.number().int().nonnegative(),
};

// Ligne quotidienne stockée côté serveur.
export const PageViewRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    ...pageFields,
});
export type PageViewRow = z.infer<typeof PageViewRowSchema>;

// Rapport renvoyé par l'API : une ligne par page, agrégée sur la plage de dates demandée.
export const PageStatSchema = z.object(pageFields);
export type PageStat = z.infer<typeof PageStatSchema>;

export const PageStatListSchema = z.array(PageStatSchema);

const searchFields = {
    term: z.string(),
    // false = recherche sans résultat, donc besoin non satisfait.
    hasResults: z.boolean(),
    searches: z.number().int().nonnegative(),
};

export const SearchRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    ...searchFields,
});
export type SearchRow = z.infer<typeof SearchRowSchema>;

export const SearchTermStatSchema = z.object(searchFields);
export type SearchTermStat = z.infer<typeof SearchTermStatSchema>;

export const SearchTermStatListSchema = z.array(SearchTermStatSchema);

// Dépenses publicitaires : lignes quotidiennes par boutique et par canal, uniquement pour les
// canaux qui en génèrent (voir `AD_SPEND_CPC` dans adSpendGenerator.ts). Pas d'appareil : une
// dépense se rattache à une campagne, pas à un écran.
export const AdSpendRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    channel: ChannelSchema,
    // En euros, centimes compris.
    spend: z.number().nonnegative(),
    // Clics côté plateforme publicitaire : toujours >= aux sessions mesurées par l'analytics
    // (clics sans chargement de page, blocages de suivi).
    clicks: z.number().int().nonnegative(),
});
export type AdSpendRow = z.infer<typeof AdSpendRowSchema>;

export const AdSpendRowListSchema = z.array(AdSpendRowSchema);

// Core Web Vitals : un point par jour, boutique et appareil, comme le rapport CrUX par type d'appareil.
// LCP, INP et CLS sont des percentiles 75 du jour (le seuil de Google s'applique au p75). Un
// percentile n'est pas additif : sur plusieurs jours, on les agrège par moyenne pondérée par
// `samples`, ce qui reste une approximation du vrai p75 de la période.
export const WebVitalsRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    device: DeviceSchema,
    // Chargements de page mesurés ce jour-là : le poids de la ligne dans une moyenne.
    samples: z.number().int().nonnegative(),
    // Largest Contentful Paint, en millisecondes.
    lcpMs: z.number().nonnegative(),
    // Interaction to Next Paint, en millisecondes.
    inpMs: z.number().nonnegative(),
    // Cumulative Layout Shift, sans unité.
    cls: z.number().nonnegative(),
    // Temps de chargement moyen de la page, en millisecondes.
    loadTimeMs: z.number().nonnegative(),
});
export type WebVitalsRow = z.infer<typeof WebVitalsRowSchema>;

export const WebVitalsRowListSchema = z.array(WebVitalsRowSchema);

export const ErrorTypeSchema = z.enum(['not_found', 'payment_failed']);
export type ErrorType = z.infer<typeof ErrorTypeSchema>;

// Erreurs rencontrées par les visiteurs : un compteur par jour, boutique et type. Les taux se
// calculent avec les autres jeux (404 / pages vues, échecs / (échecs + commandes completed)).
export const ErrorRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    type: ErrorTypeSchema,
    count: z.number().int().positive(),
});
export type ErrorRow = z.infer<typeof ErrorRowSchema>;

export const ErrorRowListSchema = z.array(ErrorRowSchema);

export const EmailCampaignSchema = z.enum(['newsletter', 'cart_recovery']);
export type EmailCampaign = z.infer<typeof EmailCampaignSchema>;

// Envois d'e-mails : un compteur par jour, boutique et type de campagne (newsletter ou relance de
// panier). `opens` est le nombre d'ouvertures (la protection de confidentialité d'Apple Mail les
// gonfle en pratique) et `clicks` celui de clics sur un lien, avec `clicks <= opens <= sent`.
export const EmailRowSchema = z.object({
    date: z.string().datetime(),
    shopId: z.string(),
    campaign: EmailCampaignSchema,
    sent: z.number().int().nonnegative(),
    opens: z.number().int().nonnegative(),
    clicks: z.number().int().nonnegative(),
});
export type EmailRow = z.infer<typeof EmailRowSchema>;

export const EmailRowListSchema = z.array(EmailRowSchema);
