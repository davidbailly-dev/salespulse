'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useAdSpend } from '../../lib/queries/useAdSpend';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateRoas } from '../../lib/kpis/roas';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const decimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function Roas() {
    const { value: roas, previousValue, isLoading, isError } = useComparedKpi2(useOrders, useAdSpend, calculateRoas);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || roas === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={roas === null ? '–' : decimalFormatter.format(roas)} unit={roas === null ? undefined : '×'} />
            <span className="text-xs text-gray-400 text-center">de CA par € dépensé</span>
            <KpiDelta current={roas} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
