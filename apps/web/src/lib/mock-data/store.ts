import { subtractOneYear } from '../dates/subtractOneYear';
import { generateAnalyticsDataset } from './analyticsGenerator';
import { HISTORY_ANALYTICS_TUNING } from './analyticsTuning';
import { generateDataset } from './generator';
import { generateHistoryOrders } from './historyGenerator';
import type { AnalyticsDataset, Dataset, Order } from '@salespulse/contracts';

// Fenêtre actuelle (les `WINDOW_DAYS` derniers jours) et fenêtre N-1 (mêmes jours, un an plus tôt),
// générées séparément : la seconde sert à la comparaison d'une année sur l'autre. Les deux sont
// exposées ensemble par `getDataset()`, c'est le filtre de dates de l'appelant qui les distingue.
let currentDataset: Dataset | null = null;
let historyOrders: Order[] = [];
let dataset: Dataset | null = null;
let analyticsDataset: AnalyticsDataset | null = null;
// Date de génération du jeu de base, réutilisée pour le trafic : les jeux couvrent ainsi
// exactement les mêmes fenêtres glissantes.
let generatedAt = new Date();

/**
 * Génère le jeu de données mockées une seule fois par démarrage de serveur
 * (voir src/instrumentation.ts) puis le sert depuis la mémoire, pour que toutes
 * les requêtes mockées lisent le même état plutôt que des données régénérées
 * à chaque appel. Les commandes contiennent la fenêtre actuelle et la fenêtre N-1.
 */
export function getDataset(): Dataset {
    if (!dataset || !currentDataset) {
        generatedAt = new Date();
        currentDataset = generateDataset(generatedAt);
        historyOrders = generateHistoryOrders(currentDataset, generatedAt);
        dataset = { ...currentDataset, orders: [...currentDataset.orders, ...historyOrders] };
    }
    return dataset;
}

/**
 * Trafic analytics (sessions, pages vues, recherches internes, dépenses, performances, erreurs,
 * e-mails), dérivé des commandes de chaque fenêtre, avec une tendance propre à la fenêtre N-1 (voir
 * `HISTORY_ANALYTICS_TUNING`). Même principe de singleton mémoire.
 */
export function getAnalyticsDataset(): AnalyticsDataset {
    if (!analyticsDataset) {
        getDataset();
        const base = currentDataset as Dataset;

        const current = generateAnalyticsDataset(base, generatedAt);
        const previous = generateAnalyticsDataset(
            { ...base, orders: historyOrders },
            subtractOneYear(generatedAt),
            HISTORY_ANALYTICS_TUNING,
        );

        analyticsDataset = {
            traffic: [...current.traffic, ...previous.traffic],
            pageViews: [...current.pageViews, ...previous.pageViews],
            searches: [...current.searches, ...previous.searches],
            adSpend: [...current.adSpend, ...previous.adSpend],
            webVitals: [...current.webVitals, ...previous.webVitals],
            errors: [...current.errors, ...previous.errors],
            emails: [...current.emails, ...previous.emails],
        };
    }
    return analyticsDataset;
}
