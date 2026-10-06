'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateUniqueVisitors } from '../../lib/kpis/uniqueVisitors';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function UniqueVisitors() {
    const { value: uniqueVisitors, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculateUniqueVisitors);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || uniqueVisitors === undefined) return <p>Erreur de chargement</p>;

    const label = uniqueVisitors === 1 ? 'visiteur unique' : 'visiteurs uniques';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={numberFormatter.format(uniqueVisitors)} />
            <span className="text-xs text-gray-400">{label}</span>
            <KpiDelta current={uniqueVisitors} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
