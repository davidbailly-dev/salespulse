'use client';

import { useErrors } from '../../lib/queries/useErrors';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateNotFoundRate } from '../../lib/kpis/notFoundRate';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function NotFoundRate() {
    const { value: notFoundRate, previousValue, isLoading, isError } = useComparedKpi2(useErrors, useTraffic, calculateNotFoundRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || notFoundRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={rateFormatter.format(notFoundRate)} unit="%" />
            <span className="text-xs text-gray-400 text-center">des pages vues sont des 404</span>
            <KpiDelta current={notFoundRate} previous={previousValue} polarity="lower-is-better" mode="points" />
        </div>
    );
}
