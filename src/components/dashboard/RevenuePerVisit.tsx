'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRevenuePerVisit } from '../../lib/kpis/revenuePerVisit';
import { KpiValue } from './KpiValue';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function RevenuePerVisit() {
    const dateRange = useDateRangeFilter();
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(dateRange);
    const { data: traffic, isLoading: isTrafficLoading, isError: isTrafficError } = useTraffic(dateRange);

    if (isOrdersLoading || isTrafficLoading) return <p>Chargement...</p>;
    if (isOrdersError || isTrafficError) return <p>Erreur de chargement</p>;

    const parts = currencyFormatter.formatToParts(calculateRevenuePerVisit(orders, traffic));

    // On sépare le nombre formaté (groupes de milliers, décimales) du symbole
    // monétaire, pour pouvoir les afficher dans deux tailles différentes via KpiValue.
    const value = parts
        .filter((part) => part.type !== 'currency' && part.type !== 'literal')
        .map((part) => part.value)
        .join('');
    const unit = parts.find((part) => part.type === 'currency')?.value ?? '';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={value} unit={unit} />
            <span className="text-xs text-gray-400">par visite</span>
        </div>
    );
}
