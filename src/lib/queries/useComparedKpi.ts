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

/**
 * Variante pour un KPI calculé sur deux sources (ex. commandes et trafic). Une source qui ne
 * dépend pas de la période (produits, clients) est acceptée telle quelle : son hook ignore la plage
 * et renvoie la même donnée pour les deux périodes.
 */
export function useComparedKpi2<TDataA, TDataB, TValue>(
    useDataA: DataHook<TDataA>,
    useDataB: DataHook<TDataB>,
    calculate: (dataA: TDataA, dataB: TDataB) => TValue,
) {
    const comparisonRange = useComparisonRange();
    const dateRange = useDateRangeFilter();
    const isComparing = comparisonRange !== undefined;

    const currentA = useDataA(dateRange);
    const currentB = useDataB(dateRange);
    const previousA = useDataA(comparisonRange, { enabled: isComparing });
    const previousB = useDataB(comparisonRange, { enabled: isComparing });

    const value = currentA.data && currentB.data ? calculate(currentA.data, currentB.data) : undefined;
    let previousValue: TValue | null | undefined;
    if (!isComparing) previousValue = undefined;
    else previousValue = previousA.data && previousB.data ? calculate(previousA.data, previousB.data) : null;

    return {
        value,
        previousValue,
        isLoading: currentA.isLoading || currentB.isLoading,
        isError: currentA.isError || currentB.isError,
    };
}
