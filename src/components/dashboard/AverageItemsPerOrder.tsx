'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAverageItemsPerOrder } from '../../lib/kpis/averageItemsPerOrder';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function AverageItemsPerOrder() {
    const { value: averageItemsPerOrder, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateAverageItemsPerOrder);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || averageItemsPerOrder === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={averageItemsPerOrder} unit="articles / commande" />
            <KpiDelta current={averageItemsPerOrder} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
