// Réglages d'un jeu analytics. Les valeurs par défaut reproduisent exactement la fenêtre actuelle ;
// `HISTORY_ANALYTICS_TUNING` sert à la fenêtre N-1 (voir historyGenerator.ts) : décalage de seed
// pour ne pas répéter les mêmes tirages, et une tendance par famille de KPI pour que les
// évolutions d'une année sur l'autre ne soient pas toutes nulles.
export type AnalyticsTuning = {
    // Ajouté au seed de chaque générateur analytics.
    seedOffset: number;
    // Multiplie le taux de conversion des sessions (moins de conversion = plus de sessions par commande).
    conversionFactor: number;
    // Multiplie les coûts par clic.
    cpcFactor: number;
    // Multiplie les temps LCP, INP et de chargement (plus de 1 = site plus lent).
    slownessFactor: number;
    // Multiplie les taux d'erreur (404 et échecs de paiement).
    errorRateFactor: number;
    // Ajouté au taux d'engagement (0,03 = 3 points de plus).
    engagementDelta: number;
    // Multiplie la durée de session, le nombre de pages par session et la part de scroll profond.
    durationFactor: number;
    pagesFactor: number;
    deepScrollFactor: number;
};

export const DEFAULT_ANALYTICS_TUNING: AnalyticsTuning = {
    seedOffset: 0,
    conversionFactor: 1,
    cpcFactor: 1,
    slownessFactor: 1,
    errorRateFactor: 1,
    engagementDelta: 0,
    durationFactor: 1,
    pagesFactor: 1,
    deepScrollFactor: 1,
};

// N-1 : conversion plus faible, clics moins chers, site plus lent, plus d'erreurs, moins d'engagement,
// de durée et de scroll qu'en N, mais plus de pages par session (N perd donc un peu sur ce seul KPI
// d'engagement, pour garder un mélange de hausses et de baisses).
export const HISTORY_ANALYTICS_TUNING: AnalyticsTuning = {
    seedOffset: 1000,
    conversionFactor: 0.95,
    cpcFactor: 0.92,
    slownessFactor: 1.12,
    errorRateFactor: 1.3,
    engagementDelta: -0.03,
    durationFactor: 0.93,
    pagesFactor: 1.05,
    deepScrollFactor: 0.9,
};
