'use client';

import { useErrors } from '../../lib/queries/useErrors';
import { useOrders } from '../../lib/queries/useOrders';
import { useComparedKpi2 } from '../../lib/queries/useComparedKpi';
import { calculatePaymentFailureRate } from '../../lib/kpis/paymentFailureRate';
import { KpiDelta } from './KpiDelta';
import { KpiValue } from './KpiValue';

const rateFormatter = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function PaymentFailureRate() {
    const { value: paymentFailureRate, previousValue, isLoading, isError } = useComparedKpi2(useErrors, useOrders, calculatePaymentFailureRate);

    if (isLoading) return <p>Chargement...</p>;
    if (isError || paymentFailureRate === undefined) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={rateFormatter.format(paymentFailureRate)} unit="%" />
            <span className="text-xs text-gray-400 text-center">des paiements échouent</span>
            <KpiDelta current={paymentFailureRate} previous={previousValue} polarity="lower-is-better" mode="points" />
        </div>
    );
}
