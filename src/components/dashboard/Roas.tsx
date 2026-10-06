'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useAdSpend } from '../../lib/queries/useAdSpend';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRoas } from '../../lib/kpis/roas';
import { KpiValue } from './KpiValue';

const decimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function Roas() {
    const dateRange = useDateRangeFilter();
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(dateRange);
    const { data: adSpend, isLoading: isAdSpendLoading, isError: isAdSpendError } = useAdSpend(dateRange);

    if (isOrdersLoading || isAdSpendLoading) return <p>Chargement...</p>;
    if (isOrdersError || isAdSpendError) return <p>Erreur de chargement</p>;

    const roas = calculateRoas(orders, adSpend);

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={roas === null ? '–' : decimalFormatter.format(roas)} unit={roas === null ? undefined : '×'} />
            <span className="text-xs text-gray-400 text-center">de CA par € dépensé</span>
        </div>
    );
}
