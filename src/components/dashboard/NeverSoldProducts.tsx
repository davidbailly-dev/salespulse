'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useProducts } from '../../lib/queries/useProducts';
import { calculateNeverSoldProducts } from '../../lib/kpis/neverSoldProducts';
import { CardList } from '../ui/Card';

export function NeverSoldProducts() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: products, isLoading: isProductsLoading, isError: isProductsError } = useProducts();

    if (isOrdersLoading || isProductsLoading) return <p>Chargement...</p>;
    if (isOrdersError || isProductsError) return <p>Erreur de chargement</p>;

    const neverSoldProducts = calculateNeverSoldProducts(orders, products);

    if (neverSoldProducts.length === 0) return <p className="text-gray-400">Aucun produit invendu</p>;

    const items = neverSoldProducts.map((product) => ({
        id: product.productId,
        label: product.name,
        value: product.category,
        tone: 'danger' as const,
    }));

    return <CardList items={items} />;
}
