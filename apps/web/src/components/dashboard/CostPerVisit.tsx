'use client';

import { useAdSpend } from '../../lib/queries/useAdSpend';
import { useTraffic } from '../../lib/queries/useTraffic';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateCostPerVisit } from '../../lib/kpis/costPerVisit';
import { CardList } from '../ui/Card';
import { channelLabels } from './channelLabels';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function CostPerVisit() {
    const dateRange = useDateRangeFilter();
    const { data: adSpend, isLoading: isAdSpendLoading, isError: isAdSpendError } = useAdSpend(dateRange);
    const { data: traffic, isLoading: isTrafficLoading, isError: isTrafficError } = useTraffic(dateRange);

    if (isAdSpendLoading || isTrafficLoading || !adSpend || !traffic) return <p>Chargement...</p>;
    if (isAdSpendError || isTrafficError) return <p>Erreur de chargement</p>;

    const items = calculateCostPerVisit(adSpend, traffic).map(({ channel, cost }) => ({
        id: channel,
        label: channelLabels[channel],
        value: currencyFormatter.format(cost),
    }));

    return <CardList items={items} />;
}
