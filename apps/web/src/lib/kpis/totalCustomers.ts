import { Customer } from '@salespulse/contracts';

export function calculateTotalCustomers(customers: Customer[]): number {
    return customers.length;
}
