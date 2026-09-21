import { Customer } from '../mock-data/schemas';

export function calculateTotalCustomers(customers: Customer[]): number {
    return customers.length;
}
