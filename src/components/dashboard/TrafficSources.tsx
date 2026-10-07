'use client';

import { calculateTrafficSources } from '../../lib/kpis/trafficSources';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';
import { channelLabels } from './channelLabels';

export function TrafficSources() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateTrafficSources(traffic).map((source) => ({
        id: source.channel,
        label: channelLabels[source.channel],
        value: `${source.share} %`,
    }));

    return <CardList items={items} />;
}
