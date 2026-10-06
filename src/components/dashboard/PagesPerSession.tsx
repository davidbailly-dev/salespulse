'use client';

import { calculatePagesPerSession } from '../../lib/kpis/pagesPerSession';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

const decimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function PagesPerSession() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={decimalFormatter.format(calculatePagesPerSession(traffic))} />
            <span className="text-xs text-gray-400">pages par session</span>
        </div>
    );
}
