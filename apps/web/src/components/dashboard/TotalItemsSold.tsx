'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateTotalItemsSold } from '../../lib/kpis/totalItemsSold';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function TotalItemsSold() {
    const { value: totalItemsSold, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateTotalItemsSold);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || totalItemsSold === undefined) return <p>Erreur de chargement</p>;

    const label = totalItemsSold === 1 ? 'article vendu' : 'articles vendus';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={totalItemsSold} />
            <span className="text-xs text-gray-400">{label}</span>
            <KpiDelta current={totalItemsSold} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
