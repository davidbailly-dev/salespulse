'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRefundRate } from '../../lib/kpis/refundRate';
import { ScoreGauge } from '../charts/ScoreGauge';

export function RefundRate() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const refundRate = calculateRefundRate(orders);

    return <ScoreGauge value={refundRate} unit="%" />;
}
