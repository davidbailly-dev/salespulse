'use client';

import { calculateTotalOrders } from '../../lib/kpis/totalOrders';
import { useOrders } from '../../lib/queries/useOrders';

export function TotalOrders() {
    const {data: orders, isLoading, isError} = useOrders();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const totalOrders = calculateTotalOrders(orders);

    return (
        <p>{totalOrders} commande(s)</p>
    )
}