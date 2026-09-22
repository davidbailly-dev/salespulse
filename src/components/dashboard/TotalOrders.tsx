'use client';

import { calculateTotalOrders } from '../../lib/kpis/totalOrders';
import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

export function TotalOrders() {
    const {data: orders, isLoading, isError} = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const totalOrders = calculateTotalOrders(orders);
    const label = totalOrders === 1 ? 'commande' : 'commandes';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={totalOrders} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    )
}