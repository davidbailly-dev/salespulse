import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { TrafficRowListSchema, type TrafficRow } from '@salespulse/contracts';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchTraffic(dateRange?: AnalyticsDateRange, shopId?: string): Promise<TrafficRow[]> {
    const response = await fetch(buildAnalyticsUrl('traffic', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch traffic: ${response.status}`);
    }

    return TrafficRowListSchema.parse(await response.json());
}

// Comme useOrders, la boutique est lue ici depuis l'URL et la plage de dates passée explicitement.
export function useTraffic(dateRange?: AnalyticsDateRange, options?: { enabled?: boolean }) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'traffic', dateRange, shopId],
        queryFn: () => fetchTraffic(dateRange, shopId),
        enabled: options?.enabled ?? true,
    });
}
