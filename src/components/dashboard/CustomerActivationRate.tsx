'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useCustomers } from '../../lib/queries/useCustomers';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateCustomerActivationRate } from '../../lib/kpis/customerActivationRate';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function CustomerActivationRate() {
    const { value: activationRate, previousValue, isLoading, isError } = useComparedKpi2(useOrders, useCustomers, calculateCustomerActivationRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || activationRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={activationRate} unit="%" />
            <span className="text-xs text-gray-400 text-center">clients ayant déjà acheté</span>
            <KpiDelta current={activationRate} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
