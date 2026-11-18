'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateConversionRate } from '../../lib/kpis/conversionRate';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function ConversionRate() {
    const { value: conversionRate, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateConversionRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || conversionRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={conversionRate} unit="%" />
            <KpiDelta current={conversionRate} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
