'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateTotalItemsSold } from '../../lib/kpis/totalItemsSold';
import { KpiValue } from './KpiValue';

export function TotalItemsSold() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const totalItemsSold = calculateTotalItemsSold(orders);
    const label = totalItemsSold === 1 ? 'article vendu' : 'articles vendus';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={totalItemsSold} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}
