'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateRecurringOrdersRate } from '../../lib/kpis/recurringCustomers';
import { KpiValue } from './KpiValue';

export function RecurringCustomers() {
    const { data: orders, isLoading, isError } = useOrders();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const recurringOrdersRate = calculateRecurringOrdersRate(orders);

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={recurringOrdersRate} unit="%" />
            <span className="text-xs text-gray-400">des commandes</span>
        </div>
    );
}
