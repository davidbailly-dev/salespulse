'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateRevenue } from '../../lib/kpis/revenue';

export function Revenue() {
    const {data: orders, isLoading, isError} = useOrders();
    
    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const revenue = calculateRevenue(orders);

    return (
        <p>{revenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
    );
}