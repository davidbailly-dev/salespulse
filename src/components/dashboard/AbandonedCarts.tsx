'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateAbandonedCartsRate } from '../../lib/kpis/abandonedCarts';
import { ScoreGauge } from '../charts/ScoreGauge';

export function AbandonedCarts() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const abandonedCartsRate = calculateAbandonedCartsRate(orders);

    return <ScoreGauge value={abandonedCartsRate} unit="%" />;
}
