'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculatePagesPerSession } from '../../lib/kpis/pagesPerSession';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const decimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function PagesPerSession() {
    const { value: pagesPerSession, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculatePagesPerSession);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || pagesPerSession === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={decimalFormatter.format(pagesPerSession)} />
            <span className="text-xs text-gray-400">pages par session</span>
            <KpiDelta current={pagesPerSession} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
