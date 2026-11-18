'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculateCatalogCoverage } from '../../lib/kpis/catalogCoverage';
import { ScoreGauge } from '../charts/ScoreGauge';
import { KpiDelta } from './KpiDelta';

export function CatalogCoverage() {
    const { value: catalogCoverage, previousValue, isLoading, isError } = useComparedKpi2(useOrders, useProducts, calculateCatalogCoverage);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || catalogCoverage === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={catalogCoverage} unit="%" />
            <KpiDelta current={catalogCoverage} previous={previousValue} polarity="higher-is-better" mode="points" />
        </div>
    );
}
