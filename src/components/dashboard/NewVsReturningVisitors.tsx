'use client';

import { calculateNewVisitorsRate } from '../../lib/kpis/newVisitorsRate';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

export function NewVsReturningVisitors() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const newVisitorsRate = calculateNewVisitorsRate(traffic);
    // Complémentaire de la part de nouveaux visiteurs (pas un second calcul indépendant), pour
    // garantir que les deux valeurs affichées somment toujours à 100 malgré l'arrondi.
    const returningVisitorsRate = 100 - newVisitorsRate;

    return (
        <div className="flex gap-8">
            <div className="flex flex-col items-center gap-1">
                <KpiValue value={newVisitorsRate} unit="%" />
                <span className="text-xs text-gray-400 text-center">visiteurs nouveaux</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <KpiValue value={returningVisitorsRate} unit="%" />
                <span className="text-xs text-gray-400 text-center">visiteurs récurrents</span>
            </div>
        </div>
    );
}
