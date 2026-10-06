'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAveragePurchaseFrequency } from '../../lib/kpis/averagePurchaseFrequency';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function AveragePurchaseFrequency() {
    const { value: averagePurchaseFrequency, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateAveragePurchaseFrequency);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || averagePurchaseFrequency === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={averagePurchaseFrequency} unit="commandes / client actif" />
            <KpiDelta current={averagePurchaseFrequency} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
