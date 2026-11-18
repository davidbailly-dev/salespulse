import { AdSpendRow, Order } from '../mock-data/schemas';
import { sumCompletedRevenue } from './revenue';

/**
 * ROAS : CA des commandes completed issues des canaux qui ont une dépense / Σ dépenses, arrondi à
 * une décimale (3,7 = 3,70 EUR de CA par euro dépensé). `null` sans dépense sur la période.
 *
 * Attribution au dernier clic : `Order.channel` est le canal de la session qui a converti. Les
 * canaux avec dépense sont déduits des lignes de dépense, pas listés en dur ici.
 */
export function calculateRoas(orders: Order[], adSpend: AdSpendRow[]): number | null {
    const totalSpend = adSpend.reduce((total, row) => total + row.spend, 0);
    if (totalSpend === 0) return null;

    const spendChannels = new Set(adSpend.map((row) => row.channel));
    const attributedRevenue = sumCompletedRevenue(orders.filter((order) => spendChannels.has(order.channel)));

    return Math.round((attributedRevenue / totalSpend) * 10) / 10;
}
