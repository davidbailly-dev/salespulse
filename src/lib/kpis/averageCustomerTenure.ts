import { Customer } from '../mock-data/schemas';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateAverageCustomerTenureDays(customers: Customer[], now: Date = new Date()): number {
    if (customers.length === 0) return 0;

    const totalDays = customers.reduce(
        (acc, customer) => acc + (now.getTime() - new Date(customer.registeredAt).getTime()) / MS_PER_DAY,
        0,
    );

    return Math.round(totalDays / customers.length);
}
