'use client';

import { calculateConversionByDevice } from '../../lib/kpis/deviceBreakdown';
import { useOrders } from '../../lib/queries/useOrders';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { CardList } from '../ui/Card';
import { deviceLabels } from './deviceLabels';

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ConversionByDevice() {
    const dateRange = useDateRangeFilter();
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(dateRange);
    const { data: traffic, isLoading: isTrafficLoading, isError: isTrafficError } = useTraffic(dateRange);

    if (isOrdersLoading || isTrafficLoading) return <p>Chargement...</p>;
    if (isOrdersError || isTrafficError) return <p>Erreur de chargement</p>;

    const items = calculateConversionByDevice(orders, traffic).map(({ device, rate }) => ({
        id: device,
        label: deviceLabels[device],
        value: `${rateFormatter.format(rate)} %`,
    }));

    return <CardList items={items} />;
}
