export type AnalyticsDateRange = {
    from?: string;
    to?: string;
};

/**
 * URL d'un rapport analytics (`/api/analytics/<report>`) avec la plage de dates et la boutique
 * en query params, même format que `/api/orders`.
 */
export function buildAnalyticsUrl(report: string, dateRange?: AnalyticsDateRange, shopId?: string): string {
    const params = new URLSearchParams();
    if (dateRange?.from) params.set('from', dateRange.from);
    if (dateRange?.to) params.set('to', dateRange.to);
    if (shopId) params.set('shop', shopId);

    const query = params.toString();
    return `/api/analytics/${report}${query ? `?${query}` : ''}`;
}
