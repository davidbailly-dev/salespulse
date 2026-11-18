import { Order } from '../mock-data/schemas';

type RevenueSegment = { label: string; minRevenue: number; maxRevenue: number | null };

// Seuils calibrés sur la distribution mesurée du CA par client actif du mock
// (médiane ~1000€, p90 ~3800€), pas des paliers arbitraires.
const REVENUE_SEGMENTS: RevenueSegment[] = [
    { label: '< 500€', minRevenue: 0, maxRevenue: 500 },
    { label: '500 - 1500€', minRevenue: 500, maxRevenue: 1500 },
    { label: '1500 - 4000€', minRevenue: 1500, maxRevenue: 4000 },
    { label: '≥ 4000€', minRevenue: 4000, maxRevenue: null },
];

export type CustomerRevenueSegmentCount = {
    label: string;
    count: number;
};

// Segmente uniquement les clients actifs (CA > 0) : les clients jamais convertis
// sont déjà couverts par leur propre KPI.
export function calculateCustomerRevenueSegments(orders: Order[]): CustomerRevenueSegmentCount[] {
    const revenueByCustomer = new Map<string, number>();

    orders
        .filter((order) => order.status === 'completed')
        .forEach((order) => {
            revenueByCustomer.set(order.customerId, (revenueByCustomer.get(order.customerId) ?? 0) + order.totalAmount);
        });

    const revenues = Array.from(revenueByCustomer.values());

    return REVENUE_SEGMENTS.map((segment) => ({
        label: segment.label,
        count: revenues.filter(
            (revenue) => revenue >= segment.minRevenue && (segment.maxRevenue === null || revenue < segment.maxRevenue),
        ).length,
    }));
}
