import { Product } from '../mock-data/schemas';

export type DecliningProductsMetric = 'revenue' | 'quantity';

export type ProductDecline = {
    productId: string;
    name: string;
    revenueChangePercent: number;
    quantityChangePercent: number;
};

const randomDeclinePercent = () => -Math.round(5 + Math.random() * 25);

/**
 * Placeholder tant que le filtre de dates n'existe pas (voir CLAUDE.md) : associe à un
 * échantillon de produits une baisse fictive par métrique, à remplacer par une vraie
 * comparaison entre la fenêtre courante et la fenêtre précédente une fois le filtre dispo.
 * Les deux métriques sont générées ensemble pour que le switch CA/Qté ne fasse que
 * re-trier cet échantillon, sans le régénérer.
 */
export function generateDecliningProductCandidates(products: Product[], poolSize = 10): ProductDecline[] {
    return [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, poolSize)
        .map((product) => ({
            productId: product.id,
            name: product.name,
            revenueChangePercent: randomDeclinePercent(),
            quantityChangePercent: randomDeclinePercent(),
        }));
}
