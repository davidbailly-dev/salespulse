'use client';

import { useAdSpend } from '../../lib/queries/useAdSpend';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateCostPerClick } from '../../lib/kpis/costPerClick';
import { CardList } from '../ui/Card';
import { channelLabels } from './channelLabels';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function CostPerClick() {
    const { data: adSpend, isLoading, isError } = useAdSpend(useDateRangeFilter());

    if (isLoading || !adSpend) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const items = calculateCostPerClick(adSpend).map(({ channel, cost }) => ({
        id: channel,
        label: channelLabels[channel],
        value: currencyFormatter.format(cost),
    }));

    return <CardList items={items} />;
}
