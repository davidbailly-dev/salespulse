'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateRevenuePerVisit } from '../../lib/kpis/revenuePerVisit';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function RevenuePerVisit() {
    const { value: revenuePerVisit, previousValue, isLoading, isError } = useComparedKpi2(
        useOrders,
        useTraffic,
        calculateRevenuePerVisit,
    );

    if (isLoading) return <p>Chargement...</p>;
    if (isError || revenuePerVisit === undefined) return <p>Erreur de chargement</p>;

    const parts = currencyFormatter.formatToParts(revenuePerVisit);

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
            <KpiDelta current={revenuePerVisit} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
