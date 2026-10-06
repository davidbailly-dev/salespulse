'use client';

import { calculatePaymentFailureRate } from '../../lib/kpis/paymentFailureRate';
import { useErrors } from '../../lib/queries/useErrors';
import { useOrders } from '../../lib/queries/useOrders';
import { useDateRangeFilter } from '../../lib/filters/useDateRangeFilter';
import { KpiValue } from './KpiValue';

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function PaymentFailureRate() {
    const dateRange = useDateRangeFilter();
    const { data: errors, isLoading: isErrorsLoading, isError: isErrorsError } = useErrors(dateRange);
    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders(dateRange);

    if (isErrorsLoading || isOrdersLoading) return <p>Chargement...</p>;
    if (isErrorsError || isOrdersError) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={rateFormatter.format(calculatePaymentFailureRate(errors, orders))} unit="%" />
            <span className="text-xs text-gray-400 text-center">des paiements échouent</span>
        </div>
    );
}
