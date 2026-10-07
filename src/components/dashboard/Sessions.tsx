'use client';

import { useTraffic } from '../../lib/queries/useTraffic';
import { useComparedKpi } from '../../lib/queries/useComparedKpi';
import { calculateSessions } from '../../lib/kpis/sessions';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function Sessions() {
    const { value: sessions, previousValue, isLoading, isError } = useComparedKpi(useTraffic, calculateSessions);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || sessions === undefined) return <p>Erreur de chargement</p>;

    const label = sessions === 1 ? 'session' : 'sessions';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={numberFormatter.format(sessions)} />
            <span className="text-xs text-gray-400">{label}</span>
            <KpiDelta current={sessions} previous={previousValue} polarity="higher-is-better" />
        </div>
    );
}
