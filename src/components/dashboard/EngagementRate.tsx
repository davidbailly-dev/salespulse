'use client';

import { calculateEngagementRate } from '../../lib/kpis/engagementRate';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { ScoreGauge } from '../charts/ScoreGauge';

export function EngagementRate() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    return <ScoreGauge value={calculateEngagementRate(traffic)} unit="%" />;
}
