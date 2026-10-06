'use client';

import { calculateAverageSessionDuration } from '../../lib/kpis/averageSessionDuration';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

export function AverageSessionDuration() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const durationSeconds = calculateAverageSessionDuration(traffic);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;

    return (
        <div className="flex gap-4">
            {minutes > 0 && <KpiValue value={minutes} unit="min" />}
            <KpiValue value={seconds} unit="s" />
        </div>
    );
}
