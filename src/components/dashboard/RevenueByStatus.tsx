'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateRevenueByStatus } from '../../lib/kpis/revenueByStatus';
import { CardList } from '../ui/Card';
import { OrderStatus } from '../../lib/mock-data/schemas';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const statusLabels: Record<OrderStatus, string> = {
    completed: 'Complétées',
    abandoned: 'Abandonnées',
    refunded: 'Remboursées',
};

const statusTones: Record<OrderStatus, 'default' | 'danger' | 'success'> = {
    completed: 'success',
    abandoned: 'default',
    refunded: 'danger',
};

export function RevenueByStatus() {
    const { data: orders, isLoading, isError } = useOrders(useDateRangeFilter());

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const revenueByStatus = calculateRevenueByStatus(orders);

    const items = revenueByStatus.map(({ status, revenue }) => ({
        id: status,
        label: statusLabels[status],
        value: currencyFormatter.format(revenue),
        tone: statusTones[status],
    }));

    return <CardList items={items} />;
}
