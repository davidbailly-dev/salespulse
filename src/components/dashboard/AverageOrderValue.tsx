'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAverageOrderValue } from '../../lib/kpis/averageOrderValue';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function AverageOrderValue() {
    const { value: averageOrderValue, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateAverageOrderValue);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || averageOrderValue === undefined) return <p>Erreur de chargement</p>;

    const parts = currencyFormatter.formatToParts(averageOrderValue);

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
            <KpiDelta current={averageOrderValue} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
