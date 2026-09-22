'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRecurringOrdersRate } from '../../lib/kpis/recurringCustomers';
import { KpiValue } from './KpiValue';

export function RecurringCustomers() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const recurringOrdersRate = calculateRecurringOrdersRate(orders);
    // Complémentaire du taux récurrent (pas un second calcul indépendant), pour garantir
    // que les deux valeurs affichées somment toujours à 100 malgré l'arrondi.
    const newOrdersRate = 100 - recurringOrdersRate;

    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-1">
                <KpiValue value={recurringOrdersRate} unit="%" />
                <span className="text-xs text-gray-400 text-center">commandes récurrentes</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <KpiValue value={newOrdersRate} unit="%" />
                <span className="text-xs text-gray-400 text-center">commandes nouvelles</span>
            </div>
        </div>
    );
}
