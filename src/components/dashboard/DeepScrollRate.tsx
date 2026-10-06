'use client';

import { calculateDeepScrollRate } from '../../lib/kpis/deepScrollRate';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

export function DeepScrollRate() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={calculateDeepScrollRate(traffic)} unit="%" />
            <span className="text-xs text-gray-400 text-center">des sessions vont aux 3/4 de la page</span>
        </div>
    );
}
