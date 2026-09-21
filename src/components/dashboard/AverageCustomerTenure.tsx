'use client';

import { useCustomers } from '../../lib/queries/useCustomers';
import { calculateAverageCustomerTenureDays } from '../../lib/kpis/averageCustomerTenure';
import { KpiValue } from './KpiValue';

export function AverageCustomerTenure() {
    const { data: customers, isLoading, isError } = useCustomers();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const averageCustomerTenureDays = calculateAverageCustomerTenureDays(customers);

    return <KpiValue value={averageCustomerTenureDays} unit="jours d'ancienneté" />;
}
