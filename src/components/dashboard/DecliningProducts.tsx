'use client';

import { useMemo, useState } from 'react';
import { useProducts } from '../../lib/queries/useProducts';
import { generateDecliningProductCandidates, type DecliningProductsMetric } from '../../lib/kpis/decliningProducts';
import { CardList } from '../ui/Card';

const metrics: { value: DecliningProductsMetric; label: string }[] = [
    { value: 'revenue', label: 'CA' },
    { value: 'quantity', label: 'Qté' },
];

export function DecliningProducts() {
    const [metric, setMetric] = useState<DecliningProductsMetric>('revenue');
    const { data: products, isLoading, isError } = useProducts();

    // Échantillon figé tant que les données sont aléatoires (placeholder) : régénéré
    // uniquement quand `products` change, pas à chaque switch CA/Qté.
    const candidates = useMemo(
        () => (products ? generateDecliningProductCandidates(products) : []),
        [products],
    );

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const key = metric === 'revenue' ? 'revenueChangePercent' : 'quantityChangePercent';
    const decliningProducts = [...candidates].sort((a, b) => a[key] - b[key]).slice(0, 5);

    const items = decliningProducts.map((product) => ({
        id: product.productId,
        label: product.name,
        value: `${product[key]}%`,
        tone: 'danger' as const,
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
