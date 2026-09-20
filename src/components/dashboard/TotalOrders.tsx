'use client';

import { calculateTotalOrders } from '../../lib/kpis/totalOrders';
import { useOrders } from '../../lib/queries/useOrders';
import { KpiValue } from './KpiValue';

export function TotalOrders() {
    const {data: orders, isLoading, isError} = useOrders();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const totalOrders = calculateTotalOrders(orders);

    return (
        <KpiValue value={totalOrders} />
    )
}