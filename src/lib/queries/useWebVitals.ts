import { useQuery } from '@tanstack/react-query';
import { useShopFilter } from '../filters/useShopFilter';
import { WebVitalsRowListSchema, type WebVitalsRow } from '../mock-data/schemas';
import { buildAnalyticsUrl, type AnalyticsDateRange } from './analyticsQuery';

async function fetchWebVitals(dateRange?: AnalyticsDateRange, shopId?: string): Promise<WebVitalsRow[]> {
    const response = await fetch(buildAnalyticsUrl('web-vitals', dateRange, shopId));

    if (!response.ok) {
        throw new Error(`Failed to fetch web vitals: ${response.status}`);
    }

    return WebVitalsRowListSchema.parse(await response.json());
}

// Comme useTraffic, la boutique est lue ici depuis l'URL et la plage de dates passée explicitement.
export function useWebVitals(dateRange?: AnalyticsDateRange) {
    const shopId = useShopFilter();

    return useQuery({
        queryKey: ['analytics', 'web-vitals', dateRange, shopId],
        queryFn: () => fetchWebVitals(dateRange, shopId),
    });
}
