'use client';

import { calculateTrafficSources } from '../../lib/kpis/trafficSources';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import type { Channel } from '../../lib/mock-data/schemas';
import { CardList } from '../ui/Card';

const channelLabels: Record<Channel, string> = {
    organic: 'Organique',
    paid: 'Payant',
    direct: 'Direct',
    social: 'Réseaux sociaux',
    email: 'E-mail',
    referral: 'Référents',
};

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
