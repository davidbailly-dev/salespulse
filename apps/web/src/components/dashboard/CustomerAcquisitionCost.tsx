'use client';

import { useCustomerAcquisitionCost } from '../../lib/queries/useCustomerAcquisitionCost';
import { KpiValue } from './KpiValue';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export function CustomerAcquisitionCost() {
    const { customerAcquisitionCost, isLoading, isError } = useCustomerAcquisitionCost();

    if (isLoading) return <p>Chargement...</p>;
    if (isError) return <p>Erreur de chargement</p>;

    return (
        <div className="flex flex-col items-center gap-1">
            <KpiValue
                value={customerAcquisitionCost === null ? '–' : numberFormatter.format(customerAcquisitionCost)}
                unit={customerAcquisitionCost === null ? undefined : '€'}
            />
            <span className="text-xs text-gray-400 text-center">par nouveau client</span>
        </div>
    );
}
