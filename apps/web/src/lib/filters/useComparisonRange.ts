'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import type { OrderDateRange } from '../queries/useOrders';
import { isValidComparisonMode, resolveComparisonRange, type ComparisonMode } from './comparisonRange';
import { useDateRangeFilter } from './useDateRangeFilter';

/** Mode de comparaison actif, lu depuis `?compare=`. `undefined` = comparaison désactivée. */
export function useComparisonMode(): ComparisonMode | undefined {
    const compare = useSearchParams().get('compare');

    return isValidComparisonMode(compare) ? compare : undefined;
}

/**
 * Plage de comparaison dérivée de la plage de dates courante, `undefined` quand la comparaison est
 * désactivée. Mémoïsée comme `useDateRangeFilter` : `useDateRangeFilter` renvoie déjà un objet
 * stable, et sans ce `useMemo` une nouvelle plage à chaque rendu changerait la `queryKey` des
 * requêtes N-1 et relancerait un fetch en boucle.
 */
export function useComparisonRange(): OrderDateRange | undefined {
    const range = useDateRangeFilter();
    const mode = useComparisonMode();

    return useMemo(() => (mode ? resolveComparisonRange(range, mode) : undefined), [range, mode]);
}
