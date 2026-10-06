'use client';

import { calculateSessions } from '../../lib/kpis/sessions';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function Sessions() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const sessions = calculateSessions(traffic);
    const label = sessions === 1 ? 'session' : 'sessions';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={numberFormatter.format(sessions)} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}
