'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateAverageTimeBetweenOrdersDays } from '../../lib/kpis/averageTimeBetweenOrders';
import { KpiValue } from './KpiValue';

export function AverageTimeBetweenOrders() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averageTimeBetweenOrdersDays = calculateAverageTimeBetweenOrdersDays(orders);

    if (averageTimeBetweenOrdersDays === null) return <KpiValue value="–" />;

    return <KpiValue value={averageTimeBetweenOrdersDays} unit="jours entre deux commandes" />;
}
