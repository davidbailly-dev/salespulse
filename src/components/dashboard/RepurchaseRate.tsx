'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateRepurchaseRate } from '../../lib/kpis/repurchaseRate';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function RepurchaseRate() {
    const { value: repurchaseRate, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateRepurchaseRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || repurchaseRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={repurchaseRate} unit="%" />
            <KpiDelta current={repurchaseRate} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
