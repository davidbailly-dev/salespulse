'use client';

import { calculateTotalOrders } from '../../lib/kpis/totalOrders';
import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function TotalOrders() {
    const { value: totalOrders, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateTotalOrders);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || totalOrders === undefined) return <p>Erreur de chargement</p>;

    const label = totalOrders === 1 ? 'commande' : 'commandes';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={totalOrders} />
            <span className="text-xs text-gray-400">{label}</span>
            <KpiDelta current={totalOrders} previous={previousValue} polarity="higher-is-better" />
        </div>
    )
}
