'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateEngagementRate } from '../../lib/kpis/engagementRate';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function EngagementRate() {
    const { value: engagementRate, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculateEngagementRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || engagementRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={engagementRate} unit="%" />
            <KpiDelta current={engagementRate} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
