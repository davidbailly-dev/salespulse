import { SimpleFaker } from '@faker-js/faker';
import { generateAdSpend } from './adSpendGenerator';
import { DEFAULT_ANALYTICS_TUNING, type AnalyticsTuning } from './analyticsTuning';
import { generateEmails } from './emailGenerator';
import { generateErrors } from './errorGenerator';
import { WINDOW_DAYS } from './generator';
import { generateWebVitals } from './webVitalsGenerator';
import type { AnalyticsDataset, Channel, Dataset, Device, PageViewRow, SearchRow, TrafficRow } from './schemas';
import { CategorySchema } from './schemas';
import {
    CHANNEL_PROFILES,
    CHANNELS,
    DEVICE_PROFILES,
    DEVICES,
    getConversionRate,
} from './trafficProfiles';

const ANALYTICS_SEED = 616161;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Poids de chaque jour de la semaine (dimanche = 0), dont la somme vaut 7 : le week-end
// attire un peu plus, sans changer le volume total sur la fenêtre.
const WEEKDAY_FACTORS = [1.2, 0.95, 0.95, 0.95, 0.95, 1.0, 1.0];

const USERS_PER_SESSION = 0.82;
const BASE_ENGAGEMENT_RATE = 0.6;
const DEEP_SCROLL_SHARE_OF_ENGAGED = 0.55;
const BASE_SESSION_DURATION_SECONDS = 150;
const BASE_PAGES_PER_SESSION = 3.6;

const PRODUCT_PAGE_VIEW_SHARE = 0.45;
const PRODUCT_PAGE_EXIT_RATE = 0.28;
// Part des sessions qui utilisent la recherche interne.
const SEARCH_RATE = 0.07;

type StaticPage = { path: string; title: string; weight: number; exitRate: number };

const STATIC_PAGES: StaticPage[] = [
    { path: '/', title: 'Accueil', weight: 22, exitRate: 0.22 },
    { path: '/catalogue', title: 'Catalogue', weight: 12, exitRate: 0.18 },
    ...CategorySchema.options.map((category) => ({
        path: `/categories/${category.toLowerCase()}`,
        title: `Catégorie ${category}`,
        weight: 5,
        exitRate: 0.2,
    })),
    { path: '/panier', title: 'Panier', weight: 7, exitRate: 0.35 },
    { path: '/commande', title: 'Paiement', weight: 4, exitRate: 0.3 },
    { path: '/recherche', title: 'Résultats de recherche', weight: 6, exitRate: 0.25 },
    { path: '/promotions', title: 'Promotions', weight: 4, exitRate: 0.3 },
    { path: '/mon-compte', title: 'Mon compte', weight: 3, exitRate: 0.3 },
    { path: '/blog', title: 'Chroniques de l\'aventurier', weight: 3, exitRate: 0.55 },
    { path: '/livraison', title: 'Livraison et retours', weight: 2, exitRate: 0.5 },
    { path: '/a-propos', title: 'À propos', weight: 1.5, exitRate: 0.6 },
    { path: '/contact', title: 'Contact', weight: 1.5, exitRate: 0.6 },
];

// Termes sans résultat = besoins non satisfaits (le catalogue n'a ni baguettes, ni mithril...).
const SEARCH_TERMS: { term: string; weight: number; hasResults: boolean }[] = [
    { term: 'épée', weight: 14, hasResults: true },
    { term: 'potion de soin', weight: 12, hasResults: true },
    { term: 'bouclier', weight: 9, hasResults: true },
    { term: 'grimoire', weight: 8, hasResults: true },
    { term: 'armure', weight: 8, hasResults: true },
    { term: 'dague', weight: 6, hasResults: true },
    { term: 'amulette', weight: 5, hasResults: true },
    { term: 'élixir', weight: 5, hasResults: true },
    { term: 'code promo', weight: 5, hasResults: true },
    { term: 'casque', weight: 4, hasResults: true },
    { term: 'arc', weight: 4, hasResults: true },
    { term: 'parchemin', weight: 3, hasResults: true },
    { term: 'anneau', weight: 3, hasResults: true },
    { term: 'cadeau', weight: 2, hasResults: true },
    { term: 'baguette magique', weight: 6, hasResults: false },
    { term: 'bâton de mage', weight: 5, hasResults: false },
    { term: 'armure en mithril', weight: 4, hasResults: false },
    { term: 'potion de vol', weight: 3, hasResults: false },
    { term: 'dragon', weight: 3, hasResults: false },
];

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

function startOfUtcDay(timestamp: number): number {
    return Math.floor(timestamp / MS_PER_DAY) * MS_PER_DAY;
}

/**
 * Répartition du volume de la fenêtre sur ses jours. Les jours partiels (début de fenêtre,
 * et jour courant puisque `now` tombe en cours de journée) pèsent proportionnellement à la
 * part de journée couverte, comme les commandes qui ne couvrent que cette fenêtre.
 */
function buildDayShares(now: Date): { dayStart: number; share: number }[] {
    const windowStart = now.getTime() - WINDOW_DAYS * MS_PER_DAY;
    const days: { dayStart: number; weight: number }[] = [];

    for (let dayStart = startOfUtcDay(windowStart); dayStart <= now.getTime(); dayStart += MS_PER_DAY) {
        const coveredMs = Math.min(dayStart + MS_PER_DAY, now.getTime()) - Math.max(dayStart, windowStart);
        const weekdayFactor = WEEKDAY_FACTORS[new Date(dayStart).getUTCDay()];
        days.push({ dayStart, weight: (coveredMs / MS_PER_DAY) * weekdayFactor });
    }

    const totalWeight = days.reduce((total, day) => total + day.weight, 0);
    return days.filter((day) => day.weight > 0).map((day) => ({ dayStart: day.dayStart, share: day.weight / totalWeight }));
}

type CellShare = { channel: Channel; device: Device; share: number };

/**
 * Part de chaque couple (canal, appareil) dans les sessions, et sessions nécessaires par
 * commande completed. Pour qu'un couple convertisse au taux `getConversionRate` tout en
 * recevant ses commandes dans les proportions d'`orderWeight`, ses sessions doivent valoir
 * (poids des commandes / taux de conversion), d'où la normalisation par `sessionsPerOrder`.
 */
function buildCellShares(): { cells: CellShare[]; sessionsPerCompletedOrder: number } {
    const channelWeightTotal = CHANNELS.reduce((total, channel) => total + CHANNEL_PROFILES[channel].orderWeight, 0);
    const deviceWeightTotal = DEVICES.reduce((total, device) => total + DEVICE_PROFILES[device].orderWeight, 0);

    const rawCells = CHANNELS.flatMap((channel) =>
        DEVICES.map((device) => {
            const orderShare =
                (CHANNEL_PROFILES[channel].orderWeight / channelWeightTotal) *
                (DEVICE_PROFILES[device].orderWeight / deviceWeightTotal);
            return { channel, device, sessionsPerCompletedOrder: orderShare / getConversionRate(channel, device) };
        }),
    );

    const sessionsPerCompletedOrder = rawCells.reduce((total, cell) => total + cell.sessionsPerCompletedOrder, 0);
    const cells = rawCells.map(({ channel, device, sessionsPerCompletedOrder: cellSessions }) => ({
        channel,
        device,
        share: cellSessions / sessionsPerCompletedOrder,
    }));

    return { cells, sessionsPerCompletedOrder };
}

/**
 * Le trafic est dérivé des commandes (sessions de la boutique = commandes completed × sessions
 * nécessaires par commande), pour que revenu par visite et taux de conversion restent cohérents
 * avec le reste du dashboard. Les pages vues et les recherches internes en découlent à leur tour.
 *
 * Seedé à part de `generateDataset` (instance `SimpleFaker` locale) : les données de base ne
 * dépendent pas de ce module, et inversement.
 */
export function generateAnalyticsDataset(
    dataset: Dataset,
    now: Date = new Date(),
    tuning: AnalyticsTuning = DEFAULT_ANALYTICS_TUNING,
): AnalyticsDataset {
    const random = new SimpleFaker();
    random.seed(ANALYTICS_SEED + tuning.seedOffset);
    const jitter = (spread: number) => random.number.float({ min: 1 - spread, max: 1 + spread });

    const dayShares = buildDayShares(now);
    const { cells, sessionsPerCompletedOrder } = buildCellShares();

    const traffic: TrafficRow[] = [];
    const pageViews: PageViewRow[] = [];
    const searches: SearchRow[] = [];

    for (const shop of dataset.shops) {
        const completedOrders = dataset.orders.filter((order) => order.shopId === shop.id && order.status === 'completed');
        const shopSessions = (completedOrders.length * sessionsPerCompletedOrder) / tuning.conversionFactor;

        // Une page produit est d'autant plus consultée que le produit se vend : le poids de
        // consultation est 1 + unités vendues, ce qui laisse quand même une traîne de produits
        // vus mais peu ou jamais vendus.
        const unitsSoldByProduct = new Map<string, number>();
        completedOrders.forEach((order) =>
            order.lines.forEach((line) =>
                unitsSoldByProduct.set(line.productId, (unitsSoldByProduct.get(line.productId) ?? 0) + line.quantity),
            ),
        );
        const shopProducts = dataset.products
            .filter((product) => product.shopId === shop.id)
            .map((product) => ({ product, weight: 1 + (unitsSoldByProduct.get(product.id) ?? 0) }));
        const productWeightTotal = shopProducts.reduce((total, { weight }) => total + weight, 0);
        const staticWeightTotal = STATIC_PAGES.reduce((total, page) => total + page.weight, 0);
        const searchWeightTotal = SEARCH_TERMS.reduce((total, term) => total + term.weight, 0);

        for (const { dayStart, share: dayShare } of dayShares) {
            const date = new Date(dayStart).toISOString();
            let daySessions = 0;
            let dayPageViews = 0;

            for (const { channel, device, share: cellShare } of cells) {
                const channelProfile = CHANNEL_PROFILES[channel];
                const deviceProfile = DEVICE_PROFILES[device];

                const sessions = Math.round(shopSessions * dayShare * cellShare * jitter(0.2));
                if (sessions <= 0) continue;

                const users = Math.round(sessions * USERS_PER_SESSION);
                const engagementRate = clamp(
                    BASE_ENGAGEMENT_RATE + channelProfile.engagementDelta + deviceProfile.engagementDelta,
                    0.2,
                    0.9,
                );
                const engagedSessions = Math.min(sessions, Math.round(sessions * engagementRate * jitter(0.05)));
                const rowPageViews = Math.max(
                    sessions,
                    Math.round(
                        sessions * BASE_PAGES_PER_SESSION * channelProfile.pagesFactor * deviceProfile.pagesFactor * jitter(0.1),
                    ),
                );

                traffic.push({
                    date,
                    shopId: shop.id,
                    channel,
                    device,
                    sessions,
                    users,
                    newUsers: Math.min(users, Math.round(users * channelProfile.newUserShare)),
                    engagedSessions,
                    deepScrollSessions: Math.round(engagedSessions * DEEP_SCROLL_SHARE_OF_ENGAGED * jitter(0.1)),
                    totalSessionDurationSeconds: Math.round(
                        sessions *
                            BASE_SESSION_DURATION_SECONDS *
                            channelProfile.durationFactor *
                            deviceProfile.durationFactor *
                            jitter(0.1),
                    ),
                    pageViews: rowPageViews,
                });

                daySessions += sessions;
                dayPageViews += rowPageViews;
            }

            const productPageViews = dayPageViews * PRODUCT_PAGE_VIEW_SHARE;
            const staticPageViews = dayPageViews - productPageViews;

            for (const page of STATIC_PAGES) {
                const views = Math.round(staticPageViews * (page.weight / staticWeightTotal) * jitter(0.4));
                if (views <= 0) continue;

                pageViews.push({
                    date,
                    shopId: shop.id,
                    path: page.path,
                    title: page.title,
                    type: 'other',
                    views,
                    exits: Math.min(views, Math.round(views * page.exitRate * jitter(0.15))),
                });
            }

            for (const { product, weight } of shopProducts) {
                const views = Math.round(productPageViews * (weight / productWeightTotal) * jitter(0.5));
                if (views <= 0) continue;

                pageViews.push({
                    date,
                    shopId: shop.id,
                    path: `/produits/${product.id}`,
                    title: product.name,
                    type: 'product',
                    productId: product.id,
                    views,
                    exits: Math.min(views, Math.round(views * PRODUCT_PAGE_EXIT_RATE * jitter(0.15))),
                });
            }

            const daySearches = daySessions * SEARCH_RATE * jitter(0.2);
            for (const { term, weight, hasResults } of SEARCH_TERMS) {
                const termSearches = Math.round(daySearches * (weight / searchWeightTotal) * jitter(0.4));
                if (termSearches <= 0) continue;

                searches.push({ date, shopId: shop.id, term, hasResults, searches: termSearches });
            }
        }
    }

    return {
        traffic,
        pageViews,
        searches,
        adSpend: generateAdSpend(traffic, tuning),
        webVitals: generateWebVitals(traffic, tuning),
        errors: generateErrors(traffic, dataset.orders, tuning),
        emails: generateEmails(traffic, tuning),
    };
}
