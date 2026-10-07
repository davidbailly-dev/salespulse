'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateDeepScrollRate } from '../../lib/kpis/deepScrollRate';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function DeepScrollRate() {
    const { value: deepScrollRate, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculateDeepScrollRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || deepScrollRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={deepScrollRate} unit="%" />
            <span className="text-xs text-gray-400 text-center">des sessions vont aux 3/4 de la page</span>
            <KpiDelta current={deepScrollRate} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
