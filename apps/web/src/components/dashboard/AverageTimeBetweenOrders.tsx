'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateAverageTimeBetweenOrdersDays } from '../../lib/kpis/averageTimeBetweenOrders';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

export function AverageTimeBetweenOrders() {
    const { value: averageTimeBetweenOrdersDays, previousValue, isLoading, isError } = useComparedKpi(useOrders, calculateAverageTimeBetweenOrdersDays);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || averageTimeBetweenOrdersDays === undefined) return <p>Erreur de chargement</p>;

    if (averageTimeBetweenOrdersDays === null) return <KpiValue value="–" />;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={averageTimeBetweenOrdersDays} unit="jours entre deux commandes" />
            <KpiDelta current={averageTimeBetweenOrdersDays} previous={previousValue} polarity="lower-is-better" />
        </div>
    );
}
