'use client';

import { useState } from 'react';
import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateTopProducts, type TopProductsMetric } from '../../lib/kpis/topProducts';
import { CardList } from '../ui/Card';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const metrics: { value: TopProductsMetric; label: string }[] = [
    { value: 'revenue', label: 'CA' },
    { value: 'quantity', label: 'Qté' },
];

export function TopProducts() {
    const [metric, setMetric] = useState<TopProductsMetric>('revenue');
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    // Récupère tous les produits pour mapper récupérer le nom d'un produit par son id
    // indiqué dans order.lines
    const productsById = new Map(products.map((product) => [product.id, product]));
    const topProducts = calculateTopProducts(orders, metric);

    // Map les produits pour correspondre au format de données de <CardList>
    const items = topProducts.map((product) => ({
        id: product.productId,
        label: productsById.get(product.productId)?.name ?? product.productId,
        value: metric === 'revenue'
            ? currencyFormatter.format(product.revenue)
            : `x ${product.quantity}`,
    }));

    return (
        <div className="flex flex-col gap-3 w-full">
            <div className="flex gap-2 self-end">
                {metrics.map(({ value, label }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => setMetric(value)}
                        className={`px-2 py-1 text-sm rounded-lg border transition-colors cursor-pointer ${
                            metric === value
                                ? 'bg-secondary-500 border-secondary-500 text-white'
                                : 'border-border text-gray-400 hover:border-secondary-500/40'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <CardList items={items} />
        </div>
    );
}
