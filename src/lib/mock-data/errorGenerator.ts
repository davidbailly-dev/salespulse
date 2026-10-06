import { SimpleFaker } from '@faker-js/faker';
import type { ErrorRow, Order, TrafficRow } from './schemas';

const ERRORS_SEED = 919191;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Part des pages vues qui tombent sur une 404 (liens périmés, anciennes URL de produits).
const NOT_FOUND_RATE = 0.012;
// Part des tentatives de paiement qui échouent : échecs / (échecs + commandes completed).
const PAYMENT_FAILURE_RATE = 0.04;

/**
 * Erreurs dérivées du trafic (404 ~ pages vues du jour) et des commandes (échecs de paiement ~
 * commandes completed du jour, de sorte que le taux d'échec mesuré reste proche de
 * `PAYMENT_FAILURE_RATE`). Seedé à part, comme les autres jeux analytics.
 */
export function generateErrors(traffic: TrafficRow[], orders: Order[]): ErrorRow[] {
    const random = new SimpleFaker();
    random.seed(ERRORS_SEED);
    const jitter = (spread: number) => random.number.float({ min: 1 - spread, max: 1 + spread });
    // Arrondi aléatoire non biaisé : une boutique n'a que quelques commandes par jour, donc
    // un arrondi classique ramènerait presque toujours les échecs de paiement à zéro.
    const randomRound = (value: number) => Math.floor(value + random.number.float({ min: 0, max: 1 }));

    const pageViewsByKey = new Map<string, { date: string; shopId: string; pageViews: number }>();
    traffic.forEach(({ date, shopId, pageViews }) => {
        const key = `${date}|${shopId}`;
        const entry = pageViewsByKey.get(key);
        if (entry) entry.pageViews += pageViews;
        else pageViewsByKey.set(key, { date, shopId, pageViews });
    });

    const completedOrdersByKey = new Map<string, number>();
    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            const dayStart = Math.floor(new Date(order.date).getTime() / MS_PER_DAY) * MS_PER_DAY;
            const key = `${new Date(dayStart).toISOString()}|${order.shopId}`;
            completedOrdersByKey.set(key, (completedOrdersByKey.get(key) ?? 0) + 1);
        });

    const rows: ErrorRow[] = [];
    for (const [key, { date, shopId, pageViews }] of pageViewsByKey) {
        const notFound = randomRound(pageViews * NOT_FOUND_RATE * jitter(0.3));
        if (notFound > 0) rows.push({ date, shopId, type: 'not_found', count: notFound });

        const completedOrders = completedOrdersByKey.get(key) ?? 0;
        const paymentFailed = randomRound(
            completedOrders * (PAYMENT_FAILURE_RATE / (1 - PAYMENT_FAILURE_RATE)) * jitter(0.3),
        );
        if (paymentFailed > 0) rows.push({ date, shopId, type: 'payment_failed', count: paymentFailed });
    }

    return rows;
}
