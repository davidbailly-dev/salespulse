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

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={activationRate} unit="%" />
            <span className="text-xs text-gray-400 text-center">clients ayant déjà acheté</span>
        </div>
    );
}
