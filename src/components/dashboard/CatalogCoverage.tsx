'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateCatalogCoverage } from '../../lib/kpis/catalogCoverage';
import { ScoreGauge } from '../charts/ScoreGauge';

export function CatalogCoverage() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    const catalogCoverage = calculateCatalogCoverage(orders, products);

    return <ScoreGauge value={catalogCoverage} unit="%" />;
}
