'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAverageSessionDuration } from '../../lib/kpis/averageSessionDuration';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function AverageSessionDuration() {
    const { value: durationSeconds, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculateAverageSessionDuration);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || durationSeconds === undefined) return <p>Erreur de chargement</p>;

    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex gap-4">
                {minutes > 0 && <KpiValue value={minutes} unit="min" />}
                <KpiValue value={seconds} unit="s" />
            </div>
            <KpiDelta current={durationSeconds} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
