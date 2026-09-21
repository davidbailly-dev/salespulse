'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateAverageOrderValue } from '../../lib/kpis/averageOrderValue';
import { KpiValue } from './KpiValue';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

export function AverageOrderValue() {
    const {data: orders, isLoading, isError} = useOrders();
    
    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averageOrderValue = calculateAverageOrderValue(orders);
    const parts = currencyFormatter.formatToParts(averageOrderValue);

    // On sépare le nombre formaté (groupes de milliers, décimales) du symbole
    // monétaire, pour pouvoir les afficher dans deux tailles différentes via KpiValue.
    const value = parts
        .filter((part) => part.type !== 'currency' && part.type !== 'literal')
        .map((part) => part.value)
        .join('');
    const unit = parts.find((part) => part.type === 'currency')?.value ?? '';

    return (
        <KpiValue value={value} unit={unit} /> 
    );
}