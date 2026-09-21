'use client';

import { useCustomers } from '../../lib/queries/useCustomers';
import { calculateTotalCustomers } from '../../lib/kpis/totalCustomers';
import { KpiValue } from './KpiValue';

export function TotalCustomers() {
    const { data: customers, isLoading, isError } = useCustomers();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    const totalCustomers = calculateTotalCustomers(customers);
    const label = totalCustomers === 1 ? 'client' : 'clients';

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue value={totalCustomers} />
            <span className="text-xs text-gray-400">{label}</span>
        </div>
    );
}
