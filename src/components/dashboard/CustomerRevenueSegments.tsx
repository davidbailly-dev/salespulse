'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateCustomerRevenueSegments } from '../../lib/kpis/customerRevenueSegments';
import { CardList } from '../ui/Card';

export function CustomerRevenueSegments() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const segments = calculateCustomerRevenueSegments(orders);

    const items = segments.map((segment) => ({
        id: segment.label,
        label: segment.label,
        value: String(segment.count),
    }));

    return <CardList items={items} />;
}
