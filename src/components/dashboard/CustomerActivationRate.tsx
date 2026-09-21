'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useCustomers } from '../../lib/queries/useCustomers';
import { calculateCustomerActivationRate } from '../../lib/kpis/customerActivationRate';
import { ScoreGauge } from '../charts/ScoreGauge';

export function CustomerActivationRate() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: customers, isLoading: isCustomersLoading, isError: isCustomersError } = useCustomers();

    if (isOrdersLoading || isCustomersLoading) return <p>Chargement...</p>;
    if (isOrdersError || isCustomersError) return <p>Erreur de chargement</p>;

    const activationRate = calculateCustomerActivationRate(orders, customers);

    return <ScoreGauge value={activationRate} unit="%" />;
}
