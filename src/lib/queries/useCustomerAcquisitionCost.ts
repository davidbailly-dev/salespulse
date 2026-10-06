import { useDateRangeFilter } from '../filters/useDateRangeFilter';
import { calculateCustomerAcquisitionCost } from '../kpis/customerAcquisitionCost';
import { useAdSpend } from './useAdSpend';
import { useOrders } from './useOrders';

/**
 * CAC de la période filtrée. Hook composé (3 requêtes) partagé par les cartes CAC et LTV/CAC pour
 * ne pas dupliquer l'assemblage. Les commandes sont demandées sans plage de dates : il faut tout
 * l'historique pour savoir quelle commande est la première d'un client (voir
 * `calculateNewCustomersCount`).
 */
export function useCustomerAcquisitionCost() {
    const dateRange = useDateRangeFilter();
    const { data: allOrders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders();
    const { data: adSpend, isLoading: isAdSpendLoading, isError: isAdSpendError } = useAdSpend(dateRange);

    const isLoading = isOrdersLoading || isAdSpendLoading;
    const isError = isOrdersError || isAdSpendError;
    const customerAcquisitionCost =
        allOrders && adSpend ? calculateCustomerAcquisitionCost(adSpend, allOrders, dateRange) : null;

    return { customerAcquisitionCost, isLoading, isError };
}
