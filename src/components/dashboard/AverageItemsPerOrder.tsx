'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateAverageItemsPerOrder } from '../../lib/kpis/averageItemsPerOrder';
import { KpiValue } from './KpiValue';

export function AverageItemsPerOrder() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averageItemsPerOrder = calculateAverageItemsPerOrder(orders);

    return <KpiValue value={averageItemsPerOrder} unit="articles / commande" />;
}
