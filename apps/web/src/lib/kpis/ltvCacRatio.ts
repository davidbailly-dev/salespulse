import { Order } from '@salespulse/contracts';
import { calculateCustomerLifetimeValue } from './customerLifetimeValue';

/**
 * Ratio LTV/CAC, arrondi à une décimale. `null` sans CAC exploitable.
 *
 * La LTV est calculée en CA et non en marge (pas de champ marge dans le mock) : le ratio est donc
 * plus flatteur que le ratio marge/CAC utilisé en pratique (seuil usuel : 3 ou plus).
 */
export function calculateLtvCacRatio(orders: Order[], customerAcquisitionCost: number | null): number | null {
    if (!customerAcquisitionCost) return null;

    return Math.round((calculateCustomerLifetimeValue(orders) / customerAcquisitionCost) * 10) / 10;
}
