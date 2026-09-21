'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateSalesConcentration } from '../../lib/kpis/salesConcentration';
import { ScoreGauge } from '../charts/ScoreGauge';

export function SalesConcentration() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    const salesConcentration = calculateSalesConcentration(orders, products);

    return <ScoreGauge value={salesConcentration} unit="%" />;
}
