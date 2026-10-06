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
};

export const DEFAULT_ANALYTICS_TUNING: AnalyticsTuning = {
    seedOffset: 0,
    conversionFactor: 1,
    cpcFactor: 1,
    slownessFactor: 1,
    errorRateFactor: 1,
};

// N-1 : conversion plus faible, clics moins chers, site plus lent et plus d'erreurs qu'en N.
export const HISTORY_ANALYTICS_TUNING: AnalyticsTuning = {
    seedOffset: 1000,
    conversionFactor: 0.95,
    cpcFactor: 0.92,
    slownessFactor: 1.12,
    errorRateFactor: 1.3,
};
