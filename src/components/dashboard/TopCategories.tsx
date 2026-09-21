'use client';

import { useState } from 'react';
import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateTopCategories, type TopCategoriesMetric } from '../../lib/kpis/topCategories';
import { CardList } from '../ui/Card';

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

const metrics: { value: TopCategoriesMetric; label: string }[] = [
    { value: 'revenue', label: 'CA' },
    { value: 'quantity', label: 'Qté' },
];

export function TopCategories() {
    const [metric, setMetric] = useState<TopCategoriesMetric>('revenue');
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    const topCategories = calculateTopCategories(orders, products, metric);

    // Map les catégories pour correspondre au format de données de <CardList>
    const items = topCategories.map((category) => ({
        id: category.category,
        label: category.category,
        value: metric === 'revenue'
            ? currencyFormatter.format(category.revenue)
            : `x ${category.quantity}`,
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
