'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { calculateConversionRate } from '../../lib/kpis/conversionRate';
import { ScoreGauge } from '../charts/ScoreGauge';

export function ConversionRate() {
    const { data: orders, isLoading, isError } = useOrders();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const conversionRate = calculateConversionRate(orders);

    return <ScoreGauge value={conversionRate} unit="%" />;
}
