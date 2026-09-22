'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { useCustomers } from '../../lib/queries/useCustomers';
import { calculateTopCustomersByOrderCount } from '../../lib/kpis/topCustomersByOrderCount';
import { CardList } from '../ui/Card';

export function TopCustomersByOrderCount() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(useDateRangeFilter());
    const { data: customers, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();

    if (isOrdersLoading || isCustomersLoading) return <p>Chargement...</p>;
    if (isOrdersError || isCustomersError) return <p>Erreur de chargement</p>;

    // Récupère tous les clients pour mapper le nom d'un client par son id
    // indiqué dans order.customerId
    const customersById = new Map(customers.map((customer) => [customer.id, customer]));
    const topCustomers = calculateTopCustomersByOrderCount(orders);

    // Map les clients pour correspondre au format de données de <CardList>
    const items = topCustomers.map((customer) => ({
        id: customer.customerId,
        label: customersById.get(customer.customerId)?.name ?? customer.customerId,
        value: `x ${customer.orderCount}`,
    }));

    return <CardList items={items} />;
}
