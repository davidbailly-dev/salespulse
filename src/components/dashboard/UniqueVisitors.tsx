'use client';

import { calculateUniqueVisitors } from '../../lib/kpis/uniqueVisitors';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function UniqueVisitors() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const uniqueVisitors = calculateUniqueVisitors(traffic);
    const label = uniqueVisitors === 1 ? 'visiteur unique' : 'visiteurs uniques';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={numberFormatter.format(uniqueVisitors)} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}
