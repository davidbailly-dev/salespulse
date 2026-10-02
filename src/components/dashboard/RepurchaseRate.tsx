'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRepurchaseRate } from '../../lib/kpis/repurchaseRate';
import { ScoreGauge } from '../charts/ScoreGauge';

export function RepurchaseRate() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const repurchaseRate = calculateRepurchaseRate(orders);

    return <ScoreGauge value={repurchaseRate} unit="%" />;
}
