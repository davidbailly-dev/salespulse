'use client';

import { calculateNotFoundRate } from '../../lib/kpis/notFoundRate';
import { useErrors } from '../../lib/queries/useErrors';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function NotFoundRate() {
    const dateRange = useDateRangeFilter();
    const { data: errors, isLoading: isErrorsLoading, isError: isErrorsError } = useErrors(dateRange);
    const { data: traffic, isLoading: isTrafficLoading, isError: isTrafficError } = useTraffic(dateRange);

    if (isErrorsLoading || isTrafficLoading) return <p>Chargement...</p>;
    if (isErrorsError || isTrafficError) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={rateFormatter.format(calculateNotFoundRate(errors, traffic))} unit="%" />
            <span className="text-xs text-gray-400 text-center">des pages vues sont des 404</span>
        </div>
    );
}
