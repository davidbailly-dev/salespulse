'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateAveragePurchaseFrequency } from '../../lib/kpis/averagePurchaseFrequency';
import { KpiValue } from './KpiValue';

export function AveragePurchaseFrequency() {
    const { data: orders, isLoading, isError } = useOrders();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averagePurchaseFrequency = calculateAveragePurchaseFrequency(orders);

    return <KpiValue value={averagePurchaseFrequency} unit="commandes / client actif" />;
}
