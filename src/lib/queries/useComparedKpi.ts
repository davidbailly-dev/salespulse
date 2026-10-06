'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { useComparisonRange } from '../filters/useComparisonRange';
import { useDateRangeFilter } from '../filters/useDateRangeFilter';
import type { OrderDateRange } from './useOrders';

type DataHook<TData> = (dateRange?: OrderDateRange, options?: { enabled?: boolean }) => UseQueryResult<TData>;

/**
 * Valeur d'un KPI sur la période courante et, quand la comparaison est active, sur la période N-1.
 * Le KPI garde sa fonction de calcul pure : on l'applique simplement aux deux jeux de données, ce
 * qui évite toute formule dupliquée. `previousValue` vaut `undefined` quand la comparaison est
 * désactivée, `null` quand elle est active mais que la valeur N-1 n'est pas disponible (chargement
 * ou erreur).
 */
export function useComparedKpi<TData, TValue>(useData: DataHook<TData>, calculate: (data: TData) => TValue) {
    const comparisonRange = useComparisonRange();
    const current = useData(useDateRangeFilter());
    const previous = useData(comparisonRange, { enabled: comparisonRange !== undefined });

    const value = current.data ? calculate(current.data) : undefined;
    let previousValue: TValue | null | undefined;
    if (comparisonRange === undefined) previousValue = undefined;
    else previousValue = previous.data ? calculate(previous.data) : null;

    return { value, previousValue, isLoading: current.isLoading, isError: current.isError };
}
