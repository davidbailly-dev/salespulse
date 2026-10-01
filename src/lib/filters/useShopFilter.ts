'use client';

import { useSearchParams } from 'next/navigation';

/**
 * Boutique sélectionnée, lue depuis le query param `?shop=<id>` (même principe que le
 * filtre de dates). `undefined` = vue "Toutes les boutiques" : on n'envoie alors aucun
 * param `shop` à l'API, qui renvoie les données de toutes les boutiques.
 */
export function useShopFilter(): string | undefined {
    const searchParams = useSearchParams();

    return searchParams.get('shop') ?? undefined;
}
