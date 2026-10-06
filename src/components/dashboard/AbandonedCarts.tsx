'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAbandonedCartsRate } from '../../lib/kpis/abandonedCarts';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function AbandonedCarts() {
    const { value: abandonedCartsRate, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateAbandonedCartsRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || abandonedCartsRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={abandonedCartsRate} unit="%" />
            <KpiDelta current={abandonedCartsRate} previous={previousValue} polarity="lower-is-better" mode="points" />
        </div>
    );
}
