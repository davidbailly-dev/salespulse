'use client';

import { calculateSessionsByDevice } from '../../lib/kpis/deviceBreakdown';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';
import { deviceLabels } from './deviceLabels';

export function SessionsByDevice() {
    const { data: traffic, isLoading, isError } = useTraffic(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateSessionsByDevice(traffic).map(({ device, share }) => ({
        id: device,
        label: deviceLabels[device],
        value: `${share} %`,
    }));

    return <CardList items={items} />;
}
