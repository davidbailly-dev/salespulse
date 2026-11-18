'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateSalesConcentration } from '../../lib/kpis/salesConcentration';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function SalesConcentration() {
    const { value: salesConcentration, previousValue, isLoading, isError } = useComparedKpi2(useOrders, useProducts, calculateSalesConcentration);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || salesConcentration === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={salesConcentration} unit="%" />
            <span className="text-xs text-gray-400 text-center">CA généré par le top 20% des produits</span>
            <KpiDelta current={salesConcentration} previous={previousValue} polarity="neutral" mode="points" />
        </div>
    );
}
