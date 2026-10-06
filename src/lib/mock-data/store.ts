import { generateAnalyticsDataset } from './analyticsGenerator';
import { generateDataset } from './generator';
import type { AnalyticsDataset, Dataset } from './schemas';

let dataset: Dataset | null = null;
let analyticsDataset: AnalyticsDataset | null = null;
// Date de génération du jeu de base, réutilisée pour le trafic : les deux jeux couvrent ainsi
// exactement la même fenêtre glissante.
let generatedAt = new Date();

/**
 * Génère le jeu de données mockées une seule fois par démarrage de serveur
 * (voir src/instrumentation.ts) puis le sert depuis la mémoire, pour que toutes
 * les requêtes mockées lisent le même état plutôt que des données régénérées
 * à chaque appel.
 */
export function getDataset(): Dataset {
    if (!dataset) {
        generatedAt = new Date();
        dataset = generateDataset(generatedAt);
    }
    return dataset;
}

/**
 * Trafic analytics (sessions, pages vues, recherches internes), dérivé des commandes de
 * `getDataset()`. Même principe de singleton mémoire.
 */
export function getAnalyticsDataset(): AnalyticsDataset {
    if (!analyticsDataset) {
        analyticsDataset = generateAnalyticsDataset(getDataset(), generatedAt);
    }
    return analyticsDataset;
}
