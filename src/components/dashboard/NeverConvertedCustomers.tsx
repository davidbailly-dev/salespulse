'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { useCustomers } from '../../lib/queries/useCustomers';
import { calculateNeverConvertedCustomers } from '../../lib/kpis/neverConvertedCustomers';
import { CardList } from '../ui/Card';

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short' });

export function NeverConvertedCustomers() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(useDateRangeFilter());
    const { data: customers, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();

    if (isOrdersLoading || isCustomersLoading) return <p>Chargement...</p>;
    if (isOrdersError || isCustomersError) return <p>Erreur de chargement</p>;

    const neverConvertedCustomers = calculateNeverConvertedCustomers(orders, customers);

    if (neverConvertedCustomers.length === 0) return <p className="text-gray-400">Tous les clients ont acheté</p>;

    const items = neverConvertedCustomers.map((customer) => ({
        id: customer.customerId,
        label: customer.name,
        value: dateFormatter.format(new Date(customer.registeredAt)),
        tone: 'danger' as const,
    }));

    return <CardList items={items} />;
}
