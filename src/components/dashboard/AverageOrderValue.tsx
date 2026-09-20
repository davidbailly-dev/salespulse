'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateAverageOrderValue } from '../../lib/kpis/averageOrderValue';

export function AverageOrderValue() {
    const {data: orders, isLoading, isError} = useOrders();
    
    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averageOrderValue = calculateAverageOrderValue(orders);

    return (
        <p>{averageOrderValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
    );
}