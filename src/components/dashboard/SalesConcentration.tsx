'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateSalesConcentration } from '../../lib/kpis/salesConcentration';
import { ScoreGauge } from '../charts/ScoreGauge';

export function SalesConcentration() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(useDateRangeFilter());
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    const salesConcentration = calculateSalesConcentration(orders, products);

    return (
        <div className="flex flex-col items-center gap-1">
            <ScoreGauge value={salesConcentration} unit="%" />
            <span className="text-xs text-gray-400 text-center">CA généré par le top 20% des produits</span>
        </div>
    );
}
