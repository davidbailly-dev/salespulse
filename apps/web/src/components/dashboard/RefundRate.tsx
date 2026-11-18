'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateRefundRate } from '../../lib/kpis/refundRate';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function RefundRate() {
    const { value: refundRate, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateRefundRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || refundRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={refundRate} unit="%" />
            <KpiDelta current={refundRate} previous={previousValue} polarity="lower-is-better" mode="points" />
        </div>
    );
}
