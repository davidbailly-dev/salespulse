import { DatasetSchema, OrderListSchema, type Dataset, type Order } from '@salespulse/contracts';
import { describe, expect, it } from 'vitest';
import { subtractOneYear } from '../dates/subtractOneYear';
import { generateDataset, WINDOW_DAYS } from './generator';
import { generateHistoryOrders } from './historyGenerator';

// Tests d'invariants : les valeurs tirées changent au moindre tirage ajouté, pas ces propriétés.

const NOW = new Date('2026-03-15T10:00:00.000Z');
const WINDOW_MS = WINDOW_DAYS * 24 * 60 * 60 * 1000;

const dataset = generateDataset(NOW);
const historyOrders = generateHistoryOrders(dataset, NOW);

function expectOrdersWithin(orders: Order[], windowEnd: Date): void {
    const dates = orders.map((order) => new Date(order.date).getTime());
    expect(Math.min(...dates)).toBeGreaterThanOrEqual(windowEnd.getTime() - WINDOW_MS);
    expect(Math.max(...dates)).toBeLessThanOrEqual(windowEnd.getTime());
}

/** Commandes qui citent un client ou un produit d'une autre boutique que la leur. */
function findCrossShopOrders(orders: Order[], { products, customers }: Dataset): Order[] {
    const shopOfProduct = new Map(products.map((product) => [product.id, product.shopId]));
    const shopOfCustomer = new Map(customers.map((customer) => [customer.id, customer.shopId]));

    return orders.filter(
        (order) =>
            shopOfCustomer.get(order.customerId) !== order.shopId ||
            order.lines.some((line) => shopOfProduct.get(line.productId) !== order.shopId),
    );
}

describe('generateDataset', () => {
    it('respecte le schéma du jeu de données', () => {
        expect(() => DatasetSchema.parse(dataset)).not.toThrow();
    });

    it('donne le même jeu de données pour le même `now`', () => {
        expect(generateDataset(NOW)).toEqual(dataset);
    });

    it('date les commandes dans les `WINDOW_DAYS` jours qui précèdent `now`', () => {
        expectOrdersWithin(dataset.orders, NOW);
    });

    it('inscrit les clients dans les deux ans qui précèdent `now`', () => {
        const dates = dataset.customers.map((customer) => new Date(customer.registeredAt).getTime());

        expect(Math.min(...dates)).toBeGreaterThanOrEqual(subtractOneYear(subtractOneYear(NOW)).getTime());
        expect(Math.max(...dates)).toBeLessThanOrEqual(NOW.getTime());
    });

    it('ne fait citer à une commande que des clients et des produits de sa boutique', () => {
        expect(findCrossShopOrders(dataset.orders, dataset)).toEqual([]);
    });
});

describe('generateHistoryOrders', () => {
    it('respecte le schéma des commandes', () => {
        expect(() => OrderListSchema.parse(historyOrders)).not.toThrow();
    });

    it('donne les mêmes commandes pour les mêmes entrées', () => {
        expect(generateHistoryOrders(dataset, NOW)).toEqual(historyOrders);
    });

    it('date les commandes dans la même fenêtre, un an plus tôt', () => {
        expectOrdersWithin(historyOrders, subtractOneYear(NOW));
    });

    it('ne fait citer à une commande que des clients et des produits de sa boutique', () => {
        expect(findCrossShopOrders(historyOrders, dataset)).toEqual([]);
    });
});
