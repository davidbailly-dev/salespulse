import { SimpleFaker } from '@faker-js/faker';
import { subtractOneYear } from '../dates/subtractOneYear';
import {
    buildWeightedCustomers,
    buildWeightedProducts,
    generateLines,
    ORDER_COUNT,
    SHOP_CONFIGS,
    WINDOW_DAYS,
} from './generator';
import type { Channel, Dataset, Device, Order, OrderStatus } from '@salespulse/contracts';
import { CHANNEL_PROFILES, CHANNELS, DEVICE_PROFILES, DEVICES } from './trafficProfiles';

const HISTORY_SEED = 626262;

// Tendances de la fenêtre N-1 par rapport à la fenêtre actuelle, pour que la comparaison d'une
// année sur l'autre donne un mélange de hausses et de baisses plutôt que du bruit aléatoire :
// - plus de paniers abandonnés et moins de remboursements en N-1 (N a donc moins d'abandons et
//   plus de remboursements) ;
// - moins de lignes par commande en N-1 (le panier moyen progresse en N) ;
// - le volume par boutique est dans `SHOP_CONFIGS` (`historyVolumeFactor`).
const HISTORY_STATUS_WEIGHTS: { value: OrderStatus; weight: number }[] = [
    { value: 'completed', weight: 75 },
    { value: 'abandoned', weight: 23 },
    { value: 'refunded', weight: 2 },
];
const HISTORY_LINE_COUNT_WEIGHTS = [
    { value: 1, weight: 30 },
    { value: 2, weight: 30 },
    { value: 3, weight: 25 },
    { value: 4, weight: 15 },
];

/**
 * Commandes de la fenêtre "N-1" : les `WINDOW_DAYS` jours se terminant un an avant `now`, avec les
 * mêmes boutiques, produits et clients que la fenêtre actuelle (un client N-1 peut donc revenir
 * en N, ce qui rend "nouveau client" cohérent). Seedé à part : ajouter cette fenêtre ne change
 * aucune commande existante.
 *
 * `Customer.registeredAt` n'est pas contraint à précéder la commande : dans le mock, c'est déjà
 * une date indépendante des commandes, y compris pour la fenêtre actuelle.
 */
export function generateHistoryOrders(dataset: Dataset, now: Date): Order[] {
    const random = new SimpleFaker();
    random.seed(HISTORY_SEED);
    const historyNow = subtractOneYear(now);

    const pickChannel = (): Channel =>
        random.helpers.weightedArrayElement(
            CHANNELS.map((channel) => ({ value: channel, weight: CHANNEL_PROFILES[channel].orderWeight })),
        );
    const pickDevice = (): Device =>
        random.helpers.weightedArrayElement(
            DEVICES.map((device) => ({ value: device, weight: DEVICE_PROFILES[device].orderWeight })),
        );

    const orders: Order[] = [];

    for (const { id: shopId, share, historyVolumeFactor } of SHOP_CONFIGS) {
        const weightedProducts = buildWeightedProducts(dataset.products.filter((product) => product.shopId === shopId));
        const weightedCustomers = buildWeightedCustomers(dataset.customers.filter((customer) => customer.shopId === shopId));
        const count = Math.round(ORDER_COUNT * share * historyVolumeFactor);

        for (let index = 0; index < count; index++) {
            const offsetHours = random.number.float({ min: 0, max: WINDOW_DAYS * 24 });
            const date = new Date(historyNow.getTime() - offsetHours * 60 * 60 * 1000);
            const lines = generateLines(
                weightedProducts,
                random,
                random.helpers.weightedArrayElement(HISTORY_LINE_COUNT_WEIGHTS),
            );
            const totalAmount = lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0);

            orders.push({
                id: random.string.uuid(),
                shopId,
                customerId: random.helpers.weightedArrayElement(weightedCustomers).id,
                date: date.toISOString(),
                status: random.helpers.weightedArrayElement(HISTORY_STATUS_WEIGHTS),
                lines,
                totalAmount: Number(totalAmount.toFixed(2)),
                channel: pickChannel(),
                device: pickDevice(),
            });
        }
    }

    return orders;
}
