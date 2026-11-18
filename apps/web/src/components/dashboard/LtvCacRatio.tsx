'use client';

import { useOrders } from '../../lib/queries/useOrders';
import { useCustomerAcquisitionCost } from '../../lib/queries/useCustomerAcquisitionCost';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { calculateLtvCacRatio } from '../../lib/kpis/ltvCacRatio';
import { KpiValue } from './KpiValue';

const decimalFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function LtvCacRatio() {
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(useDateRangeFilter());
    const { customerAcquisitionCost, isLoading: isCacLoading, isError: isCacError } = useCustomerAcquisitionCost();

    if (isOrdersLoading || isCacLoading || !orders) return <p>Chargement...</p>;
    if (isOrdersError || isCacError) return <p>Erreur de chargement</p>;

    const ratio = calculateLtvCacRatio(orders, customerAcquisitionCost);

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={ratio === null ? '–' : decimalFormatter.format(ratio)} unit={ratio === null ? undefined : '×'} />
            <span className="text-xs text-gray-400 text-center">la LTV couvre le CAC</span>
        </div>
    );
}
