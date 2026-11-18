import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { AdSpendRowListSchema, type AdSpendRow } from '@salespulse/contracts';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchAdSpend(dateRange?: AnalyticsDateRange, shopId?: string): Promise<AdSpendRow[]> {
    const response = await fetch(buildAnalyticsUrl('ad-spend', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch ad spend: ${response.status}`);
    }

    return AdSpendRowListSchema.parse(await response.json());
}

// Comme useTraffic, la boutique est lue ici depuis l'URL et la plage de dates passée explicitement.
export function useAdSpend(dateRange?: AnalyticsDateRange, options?: { enabled?: boolean }) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'ad-spend', dateRange, shopId],
        queryFn: () => fetchAdSpend(dateRange, shopId),
        enabled: options?.enabled ?? true,
    });
}
